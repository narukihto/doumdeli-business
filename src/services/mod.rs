use rust_decimal::Decimal;
use rust_decimal_macros::dec;

/// خدمة مخصصة لإدارة العمليات الحسابية المعقدة والتحقق من السياسات المالية للمنصة
pub struct OrderFinancialService;

impl OrderFinancialService {
    /// احتساب رسوم التوصيل الإضافية بناءً على طريقة الدفع عند الاستلام (COD Fees)
    /// منصة Doumdeli Business تفرض رسوم ثابتة أو نسبية لتغطية تكاليف التحصيل المحلي
    pub fn calculate_cod_fee(subtotal: Decimal) -> Decimal {
        if subtotal == Decimal::ZERO {
            return Decimal::ZERO;
        }
        
        // رسوم ثابتة للتوصيل والدفع عند الاستلام بقيمة 5.00 وحدات نقدية
        let flat_cod_fee = dec!(5.00);
        
        // ضريبة إضافية تشجيعية للأرقام الكبيرة (مثلاً 1% من الإجمالي)
        let processing_rate = dec!(0.01);
        let variable_fee = subtotal * processing_rate;

        // إرجاع الرسوم الإجمالية مقربة لأقرب 4 خانات عشرية لتطابق دقة قاعدة البيانات
        (flat_cod_fee + variable_fee).round_dp(4)
    }

    /// التحقق من أن إجمالي الطلب لا يتخطى الحد الأعلى المسموح به لعمليات الدفع عند الاستلام
    /// وذلك لحماية المندوبين والتجار من المخاطر المالية العالية
    pub fn is_cod_amount_allowed(total_amount: Decimal) -> bool {
        let max_cod_limit = dec!(10000.00); // الحد الأقصى 10,000 وحدة نقدية للطلب الواحد COD
        total_amount <= max_cod_limit
    }

    /// دالة لمطابقة الرسوم والضرائب الإجمالية للتأكد من سلامة العملية الحسابية قبل الحفظ
    pub fn calculate_final_total(subtotal: Decimal, shipping_fee: Decimal) -> Decimal {
        let cod_fee = Self::calculate_cod_fee(subtotal);
        (subtotal + shipping_fee + cod_fee).round_dp(4)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_cod_fee_for_zero() {
        let subtotal = Decimal::ZERO;
        assert_eq!(OrderFinancialService::calculate_cod_fee(subtotal), Decimal::ZERO);
    }

    #[test]
    fn test_calculate_cod_fee_for_normal_amount() {
        let subtotal = dec!(100.00);
        // 5.00 (flat) + 1.00 (1% of 100) = 6.00
        assert_eq!(OrderFinancialService::calculate_cod_fee(subtotal), dec!(6.00));
    }

    #[test]
    fn test_cod_amount_limit_validation() {
        let safe_amount = dec!(500.00);
        let unsafe_amount = dec!(15000.00);
        
        assert!(OrderFinancialService::is_cod_amount_allowed(safe_amount));
        assert!(!OrderFinancialService::is_cod_amount_allowed(unsafe_amount));
    }
}
