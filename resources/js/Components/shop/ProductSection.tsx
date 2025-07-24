import { Link } from '@inertiajs/react'
import { Plus, Star } from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Card } from '@/Components/ui/card'
import { Badge } from '@/Components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { ScrollArea, ScrollBar } from '@/Components/ui/scroll-area'

interface Product {
  id: number
  name: string
  slug: string
  price_ttc: number
  promo_price?: number
  is_promoted: boolean
  is_variable_weight: boolean
  effective_price: number
  main_image?: string
  category: {
    name: string
  }
  default_sku?: {
    id: number
    sku: string
    price_ttc: number
    stock_quantity: number
  }
}

interface ProductSectionProps {
  title: string
  products: Product[]
  viewAllLink?: string
}

export function ProductSection({ title, products, viewAllLink }: ProductSectionProps) {
  const { addItem } = useCart()

  const handleAddToCart = (product: Product) => {
    if (!product.default_sku) return

    addItem({
      id: product.id,
      productId: product.id,
      skuId: product.default_sku.id,
      name: product.name,
      image: product.main_image,
      price: product.effective_price || product.price_ttc || product.default_sku?.price_ttc || 0,
      isVariableWeight: product.is_variable_weight,
    })
  }

  return (
    <section className="px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          {viewAllLink && (
            <Link 
              href={viewAllLink}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Voir tout
            </Link>
          )}
        </div>

        {/* Mobile: Scroll horizontal */}
        <div className="md:hidden">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {products.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-40">
                  <ProductCard 
                    product={product} 
                    onAddToCart={() => handleAddToCart(product)}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Desktop: Grille */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              product={product} 
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Composant carte produit
function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: () => void }) {
  const hasStock = product.default_sku && product.default_sku.stock_quantity > 0
  const currentPrice = product.effective_price || product.price_ttc || product.default_sku?.price_ttc || 0

  return (
    <Card className="group h-full flex flex-col">
      <Link href={`/products/${product.slug}`} className="flex-1 flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          {product.main_image ? (
            <img 
              src={product.main_image} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">Image</span>
            </div>
          )}
          
          {/* Badge promo */}
          {product.is_promoted && product.promo_price && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2"
            >
              -{Math.round(((product.price_ttc - product.promo_price) / product.price_ttc) * 100)}%
            </Badge>
          )}
        </div>

        {/* Infos */}
        <div className="p-3 flex-1 flex flex-col">
          {/* Note fictive */}
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">4.8 (287)</span>
          </div>

          {/* Nom */}
          <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h4>
          
          {/* Catégorie */}
          <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>

          {/* Prix */}
          <div className="mt-auto">
            {product.is_promoted && product.promo_price ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(product.promo_price)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.price_ttc)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold">
                {formatPrice(currentPrice)}
              </span>
            )}
            {product.is_variable_weight && (
              <span className="text-xs text-gray-500 block">/kg</span>
            )}
          </div>
        </div>
      </Link>

      {/* Bouton ajouter */}
      <div className="p-3 pt-0">
        <Button
          onClick={onAddToCart}
          disabled={!hasStock}
          size="sm"
          className="w-full"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}