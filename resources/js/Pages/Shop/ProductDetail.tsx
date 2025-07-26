import { Link } from '@inertiajs/react'
import { useState } from 'react'
import { sanitizeForReact, safeGet, isValidPrice } from '@/lib/utils'
import { ChevronRight, Package } from 'lucide-react'
import ShopLayout from '@/Layouts/ShopLayout'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetail({ product: rawProduct, relatedProducts }: ProductDetailProps) {
  // Sanitize product data to prevent Symbol issues
  const product = sanitizeForReact<Product>(rawProduct)
  const [quantity, setQuantity] = useState(1)
  
  // Early return if product data is incomplete
  if (!product || !product.id) {
    return (
      <ShopLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Produit non trouvé</p>
            <Link href="/products" className="text-green-600 hover:text-green-700 mt-2 inline-block">
              Retour aux produits
            </Link>
          </div>
        </div>
      </ShopLayout>
    )
  }

  // Safe data extraction with fallbacks
  const categoryName = product.category?.name || 'Produit'
  const productName = product.name || 'Produit sans nom'
  const description = product.description || `Découvrez ${productName} sur MonEpice&Riz.`

  // Extraction de prix en toute sécurité
  const rawPrice: any = safeGet(product, 'effective_price', safeGet(product, 'price_ttc', undefined))
  const price: number | undefined = isValidPrice(rawPrice) ? (rawPrice as number) : undefined
  const imageUrl = product.image_url || null
  const hasStock = product.default_sku?.stock_quantity ? product.default_sku.stock_quantity > 0 : true
  const maxStock = product.default_sku?.stock_quantity || 99

  return (
    <ShopLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-gray-900">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-gray-900">Produits</Link>
            <ChevronRight className="w-4 h-4" />
            <span>{categoryName}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{productName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    const fallback = document.createElement('div');
                    fallback.innerHTML = '<svg class="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                    e.currentTarget.parentElement?.appendChild(fallback.firstChild!);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-300" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{productName}</h1>
                <div className="text-3xl font-bold mb-4">
                  {formatPrice(price)}
                </div>
              </div>

              <p className="text-gray-600">{description}</p>

              {/* Stock Status */}
              {!hasStock && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">Produit actuellement indisponible</p>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span>Quantité</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock || !hasStock}
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={!hasStock}
              >
                {hasStock ? 'Ajouter au panier' : 'Produit indisponible'}
              </button>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug}`}
                    className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                      {relatedProduct.image_url ? (
                        <img 
                          src={relatedProduct.image_url} 
                          alt={relatedProduct.name || 'Produit'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2">{relatedProduct.name || 'Produit'}</h3>
                      <p className="text-lg font-bold mt-1">
                        {formatPrice(relatedProduct.effective_price || relatedProduct.price_ttc || 0)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ShopLayout>
  )
}