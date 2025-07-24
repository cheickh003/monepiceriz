import { MapPin, ShoppingCart, ChevronDown, Menu, Search, User, Sun, Moon, Package2 } from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/Components/ui/sheet'
import { CartSheet } from './CartSheet'
import { SearchBar } from './SearchBar'
import { Link } from '@inertiajs/react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/Components/ui/navigation-menu'

interface MobileHeaderProps {
  onCartClick: () => void
  user?: {
    name: string
    email: string
  } | null
}

export function MobileHeader({ onCartClick, user }: MobileHeaderProps) {
  const { itemCount, isOpen, setIsOpen } = useCart()
  const [address, setAddress] = useState('61 Hopper street, Abidjan')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // TODO: Implement dark mode logic
  }

  const navigationLinks = [
    { name: 'Catégories', href: '/categories' },
    { name: 'Offres', href: '/products?promo=true' },
    { name: 'Nouveautés', href: '/products?sort=newest' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Menu hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Menu principal"
            >
              <Menu className="h-6 w-6" />
            </Button>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Package2 className="h-6 w-6 text-green-600" />
              <span className="font-bold text-lg text-gray-900">MonEpice&Riz</span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Rechercher"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(true)}
                aria-label="Panier"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="px-4 pb-3 border-t">
              <SearchBar className="mt-3" />
            </div>
          )}

          {/* Localisation mobile */}
          <button className="flex items-center gap-2 px-4 pb-3 w-full hover:bg-gray-50">
            <MapPin className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-700 truncate">{address}</span>
            <ChevronDown className="h-3 w-3 text-gray-400 ml-auto" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Package2 className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-green-600">MonEpice&Riz</h1>
              </Link>
              
              {/* Localisation desktop */}
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <MapPin className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">{address}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Search Bar Desktop */}
            <div className="flex-1 max-w-xl mx-8">
              <SearchBar />
            </div>

            {/* Actions desktop */}
            <div className="flex items-center gap-4">
              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                aria-label="Changer le thème"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* User account */}
              {user ? (
                <Button variant="ghost" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden lg:inline">{user.name}</span>
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden lg:inline">Connexion</span>
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Button
                variant="default"
                className="relative bg-green-600 hover:bg-green-700"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span>Panier</span>
                {itemCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-white text-green-600"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Navigation desktop */}
          <nav className="border-t">
            <div className="max-w-7xl mx-auto px-8">
              <ul className="flex items-center gap-8">
                {navigationLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="block py-3 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-[80%] sm:w-[350px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-6">
            <ul className="space-y-4">
              {user && (
                <li>
                  <Link href="/account" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100">
                    <User className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </Link>
                </li>
              )}
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="block p-3 rounded-lg hover:bg-gray-100 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {!user && (
                <li>
                  <Link
                    href="/login"
                    className="block p-3 rounded-lg bg-green-600 text-white text-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          
          {/* Localisation dans le menu */}
          <div className="mt-8 pt-8 border-t">
            <button className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-gray-100">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div className="text-left flex-1">
                <p className="text-sm font-medium">Lieu de livraison</p>
                <p className="text-xs text-gray-500">{address}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cart Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Votre panier</SheetTitle>
          </SheetHeader>
          <CartSheet />
        </SheetContent>
      </Sheet>
    </>
  )
}