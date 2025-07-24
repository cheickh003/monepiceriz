import { Link } from '@inertiajs/react'
import { ScrollArea, ScrollBar } from '@/Components/ui/scroll-area'
import { Apple, Milk, Coffee, Droplets, Beef, Fish, Package, Sparkles } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  products_count?: number
}

interface CategoryGridProps {
  categories: Category[]
}

// Mapping des icônes
const iconMap: Record<string, any> = {
  'apple': Apple,
  'milk': Milk,
  'coffee': Coffee,
  'soap': Droplets,
  'beef': Beef,
  'fish': Fish,
  'package': Package,
  'default': Package,
}

function getCategoryIcon(iconName?: string) {
  if (!iconName) return Package
  return iconMap[iconName] || iconMap['default']
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Catégories</h3>
        
        {/* Mobile: Scroll horizontal */}
        <div className="md:hidden">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.icon)
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="flex-shrink-0"
                  >
                    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-20">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <span className="text-xs text-center line-clamp-2">
                        {category.name}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Desktop: Grille */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon)
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group"
              >
                <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-colors">
                    <Icon className="w-8 h-8 text-green-700" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    {category.products_count !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {category.products_count} produits
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}