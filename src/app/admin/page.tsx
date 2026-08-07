'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price_inr: number
  price_usd: number
  image_url: string
  tag: string
  category_id: string
}

interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'settings'>('products')
  const [viewState, setViewState] = useState<'list' | 'form'>('list')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [productStockFilter, setProductStockFilter] = useState('all')

  const filteredProducts = products.filter((product) => {
    const search = productSearch.trim().toLowerCase()
    const matchesSearch = !search || [product.name, product.tag, product.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search))
    const matchesCategory = productCategoryFilter === 'all' || product.category_id === productCategoryFilter
    // Stock is not part of the current product schema, so every catalog item is treated as in stock.
    const matchesStock = productStockFilter === 'all' || productStockFilter === 'in-stock'
    return matchesSearch && matchesCategory && matchesStock
  })

  // Toast notification state
  const [toast, setToast] = useState<Toast | null>(null)

  // Category Form State
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')

  // Product Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [prodName, setProdName] = useState('')
  const [prodSlug, setProdSlug] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPriceInr, setProdPriceInr] = useState('')
  const [prodPriceUsd, setProdPriceUsd] = useState('')
  const [prodTag, setProdTag] = useState('')
  const [prodCategoryId, setProdCategoryId] = useState('')
  const [prodImageUrl, setProdImageUrl] = useState('')

  // Upload State
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/products')
      const data = await res.json()
      if (res.ok) {
        setCategories(data.categories || [])
        setProducts(data.products || [])
      } else {
        showToast(data.error || 'Failed to fetch data', 'error')
      }
    } catch (err) {
      showToast('Error loading data', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Extended Interfaces for Orders & Admins
  interface OrderItem {
    id: string
    product_id: string
    product_name: string
    quantity: number
    price: number
  }

  interface Customer {
    id: string
    name: string
    email: string | null
    mobile: string | null
  }

  interface Order {
    id: string
    customer_id: string
    amount: number
    status: string
    razorpay_order_id: string | null
    razorpay_payment_id: string | null
    razorpay_signature: string | null
    created_at: string
    customer: Customer | null
    items: OrderItem[]
  }

  interface AdminUser {
    id: string
    email: string
    name: string | null
    receive_notifications: boolean
    created_at: string
  }

  interface NotificationLog {
    id: string
    order_id: string | null
    recipient_email: string
    recipient_type: 'customer' | 'admin'
    subject: string
    status: 'sent' | 'failed'
    error_message: string | null
    created_at: string
  }

  // Orders, Admins, and Logs states
  const [orders, setOrders] = useState<Order[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [logsLoading, setLogsLoading] = useState(false)

  // Admin notification form states
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminNotify, setNewAdminNotify] = useState(true)

  // Detailed view of an order
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  // Fetch orders list
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
      } else {
        showToast(data.error || 'Failed to fetch orders', 'error')
      }
    } catch (err) {
      showToast('Error loading orders', 'error')
    } finally {
      setOrdersLoading(false)
    }
  }

  // Fetch administrator notification list
  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true)
      const res = await fetch('/api/admin/admins')
      const data = await res.json()
      if (res.ok) {
        setAdmins(data.admins || [])
      } else {
        showToast(data.error || 'Failed to fetch admin list', 'error')
      }
    } catch (err) {
      showToast('Error loading admin list', 'error')
    } finally {
      setAdminsLoading(false)
    }
  }

  // Fetch notification dispatch logs
  const fetchLogs = async () => {
    try {
      setLogsLoading(true)
      const res = await fetch('/api/admin/notification-logs')
      const data = await res.json()
      if (res.ok) {
        setLogs(data.logs || [])
      } else {
        showToast(data.error || 'Failed to fetch notification logs', 'error')
      }
    } catch (err) {
      showToast('Error loading notification logs', 'error')
    } finally {
      setLogsLoading(false)
    }
  }

  // Clear notification dispatch logs
  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all notification logs?')) return

    try {
      const res = await fetch('/api/admin/notification-logs', {
        method: 'DELETE',
      })
      if (res.ok) {
        setLogs([])
        showToast('All email dispatch logs cleared!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to clear logs', 'error')
      }
    } catch (err) {
      showToast('Error clearing logs', 'error')
    }
  }

  // Trigger loading when tab switches
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    } else if (activeTab === 'settings') {
      fetchAdmins()
      fetchLogs()
    }
  }, [activeTab])

  // Update order status (paid, shipped, delivered, etc.)
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
        showToast(`Order status updated to ${status}!`, 'success')
      } else {
        showToast(data.error || 'Failed to update status', 'error')
      }
    } catch (err) {
      showToast('Error updating order status', 'error')
    }
  }

  // Delete an order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return

    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== orderId))
        showToast('Order deleted successfully!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete order', 'error')
      }
    } catch (err) {
      showToast('Error deleting order', 'error')
    }
  }

  // Add an admin notification email
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminEmail) {
      showToast('Email is required', 'error')
      return
    }

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName || null,
          receive_notifications: newAdminNotify
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setAdmins([...admins, data])
        setNewAdminEmail('')
        setNewAdminName('')
        setNewAdminNotify(true)
        showToast('Admin email registered successfully!', 'success')
      } else {
        showToast(data.error || 'Failed to register admin', 'error')
      }
    } catch (err) {
      showToast('Error registering admin', 'error')
    }
  }

  // Delete an admin notification email
  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin config?')) return

    try {
      const res = await fetch(`/api/admin/admins?id=${adminId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setAdmins(admins.filter(a => a.id !== adminId))
        showToast('Admin configuration deleted successfully!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete admin config', 'error')
      }
    } catch (err) {
      showToast('Error deleting admin config', 'error')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto slug generators
  const handleNameChange = (nameVal: string, isProduct: boolean) => {
    if (isProduct) {
      setProdName(nameVal)
      if (!editingId) {
        setProdSlug(nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
      }
    } else {
      setCatName(nameVal)
      setCatSlug(nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      showToast('Uploading image to Supabase Storage...', 'info')
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setProdImageUrl(data.url)
        showToast('Image uploaded successfully!', 'success')
      } else {
        showToast(data.error || 'Upload failed', 'error')
      }
    } catch (err) {
      showToast('Error uploading image', 'error')
    } finally {
      setUploading(false)
    }
  }

  // Category Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName || !catSlug) {
      showToast('Category name and slug are required', 'error')
      return
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName, slug: catSlug }),
      })
      const data = await res.json()
      if (res.ok) {
        setCategories([...categories, data])
        setCatName('')
        setCatSlug('')
        showToast('Category created successfully!', 'success')
        setViewState('list')
      } else {
        showToast(data.error || 'Failed to create category', 'error')
      }
    } catch (err) {
      showToast('Error creating category', 'error')
    }
  }

  // Category Delete
  const handleCategoryDelete = async (id: string) => {
    if (!confirm('Are you sure? Products in this category will have their category removed.')) return

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id))
        showToast('Category deleted successfully!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete category', 'error')
      }
    } catch (err) {
      showToast('Error deleting category', 'error')
    }
  }

  // Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodName || !prodSlug || !prodPriceInr || !prodImageUrl) {
      showToast('Name, slug, price, and image are required', 'error')
      return
    }

    const payload = {
      id: editingId,
      name: prodName,
      slug: prodSlug,
      description: prodDesc,
      price_inr: parseFloat(prodPriceInr),
      price_usd: parseFloat(prodPriceInr) / 83, // Auto-calculated
      image_url: prodImageUrl,
      tag: prodTag,
      category_id: prodCategoryId || null,
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        if (editingId) {
          setProducts(products.map(p => p.id === editingId ? data : p))
          showToast('Product updated successfully!', 'success')
        } else {
          setProducts([data, ...products])
          showToast('Product created successfully!', 'success')
        }
        resetProductForm()
        setViewState('list')
      } else {
        showToast(data.error || 'Failed to save product', 'error')
      }
    } catch (err) {
      showToast('Error saving product', 'error')
    }
  }

  // Product Delete
  const handleProductDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
        showToast('Product deleted successfully!', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete product', 'error')
      }
    } catch (err) {
      showToast('Error deleting product', 'error')
    }
  }

  const editProduct = (product: Product) => {
    setEditingId(product.id)
    setProdName(product.name)
    setProdSlug(product.slug)
    setProdDesc(product.description || '')
    setProdPriceInr(product.price_inr.toString())
    setProdPriceUsd(product.price_usd.toString())
    setProdTag(product.tag || '')
    setProdCategoryId(product.category_id || '')
    setProdImageUrl(product.image_url)
    setViewState('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetProductForm = () => {
    setEditingId(null)
    setProdName('')
    setProdSlug('')
    setProdDesc('')
    setProdPriceInr('')
    setProdPriceUsd('')
    setProdTag('')
    setProdCategoryId('')
    setProdImageUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen w-full bg-[#030303] p-3 sm:p-5 lg:p-8 flex overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 max-w-[1600px] mx-auto bg-[#0c0c0c] border border-white/10 rounded-[24px] overflow-hidden shadow-[0_0_80px_-10px_rgba(229,33,43,0.2)] relative min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-4rem)]">
      {/* Toast Overlay */}
      {toast && (
        <div 
          className="fixed bottom-5 right-5 z-50 px-6 py-4 rounded shadow-2xl border transition-all duration-300 font-body text-xs tracking-wider uppercase flex items-center gap-3"
          style={{
            background: toast.type === 'error' ? 'rgba(229, 33, 43, 0.95)' : 'rgba(8, 8, 8, 0.95)',
            borderColor: toast.type === 'error' ? '#e5212b' : toast.type === 'success' ? '#10B981' : 'rgba(255,255,255,0.2)',
            color: '#fff'
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: toast.type === 'error' ? '#fff' : toast.type === 'success' ? '#10B981' : '#3B82F6' }} />
          {toast.message}
        </div>
      )}

      {/* Mobile Header (Hidden on md) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <span className="font-body text-[8px] tracking-[0.4em] uppercase font-light text-red-500 block">Control Panel</span>
          <h1 className="font-display text-xl tracking-widest text-white">ZANKA ADMIN</h1>
        </div>
        <Link href="/" className="font-body text-[10px] tracking-widest uppercase border border-white/20 px-3 py-2 text-white/60">Shop</Link>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex overflow-x-auto border-b border-white/10 p-2 gap-2 hide-scrollbar">
         {['products', 'categories', 'orders', 'settings'].map(tab => (
           <button
             key={tab}
             onClick={() => { setActiveTab(tab as any); setViewState('list'); }}
             className={`font-body text-[10px] tracking-[0.2em] uppercase px-4 py-3 shrink-0 transition-colors ${
               activeTab === tab ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/10 !p-6 xl:!p-8 flex-col gap-10 shrink-0 h-full overflow-y-auto bg-[#070707] z-10 custom-scrollbar">
        <div>
          <span className="font-body text-[10px] tracking-[0.4em] uppercase font-light text-red-500 block mb-1">
            Control Panel
          </span>
          <h1 className="font-display text-3xl tracking-widest text-white">
            ZANKA
          </h1>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {/* Products */}
          <button
            onClick={() => { setActiveTab('products'); setViewState('list'); }}
            className={`flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase px-4 py-4 transition-all duration-300 text-left ${
              activeTab === 'products' ? 'bg-red-600 text-white font-bold' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Products
          </button>
          
          {/* Categories */}
          <button
            onClick={() => { setActiveTab('categories'); setViewState('list'); }}
            className={`flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase px-4 py-4 transition-all duration-300 text-left ${
              activeTab === 'categories' ? 'bg-red-600 text-white font-bold' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Categories
          </button>

          {/* Orders (Placeholder) */}
          <button
            onClick={() => { setActiveTab('orders'); setViewState('list'); }}
            className={`flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase px-4 py-4 transition-all duration-300 text-left ${
              activeTab === 'orders' ? 'bg-red-600 text-white font-bold' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Orders
          </button>

          {/* Settings (Placeholder) */}
          <button
            onClick={() => { setActiveTab('settings'); setViewState('list'); }}
            className={`flex items-center gap-3 font-body text-xs tracking-[0.2em] uppercase px-4 py-4 transition-all duration-300 text-left ${
              activeTab === 'settings' ? 'bg-red-600 text-white font-bold' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Settings
          </button>
        </nav>

        <Link 
          href="/"
          className="font-body text-xs tracking-[0.2em] uppercase px-5 py-4 border border-white/20 text-white/60 hover:text-white hover:border-white transition-all duration-300 text-center block"
        >
          ← View Shop
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0c0c0c] h-full custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full !px-5 !py-6 sm:!px-8 sm:!py-8 lg:!px-10 lg:!py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-body text-xs tracking-[0.3em] uppercase text-white/40">Loading Store Data...</p>
          </div>
        ) : (
          <>
            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="animate-in fade-in duration-500">
                {viewState === 'list' ? (
                  <>
                    <div className="flex flex-col gap-6 mb-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-red-500 mb-2">Admin / Products</p>
                          <h2 className="font-display text-3xl md:text-4xl tracking-widest text-white uppercase">Product Catalog</h2>
                          <p className="font-body text-xs text-white/50 tracking-wider mt-2">Manage your store inventory with a focused catalog view.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link href="/" className="hidden sm:block font-body text-[10px] tracking-[0.16em] uppercase border border-white/15 px-4 py-3 text-white/60 hover:border-white/40 hover:text-white transition-colors">
                            Live Storefront
                          </Link>
                          <button
                            onClick={() => { resetProductForm(); setViewState('form'); }}
                            className="bg-red-600 hover:bg-red-700 font-body text-xs tracking-[0.15em] uppercase font-bold py-3 px-5 text-white transition-colors rounded-sm"
                          >
                            + New Product
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        {[
                          { label: 'Total Products', value: products.length },
                          { label: 'In Stock', value: products.length },
                          { label: 'Sold Out', value: 0 },
                          { label: 'Active Categories', value: categories.length },
                        ].map((stat) => (
                          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                            <p className="font-body text-[9px] tracking-[0.18em] uppercase text-white/40">{stat.label}</p>
                            <p className="font-display text-2xl sm:text-3xl tracking-wider text-white mt-1">{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col lg:flex-row gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                        <label className="relative flex-1 min-w-0">
                          <span className="sr-only">Search products</span>
                          <input
                            type="search"
                            value={productSearch}
                            onChange={(event) => setProductSearch(event.target.value)}
                            placeholder="Search products, tags, or descriptions"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 font-body text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-red-500 transition-colors"
                          />
                        </label>
                        <label className="lg:w-52">
                          <span className="sr-only">Filter by category</span>
                          <select
                            value={productCategoryFilter}
                            onChange={(event) => setProductCategoryFilter(event.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 font-body text-xs text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                          >
                            <option value="all" className="bg-[#0c0c0c]">All Categories</option>
                            {categories.map((category) => <option key={category.id} value={category.id} className="bg-[#0c0c0c]">{category.name}</option>)}
                          </select>
                        </label>
                        <label className="lg:w-44">
                          <span className="sr-only">Filter by stock status</span>
                          <select
                            value={productStockFilter}
                            onChange={(event) => setProductStockFilter(event.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 font-body text-xs text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                          >
                            <option value="all" className="bg-[#0c0c0c]">All Stock</option>
                            <option value="in-stock" className="bg-[#0c0c0c]">In Stock</option>
                            <option value="sold-out" className="bg-[#0c0c0c]">Sold Out</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    {products.length === 0 ? (
                      <div className="text-center py-32 border border-white/10 bg-white/[0.02]">
                        <p className="font-body text-xs tracking-[0.25em] uppercase text-white/40 mb-4">No Products in the database.</p>
                        <button
                          onClick={() => { resetProductForm(); setViewState('form'); }}
                          className="font-body text-[10px] tracking-wider uppercase text-red-500 hover:text-white underline decoration-red-500/30 underline-offset-4"
                        >
                          Create your first product
                        </button>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-24 border border-dashed border-white/10 bg-white/[0.02]">
                        <p className="font-body text-xs tracking-[0.2em] uppercase text-white/40">No products match these filters.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                        {filteredProducts.map(p => {
                          const categoryName = categories.find(c => c.id === p.category_id)?.name || 'Uncategorized'
                          return (
                            <div key={p.id} className="border border-white/10 bg-white/[0.02] rounded-xl group relative flex flex-col justify-between overflow-hidden">
                              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-xl bg-black/30">
                                <Image 
                                  src={p.image_url} 
                                  alt={p.name} 
                                  fill 
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
                                />
                                <div className="absolute top-3 left-3 right-3 flex">
                                  <span className="max-w-full truncate rounded-md bg-red-600 px-2 py-1 font-body text-[8px] tracking-widest uppercase font-semibold shadow-xl">
                                    {p.tag || 'No Tag'}
                                  </span>
                                </div>
                                {/* Hover overlay for actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                  <button
                                    onClick={() => editProduct(p)}
                                    className="bg-white text-black font-body text-[10px] tracking-wider uppercase font-bold px-4 py-2 hover:bg-red-600 hover:text-white transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleProductDelete(p.id)}
                                    className="bg-red-600 text-white font-body text-[10px] tracking-wider uppercase font-bold px-4 py-2 hover:bg-red-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                  <p className="font-body text-[9px] tracking-[0.2em] text-white/40 uppercase mb-1">{categoryName}</p>
                                  <h3 className="font-body text-sm font-semibold text-white mb-2 line-clamp-1">{p.name}</h3>
                                  <p className="font-body text-xs text-white/50 line-clamp-2 font-light mb-4 h-8 leading-normal">{p.description || 'No description provided.'}</p>
                                </div>
                                <div className="flex items-end justify-between pt-4 border-t border-white/5">
                                  <div>
                                    <span className="font-body text-sm font-bold text-red-500">₹{p.price_inr}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <button
                      onClick={() => { resetProductForm(); setViewState('list'); }}
                      className="font-body text-xs tracking-[0.2em] uppercase text-white/50 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                    >
                      ← Back to Products
                    </button>
                    
                    <div className="bg-white/[0.02] border border-white/10 p-6 md:p-10 shadow-2xl">
                      <h2 className="font-display text-3xl tracking-widest text-white mb-8 uppercase border-b border-white/10 pb-4">
                        {editingId ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      
                      <form onSubmit={handleProductSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Column - Image Upload */}
                          <div>
                            <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-3">Product Image</label>
                            <div className="flex flex-col gap-4">
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              
                              {prodImageUrl ? (
                                <div className="relative border border-white/10 aspect-[3/4] w-full overflow-hidden bg-black/40 group">
                                  <Image 
                                    src={prodImageUrl} 
                                    alt="Product Preview" 
                                    fill 
                                    className="object-contain" 
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                    <button 
                                      type="button" 
                                      onClick={() => fileInputRef.current?.click()}
                                      className="mb-2 bg-white text-black font-body text-[10px] tracking-wider uppercase px-4 py-2 hover:bg-gray-200"
                                    >
                                      Change Image
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => setProdImageUrl('')}
                                      className="bg-red-600 text-white font-body text-[10px] tracking-wider uppercase px-4 py-2 hover:bg-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={uploading}
                                  onClick={() => fileInputRef.current?.click()}
                                  className="w-full aspect-[3/4] bg-white/5 border-2 border-dashed border-white/20 hover:border-red-500 transition-colors flex flex-col items-center justify-center focus:outline-none"
                                >
                                  {uploading ? (
                                    <>
                                      <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
                                      <span className="font-body text-[10px] tracking-wider uppercase text-red-500 animate-pulse">Uploading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-3xl mb-2 text-white/20">+</span>
                                      <span className="font-body text-[10px] tracking-[0.2em] uppercase text-white/40">Upload Photo</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Right Column - Details */}
                          <div className="space-y-6">
                            <div>
                              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Product Name</label>
                              <input 
                                type="text" 
                                value={prodName}
                                onChange={(e) => handleNameChange(e.target.value, true)}
                                className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="e.g. Vintage Anime Tee"
                              />
                            </div>

                            <div>
                              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Slug (URL identifier)</label>
                              <input 
                                type="text" 
                                value={prodSlug}
                                onChange={(e) => setProdSlug(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="e.g. vintage-anime-tee"
                              />
                            </div>

                            <div>
                              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Price (INR)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-3 font-body text-sm text-white/40">₹</span>
                                <input 
                                  type="number" 
                                  step="1"
                                  value={prodPriceInr}
                                  onChange={(e) => setProdPriceInr(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 pl-8 pr-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Tag / Brand</label>
                                <input 
                                  type="text" 
                                  value={prodTag}
                                  onChange={(e) => setProdTag(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                                  placeholder="e.g. Evangelion"
                                />
                              </div>
                              <div>
                                <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Category</label>
                                <select 
                                  value={prodCategoryId}
                                  onChange={(e) => setProdCategoryId(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                                >
                                  <option value="" className="bg-[#0c0c0c]">Select Category</option>
                                  {categories.map(c => (
                                    <option key={c.id} value={c.id} className="bg-[#0c0c0c]">{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Description</label>
                              <textarea 
                                value={prodDesc}
                                onChange={(e) => setProdDesc(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors h-32 resize-none"
                                placeholder="Describe the product details, condition, sizing, etc."
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-white/10">
                          <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 font-body text-xs tracking-[0.25em] uppercase font-bold py-4 px-10 text-white transition-colors"
                          >
                            {editingId ? 'Save Changes' : 'Create Product'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { resetProductForm(); setViewState('list'); }}
                            className="bg-transparent border border-white/20 hover:border-white font-body text-xs tracking-[0.25em] uppercase font-bold py-4 px-10 text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div className="animate-in fade-in duration-500 max-w-5xl">
                {viewState === 'list' ? (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                      <div>
                        <h2 className="font-display text-3xl md:text-4xl tracking-widest text-white uppercase mb-2">Categories</h2>
                        <p className="font-body text-xs text-white/50 tracking-wider">Organize your store sections</p>
                      </div>
                      <button
                        onClick={() => { setCatName(''); setCatSlug(''); setViewState('form'); }}
                        className="bg-red-600 hover:bg-red-700 font-body text-sm md:text-base tracking-[0.15em] uppercase font-bold py-4 px-8 text-white transition-all shadow-lg hover:shadow-red-500/20 rounded-sm"
                      >
                        + Add Category
                      </button>
                    </div>

                    {categories.length === 0 ? (
                      <div className="text-center py-32 border border-white/10 bg-white/[0.02]">
                        <p className="font-body text-xs tracking-[0.25em] uppercase text-white/40 mb-4">No categories found.</p>
                      </div>
                    ) : (
                      <div className="bg-white/[0.02] border border-white/10 overflow-x-auto">
                        <table className="w-full text-left font-body">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="py-5 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">Category Info</th>
                              <th className="py-5 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">Slug</th>
                              <th className="py-5 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categories.map(c => {
                              const count = products.filter(p => p.category_id === c.id).length
                              return (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                  <td className="py-5 px-6">
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm text-white font-semibold">{c.name}</span>
                                      <span className="bg-white/10 text-white/60 font-body text-[9px] tracking-wide px-2 py-0.5 rounded-full">
                                        {count} items
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-5 px-6 text-sm text-white/50">
                                    /{c.slug}
                                  </td>
                                  <td className="py-5 px-6 text-right">
                                    <button
                                      onClick={() => handleCategoryDelete(c.id)}
                                      className="font-body text-[10px] tracking-[0.1em] uppercase text-red-500 hover:text-white hover:bg-red-600 border border-red-500/20 px-3 py-1.5 transition-all duration-300 opacity-50 group-hover:opacity-100"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="max-w-2xl">
                    <button
                      onClick={() => setViewState('list')}
                      className="font-body text-xs tracking-[0.2em] uppercase text-white/50 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                    >
                      ← Back to Categories
                    </button>
                    
                    <div className="bg-white/[0.02] border border-white/10 p-6 md:p-10 shadow-2xl">
                      <h2 className="font-display text-2xl tracking-widest text-white mb-8 uppercase border-b border-white/10 pb-4">
                        Add New Category
                      </h2>
                      
                      <form onSubmit={handleCategorySubmit} className="space-y-6">
                        <div>
                          <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Category Name</label>
                          <input 
                            type="text" 
                            value={catName}
                            onChange={(e) => handleNameChange(e.target.value, false)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-4 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="e.g. Outerwear"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Slug (URL identifier)</label>
                          <input 
                            type="text" 
                            value={catSlug}
                            onChange={(e) => setCatSlug(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-4 py-4 font-body text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                            placeholder="e.g. outerwear"
                          />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/10">
                          <button
                            type="submit"
                            className="flex-1 bg-red-600 hover:bg-red-700 font-body text-xs tracking-[0.25em] uppercase font-bold py-4 text-white transition-colors"
                          >
                            Create Category
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewState('list')}
                            className="bg-transparent border border-white/20 hover:border-white font-body text-xs tracking-[0.25em] uppercase font-bold py-4 px-10 text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8">
                  <h2 className="font-display text-3xl md:text-4xl tracking-widest text-white uppercase mb-2">Customer Orders</h2>
                  <p className="font-body text-xs text-white/50 tracking-wider">Monitor transactions, update fulfillment statuses, and manage sales history.</p>
                </div>

                {ordersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-body text-xs tracking-widest uppercase text-white/40">Loading Orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 border border-white/10 bg-white/[0.02]">
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-white/40">No orders recorded in the system.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Orders Table */}
                    <div className="bg-white/[0.02] border border-white/10 overflow-x-auto">
                      <table className="w-full text-left font-body">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5">
                            <th className="py-4 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">Order ID</th>
                            <th className="py-4 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">Customer</th>
                            <th className="py-4 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">Date</th>
                            <th className="py-4 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">Amount</th>
                            <th className="py-4 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold">Status</th>
                            <th className="py-4 px-6 text-[10px] tracking-[0.2em] uppercase text-white/40 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => {
                            const isExpanded = expandedOrderId === order.id
                            const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                            
                            // Status style mappings
                            let statusColor = 'border-white/20 text-white/60 bg-white/5'
                            if (order.status === 'paid') statusColor = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                            else if (order.status === 'pending') statusColor = 'border-amber-500/30 text-amber-400 bg-amber-500/5'
                            else if (order.status === 'shipped') statusColor = 'border-sky-500/30 text-sky-400 bg-sky-500/5'
                            else if (order.status === 'delivered') statusColor = 'border-purple-500/30 text-purple-400 bg-purple-500/5'
                            else if (order.status === 'failed') statusColor = 'border-rose-500/30 text-rose-400 bg-rose-500/5'

                            return (
                              <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                                <td className="py-4 px-6">
                                  <button
                                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                    className="font-mono text-xs text-white hover:text-red-500 transition-colors uppercase tracking-wider text-left"
                                  >
                                    #{order.id.substring(0, 8)}...
                                  </button>
                                </td>
                                <td className="py-4 px-6 text-sm text-white font-medium">
                                  {order.customer?.name || 'Guest Customer'}
                                </td>
                                <td className="py-4 px-6 text-sm text-white/60">
                                  {orderDate}
                                </td>
                                <td className="py-4 px-6 text-sm font-bold text-red-500">
                                  ₹{order.amount}
                                </td>
                                <td className="py-4 px-6">
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className={`px-3 py-1 text-xs border font-body font-semibold focus:outline-none uppercase tracking-wider rounded-sm cursor-pointer ${statusColor}`}
                                    style={{ background: '#0a0a0a' }}
                                  >
                                    <option value="pending" className="bg-[#0c0c0c] text-amber-400">Pending</option>
                                    <option value="paid" className="bg-[#0c0c0c] text-emerald-400">Paid</option>
                                    <option value="shipped" className="bg-[#0c0c0c] text-sky-400">Shipped</option>
                                    <option value="delivered" className="bg-[#0c0c0c] text-purple-400">Delivered</option>
                                    <option value="failed" className="bg-[#0c0c0c] text-rose-400">Failed</option>
                                  </select>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                      className="font-body text-[10px] tracking-wider uppercase border border-white/20 px-3 py-1.5 hover:border-white hover:text-white transition-colors"
                                    >
                                      {isExpanded ? 'Hide Details' : 'View Details'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteOrder(order.id)}
                                      className="font-body text-[10px] tracking-wider uppercase border border-red-500/20 text-red-500 px-3 py-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Order Details Expanded Panel */}
                    {expandedOrderId && (() => {
                      const expandedOrder = orders.find(o => o.id === expandedOrderId)
                      if (!expandedOrder) return null
                      return (
                        <div className="bg-white/[0.02] border border-white/10 p-6 md:p-8 animate-in slide-in-from-top-4 duration-300 relative shadow-2xl">
                          <button
                            onClick={() => setExpandedOrderId(null)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white text-xl transition-colors font-bold"
                          >
                            &times;
                          </button>

                          <div className="flex flex-col md:flex-row justify-between mb-8 border-b border-white/10 pb-6 gap-4">
                            <div>
                              <span className="font-body text-[9px] tracking-[0.35em] text-red-500 uppercase block mb-1">Detailed View</span>
                              <h3 className="font-display text-2xl text-white tracking-widest uppercase">Order Summary</h3>
                              <p className="font-mono text-xs text-white/40 mt-1 uppercase">ID: {expandedOrder.id}</p>
                            </div>
                            <div className="flex flex-col md:items-end justify-center">
                              <span className="font-body text-xs text-white/50 mb-1">Placement Time</span>
                              <span className="font-body text-sm text-white font-medium">
                                {new Date(expandedOrder.created_at).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Customer Profile */}
                            <div className="bg-white/[0.01] border border-white/5 p-5">
                              <h4 className="font-body text-[10px] tracking-[0.2em] text-white/40 uppercase font-bold mb-4 border-b border-white/5 pb-2">Customer Profile</h4>
                              <table className="w-full text-left font-body text-sm">
                                <tbody>
                                  <tr>
                                    <td className="py-2 text-white/50 font-medium w-28">Name:</td>
                                    <td className="py-2 text-white font-semibold">{expandedOrder.customer?.name || 'Guest Customer'}</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-white/50 font-medium">Email:</td>
                                    <td className="py-2 text-white">
                                      {expandedOrder.customer?.email ? (
                                        <a href={`mailto:${expandedOrder.customer.email}`} className="text-red-400 hover:underline">{expandedOrder.customer.email}</a>
                                      ) : 'N/A'}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-white/50 font-medium">Mobile No:</td>
                                    <td className="py-2 text-white">{expandedOrder.customer?.mobile || 'N/A'}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Transaction Details */}
                            <div className="bg-white/[0.01] border border-white/5 p-5">
                              <h4 className="font-body text-[10px] tracking-[0.2em] text-white/40 uppercase font-bold mb-4 border-b border-white/5 pb-2">Payment Details</h4>
                              <table className="w-full text-left font-body text-sm">
                                <tbody>
                                  <tr>
                                    <td className="py-2 text-white/50 font-medium w-36">Razorpay Order ID:</td>
                                    <td className="py-2 text-white font-mono text-xs">{expandedOrder.razorpay_order_id || 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-white/50 font-medium">Razorpay Payment:</td>
                                    <td className="py-2 text-white font-mono text-xs">{expandedOrder.razorpay_payment_id || 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-white/50 font-medium">Fulfillment Status:</td>
                                    <td className="py-2 font-semibold uppercase tracking-wider text-xs">
                                      <span className={
                                        expandedOrder.status === 'paid' ? 'text-emerald-400' :
                                        expandedOrder.status === 'pending' ? 'text-amber-400' :
                                        expandedOrder.status === 'shipped' ? 'text-sky-400' :
                                        expandedOrder.status === 'delivered' ? 'text-purple-400' : 'text-rose-400'
                                      }>
                                        {expandedOrder.status}
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Line Items */}
                          <div>
                            <h4 className="font-body text-[10px] tracking-[0.2em] text-white/40 uppercase font-bold mb-4 border-b border-white/5 pb-2">Items Purchased</h4>
                            <table className="w-full text-left font-body">
                              <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                  <th className="py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-white/40 font-semibold">Product Name</th>
                                  <th className="py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-white/40 font-semibold text-center w-24">Quantity</th>
                                  <th className="py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-white/40 font-semibold text-right w-32">Unit Price</th>
                                  <th className="py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-white/40 font-semibold text-right w-32">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {expandedOrder.items.map((item) => (
                                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                    <td className="py-3 px-4 text-sm text-white font-medium">
                                      {item.product_name}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-white/60 text-center font-mono">
                                      {item.quantity}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-white/80 text-right">
                                      ₹{item.price}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-red-500 text-right font-bold">
                                      ₹{item.price * item.quantity}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-white/[0.01] font-bold">
                                  <td colSpan={3} className="py-4 px-4 text-right text-white/60 text-sm">Grand Total Amount:</td>
                                  <td className="py-4 px-4 text-right text-red-500 text-lg">₹{expandedOrder.amount}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS / ADMIN NOTIFICATIONS TAB */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-500 max-w-5xl">
                <div className="mb-8">
                  <h2 className="font-display text-3xl md:text-4xl tracking-widest text-white uppercase mb-2">Notification Settings</h2>
                  <p className="font-body text-xs text-white/50 tracking-wider">Configure email dispatch rules and manage administrators receiving transactional alerts.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: SES Server Status & Config Info */}
                  <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/10 p-6">
                      <span className="font-body text-[8px] tracking-[0.4em] uppercase font-light text-emerald-500 block mb-1">
                        Infrastructure Status
                      </span>
                      <h3 className="font-display text-lg tracking-wider text-white uppercase mb-6">
                        Amazon SES Setup
                      </h3>

                      <div className="space-y-4 font-body text-xs text-white/70">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                          <div>
                            <p className="font-semibold text-white">Sending Node: ONLINE</p>
                            <p className="text-[10px] text-white/40 mt-0.5">Connecting via SMTP port 465 (SSL)</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-white/40 uppercase tracking-widest block">SMTP Endpoint Region</span>
                          <span className="font-mono text-white text-xs block bg-black/40 px-2.5 py-1.5 rounded-sm">ap-south-1 (Mumbai)</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-white/40 uppercase tracking-widest block">Sender Envelope From</span>
                          <span className="font-mono text-white text-xs block bg-black/40 px-2.5 py-1.5 rounded-sm">noreply@zanka.shop</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-white/40 uppercase tracking-widest block">Verified Domain</span>
                          <span className="font-mono text-white text-xs block bg-black/40 px-2.5 py-1.5 rounded-sm">zanka.shop</span>
                        </div>

                        <p className="text-[10px] text-white/40 leading-relaxed pt-2">
                          * Amazon SES is configured in ap-south-1. Since the sending identity is verified, we can send transactional "order placed" notifications securely to customers and admins.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/10 p-6">
                      <h3 className="font-display text-sm tracking-wider text-white uppercase mb-3">
                        Alert Triggers
                      </h3>
                      <ul className="list-disc pl-4 font-body text-[11px] text-white/50 space-y-2">
                        <li><strong>Order Placed</strong>: Email sent automatically to the customer with an invoice and to all registered administrators.</li>
                        <li><strong>Fulfillment Updates</strong>: Coming soon.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Middle & Right Column: Admin List & Add Form */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Add Admin Form */}
                    <div className="bg-white/[0.02] border border-white/10 p-6 md:p-8">
                      <h3 className="font-display text-xl tracking-widest text-white mb-6 uppercase border-b border-white/10 pb-3">
                        Add Recipient Admin
                      </h3>
                      
                      <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Recipient Name</label>
                            <input 
                              type="text" 
                              value={newAdminName}
                              onChange={(e) => setNewAdminName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                              placeholder="e.g. Francis Amal"
                            />
                          </div>
                          <div>
                            <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2">Recipient Email Address</label>
                            <input 
                              type="email" 
                              required
                              value={newAdminEmail}
                              onChange={(e) => setNewAdminEmail(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                              placeholder="e.g. admin@zanka.shop"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                          <input 
                            type="checkbox" 
                            id="notifyCheckbox"
                            checked={newAdminNotify}
                            onChange={(e) => setNewAdminNotify(e.target.checked)}
                            className="w-4 h-4 bg-white/5 border border-white/10 text-red-500 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="notifyCheckbox" className="font-body text-xs text-white/70 cursor-pointer select-none">
                            Enable immediate email notifications on new order placements
                          </label>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 font-body text-xs tracking-[0.2em] uppercase font-bold py-3.5 px-8 text-white transition-colors"
                          >
                            + Register Admin Email
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Admin List */}
                    <div className="bg-white/[0.02] border border-white/10 p-6">
                      <h3 className="font-display text-lg tracking-widest text-white mb-6 uppercase">
                        Registered Admin Recipients
                      </h3>

                      {adminsLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          <p className="font-body text-[10px] tracking-widest uppercase text-white/40">Loading admins...</p>
                        </div>
                      ) : admins.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-white/10">
                          <p className="font-body text-xs uppercase text-white/40">No admin email recipients registered.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-body text-xs">
                            <thead>
                              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-[9px] bg-white/5">
                                <th className="py-3 px-4 font-semibold">Administrator</th>
                                <th className="py-3 px-4 font-semibold">Email</th>
                                <th className="py-3 px-4 font-semibold">Notifications</th>
                                <th className="py-3 px-4 font-semibold text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {admins.map(admin => (
                                <tr key={admin.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                  <td className="py-3 px-4 text-white font-medium">
                                    {admin.name || 'Anonymous Admin'}
                                  </td>
                                  <td className="py-3 px-4 font-mono text-white/70">
                                    {admin.email}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-semibold ${
                                      admin.receive_notifications
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      {admin.receive_notifications ? 'Enabled' : 'Disabled'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      onClick={() => handleDeleteAdmin(admin.id)}
                                      className="text-red-500 hover:text-white hover:bg-red-600 border border-red-500/20 px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Email Dispatch Logs */}
                    <div className="bg-white/[0.02] border border-white/10 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display text-lg tracking-widest text-white uppercase">
                          Email Dispatch Logs
                        </h3>
                        {logs.length > 0 && (
                          <button
                            onClick={handleClearLogs}
                            className="font-body text-[10px] tracking-wider uppercase border border-red-500/20 text-red-500 px-3 py-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                          >
                            Clear Logs
                          </button>
                        )}
                      </div>

                      {logsLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          <p className="font-body text-[10px] tracking-widest uppercase text-white/40">Loading logs...</p>
                        </div>
                      ) : logs.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-white/10">
                          <p className="font-body text-xs uppercase text-white/40">No email dispatches logged yet.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                          <table className="w-full text-left font-body text-xs">
                            <thead>
                              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-[9px] bg-white/5 sticky top-0">
                                <th className="py-3 px-4 font-semibold">Recipient</th>
                                <th className="py-3 px-4 font-semibold">Type</th>
                                <th className="py-3 px-4 font-semibold">Subject</th>
                                <th className="py-3 px-4 font-semibold">Status</th>
                                <th className="py-3 px-4 font-semibold">Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {logs.map(log => (
                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                  <td className="py-3 px-4 font-mono text-white">
                                    {log.recipient_email}
                                  </td>
                                  <td className="py-3 px-4 uppercase text-[10px] tracking-wider text-white/60">
                                    {log.recipient_type}
                                  </td>
                                  <td className="py-3 px-4 text-white/80">
                                    {log.subject}
                                    {log.error_message && (
                                      <p className="text-[10px] text-red-400 mt-1 font-mono">{log.error_message}</p>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-semibold ${
                                      log.status === 'sent'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      {log.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-white/40 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit'
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </main>
      </div>
    </div>
  )
}
