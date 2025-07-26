import { SEO } from '@/Components/SEO'
import ShopLayout from '@/Layouts/ShopLayout'
import { HeroSection } from '@/Components/shop/HeroSection'
import { CategoryGrid } from '@/Components/shop/CategoryGrid'
import { ProductSection } from '@/Components/shop/ProductSection'
import TrustBadges from '@/Components/shop/TrustBadges'
import TestimonialsSection from '@/Components/shop/TestimonialsSection'
import NewsletterSection from '@/Components/shop/NewsletterSection'
import QuickViewModal from '@/Components/shop/QuickViewModal'
import { useState } from 'react'
import { useShopSync } from '@/hooks/useShopSync'
import { RefreshCw } from 'lucide-react'

interface HomeProps {
  categories: any[]
  promotions: {
    title: string
    subtitle: string
    image?: string
  }
  featured: {
    promoted: any[]
    new: any[]
    popular: any[]
  }
}

export default function Home({ categories, promotions, featured }: HomeProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const { needsUpdate, isRefreshing, refreshData } = useShopSync()

  const handleQuickView = (product: any) => {
    setSelectedProduct(product)
    setIsQuickViewOpen(true)
  }

  return (
    <ShopLayout>
      <SEO 
        title="Accueil"
        description="Découvrez une large sélection de produits africains authentiques, épices et riz de qualité. Livraison rapide à Abidjan et dans toute la Côte d'Ivoire."
        keywords="épicerie africaine, produits africains, riz, épices, livraison Abidjan, alimentation africaine, MonEpice&Riz"
        type="website"
      />
      
      {/* Notification de mise à jour */}
      {needsUpdate && (
        <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Mise à jour...' : 'Nouvelles données disponibles'}
          </span>
          {!isRefreshing && (
            <button
              onClick={refreshData}
              className="ml-2 bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded text-xs transition-colors"
            >
              Actualiser
            </button>
          )}
        </div>
      )}
      
      {/* Bannière héro */}
      <HeroSection promotions={promotions} />
      
      {/* Badges de confiance */}
      <TrustBadges />
      
      {/* Grille de catégories */}
      <CategoryGrid categories={categories} />
      
      {/* Produits en promotion */}
      {featured.promoted.length > 0 && (
        <ProductSection 
          title="Offres spéciales"
          products={featured.promoted}
          viewAllLink="/products?promo=true"
          onQuickView={handleQuickView}
        />
      )}
      
      {/* Section témoignages */}
      <TestimonialsSection />
      
      {/* Nouveaux produits */}
      {featured.new.length > 0 && (
        <ProductSection 
          title="Nouveautés"
          products={featured.new}
          viewAllLink="/products?sort=newest"
          onQuickView={handleQuickView}
        />
      )}
      
      {/* Produits populaires */}
      {featured.popular.length > 0 && (
        <ProductSection 
          title="Les plus populaires"
          products={featured.popular}
          viewAllLink="/products"
          onQuickView={handleQuickView}
        />
      )}
      
      {/* Section newsletter */}
      <NewsletterSection />
      
      {/* Modal de vue rapide */}
      <QuickViewModal 
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false)
          setSelectedProduct(null)
        }}
      />
    </ShopLayout>
  )
}