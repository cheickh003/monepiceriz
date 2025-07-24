import { Head } from '@inertiajs/react'

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
  const fullTitle = `${title} | ${siteName}`
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="fr_CI" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Product specific meta tags */}
      {type === 'product' && (
        <>
          <meta property="product:price:amount" content={String(price)} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
          <meta property="product:brand" content={brand} />
          {category && <meta property="product:category" content={category} />}
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
      {type === 'product' && price && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": title,
            "description": description,
            "image": image,
            "brand": {
              "@type": "Brand",
              "name": brand
            },
            "offers": {
              "@type": "Offer",
              "url": currentUrl,
              "priceCurrency": currency,
              "price": price,
              "availability": `https://schema.org/${availability === 'in stock' ? 'InStock' : 'OutOfStock'}`
            }
          })}
        </script>
      )}
      
      {/* Structured Data for Website */}
      {type === 'website' && (
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