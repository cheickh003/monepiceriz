import { PropsWithChildren, useState, useEffect } from 'react'
import { MobileHeader } from '@/Components/shop/MobileHeader'
import { BottomNavigation } from '@/Components/shop/BottomNavigation'
import Footer from '@/Components/shop/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { ChevronUp } from 'lucide-react'
import { Button } from '@/Components/ui/button'
import { Toaster } from '@/Components/ui/toaster'
import { usePage } from '@inertiajs/react'

interface ShopLayoutProps extends PropsWithChildren {
  showFooter?: boolean
}

export default function ShopLayout({ children, showFooter = true }: ShopLayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const { props } = usePage()
  const user = props.auth?.user || null

  // Handle scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle offline/online detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Offline notification */}
        {isOffline && (
          <div className="bg-orange-500 text-white text-center py-2 px-4">
            <p className="text-sm">Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.</p>
          </div>
        )}
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50">
          Aller au contenu principal
        </a>

        {/* Header mobile et desktop */}
        <MobileHeader onCartClick={() => setIsCartOpen(true)} user={user} />
        
        {/* Contenu principal */}
        <main id="main-content" className="flex-grow pb-20 md:pb-0">
          {children}
        </main>
        
        {/* Footer */}
        {showFooter && <Footer />}
        
        {/* Navigation bottom pour mobile uniquement */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
        
        {/* Scroll to top button */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-24 right-4 md:bottom-8 bg-green-600 hover:bg-green-700 text-white shadow-lg z-40 rounded-full"
            aria-label="Retour en haut"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
        )}
        
        {/* Global toast notifications */}
        <Toaster />
        
        {/* Cookie consent (placeholder for future implementation) */}
        {/* <CookieConsent /> */}
      </div>
    </CartProvider>
  )
}