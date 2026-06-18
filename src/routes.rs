use axum::{
    routing::{get, post},
    Router,
};
use sqlx::PgPool;
use utoipa::OpenApi;
// تم تصحيح الاسم هنا باستبدال الشرطة الوسطى بشرطة سفلية ليتوافق مع معايير الرست
use utoipa_swagger_ui::SwaggerUi;

use crate::handlers::{auth_handler, product_handler, order_handler};

/// هيكل لتجميع توثيق OpenAPI/Swagger تلقائياً
#[derive(OpenApi)]
#[openapi(
    paths(
        auth_handler::register_user_handler,
        auth_handler::login_user_handler,
        product_handler::create_product_handler,
        product_handler::list_products_handler,
        order_handler::create_order_handler
    ),
    components(
        schemas(
            crate::models::user::RegisterRequest,
            crate::models::user::LoginRequest,
            crate::models::user::AuthResponse,
            crate::models::product::ProductResponse,
            crate::models::product::CreateProductRequest,
            crate::models::order::OrderResponse,
            crate::models::order::CreateOrderRequest
        )
    ),
    tags(
        (name = "Doumdeli Business", description = "Backend Management APIs for Multi-Vendor E-Commerce")
    )
)]
struct ApiDoc;

/// الدالة الرئيسية لتوزيع وتوجيه كافة روابط المنصة
pub fn configure_routes(db_pool: PgPool) -> Router {
    // 1. مسارات نظام المصادقة والمستخدمين (Authentication)
    let auth_routes = Router::new()
        .route("/auth/register", post(auth_handler::register_user_handler))
        .route("/auth/login", post(auth_handler::login_user_handler));

    // 2. مسارات كتالوج المنتجات (Product Catalog)
    let product_routes = Router::new()
        .route("/products", post(product_handler::create_product_handler).get(product_handler::list_products_handler));

    // 3. مسارات الطلبات وعمليات الشراء والدفع عند الاستلام (Orders & COD)
    let order_routes = Router::new()
        .route("/orders", post(order_handler::create_order_handler));

    // 4. دمج كافة المسارات في راوتر موحد وتمرير الـ DbPool كـ State
    Router::new()
        .route("/health", get(health_check))
        .merge(auth_routes)
        .merge(product_routes)
        .merge(order_routes)
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .with_state(db_pool)
}

/// فحص جاهزية واستقرار السيرفر (Health Check)
async fn health_check() -> &'static str {
    "OK"
}
