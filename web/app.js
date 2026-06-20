// المسار الموحد لجلب المنتجات والأدوات الحقيقية
const API_URL = 'https://fakestoreapi.com/products';

// سعر تحويل تقريبي من الدولار إلى فرنك غرب إفريقيا (FCFA) ليناسب أسعار باماكو
const EXCHANGE_RATE = 610; 

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

// دالة جلب المنتجات من الرابط الموحد
async function fetchProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    try {
        // إظهار تأثير التحميل الفضائي أثناء جلب البيانات
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-20 text-cyan-400 cosmic-font animate-pulse">
                 جاري الاتصال بالمستودع الكوني وجلب الأغراض...
            </div>
        `;

        const response = await fetch(API_URL);
        const products = await response.json();

        // تنظيف الشاشة لبدء عرض المنتجات الحقيقية
        productsGrid.innerHTML = '';

        products.forEach(product => {
            // تحويل السعر لـ FCFA وتنسيقه بشكل جميل
            const priceInFCFA = Math.round(product.price * EXCHANGE_RATE);
            const formattedPrice = new Intl.NumberFormat('fr-FR').format(priceInFCFA);

            // إنشاء كرت المنتج الفضائي ديناميكياً لكل غرض قادم من الرابط
            const productCard = document.createElement('div');
            productCard.className = "group bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-blue-500/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]";
            
            productCard.innerHTML = `
                <div>
                    <!-- عرض الصورة الحقيقية القادمة من رابط الـ API -->
                    <div class="h-48 rounded-xl mb-4 bg-white flex items-center justify-center relative overflow-hidden p-2">
                        <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300">
                        <div class="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[9px] text-cyan-400 cosmic-font">
                            ${product.category.toUpperCase()}
                        </div>
                    </div>
                    
                    <!-- الاسم والوصف -->
                    <h3 class="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition mb-1">${product.title}</h3>
                    <p class="text-xs text-slate-400 line-clamp-2 mb-4 h-8 overflow-hidden">${product.description}</p>
                </div>

                <!-- السعر وزر الشراء -->
                <div class="mt-auto">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs text-cyan-400 tracking-wider font-mono">XOF</span>
                        <span class="text-base font-black text-slate-100 cosmic-font">${formattedPrice}</span>
                    </div>
                    <button onclick="orderProduct('${product.title.replace(/'/g, "\\'")}', ${priceInFCFA})" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-300 transform active:scale-95 shadow-lg shadow-indigo-600/20">
                        طلب فوري سريع
                    </button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-20 text-red-400 cosmic-font">
                ❌ فشل الاتصال بالمستودع الكوني. يرجى التحقق من شبكة الإنترنت.
            </div>
        `;
    }
}

// دالة إرسال الطلب (تفتح نافذة تأكيد الطلب السينمائية)
function orderProduct(title, price) {
    alert(`🛸 النظام الكوني: تم تسجيل رغبتك في شراء:\n\n📦 ${title}\n💰 السعر: ${new Intl.NumberFormat('fr-FR').format(price)} FCFA\n\nسيتم توجيهك لإتمام الطلب الآن!`);
}