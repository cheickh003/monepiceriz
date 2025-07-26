import { Link } from '@inertiajs/react'
import SafeButton from '@/Components/SafeButton'
import { Truck, ShieldCheck, Clock, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { sanitizeForReact } from '@/lib/utils'

interface HeroSectionProps {
  promotions: {
    title: string
    subtitle: string
    image?: string
    badges?: string[]
  }
}

export function HeroSection({ promotions }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  // Sanitize promotions data to ensure no Symbol values
  const safePromotions = sanitizeForReact(promotions)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const trustIndicators = [
    { icon: Truck, text: "Livraison gratuite dès 25 000 CFA" },
    { icon: ShieldCheck, text: "Produits frais garantis" },
    { icon: Clock, text: "Livraison en 24h" }
  ]

  return (
    <section className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-r from-green-50 to-green-100 rounded-2xl overflow-hidden">
          {/* Contenu */}
          <div className="flex flex-col md:flex-row items-center">
            {/* Texte */}
            <div className={`flex-1 p-8 md:p-12 z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {safePromotions.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-6">
                {safePromotions.subtitle}
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 mb-8">
                {trustIndicators.map((indicator, index) => {
                  const Icon = indicator.icon
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon className="w-4 h-4 text-green-600" />
                      <span>{indicator.text}</span>
                    </div>
                  )
                })}
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products?promo=true">
                  <SafeButton size="lg" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto gap-2">
                    Acheter maintenant
                    <ChevronRight className="w-4 h-4" />
                  </SafeButton>
                </Link>
                <Link href="/categories">
                  <SafeButton size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto">
                    Découvrir nos catégories
                  </SafeButton>
                </Link>
              </div>
            </div>

            {/* Image décorative */}
            <div className={`flex-1 relative h-64 md:h-96 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Image de panier avec légumes */}
                <svg className="w-full h-full max-w-sm" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Panier */}
                  <path d="M100 150 L300 150 L280 250 L120 250 Z" fill="#8B4513" stroke="#654321" strokeWidth="2"/>
                  <path d="M90 150 L310 150" stroke="#654321" strokeWidth="4" strokeLinecap="round"/>
                  
                  {/* Légumes */}
                  {/* Tomate */}
                  <circle cx="150" cy="130" r="25" fill="#FF6347"/>
                  <path d="M150 105 L150 115" stroke="#228B22" strokeWidth="3" strokeLinecap="round"/>
                  
                  {/* Carotte */}
                  <path d="M200 120 L210 160" stroke="#FFA500" strokeWidth="20" strokeLinecap="round"/>
                  <path d="M205 115 L200 120 L195 115" stroke="#228B22" strokeWidth="3" fill="#228B22"/>
                  
                  {/* Brocoli */}
                  <circle cx="250" cy="130" r="20" fill="#228B22"/>
                  <circle cx="240" cy="125" r="8" fill="#32CD32"/>
                  <circle cx="260" cy="125" r="8" fill="#32CD32"/>
                  <circle cx="250" cy="115" r="8" fill="#32CD32"/>
                  
                  {/* Banane */}
                  <path d="M180 140 Q 190 160 200 140" stroke="#FFD700" strokeWidth="15" strokeLinecap="round" fill="none"/>
                  
                  {/* Poivron */}
                  <ellipse cx="280" cy="140" rx="15" ry="20" fill="#FF0000"/>
                  <ellipse cx="280" cy="125" rx="8" ry="5" fill="#8B0000"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Forme décorative en arrière-plan */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full filter blur-3xl opacity-30 -z-0"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-200 rounded-full filter blur-3xl opacity-30 -z-0"></div>
        </div>
      </div>
    </section>
  )
}