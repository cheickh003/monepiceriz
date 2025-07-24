import { Link } from '@inertiajs/react'
import { ChevronRight, Package } from 'lucide-react'
import ShopLayout from '@/Layouts/ShopLayout'
import { SEO } from '@/Components/SEO'
import { formatPrice } from '@/lib/utils'
import { Product, Category, PaginatedResponse } from '@/types'

interface CategoryPageProps {
  category: Category
  subcategories: Category[]
  products: PaginatedResponse<Product>
  filters: any
}

export default function CategoryPage({ category, subcategories, products }: CategoryPageProps) {
  return (
    <ShopLayout>
      <SEO 
        title={category.name}
        description={category.description || `Découvrez notre sélection de ${category.name}. Produits de qualité, livraison rapide.`}
        keywords={`${category.name}, épicerie africaine, produits africains, MonEpice&Riz`}
      />
      
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
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                      
                      {/* Price */}
                      <div>
                        <span className="text-lg font-bold">
                          {formatPrice(product.effective_price)}
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
    </ShopLayout>
  )
}