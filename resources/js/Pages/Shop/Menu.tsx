import { Head, Link } from '@inertiajs/react'
import ShopLayout from '@/Layouts/ShopLayout'
import { ChevronRight, Package, ShoppingCart, Heart, MapPin, CreditCard, Phone, Info, LogOut } from 'lucide-react'

const menuItems = [
  { title: 'Mes commandes', href: '/orders', icon: Package },
  { title: 'Mon panier', href: '/cart', icon: ShoppingCart },
  { title: 'Mes favoris', href: '/favorites', icon: Heart },
  { title: 'Mes adresses', href: '/addresses', icon: MapPin },
  { title: 'Moyens de paiement', href: '/payment-methods', icon: CreditCard },
  { title: 'Nous contacter', href: '/contact', icon: Phone },
  { title: 'À propos', href: '/about', icon: Info },
]

export default function Menu() {
  return (
    <ShopLayout>
      <Head title="Menu" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Menu</h1>
        
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{item.title}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            )
          })}
          
          {/* Déconnexion */}
          <button
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-full text-red-600"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </div>
            <ChevronRight className="w-5 h-5 opacity-40" />
          </button>
        </div>
      </div>
    </ShopLayout>
  )
}