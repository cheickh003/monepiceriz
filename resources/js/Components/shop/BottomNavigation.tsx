import { Link, usePage } from '@inertiajs/react'
import { Home, Heart, Search, User, ShoppingCart, Menu } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: boolean
  onClick?: () => void
}

export function BottomNavigation() {
  const { url, props } = usePage()
  const { itemCount, setIsOpen } = useCart()
  const [favoriteCount, setFavoriteCount] = useState(0)
  const user = props.auth?.user || null

  // Load favorite count from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('favoriteProducts')
      if (saved) {
        const favorites = JSON.parse(saved)
        if (Array.isArray(favorites)) {
          setFavoriteCount(favorites.length)
        } else {
          console.warn('Invalid favorites data, resetting')
          localStorage.removeItem('favoriteProducts')
          setFavoriteCount(0)
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
      localStorage.removeItem('favoriteProducts')
      setFavoriteCount(0)
    }
  }, [])

  const navItems: NavItem[] = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Recherche', href: '/search', icon: Search },
    { 
      name: 'Panier', 
      href: '#', 
      icon: ShoppingCart, 
      badge: true,
      onClick: () => setIsOpen(true)
    },
    { name: 'Favoris', href: '/favorites', icon: Heart, badge: favoriteCount > 0 },
    { name: user ? 'Profil' : 'Connexion', href: user ? '/profile' : '/login', icon: User },
  ]

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-bottom"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = item.href !== '#' && (url === item.href || (item.href !== '/' && url.startsWith(item.href)))
          const Icon = item.icon
          
          if (item.onClick) {
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all relative",
                  "hover:bg-gray-50 active:scale-95",
                  isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                )}
                aria-label={`${item.name}${item.badge && itemCount > 0 ? `, ${itemCount} articles` : ''}`}
              >
                <div className="relative">
                  <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                  {item.badge && itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center bg-green-600 text-white text-xs rounded-full">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="text-xs">{item.name}</span>
              </button>
            )
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all relative",
                "hover:bg-gray-50 active:scale-95",
                isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
              )}
              aria-label={`${item.name}${item.badge && favoriteCount > 0 ? `, ${favoriteCount} favoris` : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                {item.badge && item.name === 'Favoris' && favoriteCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                    {favoriteCount}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}