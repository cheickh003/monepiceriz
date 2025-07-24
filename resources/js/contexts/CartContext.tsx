import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/types'
import { toast } from '@/Components/ui/use-toast'

interface CartItem {
  id: number
  product: Product
  quantity: number
  selectedOptions?: Record<string, string>
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  totalAmount: number
  addToCart: (product: Product, quantity?: number, options?: Record<string, string>) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: number) => boolean
  getCartItem: (productId: number) => CartItem | undefined
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'monepiceriz_cart'
const CART_SYNC_EVENT = 'cart_updated'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error)
      }
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    // Dispatch event for cross-tab synchronization
    window.dispatchEvent(new CustomEvent(CART_SYNC_EVENT, { detail: items }))
  }, [items])

  // Listen for cart updates from other tabs
  useEffect(() => {
    const handleCartSync = (event: CustomEvent) => {
      setItems(event.detail)
    }

    window.addEventListener(CART_SYNC_EVENT as any, handleCartSync)
    return () => {
      window.removeEventListener(CART_SYNC_EVENT as any, handleCartSync)
    }
  }, [])

  const addToCart = (product: Product, quantity: number = 1, options?: Record<string, string>) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      )

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        
        toast({
          title: "Quantité mise à jour",
          description: `${product.name} - Quantité: ${updatedItems[existingItemIndex].quantity}`,
          variant: "success",
        })
        
        return updatedItems
      } else {
        // Add new item
        const newItem: CartItem = {
          id: product.id,
          product,
          quantity,
          selectedOptions: options,
        }
        
        toast({
          title: "Ajouté au panier",
          description: `${product.name} a été ajouté au panier`,
          variant: "success",
        })
        
        return [...prevItems, newItem]
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setItems(prevItems => {
      const removedItem = prevItems.find(item => item.id === productId)
      if (removedItem) {
        toast({
          title: "Retiré du panier",
          description: `${removedItem.product.name} a été retiré du panier`,
        })
      }
      return prevItems.filter(item => item.id !== productId)
    })
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    toast({
      title: "Panier vidé",
      description: "Tous les articles ont été retirés du panier",
    })
  }

  const isInCart = (productId: number) => {
    return items.some(item => item.id === productId)
  }

  const getCartItem = (productId: number) => {
    return items.find(item => item.id === productId)
  }

  // Calculate totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const totalAmount = items.reduce((total, item) => {
    const price = item.product.is_promoted && item.product.promo_price 
      ? item.product.promo_price 
      : item.product.price_ttc
    return total + (price * item.quantity)
  }, 0)

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      totalAmount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
      getCartItem,
      isOpen,
      setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}