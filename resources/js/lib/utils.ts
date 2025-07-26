import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null | undefined, currency: string = 'CFA'): string {
  // Vérifier si le prix est valide
  if (price === null || price === undefined || isNaN(price)) {
    return 'Prix non disponible';
  }
  
  try {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('CFA', currency)
  } catch (error) {
    console.error('Error formatting price:', error)
    return `${price} ${currency}`
  }
}

export function formatWeight(weight: number): string {
  if (weight >= 1) {
    return `${weight} kg`
  }
  return `${weight * 1000} g`
}

// Safe object property access
export function safeGet<T>(obj: any, path: string, defaultValue?: T): T {
  try {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      result = result?.[key]
      if (result === undefined) {
        return defaultValue as T
      }
    }
    
    return result as T
  } catch (error) {
    console.error('Error accessing property:', path, error)
    return defaultValue as T
  }
}

// Safe localStorage parsing
export function safeParseJSON<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue
  
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return defaultValue
  }
}

// Validate product data
export function isValidProduct(product: any): boolean {
  return !!(
    product &&
    typeof product === 'object' &&
    product.id &&
    product.name &&
    (product.price_ttc !== undefined || product.effective_price !== undefined)
  )
}

// Validate category data
export function isValidCategory(category: any): boolean {
  return !!(
    category &&
    typeof category === 'object' &&
    category.id &&
    category.name
  )
}

// Debug helper for development
export function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data)
  }
}

// --- Price utilities (safe conversion & validation) ---

/**
 * Vérifie si la valeur fournie est un nombre de prix valide.
 * Un prix valide est un nombre fini, non NaN et positif ou nul.
 */
export function isValidPrice(value: any): value is number {
  return typeof value === 'number' && Number.isFinite(value) && !Number.isNaN(value) && value >= 0
}

/**
 * Convertit de manière sûre n'importe quelle valeur de prix en chaîne.
 *  - Gère les Symbol et autres types inattendus.
 *  - Retourne une chaîne vide lorsqu'aucun prix exploitable n'est fourni.
 */
export function safePriceToString(value: any): string {
  if (isValidPrice(value)) return String(value)
  if (typeof value === 'symbol') return value.toString()
  if (value === null || value === undefined) return ''
  try {
    const num = Number(value)
    if (isValidPrice(num)) return String(num)
  } catch (_) {
    /* ignore */
  }
  return ''
}

// --- Amélioration de safeStringify pour mieux gérer BigInt et Symbol ---
export function safeStringify(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'symbol' || typeof value === 'bigint') return value.toString()
  if (typeof value === 'function') return value.toString()

  try {
    return JSON.stringify(value, (key, val) => {
      if (typeof val === 'symbol' || typeof val === 'bigint') return val.toString()
      if (typeof val === 'function') return val.toString()
      return val
    })
  } catch (error) {
    console.error('Error stringifying value:', error)
    return String(value)
  }
}

// Validate React props to ensure no Symbol values
export function validateReactProps(props: any): boolean {
  if (!props || typeof props !== 'object') return true
  
  for (const key in props) {
    if (props.hasOwnProperty(key)) {
      const value = props[key]
      if (typeof value === 'symbol') {
        console.warn(`Found Symbol value in React props for key "${key}":`, value)
        return false
      }
      
      // Check nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (!validateReactProps(value)) return false
      }
    }
  }
  
  return true
}

// Sanitize object for React by converting Symbol values
export function sanitizeForReact<T = any>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForReact(item)) as unknown as T
  }
  
  const sanitized: any = {}
  
  for (const key in obj) {
    if ((obj as any).hasOwnProperty(key)) {
      const value = (obj as any)[key]
      
      if (typeof value === 'symbol') {
        sanitized[key] = value.toString()
      } else if (value && typeof value === 'object') {
        sanitized[key] = sanitizeForReact(value)
      } else {
        sanitized[key] = value
      }
    }
  }
  
  return sanitized as T
}