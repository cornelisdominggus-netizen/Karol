'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Order = {
  id: number
  customer_name: string
  phone: string
  address: string
  items: any
  total_price: string | null
  status: string
  created_at: string
}

type Product = {
  id: number
  title: string
  category: string
  price: string
  original_price: string | null
  image: string | null
  status?: string // 'active' atau 'archived'
}

type HeroBannerSlide = {
  id: number
  tag: string
  title: string
  subtitle: string
  image_url: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'chats'>('orders')

  // State Pesanan
  const [orders, setOrders] = useState<Order[]>([])

  // State Chat
  const [chatRooms, setChatRooms] = useState<string[]>([])
  const [activeRoom, setActiveRoom] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [replyMsg, setReplyMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State Produk Katalog, Pencarian, Folder Kategori & Arsip
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newOriginalPrice, setNewOriginalPrice] = useState('')
  
  const defaultCategories = ['Custom Kaos', 'Custom Oversized', 'Custom Hoodie', 'Custom Topi', 'Polosan']
  const [categories, setCategories] = useState<string[]>([
    ...defaultCategories,
    'Christmas Series'
  ])
  const [newCategory, setNewCategory] = useState('Custom Kaos')
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // State CMS Multi-Slide Banner & Toggle Teks
  const [bannerSlides, setBannerSlides] = useState<HeroBannerSlide[]>([])
  const [slideTag, setSlideTag] = useState('')
  const [slideTitle, setSlideTitle] = useState('')
  const [slideSubtitle, setSlideSubtitle] = useState('')
  const [slideImageFile, setSlideImageFile] = useState<File | null>(null)
  const [uploadingSlide, setUploadingSlide] = useState(false)
  const [showBannerText, setShowBannerText] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/admin/login')
        return
      }
      setAuthed(true)

      const [ordersRes, productsRes, bannersRes, settingsRes, chatsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('hero_banners').select('*').order('created_at', { ascending: true }),
        supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
        supabase.from('chats').select('room_id').order('created_at', { ascending: false })
      ])

      if (ordersRes.data) setOrders(ordersRes.data as Order[])
      if (productsRes.data) {
        setProducts(productsRes.data as Product[])
        const uniqueCats = Array.from(new Set(productsRes.data.map((p: any) => p.category).filter(Boolean))) as string[]
        setCategories((prev) => Array.from(new Set([...prev, ...uniqueCats])))
      }
      if (bannersRes.data) setBannerSlides(bannersRes.data as HeroBannerSlide[])
      if (settingsRes.data?.data) {
        const settingsData = settingsRes.data.data as any
        if (typeof settingsData.showBannerText === 'boolean') {
          setShowBannerText(settingsData.showBannerText)
        }
      }
      if (chatsRes.data) {
        const uniqueRooms = Array.from(new Set(chatsRes.data.map((c: any) => c.room_id))) as string[]
        setChatRooms(uniqueRooms)
        if (uniqueRooms.length > 0 && !activeRoom) {
          setActiveRoom(uniqueRooms[0])
        }
      }
    }

    init()

    const ordersChannel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((ord) => (ord.id === payload.new.id ? (payload.new as Order) : ord))
            )
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((ord) => ord.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    const chatsChannel = supabase
      .channel('admin-chats-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload: any) => {
          const newRoom = payload.new.room_id
          setChatRooms((prev) => {
            if (!prev.includes(newRoom)) return [newRoom, ...prev]
            return prev
          })
          if (activeRoom === newRoom) {
            setMessages((prev) => [...prev, payload.new])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(chatsChannel)
    }
  }, [router, activeRoom])

  useEffect(() => {
    if (!activeRoom) return
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chats')
        .select('*')
        .eq('room_id', activeRoom)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }
    fetchMessages()
  }, [activeRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    if (error) {
      alert('Gagal memperbarui status pesanan.')
      return
    }
    setOrders(orders.map((ord) => (ord.id === id ? { ...ord, status: newStatus } : ord)))
  }

  const handleDeleteOrder = async (id: number) => {
    if (!confirm('Hapus pesanan ini?')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) {
      alert('Gagal menghapus pesanan.')
      return
    }
    setOrders(orders.filter((ord) => ord.id !== id))
  }

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMsg.trim() || !activeRoom) return

    const { error } = await supabase.from('chats').insert([
      {
        room_id: activeRoom,
        sender: 'admin',
        message: replyMsg.trim()
      }
    ])

    if (!error) {
      setReplyMsg('')
    }
  }

  const extractOrderItemsAndFiles = (itemsData: any) => {
    let parsedItems = []
    if (Array.isArray(itemsData)) {
      parsedItems = itemsData
    } else if (typeof itemsData === 'string') {
      try {
        const json = JSON.parse(itemsData)
        if (Array.isArray(json)) parsedItems = json
      } catch (e) {
        parsedItems = []
      }
    }

    if (parsedItems.length > 0) {
      return parsedItems.map((item: any) => ({
        title: item.title || 'Custom Apparel',
        size: item.size || 'L',
        quantity: item.quantity || 1,
        frontDesign: item.frontDesignImage || item.front_design_image || '',
        backDesign: item.backDesignImage || item.back_design_image || '',
      }))
    }

    const textStr = String(itemsData || '')
    const getUrl = (keyword: string) => {
      const regexBracket = new RegExp(`\\[(?:[^:]*?)${keyword}:\\s*(https?://[^\\]]+)\\]`, 'i')
      let match = textStr.match(regexBracket)
      if (match) return match[1].trim()
      const regexPlain = new RegExp(`${keyword}:\\s*(https?://\\S+)`, 'i')
      match = textStr.match(regexPlain)
      return match ? match[1].trim().replace(/\|$/, '') : ''
    }

    return [{
      title: textStr.split('||')[0] || 'Pesanan Produk',
      size: '-',
      quantity: 1,
      frontDesign: getUrl('Desain Depan'),
      backDesign: getUrl('Desain Belakang'),
    }]
  }

  const handleDownloadFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal mengunduh file.')
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      alert('Gagal mendownload file gambar.')
    }
  }

  const handleDeleteCategory = (catToDelete: string) => {
    if (defaultCategories.includes(catToDelete)) {
      alert('Kategori utama sistem tidak dapat dihapus!')
      return
    }
    if (confirm(`Hapus kategori "${catToDelete}"?`)) {
      setCategories(categories.filter(c => c !== catToDelete))
      if (newCategory === catToDelete) {
        setNewCategory('Custom Kaos')
      }
      alert('Kategori berhasil dihapus.')
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice) return

    setUploadingImage(true)

    let finalCategory = newCategory
    if (isAddingCustomCategory && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim()
      if (!categories.includes(finalCategory)) {
        setCategories([...categories, finalCategory])
      }
    }

    try {
      let imageUrl = editingId !== null ? products.find(p => p.id === editingId)?.image || '' : ''

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}_prod.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('designs').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data: pubData } = supabase.storage.from('designs').getPublicUrl(fileName)
        imageUrl = pubData.publicUrl
      } else if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500'
      }

      if (editingId !== null) {
        const { data, error } = await supabase
          .from('products')
          .update({
            title: newTitle,
            price: newPrice,
            original_price: newOriginalPrice || null,
            category: finalCategory,
            image: imageUrl
          })
          .eq('id', editingId)
          .select()
          .single()

        if (error) throw error

        if (data) {
          setProducts(products.map(p => p.id === editingId ? (data as Product) : p))
          alert('Produk berhasil diperbarui!')
        }
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert({
            title: newTitle,
            price: newPrice,
            original_price: newOriginalPrice || null,
            category: finalCategory,
            image: imageUrl,
            status: 'active'
          })
          .select()
          .single()

        if (error || !data) throw error

        setProducts([data as Product, ...products])
        alert('Produk baru berhasil diunggah secara real-time!')
      }

      setNewTitle('')
      setNewPrice('')
      setNewOriginalPrice('')
      setImageFile(null)
      setEditingId(null)
      setIsAddingCustomCategory(false)
      setCustomCategoryInput('')
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan produk.')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handler Toggle Archive / Unarchive Produk
  const handleToggleArchiveProduct = async (prod: Product) => {
    const nextStatus = prod.status === 'archived' ? 'active' : 'archived'
    const actionText = nextStatus === 'archived' ? 'mengarsipkan (menyembunyikan)' : 'mengaktifkan kembali'
    if (!confirm(`Yakin ingin ${actionText} produk "${prod.title}"?`)) return

    const { error } = await supabase
      .from('products')
      .update({ status: nextStatus })
      .eq('id', prod.id)

    if (error) {
      alert('Gagal mengubah status arsip produk.')
      return
    }

    setProducts(products.map(p => p.id === prod.id ? { ...p, status: nextStatus } : p))
  }

  const handleStartEdit = (p: Product) => {
    setEditingId(p.id)
    setNewTitle(p.title)
    setNewPrice(p.price)
    setNewOriginalPrice(p.original_price || '')
    if (categories.includes(p.category)) {
      setNewCategory(p.category)
      setIsAddingCustomCategory(false)
    } else {
      setIsAddingCustomCategory(true)
      setCustomCategoryInput(p.category)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setNewTitle('')
    setNewPrice('')
    setNewOriginalPrice('')
    setImageFile(null)
    setIsAddingCustomCategory(false)
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Hapus produk ini dari katalog?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert('Gagal menghapus produk.')
      return
    }
    setProducts(products.filter((p) => p.id !== id))
  }

  // Handler Tambah Slide Banner Multi-Gambar
  const handleAddBannerSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slideImageFile || !slideTitle.trim()) {
      alert('Pilih file gambar banner dan isi judul terlebih dahulu!')
      return
    }

    try {
      setUploadingSlide(true)
      const fileExt = slideImageFile.name.split('.').pop()
      const fileName = `hero-banner-${Date.now()}.${fileExt}`
      const { error: uploadErr } = await supabase.storage.from('designs').upload(fileName, slideImageFile)
      if (uploadErr) throw uploadErr

      const { data: pub } = supabase.storage.from('designs').getPublicUrl(fileName)
      const imageUrl = pub.publicUrl

      const { data, error } = await supabase
        .from('hero_banners')
        .insert([{ tag: slideTag, title: slideTitle, subtitle: slideSubtitle, image_url: imageUrl }])
        .select()
        .single()

      if (error || !data) throw error

      setBannerSlides([...bannerSlides, data as HeroBannerSlide])
      setSlideTag('')
      setSlideTitle('')
      setSlideSubtitle('')
      setSlideImageFile(null)
      alert('Slide banner baru berhasil ditambahkan!')
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah slide banner.')
    } finally {
      setUploadingSlide(false)
    }
  }

  // Handler Hapus Slide Banner
  const handleDeleteBannerSlide = async (id: number) => {
    if (!confirm('Hapus slide banner ini?')) return
    const { error } = await supabase.from('hero_banners').delete().eq('id', id)
    if (error) {
      alert('Gagal menghapus slide banner.')
      return
    }
    setBannerSlides(bannerSlides.filter((s) => s.id !== id))
  }

  const handleToggleBannerText = async (newState: boolean) => {
    setShowBannerText(newState)
    const { data: current } = await supabase.from('site_settings').select('data').eq('id', 1).maybeSingle()
    const updatedData = { ...(current?.data || {}), showBannerText: newState }
    await supabase.from('site_settings').upsert({ id: 1, data: updatedData })
  }

  // Filter produk berdasarkan kolom Search
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Kelompokkan produk per kategori (folder)
  const groupedProducts: { [key: string]: Product[] } = {}
  filteredProducts.forEach(p => {
    const cat = p.category || 'Lainnya'
    if (!groupedProducts[cat]) groupedProducts[cat] = []
    groupedProducts[cat].push(p)
  })

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-bold text-black">
        Memeriksa akses admin...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Admin */}
        <div className="bg-black text-white p-5 sm:p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow">
          <div>
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              PANEL SUPER ADMIN DSCPL WEAR
            </span>
            <h1 className="text-xl md:text-2xl font-black mt-2">Pusat Kendali & Manajemen Toko ⚙️</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link href="/products" className="flex-1 sm:flex-none text-center bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl transition hover:bg-gray-100">
              Lihat Website Toko ➔
            </Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer">
              Keluar
            </button>
          </div>
        </div>

        {/* Tab Navigasi Admin */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200">
          <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'orders' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'}`}>
            📦 Manajemen Pesanan ({orders.length})
          </button>
          <button onClick={() => setActiveTab('chats')} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'chats' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'}`}>
            💬 Live Chat Pembeli ({chatRooms.length})
          </button>
          <button onClick={() => setActiveTab('products')} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'products' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'}`}>
            🛍️ Upload & Kelola Katalog ({products.length})
          </button>
          <button onClick={() => setActiveTab('settings')} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'settings' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'}`}>
            ⚙️ CMS Multi-Slide Banner ({bannerSlides.length})
          </button>
        </div>

        {/* TAB 1: MANAJEMEN PESANAN */}
        {activeTab === 'orders' && (
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b pb-2">Daftar Pesanan Masuk Pelanggan</h2>
            {orders.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <span className="text-4xl">📭</span>
                <p className="text-xs text-gray-500 font-semibold">Belum ada pesanan masuk.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-500 uppercase">
                      <th className="p-3">ID / Waktu</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Detail Item & Berkas Desain</th>
                      <th className="p-3">Total Harga</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((ord) => {
                      const extractedItems = extractOrderItemsAndFiles(ord.items)
                      return (
                        <tr key={ord.id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono text-gray-500 align-top">
                            #{ord.id}
                            <span className="block text-[10px] text-gray-400">{new Date(ord.created_at).toLocaleString('id-ID')}</span>
                          </td>
                          <td className="p-3 align-top">
                            <p className="font-bold text-black uppercase">{ord.customer_name}</p>
                            <p className="text-[11px] text-gray-500">{ord.phone}</p>
                            <p className="text-[10px] text-gray-400 max-w-[180px]">{ord.address}</p>
                          </td>
                          <td className="p-3 align-top space-y-4 max-w-sm">
                            {extractedItems.map((item, idx) => (
                              <div key={idx} className="space-y-2 pb-2 border-b border-gray-100 last:border-0">
                                <p className="font-semibold text-black">
                                  {item.title} (Ukuran: {item.size}) x{item.quantity}
                                </p>
                                <div className="grid grid-cols-2 gap-2 max-w-[280px]">
                                  <div className="bg-gray-50 p-2 rounded-xl border text-center space-y-1">
                                    <span className="text-[9px] font-black text-gray-600 block">Desain Depan</span>
                                    {item.frontDesign ? (
                                      <>
                                        <a href={item.frontDesign} target="_blank" rel="noreferrer">
                                          <img src={item.frontDesign} alt="" className="w-full h-20 object-contain rounded bg-white border" />
                                        </a>
                                        <button onClick={() => handleDownloadFile(item.frontDesign, `depan-${ord.id}-${idx}.png`)} className="w-full bg-black text-white text-[9px] font-bold py-1.5 rounded cursor-pointer">📥 Download</button>
                                      </>
                                    ) : <span className="text-[10px] text-gray-400 block py-6">Tidak ada</span>}
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded-xl border text-center space-y-1">
                                    <span className="text-[9px] font-black text-gray-600 block">Desain Belakang</span>
                                    {item.backDesign ? (
                                      <>
                                        <a href={item.backDesign} target="_blank" rel="noreferrer">
                                          <img src={item.backDesign} alt="" className="w-full h-20 object-contain rounded bg-white border" />
                                        </a>
                                        <button onClick={() => handleDownloadFile(item.backDesign, `belakang-${ord.id}-${idx}.png`)} className="w-full bg-black text-white text-[9px] font-bold py-1.5 rounded cursor-pointer">📥 Download</button>
                                      </>
                                    ) : <span className="text-[10px] text-gray-400 block py-6">Tidak ada</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </td>
                          <td className="p-3 font-black text-red-600 align-top whitespace-nowrap">{ord.total_price}</td>
                          <td className="p-3 align-top">
                            <select value={ord.status} onChange={(e) => handleUpdateStatus(ord.id, e.target.value)} className="font-bold px-3 py-1.5 rounded-xl border text-xs bg-yellow-50 text-yellow-700 cursor-pointer">
                              <option value="Pending">Pending</option>
                              <option value="Diproses">Diproses</option>
                              <option value="Dikirim">Dikirim</option>
                              <option value="Selesai">Selesai</option>
                            </select>
                          </td>
                          <td className="p-3 text-center align-top whitespace-nowrap">
                            <button onClick={() => handleDeleteOrder(ord.id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer">Hapus</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB LIVE CHAT ADMIN */}
        {activeTab === 'chats' && (
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
            <div className="md:col-span-4 border-r border-gray-200 pr-4 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">Daftar Ruang Chat Pembeli</h3>
              {chatRooms.length === 0 ? <p className="text-xs text-gray-400 italic">Belum ada chat masuk.</p> : chatRooms.map((room) => (
                <button key={room} onClick={() => setActiveRoom(room)} className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${activeRoom === room ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100 text-black'}`}>
                  Room ID: {room}
                </button>
              ))}
            </div>
            <div className="md:col-span-8 flex flex-col justify-between">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-xs">{activeRoom ? `Percakapan di Room: ${activeRoom}` : 'Pilih room chat'}</div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[380px]">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-bold ${m.sender === 'admin' ? 'bg-black text-white' : 'bg-white border text-black shadow-sm'}`}>
                      <p className="text-[9px] opacity-60 mb-0.5">{m.sender === 'admin' ? 'Anda (Admin)' : 'Pembeli'}</p>
                      {m.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {activeRoom && (
                <form onSubmit={handleSendAdminReply} className="pt-3 border-t border-gray-200 flex gap-2">
                  <input type="text" value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder="Balas pesan pembeli..." className="flex-1 bg-gray-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:outline-none" />
                  <button type="submit" className="bg-black text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer">Kirim</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUK (DENGAN FOLDER KATEGORI, SEARCH, & ARCHIVE) */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-red-600">
                  {editingId !== null ? '✏️ Edit Produk Katalog' : '+ Tambah Produk Katalog'}
                </h2>
                {editingId !== null && (
                  <button onClick={handleCancelEdit} className="text-[10px] font-bold text-zinc-500 underline cursor-pointer">Batal Edit</button>
                )}
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Nama Produk *</label>
                  <input type="text" placeholder="Contoh: Custom Kaos Kerajaan" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none" required />
                </div>
                <div>
                  <label className="block font-bold mb-1">Harga Jual Diskon *</label>
                  <input type="text" placeholder="Contoh: Rp 70.000" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none" required />
                </div>
                <div>
                  <label className="block font-bold mb-1">Harga Asli / Coret (Opsional)</label>
                  <input type="text" placeholder="Contoh: Rp 150.000" value={newOriginalPrice} onChange={(e) => setNewOriginalPrice(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold">Kategori / Folder Produk</label>
                    {!defaultCategories.includes(newCategory) && !isAddingCustomCategory && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(newCategory)}
                        className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        🗑️ Hapus Kategori Ini
                      </button>
                    )}
                  </div>

                  {!isAddingCustomCategory ? (
                    <div className="flex gap-2">
                      <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 bg-gray-50 border rounded-xl p-2.5 font-semibold text-black cursor-pointer">
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>
                            {cat} {defaultCategories.includes(cat) ? '' : ' (Kustom)'}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomCategory(true)}
                        className="bg-zinc-900 text-white font-bold px-3 py-2.5 rounded-xl text-[11px] whitespace-nowrap cursor-pointer hover:bg-black"
                      >
                        + Kategori Baru
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nama Kategori Baru"
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          className="flex-1 bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setIsAddingCustomCategory(false)}
                          className="bg-gray-200 text-black font-bold px-3 py-2.5 rounded-xl text-[11px] cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold mb-1">Upload Foto Produk</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full bg-gray-50 border rounded-xl p-2 text-xs font-semibold text-black file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-black file:text-white cursor-pointer"
                  />
                </div>

                <button type="submit" disabled={uploadingImage} className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer">
                  {uploadingImage ? 'Mengunggah & Menyimpan...' : (editingId !== null ? 'SIMPAN PERUBAHAN PRODUK' : 'SIMPAN & TAYANGKAN REAL-TIME')}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-black">
                  Daftar Katalog Produk ({filteredProducts.length} Total)
                </h2>
                {/* Kolom Search Produk */}
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="🔍 Cari nama produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl px-3.5 py-2 text-xs font-bold text-black focus:outline-none focus:border-black transition"
                  />
                </div>
              </div>

              {/* TAMPILAN PER FOLDER KATEGORI */}
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
                {Object.keys(groupedProducts).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs italic">
                    Tidak ada produk yang cocok dengan pencarian "{searchQuery}".
                  </div>
                ) : (
                  Object.entries(groupedProducts).map(([categoryName, items]) => (
                    <div key={categoryName} className="space-y-3 bg-zinc-50/60 p-4 rounded-2xl border border-zinc-200">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                        <h3 className="font-black text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                          📁 Folder: {categoryName} <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">({items.length})</span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map((p) => {
                          const isArchived = p.status === 'archived'
                          return (
                            <div key={p.id} className={`p-3 rounded-2xl border flex items-center justify-between gap-3 bg-white shadow-sm transition ${isArchived ? 'opacity-50 border-dashed border-zinc-400' : 'border-zinc-200'}`}>
                              {p.image && <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-xl bg-white shadow-sm flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-black truncate">{p.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-red-600 font-black">{p.price}</span>
                                  {p.original_price && <span className="text-[10px] text-gray-400 line-through">{p.original_price}</span>}
                                </div>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${isArchived ? 'bg-zinc-500 text-white' : 'bg-emerald-600 text-white'}`}>
                                  {isArchived ? '📦 Diarsipkan (Disembunyikan)' : '✨ Aktif (Tampil)'}
                                </span>
                              </div>
                              
                              <div className="flex flex-col gap-1 flex-shrink-0">
                                <button onClick={() => handleToggleArchiveProduct(p)} className={`font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer ${isArchived ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}>
                                  {isArchived ? 'Aktifkan' : 'Arsip'}
                                </button>
                                <button onClick={() => handleStartEdit(p)} className="bg-zinc-100 hover:bg-zinc-200 text-black font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer">Edit</button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer">Hapus</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CMS MULTI-SLIDE BANNER */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-black">Status Tampilkan Teks Banner Hero</h3>
                <p className="text-xs text-gray-400 mt-0.5">Aktifkan untuk menampilkan teks slide promo di halaman utama.</p>
              </div>
              <button
                onClick={() => handleToggleBannerText(!showBannerText)}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                  showBannerText ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                  showBannerText ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-red-600 border-b pb-2">+ Tambah Slide Banner Gambar & Teks Baru</h2>
                <form onSubmit={handleAddBannerSlide} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Tag Banner (Kecil di Atas)</label>
                    <input type="text" placeholder="Contoh: WORKSHOP HIGHLIGHT" value={slideTag} onChange={(e) => setSlideTag(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Judul Utama Slider *</label>
                    <input type="text" placeholder="Contoh: PREMIUM DTF PRINTING" value={slideTitle} onChange={(e) => setSlideTitle(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Sub-Judul / Keterangan *</label>
                    <textarea rows={2} placeholder="Kualitas sablon tajam..." value={slideSubtitle} onChange={(e) => setSlideSubtitle(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Upload Gambar Banner (PNG/JPG) *</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setSlideImageFile(e.target.files?.[0] || null)} 
                      className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white cursor-pointer" 
                      required 
                    />
                  </div>
                  <button type="submit" disabled={uploadingSlide} className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer">
                    {uploadingSlide ? 'Mengunggah...' : 'SIMPAN SLIDE BANNER BARU'}
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-black border-b pb-2">Daftar Slide Banner Aktif ({bannerSlides.length})</h2>
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {bannerSlides.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Belum ada slide banner.</p>
                  ) : (
                    bannerSlides.map((slide) => (
                      <div key={slide.id} className="bg-gray-50 p-3 rounded-2xl border flex items-center justify-between gap-3">
                        {slide.image_url && (
                          <img src={slide.image_url} alt="" className="w-16 h-14 object-cover rounded-xl border bg-white flex-shrink-0" />
                        )}
                        <div className="space-y-1 flex-1 min-w-0">
                          <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded-full font-bold uppercase">{slide.tag}</span>
                          <h4 className="font-black text-xs text-black uppercase truncate">{slide.title}</h4>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{slide.subtitle}</p>
                        </div>
                        <button onClick={() => handleDeleteBannerSlide(slide.id)} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer flex-shrink-0">Hapus</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  )
}