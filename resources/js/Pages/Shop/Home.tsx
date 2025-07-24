import { Head } from '@inertiajs/react'
import ShopLayout from '@/Layouts/ShopLayout'
import { HeroSection } from '@/Components/shop/HeroSection'
import { CategoryGrid } from '@/Components/shop/CategoryGrid'
import { ProductSection } from '@/Components/shop/ProductSection'

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
  return (
    <ShopLayout>
      <Head title="Accueil - MonEpice&Riz" />
      
      {/* Bannière héro */}
      <HeroSection promotions={promotions} />
      
      {/* Grille de catégories */}
      <CategoryGrid categories={categories} />
      
      {/* Produits en promotion */}
      {featured.promoted.length > 0 && (
        <ProductSection 
          title="Promotions"
          products={featured.promoted}
          viewAllLink="/products?promo=true"
        />
      )}
      
      {/* Nouveaux produits */}
      {featured.new.length > 0 && (
        <ProductSection 
          title="Nouveautés"
          products={featured.new}
          viewAllLink="/products?sort=newest"
        />
      )}
      
      {/* Produits populaires */}
      {featured.popular.length > 0 && (
        <ProductSection 
          title="Populaires"
          products={featured.popular}
          viewAllLink="/products"
        />
      )}
    </ShopLayout>
  )
}