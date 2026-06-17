use serde::{Deserialize, Serialize};

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_lifetime_minutes: i64,
}

impl AppConfig {
    /// تحميل الإعدادات من متغيرات البيئة (Environment Variables)
    pub fn from_env() -> Self {
        Self {
            database_url: std::env::var("DATABASE_URL")
                .expect("DATABASE_URL environment variable must be set"),
            jwt_secret: std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "super_secure_and_extremely_long_secret_key_2026_doumdeli".to_string()),
            jwt_lifetime_minutes: std::env::var("JWT_LIFETIME_MINUTES")
                .unwrap_or_else(|_| "1440".to_string()) // يوم كامل بشكل افتراضي
                .parse::<i64>()
                .expect("JWT_LIFETIME_MINUTES must be a valid number"),
        }
    }
}

/// تعريف الأدوار (Roles) المتاحة في منصة "Doumdeli Business"
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum UserRole {
    Admin,
    Seller,
    Customer,
    Courier, // دعم لدور التوصيل المحلي (Local Courier Role)
}

impl std::fmt::Display for UserRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let role_str = match self {
            UserRole::Admin => "admin",
            UserRole::Seller => "seller",
            UserRole::Customer => "customer",
            UserRole::Courier => "courier",
        };
        write!(f, "{}", role_str)
    }
}

impl From<String> for UserRole {
    fn from(role: String) -> Self {
        match role.to_lowercase().as_str() {
            "admin" => UserRole::Admin,
            "seller" => UserRole::Seller,
            "courier" => UserRole::Courier,
            _ => UserRole::Customer,
        }
    }
}

/// هيكل البيانات المخزن داخل الـ Token (JWT Claims)
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,       // معرف المستخدم (User ID)
    pub email: String,     // البريد الإلكتروني
    pub role: UserRole,    // صلاحية المستخدم
    pub exp: usize,        // وقت انتهاء صلاحية الـ Token
}
