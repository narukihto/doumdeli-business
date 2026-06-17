-- تفعيل إضافة توليد الـ UUID إذا لم تكن مفعلة مسبقاً لضمان معرفات فريدة وعشوائية لجميع السجلات
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. إنشاء جدول المستخدمين (Users) لدعم تعدد التجار والمشترين والمندوبين
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- (admin, seller, customer, courier)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. إنشاء جدول المنتجات (Products) مع حقل رابط الصورة وحقل السعر العشري الدقيق
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15, 4) NOT NULL, -- استخدام NUMERIC لضمان الدقة المالية التامة والمطابقة لـ Decimal
    image_url TEXT NOT NULL,       -- رابط الصورة النظيف كـ String (e.g., https://placeholder.com)
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. إنشاء جدول الطلبات (Orders) لدعم الدفع عند الاستلام والتتبع المحلي
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    total_amount NUMERIC(15, 4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- (pending, shipped, delivered)
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cod', -- الدفع عند الاستلام Cash on Delivery
    courier_id UUID, -- المندوب المحلي المسؤول عن التوصيل (Courier Role Routing)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_courier FOREIGN KEY (courier_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. إنشاء جدول عناصر الطلب تفصيلياً (Order Items) لربط المنتجات بالكميات والأسعار وقت الشراء
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase NUMERIC(15, 4) NOT NULL,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- إنشاء كشافات (Indexes) لتسريع عمليات البحث والـ Joins في الـ CI والإنتاج
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
