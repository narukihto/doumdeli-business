use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use rust_decimal::Decimal;
use utoipa::ToSchema;

/// هيكل البيانات المدخل لطلب عنصر واحد داخل سلة المشتريات
#[allow(dead_code)]
#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateOrderItemRequest {
    /// معرف المنتج المراد شراؤه
    #[schema(example = "00000000-0000-0000-0000-000000000000")]
    pub product_id: Uuid,

    /// الكمية المطلوبة من هذا المنتج
    #[schema(example = 2)]
    pub quantity: i32,
}

/// هيكل البيانات الرئيسي المطلوب عند إنشاء طلب وعملية Checkout جديدة
#[allow(dead_code)]
#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateOrderRequest {
    /// قائمة العناصر والمنتجات المراد شراؤها في هذا الطلب
    pub items: Vec<CreateOrderItemRequest>,
}

/// هيكل مخرجات عنصر الطلب التفصيلي العائد من قاعدة البيانات (Order Item Line)
#[allow(dead_code)]
#[derive(Debug, Serialize, FromRow, ToSchema)]
pub struct OrderItemResponse {
    pub id: Uuid,
    pub order_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    #[schema(value_type = String)]
    pub price_at_purchase: Decimal, // السعر وقت الشراء الفعلي لتوثيق الفواتير تاريخياً
}

/// الرد النهائي المكتمل للطلب (الطلب الرئيسي + قائمة العناصر التفصيلية)
#[allow(dead_code)]
#[derive(Debug, Serialize, FromRow, ToSchema)]
pub struct OrderResponse {
    pub id: Uuid,
    pub customer_id: Uuid,
    #[schema(value_type = String)]
    pub total_amount: Decimal, // الإجمالي المالي الكلي للطلب بدقة Decimal
    pub status: String,         // حالة الطلب الحالية: (pending, shipped, delivered)
    pub payment_method: String, // طريقة الدفع: (cod - الدفع عند الاستلام كـ خيار محلي أساسي)
    pub courier_id: Option<Uuid>, // معرف المندوب المحلي المسؤول عن التوصيل والتحصيل النظري
    
    #[sqlx(skip)] // إخبار sqlx بتخطي هذا الحقل أثناء الـ Mapping التلقائي لأنه مصفوفة مجمعة برمجياً
    pub items: Vec<OrderItemResponse>, // قائمة المنتجات والكميات المربوطة بهذا الطلب
}