use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use sqlx::PgPool;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, PasswordVerifier, SaltString},
    Argon2, PasswordHash,
};
use jsonwebtoken::{encode, Header, EncodingKey};
use chrono::Utc;

use crate::models::user::{RegisterRequest, LoginRequest, AuthResponse, UserResponse};
use crate::config::{AppConfig, Claims, UserRole};

/// تسجيل مستخدم جديد (Customer, Seller, Courier) وتشفير كلمة المرور
#[utoipa::path(
    post,
    path = "/auth/register",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "User registered successfully", body = AuthResponse),
        (status = 400, description = "Email already exists or invalid data"),
        (status = 500, description = "Internal server error")
    ),
    tag = "Doumdeli Business"
)]
pub async fn register_user_handler(
    State(pool): State<PgPool>,
    Json(payload): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), (StatusCode, String)> {
    // 1. التحقق من عدم تكرار البريد الإلكتروني
    let email_exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)"
    )
    .bind(&payload.email)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if email_exists {
        return Err((StatusCode::BAD_REQUEST, "Email is already registered".to_string()));
    }

    // 2. تشفير كلمة المرور باستخدام Argon2
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to hash password".to_string()))?
        .to_string();

    // 3. تحديد الدور (Role) الافتراضي أو المدخل
    let role_str = payload.role.unwrap_or_else(|| "customer".to_string());
    let role = UserRole::from(role_str.clone());

    // 4. حفظ المستخدم الجديد في قاعدة البيانات
    let user_record = sqlx::query_as::<_, UserResponse>(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) 
         RETURNING id, email, role, created_at"
    )
    .bind(&payload.email)
    .bind(password_hash)
    .bind(role.to_string())
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 5. توليد الـ JWT Token للمستخدم الجديد مباشرة
    let token = generate_jwt_token(&user_record.id.to_string(), &user_record.email, role)?;

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            token,
            user: user_record,
        }),
    ))
}

/// تسجيل الدخول والتحقق من الهوية والصلاحيات
#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = AuthResponse),
        (status = 401, description = "Invalid email or password"),
        (status = 500, description = "Internal server error")
    ),
    tag = "Doumdeli Business"
)]
pub async fn login_user_handler(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), (StatusCode, String)> {
    // 1. جلب بيانات المستخدم و كلمة المرور المشفرة من القاعدة
    let row: (uuid::Uuid, String, String, chrono::DateTime<chrono::Utc>) = sqlx::query_as(
        "SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1"
    )
    .bind(&payload.email)
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or_else(|| (StatusCode::UNAUTHORIZED, "Invalid email or password".to_string()))?;

    let (user_id, email, db_password_hash, role_str, created_at) = row;
    let role = UserRole::from(role_str.clone());

    // 2. التحقق من صحة كلمة المرور باستخدام Argon2
    let parsed_hash = PasswordHash::new(&db_password_hash)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Invalid password hash format in DB".to_string()))?;

    Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid email or password".to_string()))?;

    // 3. توليد الـ JWT Token للمستخدم
    let token = generate_jwt_token(&user_id.to_string(), &email, role)?;

    let user_response = UserResponse {
        id: user_id,
        email,
        role: role_str,
        created_at,
    };

    Ok((
        StatusCode::OK,
        Json(AuthResponse {
            token,
            user: user_response,
        }),
    ))
}

/// دالة مساعدة داخلية لتوليد الـ JWT Token بأمان كامل
fn generate_jwt_token(user_id: &str, email: &str, role: UserRole) -> Result<String, (StatusCode, String)> {
    let config = AppConfig::from_env();
    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::minutes(config.jwt_lifetime_minutes))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        role,
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_bytes()),
    )
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to generate token: {}", e)))
}
