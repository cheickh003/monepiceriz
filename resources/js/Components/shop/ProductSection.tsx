import { Link } from '@inertiajs/react'
import { Plus, Star, Eye, Heart, ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Card } from '@/Components/ui/card'
import { Badge } from '@/Components/ui/badge'
import { Skeleton } from '@/Components/ui/skeleton'
import { formatPrice, cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { ScrollArea, ScrollBar } from '@/Components/ui/scroll-area'
import { useState, useCallback, useEffect, memo } from 'react'
import { toast } from '@/Components/ui/use-toast'
import { Product } from '@/types'

interface ProductSectionProps {
  title: string
  products: Product[]
  viewAllLink?: string
  loading?: boolean
  onQuickView?: (product: Product) => void
}

export function ProductSection({ title, products, viewAllLink, loading = false, onQuickView }: ProductSectionProps) {
  const { addToCart } = useCart()
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('favoriteProducts')
      if (saved) {
        setFavoriteProducts(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }, [])

  const handleAddToCart = useCallback((product: Product) => {
    try {
      if (!product.default_sku) {
        toast({
          title: "Erreur",
          description: "Ce produit n'est pas disponible pour le moment",
          variant: "destructive",
        })
        return
      }

      addToCart(product, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit au panier",
        variant: "destructive",
      })
    }
  }, [addToCart])

  const toggleFavorite = useCallback((productId: number) => {
    try {
      setFavoriteProducts(prev => {
        const isFavorite = prev.includes(productId)
        const newFavorites = isFavorite 
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
        
        // Save to localStorage
        localStorage.setItem('favoriteProducts', JSON.stringify(newFavorites))
        
        toast({
          title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
          description: isFavorite ? "Le produit a été retiré de vos favoris" : "Le produit a été ajouté à vos favoris",
          variant: "success",
        })
        
        return newFavorites
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris",
        variant: "destructive",
      })
    }
  }, [])

  return (
    <section className="px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
          {viewAllLink && (
            <Link 
              href={viewAllLink}
              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 group"
            >
              Voir tout
              <Plus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Mobile: Scroll horizontal */}
        <div className="md:hidden">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-44">
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : (
                products.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-44">
                    <ProductCard 
                      product={product} 
                      onAddToCart={() => handleAddToCart(product)}
                      onQuickView={onQuickView}
                      isFavorite={favoriteProducts.includes(product.id)}
                      onToggleFavorite={() => toggleFavorite(product.id)}
                    />
                  </div>
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Desktop: Grille */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (
            products.map((product) => (
              <ProductCard 
                key={product.id}
                product={product} 
                onAddToCart={() => handleAddToCart(product)}
                onQuickView={onQuickView}
                isFavorite={favoriteProducts.includes(product.id)}
                onToggleFavorite={() => toggleFavorite(product.id)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

// Composant carte produit
const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onQuickView,
  isFavorite = false,
  onToggleFavorite 
}: { 
  product: Product
  onAddToCart: () => void
  onQuickView?: (product: Product) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const hasStock = product.default_sku && product.default_sku.stock_quantity > 0
  const currentPrice = product.effective_price || product.price_ttc || product.default_sku?.price_ttc || 0
  const stockQuantity = product.default_sku?.stock_quantity || 0
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5
  const discount = product.is_promoted && product.promo_price 
    ? Math.round(((product.price_ttc - product.promo_price) / product.price_ttc) * 100)
    : 0

  return (
    <Card 
      className="group h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Link href={`/products/${product.slug}`}>
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </Link>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge 
                variant="destructive" 
                className="shadow-sm"
              >
                -{discount}%
              </Badge>
            )}
            {isLowStock && (
              <Badge 
                variant="outline" 
                className="bg-orange-50 text-orange-700 border-orange-200"
              >
                Dernières pièces
              </Badge>
            )}
          </div>

          {/* Actions rapides */}
          <div className={cn(
            "absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          )}>
            {onToggleFavorite && (
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white hover:bg-gray-100 shadow-md"
                onClick={(e) => {
                  e.preventDefault()
                  onToggleFavorite()
                }}
              >
                <Heart className={cn(
                  "w-4 h-4",
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                )} />
              </Button>
            )}
            {onQuickView && (
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white hover:bg-gray-100 shadow-md"
                onClick={(e) => {
                  e.preventDefault()
                  onQuickView(product)
                }}
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </Button>
            )}
          </div>
        </div>

        {/* Infos */}
        <Link href={`/products/${product.slug}`} className="p-4 flex-1 flex flex-col">
          {/* Note fictive */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-3 h-3",
                      i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    )} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">(287)</span>
            </div>
            {hasStock && stockQuantity <= 10 && (
              <span className="text-xs text-orange-600 font-medium">
                Stock limité
              </span>
            )}
          </div>

          {/* Catégorie */}
          <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
          
          {/* Nom */}
          <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-900 group-hover:text-green-600 transition-colors">
            {product.name}
          </h4>

          {/* Prix */}
          <div className="mt-auto">
            {product.is_promoted && product.promo_price ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(product.promo_price)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.price_ttc)}
                  </span>
                </div>
                <span className="text-xs text-green-600">
                  Économisez {formatPrice(product.price_ttc - product.promo_price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(currentPrice)}
              </span>
            )}
            {product.is_variable_weight && (
              <span className="text-xs text-gray-500 block">/kg</span>
            )}
          </div>
        </Link>
      </div>

      {/* Bouton ajouter */}
      <div className="p-4 pt-0">
        <Button
          onClick={onAddToCart}
          disabled={!hasStock}
          size="sm"
          className={cn(
            "w-full gap-2 transition-all",
            hasStock 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {hasStock ? (
            <>
              <ShoppingCart className="w-4 h-4" />
              Ajouter au panier
            </>
          ) : (
            "Rupture de stock"
          )}
        </Button>
      </div>
    </Card>
  )
})

ProductCard.displayName = 'ProductCard'

// Composant skeleton pour le chargement
function ProductCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <Skeleton className="aspect-square rounded-t-lg" />
      <div className="p-4 flex-1 flex flex-col">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="mt-auto">
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  )
}