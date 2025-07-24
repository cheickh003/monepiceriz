import { Link } from '@inertiajs/react'
import { ScrollArea, ScrollBar } from '@/Components/ui/scroll-area'
import { Badge } from '@/Components/ui/badge'
import * as LucideIcons from 'lucide-react'
import { useState } from 'react'

interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  products_count?: number
  is_featured?: boolean
  is_on_sale?: boolean
}

interface CategoryGridProps {
  categories: Category[]
}

// Mapping complet des icônes basé sur le CategorySeeder
const iconMap: Record<string, keyof typeof LucideIcons> = {
  // Boissons
  'cup-soda': 'CupSoda',
  'soda': 'CupSoda',
  'droplet': 'Droplet',
  'water': 'GlassWater',
  'droplets': 'Droplets',
  
  // Alimentation
  'shopping-basket': 'ShoppingBasket',
  'butter': 'Sandwich',
  'cookie': 'Cookie',
  'ham': 'Drumstick',
  'fish': 'Fish',
  'package-2': 'Package2',
  'wheat': 'Wheat',
  'grain': 'Grain',
  'noodles': 'Soup',
  'rice': 'Package',
  'flask-conical': 'FlaskConical',
  
  // Épices et Sauces
  'pepper': 'Pepper',
  'sauce': 'Soup',
  'tomato': 'Cherry',
  'egg': 'Egg',
  'jar': 'Package',
  
  // Viandes
  'beef': 'Beef',
  'cow': 'Beef',
  'smoke': 'Flame',
  'sheep': 'Rabbit',
  'baby': 'Baby',
  'drumstick-bite': 'Drumstick',
  'hotdog': 'Sandwich',
  'bacon': 'Sandwich',
  'pie': 'PieChart',
  'utensils': 'Utensils',
  
  // Poissonnerie
  'waves': 'Waves',
  
  // Petit Déjeuner
  'coffee': 'Coffee',
  'candy-cane': 'Candy',
  'glass-water': 'GlassWater',
  
  // Hygiène
  'soap': 'Droplets',
  'toothbrush': 'Brush',
  'shower': 'Shower',
  'spray-can': 'SprayCan',
  'sparkles': 'Sparkles',
  'package': 'Package',
  
  // MonEpice&Riz
  'store': 'Store',
  
  // Default
  'default': 'Package'
}

function getCategoryIcon(iconName?: string) {
  if (!iconName) return LucideIcons.Package
  const iconKey = iconMap[iconName] || iconMap['default']
  return (LucideIcons as any)[iconKey] || LucideIcons.Package
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)

  return (
    <section className="px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">Nos Catégories</h3>
          <Link 
            href="/categories" 
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            Voir toutes les catégories
            <LucideIcons.ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
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
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="relative flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105 w-24">
                      {category.is_on_sale && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                          Promo
                        </Badge>
                      )}
                      <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center">
                        <Icon className="w-7 h-7 text-green-700" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-medium line-clamp-2">
                          {category.name}
                        </span>
                        {category.products_count !== undefined && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {category.products_count}
                          </p>
                        )}
                      </div>
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
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="relative flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all group-hover:scale-105 h-full">
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {category.is_featured && (
                      <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">
                        <LucideIcons.Star className="w-3 h-3 mr-0.5" />
                        Vedette
                      </Badge>
                    )}
                    {category.is_on_sale && (
                      <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                        Promo
                      </Badge>
                    )}
                  </div>
                  
                  <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-all duration-300 group-hover:rotate-12">
                    <Icon className="w-8 h-8 text-green-700 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-sm text-gray-900 group-hover:text-green-700 transition-colors">
                      {category.name}
                    </h4>
                    {category.products_count !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {category.products_count} produit{category.products_count > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  
                  {/* Hover indicator */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-green-600 transition-all duration-300 ${hoveredCategory === category.id ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}