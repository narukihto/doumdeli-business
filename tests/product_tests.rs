use axum::{
    http::{HeaderMap, HeaderValue, StatusCode},
    Json,
};
use rust_decimal_macros::dec;

mod common;

use doumdeli_business::handlers::{
    auth_handler::register_user_handler,
    product_handler::{create_product_handler, list_products_handler},
    order_handler::create_order_handler,
};
use doumdeli_business::models::{
    user::RegisterRequest,
    product::CreateProductRequest,
    order::{CreateOrderRequest, CreateOrderItemRequest},
};

#[tokio::test]
async fn test_e2e_product_creation_and_checkout_flow() {
    // 1. تهيئة قاعدة البيانات وتنظيف الجداول في الـ CI
    let pool = common::setup_test_db().await;
    common::json_clear_tables(&pool).await;

    // 2. تسجيل تاجر جديد (Seller) للحصول على صلاحية لإضافة منتجات
    let seller_payload = RegisterRequest {
        email: "seller_test_2026@doumdeli.com".to_string(),
        password: "SellerPassword123!".to_string(),
        role: Some("seller".to_string()),
    };
    let (_, Json(seller_auth)) = register_user_handler(axum::extract::State(pool.clone()), Json(seller_payload))
        .await
        .expect("Seller registration failed");

    // 3. بناء الـ Headers وتضمين الـ JWT Token للتاجر
    let mut seller_headers = HeaderMap::new();
    let token_value = format!("Bearer {}", seller_auth.token);
    seller_headers.insert("Authorization", HeaderValue::from_str(&token_value).unwrap());

    // 4. إنشاء منتج تجريبي والتحقق من حقل السعر العشري ورابط الصورة كـ String
    let product_payload = CreateProductRequest {
        name: "Test Laptop Pro".to_string(),
        description: Some("High performance test laptop".to_string()),
        price: dec!(1200.50), // استخدام Decimal للدقة المالية
        image_url: "https://placeholder.com/products/laptop.png".to_string(), // رابط نظيف
        stock: 10,
    };

    let (prod_status, Json(product_response)) = create_product_handler(
        axum::extract::State(pool.clone()),
        seller_headers,
        Json(product_payload),
    )
    .await
    .expect("Product creation failed");

    assert_eq!(prod_status, StatusCode::CREATED);
    assert_eq!(product_response.name, "Test Laptop Pro");
    assert_eq!(product_response.price, dec!(1200.50));
    assert_eq!(product_response.image_url, "https://placeholder.com/products/laptop.png");
    assert_eq!(product_response.stock, 10);

    // 5. التحقق من ظهور المنتج في قائمة المنتجات العامة
    let (list_status, Json(products_list)) = list_products_handler(axum::extract::State(pool.clone()))
        .await
        .expect("Listing products failed");
    
    assert_eq!(list_status, StatusCode::OK);
    assert!(!products_list.is_empty());

    // 6. تسجيل مشتري جديد (Customer) لإتمام عملية الـ Checkout
    let customer_payload = RegisterRequest {
        email: "customer_test_2026@doumdeli.com".to_string(),
        password: "CustomerPassword123!".to_string(),
        role: Some("customer".to_string()),
    };
    let (_, Json(customer_auth)) = register_user_handler(axum::extract::State(pool.clone()), Json(customer_payload))
        .await
        .expect("Customer registration failed");

    // بناء الـ Headers للمشتري
    let mut customer_headers = HeaderMap::new();
    let cust_token_value = format!("Bearer {}", customer_auth.token);
    customer_headers.insert("Authorization", HeaderValue::from_str(&cust_token_value).unwrap());

    // 7. محاكاة طلب الشراء والدفع عند الاستلام (COD) لعنصرين من المنتج
    let order_payload = CreateOrderRequest {
        items: vec![CreateOrderItemRequest {
            product_id: product_response.id,
            quantity: 2,
        }],
    };

    let (order_status, Json(order_response)) = create_order_handler(
        axum::extract::State(pool.clone()),
        customer_headers,
        Json(order_payload),
    )
    .await
    .expect("Order checkout processing failed");

    // التحقق من نجاح الطلب وحساب الإجمالي المالي بدقة (1200.50 * 2 = 2401.00)
    assert_eq!(order_status, StatusCode::CREATED);
    assert_eq!(order_response.total_amount, dec!(2401.00));
    assert_eq!(order_response.status, "pending");
    assert_eq!(order_response.payment_method, "cod");
    assert_eq!(order_response.items.len(), 1);
    assert_eq!(order_response.items[0].quantity, 2);

    // 8. التحقق من خصم المخزون التلقائي من قاعدة البيانات بعد نجاح الـ Transaction
    let (after_list_status, Json(updated_products)) = list_products_handler(axum::extract::State(pool.clone()))
        .await
        .unwrap();
    
    assert_eq!(after_list_status, StatusCode::OK);
    let target_product = updated_products.iter().find(|p| p.id == product_response.id).unwrap();
    // المخزن الأصلي 10 - تم شراء 2 = المتبقي يجب أن يكون 8
    assert_eq!(target_product.stock, 8);
}
