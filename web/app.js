// ==========================================
// 1. CONFIGURATION ET STOCK DE PRODUITS
// ==========================================
const API_URL = 'https://fakestoreapi.com/products';
const EXCHANGE_RATE = 610;

// ضع رقم الواتساب الخاص بمتجرك هنا (مع رمز الدولة بدون أصفار أو علامة +)
const WHATSAPP_NUMBER = "22370000000"; // استبدل هذا برقمك الحقيقي لاحقاً إذا رغبت

let totalAmount = 0;
let itemsCount = 0;
let selectedProducts = [];
let ALL_PRODUCTS_STORE = []; 
let currentCategory = 'TOUT';

// ربط المنتجات بالأسماء الدقيقة الموجودة في لقطة الشاشة وموازنتها
const LOCAL_PRODUCTS = [
    // --- ESPACE BÉBÉ ---
    { title: "Pack Couches Bébé - Édition 1", price: 12500, description: "Couches pour bébé de haute qualité, douces pour la peau et ultra absorbantes.", image: "./images/bebe1.jpg", category: "BÉBÉ" },
    { title: "Pack Couches Bébé - Édition 2", price: 14000, description: "Pack de couches premium anti-fuites, parfaitement adaptées aux mouvements de l'enfant.", image: "./images/bebe2.jpg", category: "BÉBÉ" },
    { title: "Pack Couches Bébé - Format Économique", price: 18500, description: "Grand format économique qui offre une protection douce et fiable.", image: "./images/bebe3.jpg", category: "BÉBÉ" },
    { title: "Pack Couches Bébé - Format Familial", price: 22000, description: "La protection maximale pour les mamans à un prix compétitif.", image: "./images/bebe4.jpg", category: "BÉBÉ" },
    { title: "Pack Couches Bébé - Plus Premium", price: 25000, description: "Couches de nouvelle génération ultra-douces pour les peaux sensibles.", image: "./images/bebe5.jpg", category: "BÉBÉ" },
    
    // --- ÉLECTRONIQUE ---
    { title: "Smart Balance Scooter Pro", price: 175000, description: "Scooter électrique intelligent avec gyroscope stabilisateur et batterie haute autonomie.", image: "./images/Balance scooter 1 .jpg", category: "ÉLECTRONIQUE" },
    { title: "Appareil Électronique Intelligent - Alpha 1", price: 85000, description: "Dernière technologie intelligente avec des performances puissantes et un design moderne.", image: "./images/electro1.jpg", category: "ÉLECTRONIQUE" },
    { title: "Système Électronique Avancé - Quantum 3", price: 120000, description: "Outil technologique de pointe offrant une grande efficacité.", image: "./images/electro2.jpg", category: "ÉLECTRONIQUE" },
    { title: "Édition de Luxe - Tech Pro 5", price: 165000, description: "Version premium de luxe combinant puissance et fonctionnalités de nouvelle generation.", image: "./images/electro3.jpg", category: "ÉLECTRONIQUE" },
    { title: "Module Connecté - NextGen v4", price: 95000, description: "Composant et appareil de haute précision pour optimiser vos installations.", image: "./images/electro4.jpg", category: "ÉLECTRONIQUE" },
    { title: "Station Centrale Électronique - Max", price: 145000, description: "Console d'alimentation et de contrôle avec protection contre les surtensions.", image: "./images/electro5.jpg", category: "ÉLECTRONIQUE" }
];

document.addEventListener('DOMContentLoaded', () => {
    loadStoreData();
});

// ==========================================
// 2. RECUPERATION ET FUSION DE TOUS LES PRODUITS
// ==========================================
async function loadStoreData() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = `
        <div class="col-span-full text-center py-20 text-cyan-400 cosmic-font animate-pulse">
             Connexion au dépôt cosmique et chargement des univers...
        </div>
    `;

    ALL_PRODUCTS_STORE = [...LOCAL_PRODUCTS];

    try {
        const response = await fetch(API_URL);
        const apiProducts = await response.json();

        apiProducts.forEach(product => {
            let cat = "AUTRES";
            const apiCat = product.category.toLowerCase();
            if (apiCat.includes('electronics')) {
                cat = "ÉLECTRONIQUE";
            }

            ALL_PRODUCTS_STORE.push({
                title: product.title,
                price: Math.round(product.price * EXCHANGE_RATE),
                description: product.description,
                image: product.image,
                category: cat
            });
        });
    } catch (error) {
        console.log("Mode local activé. Vos images physiques sont prioritaires.");
    }

    renderProducts();
}

