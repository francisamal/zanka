'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  tag: string
  price: string // e.g. "₹249"
  image: string
  desc: string
  quantity: number
  priceNumber: number
}

export interface Customer {
  id: string
  name: string
  email: string
  mobile: string
}

interface CartContextType {
  cartItems: CartItem[]
  customer: Customer | null
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  addToCart: (product: any) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  signInCustomer: (name: string, email: string, mobile: string) => Promise<Customer | null>
  signOutCustomer: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('zanka_cart')
      const storedCustomer = localStorage.getItem('zanka_customer')

      if (storedCart) {
        setCartItems(JSON.parse(storedCart))
      }
      if (storedCustomer) {
        setCustomer(JSON.parse(storedCustomer))
      }
    } catch (err) {
      console.error('Error loading cart/customer from localStorage:', err)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Sync cart to LocalStorage when it changes
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('zanka_cart', JSON.stringify(cartItems))
    } catch (err) {
      console.error('Error saving cart to localStorage:', err)
    }
  }, [cartItems, isLoaded])

  // Sync customer to LocalStorage when it changes
  useEffect(() => {
    if (!isLoaded) return
    try {
      if (customer) {
        localStorage.setItem('zanka_customer', JSON.stringify(customer))
      } else {
        localStorage.removeItem('zanka_customer')
      }
    } catch (err) {
      console.error('Error saving customer to localStorage:', err)
    }
  }, [customer, isLoaded])

  const parsePrice = (priceStr: string): number => {
    // e.g. "₹249" -> 249, "₹1,199" -> 1199
    const cleaned = priceStr.replace(/[^\d]/g, '')
    return parseInt(cleaned, 10) || 0
  }

  const addToCart = (product: any) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id)
      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      const priceNumber = parsePrice(product.price)
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          tag: product.tag,
          price: product.price,
          image: product.image,
          desc: product.desc,
          quantity: 1,
          priceNumber,
        },
      ]
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const signInCustomer = async (name: string, email: string, mobile: string): Promise<Customer | null> => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sign in')
      }

      const data = await response.json()
      setCustomer(data)
      return data
    } catch (err) {
      console.error('Error signing in customer:', err)
      return null
    }
  }

  const signOutCustomer = () => {
    setCustomer(null)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        customer,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        signInCustomer,
        signOutCustomer,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
