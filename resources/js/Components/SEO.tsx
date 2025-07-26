import { Head } from '@inertiajs/react'
import { safePriceToString, isValidPrice, safeStringify } from '@/lib/utils'

// Convertit n'importe quelle valeur potentiellement Symbol en chaîne
function safeMetaValue(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'symbol') return value.toString()
  return String(value)
}

interface SEOProps {
  title: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  price?: number
  currency?: string
  availability?: 'in stock' | 'out of stock'
  brand?: string
  category?: string
}

export function SEO({
  title,
  description = "MonEpice&Riz - Votre épicerie africaine en ligne. Découvrez nos produits d'épicerie, riz et spécialités africaines livrés chez vous.",
  keywords = "épicerie africaine, riz, épices, produits africains, livraison, Abidjan",
  image = "/images/og-default.jpg",
  url,
  type = 'website',
  price,
  currency = 'XOF',
  availability = 'in stock',
  brand = 'MonEpice&Riz',
  category
}: SEOProps) {
  const siteName = 'MonEpice&Riz'
  // Garantir que toutes les valeurs passées dans <Head> sont sûres
  const safeTitle = safeMetaValue(title)
  const safeDescription = safeMetaValue(description)
  const safeKeywords = safeMetaValue(keywords)
  const safeImage = safeMetaValue(image)
  const safeType = safeMetaValue(type)
  const safeBrand = safeMetaValue(brand)
  const safeAvailability = safeMetaValue(availability)
  const safeCategory = category ? safeMetaValue(category) : undefined

  const fullTitle = `${safeTitle} | ${siteName}`
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={safeDescription} />
      <meta name="keywords" content={safeKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={safeType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:image" content={safeImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="fr_CI" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={safeImage} />
      
      {/* Product specific meta tags */}
      {safeType === 'product' && isValidPrice(price) && (
        <>
          <meta property="product:price:amount" content={safePriceToString(price)} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={safeAvailability} />
          <meta property="product:brand" content={safeBrand} />
          {safeCategory && <meta property="product:category" content={safeCategory} />}
        </>
      )}
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={siteName} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {/* Language */}
      <meta httpEquiv="content-language" content="fr" />
      
      {/* Structured Data for Products */}
      {safeType === 'product' && isValidPrice(price) && (
        <script type="application/ld+json">
          {safeStringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": safeTitle,
            "description": safeDescription,
            "image": safeImage,
            "brand": {
              "@type": "Brand",
              "name": safeBrand
            },
            "offers": {
              "@type": "Offer",
              "url": currentUrl,
              "priceCurrency": currency,
              "price": price,
              "availability": `https://schema.org/${safeAvailability === 'in stock' ? 'InStock' : 'OutOfStock'}`
            }
          })}
        </script>
      )}
      
      {/* Structured Data for Website */}
      {safeType === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "url": currentUrl,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${currentUrl}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      )}
    </Head>
  )
}