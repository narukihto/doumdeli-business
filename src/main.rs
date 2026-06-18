use axum::Router;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// جعل الموديولات عامة (pub mod) لتتمكن ملفات الاختبارات (Integration Tests) من الوصول إليها
pub mod config;
pub mod routes;
pub mod handlers;
pub mod models;
pub mod services;

#[tokio::main]
async fn main() {
    // 1. تهيئة نظام التتبع وتسجيل الأحداث (Tracing & Logging) مع تفعيل الـ EnvFilter المحدث
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "doumdeli_business=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Initializing Doumdeli Business Backend Server...");

    // 2. تحميل متغيرات البيئة من ملف .env (إذا كان متوفراً محلياً)
    if let Err(e) = dotenvy::dotenv() {
        tracing::warn!("Could not load .env file: {}. Relying on environment variables.", e);
    }

    // 3. جلب رابط قاعدة البيانات وإنشاء رابط الاتصال الـ Connection Pool
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL environment variable must be set");

    tracing::info!("Connecting to PostgreSQL Database Pool...");
    let db_pool = sqlx::PgPool::connect(&database_url)
        .await
        .expect("Failed to create PostgreSQL connection pool");

    // 4. بناء الـ Router الرئيسي ودمج كافة المسارات المهيأة
    let app = Router::new()
        .merge(routes::configure_routes(db_pool.clone()))
        .layer(tower_http::trace::TraceLayer::new_for_http());

    // 5. تحديد المنفذ والـ Address الخاص بتشغيل السيرفر
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Doumdeli Business Server is running successfully on {}", addr);

    // 6. تشغيل سيرفر Axum باستخدام Tokio Listener المحدث لـ Axum 0.7
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|e| panic!("Failed to bind to port {}: {}", port, e));

    axum::serve(listener, app)
        .await
        .expect("Server encountered a critical error during execution");
}