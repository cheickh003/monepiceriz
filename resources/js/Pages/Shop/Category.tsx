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
  // Early return if category data is incomplete
  if (!category || !category.id) {
    return (
      <ShopLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Catégorie non trouvée</p>
            <Link href="/products" className="text-green-600 hover:text-green-700 mt-2 inline-block">
              Voir tous les produits
            </Link>
          </div>
        </div>
      </ShopLayout>
    )
  }

  // Safe data extraction with fallbacks
  const categoryName = category.name || 'Catégorie'
  const categoryDescription = category.description || `Découvrez notre sélection de ${categoryName}. Produits de qualité, livraison rapide.`
  const validSubcategories = Array.isArray(subcategories) ? subcategories : []
  const productData = products?.data || []
  const totalProducts = products?.total || 0
  const lastPage = products?.last_page || 1
  const currentPage = products?.current_page || 1

  return (
    <ShopLayout>
      <SEO 
        title={categoryName}
        description={categoryDescription}
        keywords={`${categoryName}, épicerie africaine, produits africains, MonEpice&Riz`}
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-gray-900">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-gray-900">Produits</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{categoryName}</span>
          </nav>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>

          {/* Subcategories */}
          {validSubcategories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Sous-catégories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {validSubcategories.map((subcat) => {
                  if (!subcat || !subcat.id) return null
                  
                  return (
                    <Link
                      key={subcat.id}
                      href={`/category/${subcat.slug || ''}`}
                      className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="text-center">
                        {subcat.icon && (
                          <div className="text-2xl mb-2">{subcat.icon}</div>
                        )}
                        <h3 className="font-medium">{subcat.name || 'Sous-catégorie'}</h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Products */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {totalProducts} produit{totalProducts > 1 ? 's' : ''}
            </h2>
            
            {productData.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Aucun produit trouvé dans cette catégorie.</p>
                <Link href="/products" className="text-green-600 hover:text-green-700">
                  Voir tous les produits
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productData.map((product) => {
                  if (!product || !product.id) return null
                  
                  const productName = product.name || 'Produit'
                  const productSlug = product.slug || ''
                  const productPrice = product.effective_price || product.price_ttc || 0
                  const productImage = product.image_url || null
                  const productCategory = product.category?.name || categoryName
                  
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${productSlug}`}
                      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      {/* Image */}
                      <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={productName}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.classList.add('flex', 'items-center', 'justify-center');
                                const icon = document.createElement('div');
                                icon.innerHTML = '<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                                parent.appendChild(icon.firstChild!);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{productName}</h3>
                        <p className="text-xs text-gray-500 mb-2">{productCategory}</p>
                        
                        {/* Price */}
                        <div>
                          <span className="text-lg font-bold">
                            {formatPrice(productPrice)}
                          </span>
                          {product.is_variable_weight && (
                            <span className="text-xs text-gray-500 block">/kg</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                  let pageNum: number;
                  if (lastPage <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= lastPage - 2) {
                    pageNum = lastPage - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Link
                      key={pageNum}
                      href={`/category/${category.slug}?page=${pageNum}`}
                      className={`px-3 py-1 rounded ${
                        pageNum === currentPage
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}