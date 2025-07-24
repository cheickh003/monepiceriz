import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import ShopLayout from '@/Layouts/ShopLayout'
import { Button } from '@/Components/ui/button'
import { Card } from '@/Components/ui/card'
import { Checkbox } from '@/Components/ui/checkbox'
import { Label } from '@/Components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { Slider } from '@/Components/ui/slider'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/Components/ui/sheet'

interface Category {
  id: number
  name: string
  slug: string
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

interface Filters {
  category?: number
  min_price?: number
  max_price?: number
  promo: boolean
  in_stock: boolean
  sort: string
}

interface ProductsPageProps {
  products: {
    data: Product[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  categories: Category[]
  filters: Filters
}

export default function Products({ products, categories, filters }: ProductsPageProps) {
  const { addItem } = useCart()
  const [priceRange, setPriceRange] = useState([filters.min_price || 0, filters.max_price || 10000])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    router.get('/products', newFilters, { preserveState: true, preserveScroll: true })
  }

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
  }

  const applyPriceFilter = () => {
    handleFilterChange('min_price', priceRange[0])
    handleFilterChange('max_price', priceRange[1])
  }

  const handleAddToCart = (product: Product) => {
    if (!product.default_sku) return

    addItem({
      id: product.id,
      productId: product.id,
      skuId: product.default_sku.id,
      name: product.name,
      image: product.main_image,
      price: product.effective_price,
      isVariableWeight: product.is_variable_weight,
    })
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Catégories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={filters.category === category.id}
                onCheckedChange={(checked) => 
                  handleFilterChange('category', checked ? category.id : undefined)
                }
              />
              <Label htmlFor={`cat-${category.id}`} className="cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Prix</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={10000}
            step={100}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
          <Button onClick={applyPriceFilter} size="sm" className="w-full">
            Appliquer
          </Button>
        </div>
      </div>

      {/* Other Filters */}
      <div>
        <h3 className="font-semibold mb-3">Filtres</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="promo"
              checked={filters.promo}
              onCheckedChange={(checked) => handleFilterChange('promo', checked)}
            />
            <Label htmlFor="promo" className="cursor-pointer">
              En promotion
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in_stock"
              checked={filters.in_stock}
              onCheckedChange={(checked) => handleFilterChange('in_stock', checked)}
            />
            <Label htmlFor="in_stock" className="cursor-pointer">
              En stock uniquement
            </Label>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ShopLayout>
      <Head title="Tous les produits - MonEpice&Riz" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tous les produits</h1>
          
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="position">Pertinence</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="name">Nom A-Z</SelectItem>
                <SelectItem value="newest">Nouveautés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <FilterContent />
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.data.map((product) => (
                <Card key={product.id} className="group h-full flex flex-col">
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
                      
                      {/* Promo Badge */}
                      {product.is_promoted && product.promo_price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                          -{Math.round(((product.price_ttc - product.promo_price) / product.price_ttc) * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                      
                      {/* Price */}
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
                            {formatPrice(product.effective_price)}
                          </span>
                        )}
                        {product.is_variable_weight && (
                          <span className="text-xs text-gray-500 block">/kg</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Add to Cart Button */}
                  <div className="p-3 pt-0">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.default_sku || product.default_sku.stock_quantity === 0}
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {products.last_page > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: products.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === products.current_page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.get('/products', { ...filters, page }, { preserveState: true })}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}