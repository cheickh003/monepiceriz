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
  
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace('CFA', currency)
}

export function formatWeight(weight: number): string {
  if (weight >= 1) {
    return `${weight} kg`
  }
  return `${weight * 1000} g`
}