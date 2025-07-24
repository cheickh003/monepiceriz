import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: number
  productId: number
  skuId: number
  name: string
  image?: string
  price: number
  quantity: number
  weight?: number
  isVariableWeight?: boolean
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (skuId: number) => void
  updateQuantity: (skuId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalAmount: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Erreur lors du chargement du panier:', e)
      }
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.skuId === newItem.skuId)
      
      if (existingItem) {
        return prevItems.map(item =>
          item.skuId === newItem.skuId
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        )
      }
      
      return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }]
    })
  }

  const removeItem = (skuId: number) => {
    setItems(prevItems => prevItems.filter(item => item.skuId !== skuId))
  }

  const updateQuantity = (skuId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(skuId)
      return
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.skuId === skuId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
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