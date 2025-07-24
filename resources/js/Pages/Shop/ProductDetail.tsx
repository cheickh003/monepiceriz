import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  main_image?: string
  price_ttc: number
  promo_price?: number
  is_promoted: boolean
  effective_price: number
  category: {
    id: number
    name: string
    slug: string
  }
}

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)

  return (
    <>
      <Head title={`${product.name} - MonEpice&Riz`} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-gray-900">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <span>{product.category.name}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-2xl">Image</span>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="text-3xl font-bold mb-4">
                  {product.effective_price} F CFA
                </div>
              </div>

              <p className="text-gray-600">{product.description}</p>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span>Quantité</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    className="px-4 py-2"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    className="px-4 py-2"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button className="w-full bg-green-600 text-white py-3 rounded-lg">
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}