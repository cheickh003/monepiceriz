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