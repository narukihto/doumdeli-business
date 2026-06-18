use axum::{
    extract::State,
    http::{StatusCode, HeaderMap},
    Json,
};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;
use jsonwebtoken::{decode, DecodingKey, Validation};
use rust_decimal::Decimal;

use crate::models::order::{CreateOrderRequest, OrderResponse, OrderItemResponse};
use crate::config::{AppConfig, Claims, UserRole};

/// إنشاء طلب جديد ومعالجة عملية الشراء - متاح لجميع المستخدمين الموثقين
#[utoipa::path(
    post,
    path = "/orders",
    request_body = CreateOrderRequest,
    responses(
        (status = 201, description = "Order placed successfully", body = OrderResponse),
        (status = 400, description = "Bad Request - Out of stock or invalid data"),
        (status = 401, description = "Unauthorized - Missing or invalid token"),
        (status = 500, description = "Internal server error")
    ),
    tag = "Doumdeli Business"
)]
pub async fn create_order_handler(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<(StatusCode, Json<OrderResponse>), (StatusCode, String)> {
    // 1. التحقق من الهوية واستخراج معرف المشتري عبر الـ JWT
    let claims = authorize_customer(headers)?;
    let customer_uuid = Uuid::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid customer ID format within token".to_string()))?;

    if payload.items.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Order must contain at least one item".to_string()));
    }

    // 2. بدء معاملة آمنة (Database Transaction) لضمان تكامل البيانات وعمليات الخصم
    let mut tx: Transaction<'_, Postgres> = pool
        .begin()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to start transaction: {}", e)))?;

    let mut total_amount = Decimal::ZERO;
    let mut order_items_to_insert = Vec::new();

    // 3. التحقق من المخزون، جلب الأسعار الحقيقية، وحساب الإجمالي المالي بدقة
    for item in &payload.items {
        // جلب تفاصيل المنتج والتحقق من توفره داخل الـ Transaction (Row Locking لمنع الـ Race Conditions)
        let product_row: (Decimal, i32) = sqlx::query_as(
            "SELECT price, stock FROM products WHERE id = $1 FOR UPDATE"
        )
        .bind(item.product_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database query error: {}", e)))?
        .ok_or_else(|| (StatusCode::BAD_REQUEST, format!("Product with ID {} not found", item.product_id)))?;

        let (price, stock) = product_row;

        if stock < item.quantity {
            return Err((StatusCode::BAD_REQUEST, format!("Insufficient stock for product ID: {}", item.product_id)));
        }

        // تحديث المخزون وخصم الكمية المطلوبة فوراً
        sqlx::query("UPDATE products SET stock = stock - $1 WHERE id = $2")
            .bind(item.quantity)
            .bind(item.product_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to update stock: {}", e)))?;

        // حساب التكلفة الجزئية والإجمالية
        let item_total = price * Decimal::from(item.quantity);
        total_amount += item_total;

        order_items_to_insert.push((item.product_id, item.quantity, price));
    }

    // 4. تعيين مندوب توصيل محلي عشوائي متوفر للتوصيل (Courier Role Routing) لدعم الدفع عند الاستلام (COD)
    let courier_id: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM users WHERE role = 'courier' LIMIT 1"
    )
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to route courier: {}", e)))?;

    // 5. إدخال سجل الطلب الرئيسي (Order Master)
    let order_id: Uuid = sqlx::query_scalar(
        "INSERT INTO orders (customer_id, total_amount, status, payment_method, courier_id)
         VALUES ($1, $2, 'pending', 'cod', $3)
         RETURNING id"
    )
    .bind(customer_uuid)
    .bind(total_amount)
    .bind(courier_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to insert order: {}", e)))?;

    // 6. إدخال عناصر الطلب تفصيلياً (Order Items Details)
    let mut inserted_items = Vec::new();
    for (product_id, quantity, price_at_purchase) in order_items_to_insert {
        let item_response = sqlx::query_as::<_, OrderItemResponse>(
            "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
             VALUES ($1, $2, $3, $4)
             RETURNING id, order_id, product_id, quantity, price_at_purchase"
        )
        .bind(order_id)
        .bind(product_id)
        .bind(quantity)
        .bind(price_at_purchase)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to insert order item: {}", e)))?;

        inserted_items.push(item_response);
    }

    // اعتماد وإغلاق المعاملة بنجاح (Commit Transaction)
    tx.commit()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Transaction commit failure: {}", e)))?;

    // 7. بناء الرد النهائي المكتمل لطلب الـ Checkout
    let order_response = OrderResponse {
        id: order_id,
        customer_id: customer_uuid,
        total_amount,
        status: "pending".to_string(),
        payment_method: "cod".to_string(),
        courier_id,
        items: inserted_items,
    };

    Ok((StatusCode::CREATED, Json(order_response)))
}

/// دالة مساعدة مخصصة للتحقق من هوية المشترين أو صلاحيات الإدارة للعمليات المالية
fn authorize_customer(headers: HeaderMap) -> Result<Claims, (StatusCode, String)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| (StatusCode::UNAUTHORIZED, "Missing Authorization header".to_string()))?;

    if !auth_header.starts_with("Bearer ") {
        return Err((StatusCode::UNAUTHORIZED, "Invalid Authorization format".to_string()));
    }

    let token = &auth_header[7..];
    let config = AppConfig::from_env();

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(config.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid or expired token".to_string()))?;

    Ok(token_data.claims)
}
