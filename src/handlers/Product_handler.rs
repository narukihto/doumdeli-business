use axum::{
    extract::{State, Query},
    http::{StatusCode, HeaderMap},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use jsonwebtoken::{decode, DecodingKey, Validation};

use crate::models::product::{CreateProductRequest, ProductResponse};
use crate::config::{AppConfig, Claims, UserRole};

/// إنشاء منتج جديد - متاح فقط للتجار (Sellers) والمسؤولين (Admins)
#[utoipa::path(
    post,
    path = "/products",
    request_body = CreateProductRequest,
    responses(
        (status = 201, description = "Product created successfully", body = ProductResponse),
        (status = 401, description = "Unauthorized - Missing or invalid token"),
        (status = 403, description = "Forbidden - Insufficient permissions"),
        (status = 500, description = "Internal server error")
    ),
    tag = "Doumdeli Business"
)]
pub async fn create_product_handler(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Json(payload): Json<CreateProductRequest>,
) -> Result<(StatusCode, Json<ProductResponse>), (StatusCode, String)> {
    // 1. التحقق من الهوية والصلاحيات عبر الـ JWT (Role Enforcement)
    let claims = authorize_role(headers, vec![UserRole::Seller, UserRole::Admin])?;
    let seller_uuid = Uuid::parse_str(&claims.sub)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid seller ID format within token".to_string()))?;

    // 2. إدخال المنتج في قاعدة البيانات مع تتبع حقل الرابط والسعر بدقة العشريات
    let product = sqlx::query_as::<_, ProductResponse>(
        "INSERT INTO products (seller_id, name, description, price, image_url, stock)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, seller_id, name, description, price, image_url, stock, created_at"
    )
    .bind(seller_uuid)
    .bind(&payload.name)
    .bind(&payload.description)
    .bind(payload.price) // يتوافق مباشرة مع rust_decimal::Decimal
    .bind(&payload.image_url) // رابط نظيف ومباشر على هيئة String URL
    .bind(payload.stock)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database failure: {}", e)))?;

    Ok((StatusCode::CREATED, Json(product)))
}

/// جلب كافة المنتجات المعروضة في المنصة
#[utoipa::path(
    get,
    path = "/products",
    responses(
        (status = 200, description = "List of products retrieved successfully", body = [ProductResponse]),
        (status = 500, description = "Internal server error")
    ),
    tag = "Doumdeli Business"
)]
pub async fn list_products_handler(
    State(pool): State<PgPool>,
) -> Result<(StatusCode, Json<Vec<ProductResponse>>), (StatusCode, String)> {
    let products = sqlx::query_as::<_, ProductResponse>(
        "SELECT id, seller_id, name, description, price, image_url, stock, created_at FROM products ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Database failure: {}", e)))?;

    Ok((StatusCode::OK, Json(products)))
}

/// دالة مساعدة مخصصة للتحقق من الـ Token والصلاحيات المسموح لها بالعملية
fn authorize_role(headers: HeaderMap, allowed_roles: Vec<UserRole>) -> Result<Claims, (StatusCode, String)> {
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

    if !allowed_roles.contains(&token_data.claims.role) {
        return Err((StatusCode::FORBIDDEN, "Access denied: Insufficient privileges".to_string()));
    }

    Ok(token_data.claims)
}