// ==========================================
// 3. SELECTION / FILTRAGE DYNAMIQUE DES CATEGORIES
// ==========================================
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    const filtered = ALL_PRODUCTS_STORE.filter(p => {
        if (currentCategory === 'TOUT') return true;
        return p.category === currentCategory;
    });

    if (filtered.length === 0) {
        productsGrid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">Aucun produit dans cette dimension.</div>`;
        return;
    }

    filtered.forEach(product => {
        const formattedPrice = new Intl.NumberFormat('fr-FR').format(product.price);
        
        const card = document.createElement('div');
        card.className = "group bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-blue-500/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]";
        
        card.innerHTML = `
            <div>
                <div class="h-48 rounded-xl mb-4 bg-white flex items-center justify-center relative overflow-hidden p-2">
                    <img src="${product.image}" alt="${product.title}" onerror="this.src='https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'" class="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300">
                    <div class="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[9px] text-cyan-400 cosmic-font">
                        ${product.category}
                    </div>
                </div>
                <h3 class="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition mb-1">${product.title}</h3>
                <p class="text-xs text-slate-400 line-clamp-2 mb-4 h-8 overflow-hidden">${product.description}</p>
            </div>
            <div class="mt-auto">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-cyan-400 tracking-wider font-mono">XOF</span>
                    <span class="text-base font-black text-slate-100 cosmic-font">${formattedPrice}</span>
                </div>
                <button onclick="addToCart('${product.title.replace(/'/g, "\\'")}', ${product.price})" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-300 transform active:scale-95 shadow-lg shadow-indigo-600/20">
                    Acheter
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function filterCategory(categoryName) {
    currentCategory = categoryName;
    const categories = ['TOUT', 'BÉBÉ', 'ÉLECTRONIQUE', 'AUTRES'];
    const ids = { 'TOUT': 'btn-tout', 'BÉBÉ': 'btn-bebe', 'ÉLECTRONIQUE': 'btn-electronique', 'AUTRES': 'btn-autres' };

    categories.forEach(cat => {
        const btn = document.getElementById(ids[cat]);
        if (!btn) return;
        if (cat === categoryName) {
            btn.className = "cosmic-font text-xs px-5 py-2.5 rounded-xl transition duration-300 font-bold tracking-wider bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg";
        } else {
            btn.className = "cosmic-font text-xs px-5 py-2.5 rounded-xl transition duration-300 font-bold tracking-wider text-gray-400 hover:text-white hover:bg-white/5";
        }
    });

    renderProducts();
}

// ==========================================
// 4. GESTION DU PANIER
// ==========================================
function addToCart(productName, price) {
    totalAmount += price;
    itemsCount += 1;
    selectedProducts.push(productName);

    document.getElementById('cart-count').innerText = itemsCount;
    document.getElementById('total-price').innerText = totalAmount.toLocaleString('fr-FR') + " FCFA";
    
    // إظهار أسماء المنتجات بشكل مجمع وجميل
    const uniqueItems = [...new Set(selectedProducts)];
    document.getElementById('selected-items-list').innerText = uniqueItems.join(', ');
}

// ==========================================
// 5. ENVOI DE LA COMMANDE VIA WHATSAPP (زر القيام بالطلب فعال 100%)
// ==========================================
function submitCosmicOrder(event) {
    event.preventDefault();
    
    if (totalAmount === 0 || selectedProducts.length === 0) {
        alert("⚠️ Votre panier est vide. Veuillez ajouter des produits avant de commander.");
        return;
    }

    // جلب بيانات العميل من الفورم
    const nomClient = document.getElementById('customer-name').value.trim();
    const telephoneClient = document.getElementById('customer-phone').value.trim();
    const adresseClient = document.getElementById('customer-address').value.trim();

    // حساب عدد تكرار كل منتج لترتيب الفاتورة
    const productCounts = {};
    selectedProducts.forEach(name => {
        productCounts[name] = (productCounts[name] || 0) + 1;
    });

    // بناء نص رسالة الواتساب الاحترافية والكوزمية
    let messageTxt = `🌌 *NOUVELLE COMMANDE - DOUMDELI BUSINESS* 🌌\n\n`;
    messageTxt += `👤 *Détails du Client :*\n`;
    messageTxt += `▪️ *Nom :* ${nomClient}\n`;
    messageTxt += `▪️ *Téléphone :* ${telephoneClient}\n`;
    messageTxt += `▪️ *Quartier (Bamako) :* ${adresseClient}\n\n`;
    
    messageTxt += `📦 *Articles Commandés :*\n`;
    for (const [name, count] of Object.entries(productCounts)) {
        messageTxt += `🔹 ${name} (x${count})\n`;
    }
    
    messageTxt += `\n💰 *Total à payer à la livraison :* ${totalAmount.toLocaleString('fr-FR')} FCFA\n\n`;
    messageTxt += `🚀 _Merci pour votre confiance ! Commande envoyée depuis la Dimension Doumdeli._`;

    // ترميز النص ليكون متوافقاً مع روابط الويب
    const encodedMessage = encodeURIComponent(messageTxt);
    
    // فتح رابط الواتساب مباشرة لإرسال الفاتورة لك جاهزة
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Error', err));
    });
}