use axum::http::StatusCode;
use axum::Json;

mod common;

use doumdeli_business::handlers::auth_handler::{register_user_handler, login_user_handler};
use doumdeli_business::models::user::{RegisterRequest, LoginRequest};

#[tokio::test]
async fn test_e2e_user_registration_and_login_flow() {
    // 1. تهيئة قاعدة بيانات الاختبارات النظيفة في الـ CI
    let pool = common::setup_test_db().await;
    common::json_clear_tables(&pool).await;

    // 2. إعداد بيانات تجارية مخصصة لتسجيل تاجر جديد (Seller)
    let register_payload = RegisterRequest {
        email: "test_merchant_2026@doumdeli.com".to_string(),
        password: "VeryStrongPassword123!".to_string(),
        role: Some("seller".to_string()),
    };

    // 3. تشغيل الـ Register Handler ومحاكاة الطلب
    let (status, Json(register_response)) = register_user_handler(
        axum::extract::State(pool.clone()),
        Json(register_payload),
    )
    .await
    .expect("Failed to register user in test");

    // التحقق من نجاح الإدخال وإرجاع البيانات الصحيحة والـ Token
    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(register_response.user.email, "test_merchant_2026@doumdeli.com");
    assert_eq!(register_response.user.role, "seller");
    assert!(!register_response.token.is_empty());

    // 4. محاكاة عملية تسجيل الدخول (Login) للتحقق من مطابقة الـ Argon2 والـ Hash
    let login_payload = LoginRequest {
        email: "test_merchant_2026@doumdeli.com".to_string(),
        password: "VeryStrongPassword123!".to_string(),
    };

    let (login_status, Json(login_response)) = login_user_handler(
        axum::extract::State(pool.clone()),
        Json(login_payload),
    )
    .await
    .expect("Failed to log in user in test");

    // التحقق من صحة بيانات تسجيل الدخول وتوليد الـ Token الجديد
    assert_eq!(login_status, StatusCode::OK);
    assert_eq!(login_response.user.id, register_response.user.id);
    assert!(!login_response.token.is_empty());
}

#[tokio::test]
async fn test_registration_duplicate_email_prohibited() {
    let pool = common::setup_test_db().await;
    common::json_clear_tables(&pool).await;

    let user_payload = RegisterRequest {
        email: "duplicate@doumdeli.com".to_string(),
        password: "Password123!".to_string(),
        role: None, // سيتحول تلقائياً إلى customer
    };

    // التسجيل للمرة الأولى (ينجح)
    let (status1, _) = register_user_handler(
        axum::extract::State(pool.clone()),
        Json(user_payload),
    )
    .await
    .expect("First registration should succeed");
    assert_eq!(status1, StatusCode::CREATED);

    // محاولة التسجيل بنفس البريد الإلكتروني مرة أخرى (يجب أن يفشل)
    let user_payload_duplicate = RegisterRequest {
        email: "duplicate@doumdeli.com".to_string(),
        password: "DifferentPassword123!".to_string(),
        role: Some("customer".to_string()),
    };

    let result = register_user_handler(
        axum::extract::State(pool.clone()),
        Json(user_payload_duplicate),
    )
    .await;

    // التحقق من رفض الطلب وإرجاع رمز الحماية الموحد 400 Bad Request
    assert!(result.is_err());
    let (err_status, err_msg) = result.unwrap_err();
    assert_eq!(err_status, StatusCode::BAD_REQUEST);
    assert!(err_msg.contains("already registered"));
}
