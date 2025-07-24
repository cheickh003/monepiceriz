import { Head, Link } from '@inertiajs/react'
import { ChevronRight } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parent_id?: number
  icon?: string
}

interface Product {
  id: number
  name: string
  slug: string
  price_ttc: number
  promo_price?: number
  is_promoted: boolean
  effective_price: number
  is_variable_weight: boolean
  main_image?: string
  category: Category
  default_sku?: {
    id: number
    sku: string
    price_ttc: number
    stock_quantity: number
  }
}

interface CategoryPageProps {
  category: Category
  subcategories: Category[]
  products: {
    data: Product[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  filters: any
}

export default function CategoryPage({ category, subcategories, products }: CategoryPageProps) {
  return (
    <>
      <Head title={`${category.name} - MonEpice&Riz`} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-gray-900">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-gray-900">Produits</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{category.name}</span>
          </nav>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Sous-catégories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subcategories.map((subcat) => (
                  <Link
                    key={subcat.id}
                    href={`/category/${subcat.slug}`}
                    className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="text-center">
                      {subcat.icon && (
                        <div className="text-2xl mb-2">{subcat.icon}</div>
                      )}
                      <h3 className="font-medium">{subcat.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {products.total} produit{products.total > 1 ? 's' : ''}
            </h2>
            
            {products.data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun produit trouvé dans cette catégorie.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.data.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">Image</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                      
                      {/* Price */}
                      <div>
                        <span className="text-lg font-bold">
                          {product.effective_price} F CFA
                        </span>
                        {product.is_variable_weight && (
                          <span className="text-xs text-gray-500 block">/kg</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {products.last_page > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: products.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded ${
                      page === products.current_page
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}