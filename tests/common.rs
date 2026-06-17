use sqlx::{Connection, Executor, PgConnection, PgPool};
use std::sync::Once;

// لضمان تهيئة متغيرات البيئة والتتبع لمرة واحدة فقط لجميع ملفات الاختبارات
static INIT: Once = Once::new();

/// تهيئة بيئة الاختبار وجلب رابط قاعدة البيانات Pool الموحد للـ CI
pub async fn setup_test_db() -> PgPool {
    INIT.call_once(|| {
        // 1. محاولة تحميل ملف .env المحلي (إذا كان متوفراً خارج بيئة الـ CI)
        let _ = dotenvy::dotenv();
        
        // تهيئة التتبع للاختبارات لمشاهدة سجلات الـ SQL والـ Handlers أثناء الفشل
        let _ = tracing_subscriber::fmt()
            .with_env_filter("doumdeli_business=debug,sqlx=warn")
            .try_init();
    });

    // 2. جلب رابط قاعدة البيانات المخصص للاختبارات (الذي يوفره الـ GitHub Actions CI)
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:secure_password_2026@localhost:5432/doumdeli_db".to_string());

    // 3. إنشاء الـ Pool والاتصال الفوري
    let pool = PgPool::connect(&database_url)
        .await
        .expect("Test Suite failed to connect to the CI PostgreSQL instance");

    // 4. تشغيل الهجرات والتأكد من بناء الجداول (Users, Products, Orders) بالكامل سحابياً
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Test Suite failed to run database migrations on CI database");

    pool
}

/// دالة مساعدة لتنظيف السجلات بين جولات الاختبارات لمنع تداخل أو تلوث البيانات (Data Isolation)
pub async fn json_clear_tables(pool: &PgPool) {
    let mut tx = pool.begin().await.unwrap();
    // إيقاف ميكانيكية التحقق من القيود مؤقتاً للتنظيف السريع والآمن
    sqlx::query("TRUNCATE TABLE order_items, orders, products, users CASCADE")
        .execute(&mut *tx)
        .await
        .expect("Failed to truncate test database tables");
    tx.commit().await.unwrap();
}
