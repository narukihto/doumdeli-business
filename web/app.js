let totalAmount = 0;
let itemsCount = 0;
let selectedProducts = [];

// دالة إضافة المنتجات للسلة وحساب السعر وتجميع الأسماء
function addToCart(productName, price) {
    totalAmount += price;
    itemsCount += 1;
    selectedProducts.push(productName);
    
    // تحديث الواجهة العلوية
    document.getElementById('cart-count').innerText = itemsCount;
    document.getElementById('total-price').innerText = totalAmount.toLocaleString('fr-FR') + " FCFA";
    
    // تحديث قائمة الأسماء المشتراة في الفاتورة
    document.getElementById('selected-items-list').innerText = [...new Set(selectedProducts)].join(', ');
}

// دالة معالجة الطلب وإظهار خانة الانتظار والمتابعة
function submitCosmicOrder(event) {
    event.preventDefault(); // منع الصفحة من إعادة التحميل
    
    if (totalAmount === 0) {
        alert("Votre panier est vide ! Veuillez ajouter des produits avant de confirmer.");
        return;
    }
    
    // جلب بيانات العميل المكتوبة
    const clientName = document.getElementById('client-name').value;
    
    // إخفاء فورم الإدخال لإخلاء مساحة لخانة المتابعة
    document.getElementById('checkout-form-container').classList.add('hidden');
    
    // إدخال اسم العميل في خانة الانتظار وإظهارها فوراً تأثير سينمائي
    document.getElementById('status-client-name').innerText = clientName;
    document.getElementById('waiting-status-container').classList.remove('hidden');
    
    // تصفير البيانات كأنه تم الشحن بنجاح
    console.log("Commande confirmée pour: ", clientName, " d'un montant de: ", totalAmount);
}

// تفعيل ميزة الـ PWA للتنزيل على شاشة الهاتف الرئيسية
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Running successfully'))
            .catch(err => console.log('Service Worker Error', err));
    });
}
