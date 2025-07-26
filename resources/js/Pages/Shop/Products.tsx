import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
import ShopLayout from '@/Layouts/ShopLayout'
import { SEO } from '@/Components/SEO'
import { ProductSection } from '@/Components/shop/ProductSection'
import AdvancedFilters from '@/Components/shop/AdvancedFilters'
import BreadcrumbNavigation, { generateBreadcrumbs } from '@/Components/shop/BreadcrumbNavigation'
import QuickViewModal from '@/Components/shop/QuickViewModal'
import { Button } from '@/Components/ui/button'
import { LayoutGrid, List, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { Product, Category, PaginatedResponse } from '@/types'
import { formatPrice } from '@/lib/utils'

interface Filters {
  category?: number
  min_price?: number
  max_price?: number
  promo: boolean
  in_stock: boolean
  sort: string
  brand?: string
  origin?: string
  rating?: number
  view?: 'grid' | 'list'
}

interface ProductsPageProps {
  products: PaginatedResponse<Product>
  categories: Category[]
  filters: Filters
}

export default function Products({ products, categories, filters }: ProductsPageProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(filters.view || 'grid')

  const handleFiltersChange = (newFilters: any) => {
    router.get('/products', { ...filters, ...newFilters }, { 
      preserveState: true, 
      preserveScroll: true 
    })
  }

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product)
    setIsQuickViewOpen(true)
  }

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    handleFiltersChange({ view: mode })
  }

  const handlePageChange = (page: number) => {
    router.get('/products', { ...filters, page }, { 
      preserveState: true,
      preserveScroll: false 
    })
  }

  // Prepare filter options
  const filterOptions = {
    categories: categories.map(cat => ({
      label: cat.name,
      value: cat.id.toString(),
      count: 0 // TODO: Get count from backend
    })),
    brands: [], // TODO: Get from backend
    origins: [], // TODO: Get from backend
  }

  const breadcrumbItems = generateBreadcrumbs('search', { query: 'Tous les produits' })

  return (
    <ShopLayout>
      <SEO 
        title="Tous les produits"
        description="Découvrez notre sélection complète de produits africains : épices, riz, alimentation et plus. Filtrez par catégorie, prix et disponibilité."
        keywords="produits africains, épices, riz, alimentation africaine, boutique en ligne, MonEpice&Riz"
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <BreadcrumbNavigation items={breadcrumbItems} className="mb-6" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tous les produits</h1>
            <p className="text-gray-600 mt-1">
              {products.total} produit{products.total > 1 ? 's' : ''} disponible{products.total > 1 ? 's' : ''}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleViewModeChange('grid')}
              aria-label="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleViewModeChange('list')}
              aria-label="Vue liste"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        <AdvancedFilters
          categories={filterOptions.categories}
          brands={filterOptions.brands}
          origins={filterOptions.origins}
          onFiltersChange={handleFiltersChange}
          productCount={products.total}
          className="mb-6"
        />

        {/* Products Section */}
        {viewMode === 'grid' ? (
          <ProductSection
            title=""
            products={products.data}
            onQuickView={handleQuickView}
          />
        ) : (
          // List view
          <div className="space-y-4">
            {products.data.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                <Link href={`/products/${product.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-lg hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    {product.category && (
                      <p className="text-sm text-gray-600">{product.category.name}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      {product.is_promoted && product.promo_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-green-600">
                            {formatPrice(product.promo_price)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.price_ttc)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold">
                          {formatPrice(product.effective_price)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickView(product)}
                      >
                        Vue rapide
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {products.last_page > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(products.current_page - 1)}
              disabled={products.current_page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            
            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, products.last_page) }, (_, i) => {
                let page: number
                if (products.last_page <= 5) {
                  page = i + 1
                } else if (products.current_page <= 3) {
                  page = i + 1
                } else if (products.current_page >= products.last_page - 2) {
                  page = products.last_page - 4 + i
                } else {
                  page = products.current_page - 2 + i
                }
                
                return (
                  <Button
                    key={page}
                    variant={page === products.current_page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(products.current_page + 1)}
              disabled={products.current_page === products.last_page}
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Quick View Modal */}
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