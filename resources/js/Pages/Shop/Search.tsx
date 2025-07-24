import { Head, useForm } from '@inertiajs/react'
import ShopLayout from '@/Layouts/ShopLayout'
import { ProductSection } from '@/Components/shop/ProductSection'
import { Search as SearchIcon } from 'lucide-react'
import { Button } from '@/Components/ui/button'

interface SearchProps {
  query: string
  products: any
  categories: any[]
}

export default function Search({ query, products, categories }: SearchProps) {
  const { data, setData, get } = useForm({
    q: query || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    get('/search')
  }

  return (
    <ShopLayout>
      <Head title={query ? `Recherche: ${query}` : 'Recherche'} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Formulaire de recherche */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={data.q}
                onChange={(e) => setData('q', e.target.value)}
                placeholder="Rechercher des produits..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <Button type="submit">
              Rechercher
            </Button>
          </div>
        </form>

        {/* Résultats */}
        {query && (
          <>
            {/* Catégories trouvées */}
            {categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">
                  Catégories ({categories.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <a
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-medium">{category.name}</h3>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Produits trouvés */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Produits ({products.total || 0})
              </h2>
              {products.data && products.data.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <ProductSection 
                    title=""
                    products={products.data}
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucun produit trouvé pour "{query}"
                </p>
              )}
            </div>
          </>
        )}

        {!query && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Entrez un terme de recherche pour trouver des produits
            </p>
          </div>
        )}
      </div>
    </ShopLayout>
  )
}