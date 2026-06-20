// ==========================================
// 1. CONFIGURATION ET HUBS DE STOCK COUSMIQUE
// ==========================================
const API_URL = 'https://fakestoreapi.com/products';
const EXCHANGE_RATE = 610; // Taux de conversion USD vers FCFA

// Numéro officiel de la boutique pour la réception des commandes
const WHATSAPP_NUMBER = "22379178766"; 

let totalAmount = 0;
let itemsCount = 0;
let selectedProducts = []; 
let ALL_PRODUCTS_STORE = []; 
let currentCategory = 'TOUT';

// Structure du panier pour optimiser les calculs, l'ajustement des quantités et la suppression
let modernCart = {};

// Catalogue étendu des 17 produits physiques locaux répartis par dimensions
const LOCAL_PRODUCTS = [
    // --- ESPACE BÉBÉ (👶) ---
    { title: "Pack Couches Bébé - Édition Confort 1", price: 12500, description: "Couches pour bébé de haute qualité, douces pour la peau, hypoallergéniques et ultra absorbantes pour des nuits paisibles.", image: "./images/bebe1.jpg", category: "BÉBÉ" },
    { title: "Pack Couches Bébé - Édition Protection 2", price: 14000, description: "Pack de couches premium anti-fuites avec barrières latérales extensibles, parfaitement adaptées aux mouvements de l'enfant.", image: "./images/bebe2.jpg", category: "BÉBÉ" },
    { title: "Pack Couches Bébé - Format Économique Pro", price: 18500, description: "Grand format économique qui offre une protection douce, fiable et durable pour toutes les mamans soucieuses du budget.", image: "./images/bebe3.jpg", category: "BÉBÉ" },
    { title: "Pack Couches Bébé - Format Familial Max", price: 22000, description: "La protection maximale pour les familles. Absorption renforcée jour et nuit avec indicateur d'humidité intégré.", image: "./images/bebe4.jpg", category: "BÉBÉ" },
    { title: "Pack Couches Bébé - Plus Ultra Premium", price: 25000, description: "Couches de nouvelle génération ultra-douces à base de coton organique pour les peaux extrêmement sensibles des nouveau-nés.", image: "./images/bebe5.jpg", category: "BÉBÉ" },

    // --- ÉLECTRONIQUE (⚡) ---
    { title: "Smart Balance Scooter Pro Dynamic", price: 175000, description: "Scooter électrique intelligent de pointe avec gyroscope stabilisateur, lumières LED futuristes et batterie haute autonomie.", image: "./images/Balance scooter 1 .jpg", category: "ÉLECTRONIQUE" },
    { title: "Appareil Électronique Intelligent - Alpha 1", price: 85000, description: "Dernière technologie intelligente avec des performances puissantes, un design moderne et une connectivité réseau optimisée.", image: "./images/electro1.jpg", category: "ÉLECTRONIQUE" },
    { title: "Système Électronique Avancé - Quantum 3", price: 120000, description: "Outil technologique de pointe offrant une grande efficacité énergétique et des fonctionnalités automatisées avancées.", image: "./images/electro2.jpg", category: "ÉLECTRONIQUE" },
    { title: "Édition de Luxe - Tech Pro 5 Turbo", price: 165000, description: "Version premium de luxe combinant puissance brute, processeur accéléré et fonctionnalités de nouvelle génération.", image: "./images/electro3.jpg", category: "ÉLECTRONIQUE" },
    { title: "Module Connecté - NextGen v4 Smart", price: 95000, description: "Composant et appareil de haute précision pour optimiser vos installations domestiques et professionnelles intelligentes.", image: "./images/electro4.jpg", category: "ÉLECTRONIQUE" },
    { title: "Station Centrale Électronique - Max Power", price: 145000, description: "Console d'alimentation et de contrôle centralisée avec fusibles de protection intégrés contre les surtensions et coupures.", image: "./images/electro5.jpg", category: "ÉLECTRONIQUE" },

    // --- MATÉRIAUX DE CONSTRUCTION (🧱) ---
    { title: "Matériaux de Construction - Ciment Haute Résistance v1", price: 6500, description: "Sac de ciment de qualité supérieure, idéal pour les fondations lourdes, les dalles et les structures porteuses de chantiers.", image: "./images/Materiaux de construction1.jpg", category: "MATÉRIAUX" },
    { title: "Matériaux de Construction - Lot d'Acier Renforcé v2", price: 48000, description: "Barres de fer et d'acier de construction haute performance, résistantes à la torsion pour armatures de béton.", image: "./images/Materiaux de construction2.jpg", category: "MATÉRIAUX" },
    { title: "Matériaux de Construction - Briques Finies Premium v3", price: 35000, description: "Lot de briques de construction haut de gamme, calibrées avec précision pour une isolation thermique et une solidité maximale.", image: "./images/Materiaux de construction3.jpg", category: "MATÉRIAUX" },
    { title: "Matériaux de Construction - Revêtement Extérieur Protect v4", price: 22500, description: "Enduit et mortier spécial pour façades extérieures offrant une protection étanche contre les intempéries et la chaleur.", image: "./images/Materiaux de construction4.jpg", category: "MATÉRIAUX" },
    { title: "Matériaux de Construction - Peinture Isolante Spéciale v5", price: 32000, description: "Seau de peinture professionnelle longue durée, anti-fissures et lavable pour intérieurs et extérieurs modernes.", image: "./images/Materiaux de construction5.jpg", category: "MATÉRIAUX" },
    { title: "Matériaux de Construction - Kit de Fixation Fondations v6", price: 15000, description: "Ensemble complet de visserie, ancrages et fixations industrielles pour gros œuvres et menuiseries lourdes.", image: "./images/Materiaux de construction6.jpg", category: "MATÉRIAUX" },
    { title: "Matériaux de Construction - Outillage Chantier Pro v7", price: 55000, description: "Équipement et outils de maçonnerie professionnels pour accélérer les travaux de construction en toute sécurité.", image: "./images/Materiaux de construction7.jpg", category: "MATÉRIAUX" },

    // --- MERCERIE & COUTURE (🧵) ---
    { title: "Pack Mercerie - Fils de Soie Haute Couture v1", price: 8500, description: "Assortiment de fils à coudre de qualité supérieure en soie, couleurs éclatantes pour machines professionnelles.", image: "./images/Mercerie1.jpg", category: "MERCERIE" },
    { title: "Pack Mercerie - Boutons de Luxe Ornementaux v2", price: 4500, description: "Collection exclusive de boutons décoratifs haut de gamme pour sublimer les vestes, robes traditionnelles et bazins.", image: "./images/Mercerie2.jpg", category: "MERCERIE" },
    { title: "Pack Mercerie - Rubans et Dentelles Brodés v3", price: 12000, description: "Rouleaux de dentelles fines et rubans satinés pour finitions de broderies de grand luxe et robes de mariées.", image: "./images/Mercerie3.jpg", category: "MERCERIE" },
    { title: "Pack Mercerie - Kit Aiguilles et Épingles Pro v4", price: 3500, description: "Boîtier complet contenant des aiguilles de toutes tailles pour le piquage à la main ou sur machines industrielles.", image: "./images/Mercerie4.jpg", category: "MERCERIE" },
    { title: "Pack Mercerie - Ciseaux de Couturier Professionnel v5", price: 9500, description: "Ciseaux de coupe en acier inoxydable ultra-tranchants, ergonomiques pour des découpes de tissus nettes et sans effort.", image: "./images/Mercerie5.jpg", category: "MERCERIE" },
    { title: "Pack Mercerie - Accessoires de Mesure et Marquage v6", price: 2500, description: "Ensemble de mètres rubans professionnels, craies de tailleur et outils de traçage pour ateliers de couture.", image: "./images/Mercerie6.jpg", category: "MERCERIE" },
    { title: "Pack Mercerie - Organisateur d'Atelier Complet v7", price: 18000, description: "Mallette de rangement compartimentée contenant tous les accessoires indispensables pour couturiers exigeants.", image: "./images/Mercerie7.jpg", category: "MERCERIE" },

    // --- PIÈCES DÉTACHÉES (⚙️) ---
    { title: "Pièces Détachées - Filtre à Air Haute Performance v1", price: 14500, description: "Filtre mécanique de haute précision pour moteurs de véhicules, optimisant l'admission d'air et la combustion.", image: "./images/Pièces détachées1.jpg", category: "PIÈCES" },
    { title: "Pièces Détachées - Kit de Courroies Renforcées v4", price: 28000, description: "Courroie de distribution et de transmission ultra-résistante à la chaleur pour éviter les pannes moteurs.", image: "./images/Pièces détachées4.jpg", category: "PIÈCES" },
    { title: "Pièces Détachées - Plaquettes de Frein Premium v5", price: 19500, description: "Lot de plaquettes de frein avant/arrière offrant une friction maximale et un freinage sécurisé en toute situation.", image: "./images/Pièces détachées5.jpg", category: "PIÈCES" }
];

