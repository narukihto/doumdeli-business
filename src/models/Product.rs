use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use utoipa::ToSchema;

/// هيكل البيانات المدخلة عند إضافة أو تعديل منتج من قبل التاجر
#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateProductRequest {
    /// اسم المنتج التجاري
    #[schema(example = "iPhone 17 Pro Max")]
    pub name: String,
    
    /// وصف تفصيلي للمنتج ومواصفاته
    #[schema(example = "Latest flagship smartphone with advanced AI capabilities")]
    pub description: Option<String>,
    
    /// سعر المنتج المالي - يتم معالجته بدقة عشرية كاملة عبر مكتبة Decimal لمنع مشاكل العشريات الفلوت
    #[schema(value_type = String, example = "1199.99")]
    pub price: Decimal,
    
    /// رابط الصورة النظيف للمنتج (يدعم روابط الـ Placeholders حالياً ويقبل التحديث لمسارات التخزين لاحقاً)
    #[schema(example = "https://placeholder.com/products/iphone17.png")]
    pub image_url: String,
    
    /// الكمية المتوفرة في المخزن لهذا التاجر
    #[schema(example = 50)]
    pub stock: i32,
}

/// هيكل مخرجات المنتج العائد من قاعدة البيانات ومطابقته بالكامل مع جدول الـ PostgreSQL
#[derive(Debug, Serialize, FromRow, ToSchema)]
pub struct ProductResponse {
    pub id: Uuid,
    pub seller_id: Uuid, // معرف التاجر صاحب المنتج
    pub name: String,
    pub description: Option<String>,
    #[schema(value_type = String)]
    pub price: Decimal,   // يتطابق تلقائياً مع حقل NUMERIC في قاعدة البيانات
    pub image_url: String, // رابط الصورة النظيف كـ String
    pub stock: i32,
    pub created_at: DateTime<Utc>,
}
