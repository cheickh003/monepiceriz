// Mapping complet des icônes de catégories
export const CATEGORY_ICON_MAP: Record<string, string> = {
  // Boissons
  'cup-soda': 'CupSoda',
  'soda': 'CupSoda',
  'droplet': 'Droplet',
  'water': 'GlassWater',
  'droplets': 'Droplets',
  
  // Alimentation
  'shopping-basket': 'ShoppingBasket',
  'butter': 'Sandwich',
  'cookie': 'Cookie',
  'ham': 'Drumstick',
  'fish': 'Fish',
  'package-2': 'Package2',
  'wheat': 'Wheat',
  'grain': 'Grain',
  'noodles': 'Soup',
  'rice': 'Package',
  'flask-conical': 'FlaskConical',
  
  // Épices et Sauces
  'pepper': 'Pepper',
  'sauce': 'Soup',
  'tomato': 'Cherry',
  'egg': 'Egg',
  'jar': 'Package',
  
  // Viandes
  'beef': 'Beef',
  'cow': 'Beef',
  'smoke': 'Flame',
  'sheep': 'Rabbit',
  'baby': 'Baby',
  'drumstick-bite': 'Drumstick',
  'hotdog': 'Sandwich',
  'bacon': 'Sandwich',
  'pie': 'PieChart',
  'utensils': 'Utensils',
  
  // Poissonnerie
  'waves': 'Waves',
  
  // Petit Déjeuner
  'coffee': 'Coffee',
  'candy-cane': 'Candy',
  'glass-water': 'GlassWater',
  
  // Hygiène
  'soap': 'Droplets',
  'toothbrush': 'Brush',
  'shower': 'Shower',
  'spray-can': 'SprayCan',
  'sparkles': 'Sparkles',
  'package': 'Package',
  
  // MonEpice&Riz
  'store': 'Store',
  
  // Default
  'default': 'Package'
};

// Constantes pour les couleurs de la marque
export const BRAND_COLORS = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// Configuration des filtres et options de tri
export const FILTER_OPTIONS = {
  sortOptions: [
    { value: 'relevance', label: 'Pertinence' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'name', label: 'Nom A-Z' },
    { value: 'newest', label: 'Nouveautés' },
    { value: 'rating', label: 'Meilleures notes' },
    { value: 'bestsellers', label: 'Meilleures ventes' },
  ],
  priceRanges: [
    { min: 0, max: 5000, label: 'Moins de 5 000 CFA' },
    { min: 5000, max: 15000, label: '5 000 - 15 000 CFA' },
    { min: 15000, max: 30000, label: '15 000 - 30 000 CFA' },
    { min: 30000, max: 50000, label: '30 000 - 50 000 CFA' },
    { min: 50000, max: null, label: 'Plus de 50 000 CFA' },
  ],
  ratings: [5, 4, 3, 2, 1],
};

// Textes et labels réutilisables
export const UI_TEXT = {
  common: {
    addToCart: 'Ajouter au panier',
    viewDetails: 'Voir les détails',
    quickView: 'Vue rapide',
    outOfStock: 'Rupture de stock',
    inStock: 'En stock',
    lowStock: 'Stock limité',
    lastPieces: 'Dernières pièces',
    freeShipping: 'Livraison gratuite',
    save: 'Économisez',
    new: 'Nouveau',
    sale: 'Promo',
    featured: 'Vedette',
  },
  cart: {
    empty: 'Votre panier est vide',
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    total: 'Total',
    checkout: 'Passer commande',
    continueShopping: 'Continuer vos achats',
  },
  search: {
    placeholder: 'Rechercher des produits...',
    noResults: 'Aucun résultat trouvé',
    recentSearches: 'Recherches récentes',
    popularSearches: 'Recherches populaires',
    seeAllResults: 'Voir tous les résultats',
  },
  filters: {
    clearAll: 'Effacer les filtres',
    apply: 'Appliquer',
    categories: 'Catégories',
    price: 'Prix',
    rating: 'Note',
    availability: 'Disponibilité',
    brand: 'Marque',
    origin: 'Origine',
  },
  newsletter: {
    title: 'Restez informé de nos offres',
    subtitle: 'Inscrivez-vous à notre newsletter',
    placeholder: 'Votre adresse email',
    subscribe: "S'inscrire",
    success: 'Merci de votre inscription !',
    error: 'Une erreur est survenue',
  },
};

// Configuration des animations et transitions
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// Constantes pour les seuils
export const THRESHOLDS = {
  stockLimit: {
    low: 5,
    critical: 2,
  },
  freeShipping: {
    amount: 25000,
    currency: 'CFA',
  },
  newProduct: {
    days: 30,
  },
  popularProduct: {
    minViews: 100,
    minSales: 50,
  },
};

// Configuration des métadonnées SEO par défaut
export const DEFAULT_SEO = {
  title: 'MonEpice&Riz - Votre épicerie en ligne de confiance',
  description: 'Découvrez une large sélection de produits frais, épices et aliments de qualité. Livraison rapide et gratuite dès 25 000 CFA.',
  keywords: 'épicerie en ligne, produits frais, épices, livraison rapide, alimentation',
  ogImage: '/images/og-image.jpg',
  twitterCard: 'summary_large_image',
};

// Configuration des formats de prix et devises
export const CURRENCY_CONFIG = {
  code: 'XOF',
  symbol: 'CFA',
  position: 'after', // 'before' or 'after'
  decimals: 2,
  thousandsSeparator: ' ',
  decimalSeparator: ',',
};

// Configuration des tailles d'images et breakpoints
export const IMAGE_CONFIG = {
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  },
  quality: {
    low: 60,
    medium: 80,
    high: 90,
  },
  formats: ['webp', 'jpg', 'png'],
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};