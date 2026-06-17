use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use utoipa::ToSchema;

/// هيكل البيانات المطلوب عند تسجيل مستخدم جديد في المنصة
#[derive(Debug, Deserialize, ToSchema)]
pub struct RegisterRequest {
    /// البريد الإلكتروني للمستخدم (يجب أن يكون فريداً)
    #[schema(example = "merchant@doumdeli.com")]
    pub email: String,
    
    /// كلمة المرور النصية قبل التشفير
    #[schema(example = "StrongPassword2026!")]
    pub password: String,
    
    /// دور المستخدم في المنصة: (admin, seller, customer, courier)
    /// إذا تُرِك فارغاً، يتم تعيينه تلقائياً كـ 'customer'
    #[schema(example = "seller")]
    pub role: Option<String>,
}

/// هيكل البيانات المطلوب عند تسجيل الدخول
#[derive(Debug, Deserialize, ToSchema)]
pub struct LoginRequest {
    #[schema(example = "merchant@doumdeli.com")]
    pub email: String,
    
    #[schema(example = "StrongPassword2026!")]
    pub password: String,
}

/// هيكل السجل النظيف للمستخدم العائد من قاعدة البيانات (بدون الـ Password Hash للأمان)
#[derive(Debug, Serialize, FromRow, ToSchema)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub role: String,
    pub created_at: DateTime<Utc>,
}

/// الرد النهائي المكتمل لعمليات المصادقة (يحتوي على الـ Token وبيانات المستخدم)
#[derive(Debug, Serialize, ToSchema)]
pub struct AuthResponse {
    #[schema(example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")]
    pub token: String,
    pub user: UserResponse,
}
