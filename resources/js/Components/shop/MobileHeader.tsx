import { MapPin, ShoppingCart, ChevronDown } from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/Components/ui/sheet'
import { CartSheet } from './CartSheet'

interface MobileHeaderProps {
  onCartClick: () => void
}

export function MobileHeader({ onCartClick }: MobileHeaderProps) {
  const { totalItems, isOpen, setIsOpen } = useCart()
  const [address] = useState('61 Hopper street, Abidjan')

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Localisation */}
          <button className="flex items-center gap-2 flex-1">
            <MapPin className="h-5 w-5 text-gray-600" />
            <div className="text-left">
              <span className="text-sm font-medium text-gray-900 line-clamp-1">
                {address}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {/* Panier */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <h1 className="text-2xl font-bold text-green-600">MonEpice&Riz</h1>
            
            {/* Localisation desktop */}
            <button className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">{address}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Actions desktop */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="default"
              className="relative"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span>Panier</span>
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Sheet du panier */}
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