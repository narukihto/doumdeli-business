// ==========================================
// 1. CONFIGURATION ET VARIABLES GLOBAL
// ==========================================
const API_URL = 'https://fakestoreapi.com/products';
const EXCHANGE_RATE = 610; // Taux de conversion USD en FCFA pour Bamako

let totalAmount = 0;
let itemsCount = 0;
let selectedProducts = [];

// Liste de tes produits locaux (Images téléchargées dans le dossier images)
const LOCAL_PRODUCTS = [
    {
        title: "Pack Couches Bébé - Édition 1",
        price: 12500, // Prix en FCFA directement
        description: "Couches pour bébé de haute qualité, douces pour la peau et ultra absorbantes pour un confort optimal toute la journée.",
        image: "images/1 حزمة حفاضات أطفال .jpg",
        category: "BÉBÉ"
    },
    {
        title: "Pack Couches Bébé - Édition 2",
        price: 14000,
        description: "Pack de couches premium anti-fuites, parfaitement adaptées aux mouvements quotidiens de votre enfant.",
        image: "images/2 حزمة حفاضات أطفال .jpg",
        category: "BÉBÉ"
    },
    {
        title: "Pack Couches Bébé - Format Économique",
        price: 18500,
        description: "Grand format économique qui dure plus longtemps, offrant une protection douce et fiable pour la peau de votre bébé.",
        image: "images/3 حزمة حفاضات أطفال .jpg",
        category: "BÉBÉ"
    },
    {
        title: "Pack Couches Bébé - Format Familial",
        price: 22000,
        description: "La protection maximale pour les mamans à un prix compétitif avec une technologie d'absorption double.",
        image: "images/4 حزمة حفاضات أطفال .jpg",
        category: "BÉBÉ"
    },
    {
        title: "Pack Couches Bébé - Plus Premium",
        price: 25000,
        description: "Couches de nouvelle génération ultra-douces, spécialement conçues pour les peaux les plus sensibles.",
        image: "images/5 حزمة حفاضات أطفال .jpg",
        category: "BÉBÉ"
    },
    {
        title: "Appareil Électronique Intelligent - Alpha 1",
        price: 85000,
        description: "Dernière technologie intelligente avec des performances puissantes et un design moderne adapté à votre style de vie.",
        image: "images/1 اجهزه.jpg",
        category: "ÉLECTRONIQUE"
    },
    {
        title: "Système Électronique Avancé - Quantum 3",
        price: 120000,
        description: "Outil technologique de pointe offrant une grande efficacité et une intégration parfaite pour accomplir vos tâches rapidement.",
        image: "images/3 اجهزه.jpg",
        category: "ÉLECTRONIQUE"
    },
    {
        title: "Édition de Luxe - Tech Pro 5",
        price: 165000,
        description: "Version premium de luxe combinant puissance, élégance et fonctionnalités de nouvelle génération.",
        image: "images/5 اجهز.jpg",
        category: "ÉLECTRONIQUE"
    },
    {
        title: "Appareil Connecté - Édition Spéciale",
        price: 95000,
        description: "Produit technologique de haute qualité conçu pour améliorer l'efficacité et la productivité au quotidien.",
        image: "images/IMG-20260618-WA0056.jpg",
        category: "ÉLECTRONIQUE"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

// ==========================================
// 2. CHARGEMENT DES PRODUITS (LOCAL + API)
// ==========================================
async function fetchProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    try {
        // Effet de chargement cosmique
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-20 text-cyan-400 cosmic-font animate-pulse">
                 Connexion au dépôt cosmique et chargement des produits...
            </div>
        `;

        // Récupération des produits depuis l'API externe
        const response = await fetch(API_URL);
        const apiProducts = await response.json();

        // Nettoyage de la grille
        productsGrid.innerHTML = '';

        // En premier : Affichage de TES produits locaux en haut de la page
        LOCAL_PRODUCTS.forEach(product => {
            const formattedPrice = new Intl.NumberFormat('fr-FR').format(product.price);
            const card = createCardHTML(product.title, product.image, product.category, product.description, product.price, formattedPrice);
            productsGrid.appendChild(card);
        });

        // En deuxième : Affichage des produits de l'API juste après
        apiProducts.forEach(product => {
            const priceInFCFA = Math.round(product.price * EXCHANGE_RATE);
            const formattedPrice = new Intl.NumberFormat('fr-FR').format(priceInFCFA);
            const card = createCardHTML(product.title, product.image, product.category, product.description, priceInFCFA, formattedPrice);
            productsGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        // Mode hors-ligne : Si internet coupe, on affiche uniquement tes produits locaux
        productsGrid.innerHTML = '';
        LOCAL_PRODUCTS.forEach(product => {
            const formattedPrice = new Intl.NumberFormat('fr-FR').format(product.price);
            const card = createCardHTML(product.title, product.image, product.category, product.description, product.price, formattedPrice);
            productsGrid.appendChild(card);
        });
    }
}

// Fonction d'aide pour générer la structure HTML de chaque carte produit
function createCardHTML(title, image, category, description, rawPrice, formattedPrice) {
    const productCard = document.createElement('div');
    productCard.className = "group bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-blue-500/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]";
    
    productCard.innerHTML = `
        <div>
            <div class="h-48 rounded-xl mb-4 bg-white flex items-center justify-center relative overflow-hidden p-2">
                <img src="${image}" alt="${title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300">
                <div class="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[9px] text-cyan-400 cosmic-font">
                    ${category.toUpperCase()}
                </div>
            </div>
            
            <h3 class="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-cyan-400 transition mb-1">${title}</h3>
            <p class="text-xs text-slate-400 line-clamp-2 mb-4 h-8 overflow-hidden">${description}</p>
        </div>

        <div class="mt-auto">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs text-cyan-400 tracking-wider font-mono">XOF</span>
                <span class="text-base font-black text-slate-100 cosmic-font">${formattedPrice}</span>
            </div>
            <button onclick="addToCart('${title.replace(/'/g, "\\'")}', ${rawPrice})" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-300 transform active:scale-95 shadow-lg shadow-indigo-600/20">
                Acheter
            </button>
        </div>
    `;
    return productCard;
}

// ==========================================
// 3. GESTION DU PANIER ET DE LA FACTURE
// ==========================================
function addToCart(productName, price) {
    totalAmount += price;
    itemsCount += 1;
    selectedProducts.push(productName);

    // Mise à jour de l'affichage du panier en haut
    document.getElementById('cart-count').innerText = itemsCount;
    document.getElementById('total-price').innerText = totalAmount.toLocaleString('fr-FR') + " FCFA";

    // Mise à jour de la liste des articles sélectionnés dans la commande
    document.getElementById('selected-items-list').innerText = [...new Set(selectedProducts)].join(', ');
}

// ==========================================
// 4. TRAITEMENT DE LA COMMANDE (FORMULAIRE)
// ==========================================
function submitCosmicOrder(event) {
    event.preventDefault();

    if (totalAmount === 0) {
        alert("Votre panier est vide ! Veuillez ajouter des produits avant de confirmer.");
        return;
    }

    const clientName = document.getElementById('customer-name').value;

    // Cache le formulaire pour afficher l'animation de confirmation
    document.getElementById('checkout-form-container').classList.add('hidden');

    const statusClient = document.getElementById('status-client-name');
    const waitingStatus = document.getElementById('waiting-status-container');
    
    if (statusClient) statusClient.innerText = clientName;
    if (waitingStatus) waitingStatus.classList.remove('hidden');

    console.log("Commande confirmée pour: ", clientName, " d'un montant de: ", totalAmount);
}

// ==========================================
// 5. ENREGISTREMENT DU SERVICE WORKER (PWA)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Running successfully'))
            .catch(err => console.log('Service Worker Error', err));
    });
}