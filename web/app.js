let totalAmount = 0;
let itemsCount = 0;

function addToCart(price) {
    totalAmount += price;
    itemsCount += 1;
    
    // تحديث عداد السلة العلوي
    document.getElementById('cart-count').innerText = itemsCount;
    
    // تحديث إجمالي الفلوس بالـ FCFA مع التنسيق الفرنسي للمليون والآلاف
    document.getElementById('total-price').innerText = totalAmount.toLocaleString('fr-FR') + " FCFA";
}