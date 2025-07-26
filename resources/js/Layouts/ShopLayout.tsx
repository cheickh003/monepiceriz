import { PropsWithChildren, useState, useEffect } from 'react'
import { MobileHeader } from '@/Components/shop/MobileHeader'
import { BottomNavigation } from '@/Components/shop/BottomNavigation'
import Footer from '@/Components/shop/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { ChevronUp } from 'lucide-react'
import SafeButton from '@/Components/SafeButton'
import { Toaster } from '@/Components/ui/toaster'
import { usePage } from '@inertiajs/react'
import { sanitizeForReact } from '@/lib/utils'
import ErrorBoundary from '@/Components/ErrorBoundary'

interface ShopLayoutProps extends PropsWithChildren {
  showFooter?: boolean
}

export default function ShopLayout({ children, showFooter = true }: ShopLayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const { props } = usePage()
  // Sanitize props to ensure no Symbol values
  const safeProps = sanitizeForReact(props)
  const user = safeProps.auth?.user || null

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
    <ErrorBoundary>
      <CartProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
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
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        
        {/* Footer */}
        {showFooter && <Footer />}
        
        {/* Navigation bottom pour mobile uniquement */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
        
        {/* Scroll to top button */}
        {showScrollTop && (
          <SafeButton
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-24 right-4 md:bottom-8 bg-green-600 hover:bg-green-700 text-white shadow-lg z-40 rounded-full"
            aria-label="Retour en haut"
          >
            <ChevronUp className="w-5 h-5" />
          </SafeButton>
        )}
        
        {/* Global toast notifications */}
        <Toaster />
        
          {/* Cookie consent (placeholder for future implementation) */}
          {/* <CookieConsent /> */}
          
          {/* Debug Info in Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-20 right-4 p-2 bg-black/80 text-white text-xs rounded-md z-50 max-w-xs">
              <div>Network: {isOffline ? 'Offline' : 'Online'}</div>
              <div>User: {user ? user.name : 'Guest'}</div>
            </div>
          )}
        </div>
      </CartProvider>
    </ErrorBoundary>
  )
}