document.addEventListener('DOMContentLoaded', () => {
    loadStoreData();
});

// ==========================================
// 2. RECUPERATION ET FUSION GLOBAL DES APIS
// ==========================================
async function loadStoreData() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = `
        <div class="col-span-full text-center py-24 text-cyan-400 cosmic-font animate-pulse tracking-widest text-xs">
            🌌 APPLICATION EN COURS DE SYNCHRONISATION AVEC LE DÉPÔT GLOBAL... <br>
            <span class="text-[10px] text-gray-500 block mt-2">CHARGEMENT DE TOUTES LES DIMENSIONS EN COURS</span>
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
        console.log("Mode Local Activé avec succès. Les 17 produits physiques sont prioritaires.");
    }

    renderProducts();
}

// ==========================================
// 3. GENERATION DE LA GRILLE DES PRODUITS
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
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-16 text-gray-500 cosmic-font text-xs uppercase tracking-widest">
                Aucun produit disponible dans cette dimension actuellement.
            </div>
        `;
        return;
    }

    filtered.forEach(product => {
        const formattedPrice = new Intl.NumberFormat('fr-FR').format(product.price);
        const safeTitle = product.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        const card = document.createElement('div');
        card.className = "group bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-blue-500/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:scale-[1.01]";

        card.innerHTML = `
            <div>
                <div class="h-52 rounded-xl mb-4 bg-white flex items-center justify-center relative overflow-hidden p-3 shadow-inner">
                    <img src="${product.image}" alt="${product.title}" onerror="this.src='https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'" class="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300">
                    <div class="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[9px] text-cyan-400 cosmic-font border border-cyan-500/20 uppercase tracking-widest">
                        ${product.category}
                    </div>
                </div>
                <h3 class="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition mb-1.5">${product.title}</h3>
                <p class="text-xs text-slate-400 line-clamp-2 mb-4 h-8 overflow-hidden leading-relaxed">${product.description}</p>
            </div>
            <div class="mt-auto pt-2 border-t border-white/5">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-[10px] text-cyan-400 tracking-widest font-mono font-bold">FCFA</span>
                    <span class="text-base font-black text-slate-100 cosmic-font tracking-wide">${formattedPrice}</span>
                </div>
                <button onclick="addToCart('${safeTitle}', ${product.price})" class="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-300 transform active:scale-95 shadow-lg shadow-indigo-600/10 tracking-widest uppercase cosmic-font">
                    Acheter ✨
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// ==========================================
// 4. FILTRES DES CATÉGORIES ET NAVIGATION SMOOTH
// ==========================================
function filterCategory(categoryName) {
    currentCategory = categoryName;
    const categories = ['TOUT', 'BÉBÉ', 'ÉLECTRONIQUE', 'MATÉRIAUX', 'MERCERIE', 'PIÈCES', 'AUTRES'];
    const ids = { 'TOUT': 'btn-tout', 'BÉBÉ': 'btn-bebe', 'ÉLECTRONIQUE': 'btn-electronique', 'MATÉRIAUX': 'btn-materiaux', 'MERCERIE': 'btn-mercerie', 'PIÈCES': 'btn-pieces', 'AUTRES': 'btn-autres' };

    categories.forEach(cat => {
        const btn = document.getElementById(ids[cat]);
        if (!btn) return;
        if (cat === categoryName) {
            btn.className = "cosmic-font text-xs px-5 py-2.5 rounded-xl transition duration-300 font-bold tracking-wider bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg border border-cyan-400/30";
        } else {
            btn.className = "cosmic-font text-xs px-5 py-2.5 rounded-xl transition duration-300 font-bold tracking-wider text-gray-400 hover:text-white hover:bg-white/5";
        }
    });

    renderProducts();
    const catalogSection = document.getElementById('catalog-section');
    if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 5. GESTION DYNAMIQUE DU PANIER (AJOUT / QUANTITÉ / SUPPRESSION)
// ==========================================
function addToCart(productName, price) {
    if (modernCart[productName]) {
        modernCart[productName].quantity += 1;
    } else {
        modernCart[productName] = { price: price, quantity: 1 };
    }
    syncAndRenderCart();
}

function updateQuantity(productName, amount) {
    if (modernCart[productName]) {
        modernCart[productName].quantity += amount;
        if (modernCart[productName].quantity <= 0) {
            delete modernCart[productName];
        }
        syncAndRenderCart();
    }
}

function removeProductEntirely(productName) {
    if (modernCart[productName]) {
        delete modernCart[productName];
        syncAndRenderCart();
    }
}

function syncAndRenderCart() {
    totalAmount = 0;
    itemsCount = 0;
    selectedProducts = [];

    Object.keys(modernCart).forEach(name => {
        const item = modernCart[name];
        totalAmount += (item.price * item.quantity);
        itemsCount += item.quantity;
        for (let i = 0; i < item.quantity; i++) {
            selectedProducts.push(name);
        }
    });

    if(document.getElementById('cart-count')) document.getElementById('cart-count').innerText = itemsCount;
    if(document.getElementById('total-price')) document.getElementById('total-price').innerText = totalAmount.toLocaleString('fr-FR') + " FCFA";

    const cartContainer = document.getElementById('cart-items-container');

    if (cartContainer) {
        cartContainer.innerHTML = '';

        const items = Object.keys(modernCart);
        if (items.length === 0) {
            cartContainer.innerHTML = `<p id="empty-cart-message" class="text-gray-500 italic py-4">Aucun produit dans le panier. Explorez le catalogue pour ajouter des articles.</p>`;
            return;
        }

        items.forEach(name => {
            const item = modernCart[name];
            const safeName = name.replace(/'/g, "\\'");

            const row = document.createElement('div');
            row.className = "flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-white/5 text-xs text-gray-200 mt-2";
            row.innerHTML = `
                <span class="truncate pr-2 font-semibold flex-1">${name} (x${item.quantity})</span>
                <div class="flex items-center space-x-1 flex-shrink-0">
                    <button onclick="updateQuantity('${safeName}', -1)" class="w-5 h-5 bg-slate-800 rounded flex items-center justify-center text-gray-400 hover:text-white font-bold text-xs">-</button>
                    <button onclick="addToCart('${safeName}', ${item.price})" class="w-5 h-5 bg-slate-800 rounded flex items-center justify-center text-gray-400 hover:text-white font-bold text-xs">+</button>
                    <button onclick="removeProductEntirely('${safeName}')" class="w-5 h-5 bg-red-950/50 text-red-400 rounded flex items-center justify-center hover:bg-red-900 hover:text-white text-[10px]" title="Supprimer">🗑️</button>
                </div>
            `;
            cartContainer.appendChild(row);
        });
    }
}

// ==========================================
// 6. SÉCURISATION ET ENVOI DE LA COMMANDE SUR WHATSAPP
// ==========================================
function submitCosmicOrder(event) {
    event.preventDefault();

    if (totalAmount === 0 || selectedProducts.length === 0) {
        alert("⚠️ Votre panier est vide. Veuillez sélectionner des articles du catalogue interdimensionnel avant de commander.");
        return;
    }

    const nomClient = document.getElementById('customer-name').value.trim();
    const telephoneClient = document.getElementById('customer-phone').value.trim();
    const adresseClient = document.getElementById('customer-address').value.trim();

    let messageTxt = `🌌 *NOUVELLE COMMANDE GLOBAL - DOUMDELI BUSINESS* 🌌\n`;
    messageTxt += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    messageTxt += `👤 *DÉTAILS DU DESTINATAIRE :*\n`;
    messageTxt += `▪️ *Nom Complet :* ${nomClient}\n`;
    messageTxt += `▪️ *Téléphone WhatsApp :* ${telephoneClient}\n`;
    messageTxt += `▪️ *Adresse & Quartier (Bamako) :* ${adresseClient}\n\n`;

    messageTxt += `📦 *BORDEREAU DES ARTICLES COMMANDÉS :*\n`;
    messageTxt += `----------------------------------------------------------\n`;

    Object.keys(modernCart).forEach(name => {
        const item = modernCart[name];
        messageTxt += `🔹 _${name}_ \n    *Quantité :* x${item.quantity}\n    *Prix :* ${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA\n`;
    });

    messageTxt += `----------------------------------------------------------\n\n`;
    messageTxt += `💰 *MONTANT TOTAL À PAYER (COD) :* ${totalAmount.toLocaleString('fr-FR')} FCFA\n\n`;
    messageTxt += `🚀 *LOGISTIQUE :* Expédition validée. Paiement de main à main après vérification complète du colis auprès du livreur.\n\n`;
    messageTxt += `🛸 _Système automatisé Doumdeli Core v4.0 - Bamako, Mali._`;

    const encodedMessage = encodeURIComponent(messageTxt);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// ==========================================
// 7. ENREGISTREMENT DU SERVICE WORKER (OFFLINE SESSIONS)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Global Doumdeli Connecté avec succès !'))
            .catch(err => console.log('SW Registration Error', err));
    });
}