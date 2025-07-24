import { Link, usePage } from '@inertiajs/react'
import { Home, Heart, Search, User, Menu } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: any
}

const navItems: NavItem[] = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Favoris', href: '/favorites', icon: Heart },
  { name: 'Recherche', href: '/search', icon: Search },
  { name: 'Profil', href: '/profile', icon: User },
  { name: 'Menu', href: '/menu', icon: Menu },
]

export function BottomNavigation() {
  const { url } = usePage()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = url === item.href || (item.href !== '/' && url.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive 
                  ? 'text-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}