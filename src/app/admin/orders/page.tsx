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
  items: string
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
}

type HeroSlide = {
  id: number
  tag: string
  title: string
  subtitle: string
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

  // State Produk Katalog & Upload File Foto
  const [products, setProducts] = useState<Product[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newOriginalPrice, setNewOriginalPrice] = useState('')
  const [newCategory, setNewCategory] = useState('Custom Kaos')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // State CMS Hero Slides & Toggle Tampil Teks Banner
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [slideTag, setSlideTag] = useState('')
  const [slideTitle, setSlideTitle] = useState('')
  const [slideSubtitle, setSlideSubtitle] = useState('')
  const [showBannerText, setShowBannerText] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/admin/login')
        return
      }
      setAuthed(true)

      const [ordersRes, productsRes, slidesRes, settingsRes, chatsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('hero_slides').select('*'),
        supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
        supabase.from('chats').select('room_id').order('created_at', { ascending: false })
      ])

      if (ordersRes.data) setOrders(ordersRes.data as Order[])
      if (productsRes.data) setProducts(productsRes.data as Product[])
      if (slidesRes.data) setHeroSlides(slidesRes.data as HeroSlide[])
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

  const extractFileUrls = (itemsText: string) => {
    if (!itemsText) return { desFront: '', desBack: '' }
    const getUrl = (keyword: string) => {
      const regexBracket = new RegExp(`\\[(?:[^:]*?)${keyword}:\\s*(https?://[^\\]]+)\\]`, 'i')
      let match = itemsText.match(regexBracket)
      if (match) return match[1].trim()
      const regexPlain = new RegExp(`${keyword}:\\s*(https?://\\S+)`, 'i')
      match = itemsText.match(regexPlain)
      return match ? match[1].trim().replace(/\|$/, '') : ''
    }
    return {
      desFront: getUrl('Desain Depan'),
      desBack: getUrl('Desain Belakang'),
    }
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice) return

    setUploadingImage(true)
    let imageUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500'

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}_prod.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('designs').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data: pubData } = supabase.storage.from('designs').getPublicUrl(fileName)
        imageUrl = pubData.publicUrl
      }

      const { data, error } = await supabase
        .from('products')
        .insert({ title: newTitle, price: newPrice, original_price: newOriginalPrice || null, category: newCategory, image: imageUrl })
        .select()
        .single()

      if (error || !data) throw error
      setProducts([data as Product, ...products])
      setNewTitle('')
      setNewPrice('')
      setNewOriginalPrice('')
      setImageFile(null)
      alert('Produk baru & foto berhasil diunggah secara real-time!')
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan produk.')
    } finally {
      setUploadingImage(false)
    }
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

  const handleAddHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slideTitle.trim()) {
      alert('Judul slider tidak boleh kosong!')
      return
    }

    const { data, error } = await supabase
      .from('hero_slides')
      .insert([{ tag: slideTag, title: slideTitle, subtitle: slideSubtitle }])
      .select()
      .single()

    if (error || !data) {
      alert('Gagal menambahkan slider hero.')
      return
    }

    setHeroSlides([...heroSlides, data as HeroSlide])
    setSlideTag('')
    setSlideTitle('')
    setSlideSubtitle('')
    alert('Slider hero berhasil ditambahkan!')
  }

  const handleDeleteHeroSlide = async (id: number) => {
    if (!confirm('Hapus slider ini?')) return
    const { error } = await supabase.from('hero_slides').delete().eq('id', id)
    if (error) {
      alert('Gagal menghapus slider.')
      return
    }
    setHeroSlides(heroSlides.filter((s) => s.id !== id))
  }

  // Handler Toggle Tampilkan / Nonaktifkan Teks Banner
  const handleToggleBannerText = async (newState: boolean) => {
    setShowBannerText(newState)
    
    // Simpan status toggle ke tabel site_settings Supabase
    await supabase.from('site_settings').upsert({
      id: 1,
      data: { showBannerText: newState }
    })

    // Jika di-nonaktifkan, kita juga bisa beri opsi menghapus semua teks slide jika diinginkan, atau cukup menyembunyikannya
    if (!newState) {
      // Opsional: jika ingin sekaligus menghapus semua data di tabel hero_slides
      // await supabase.from('hero_slides').delete().neq('id', 0)
      // setHeroSlides([])
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-bold text-black">
        Memeriksa akses admin...
      </div>
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
          <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'orders' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-150'}`}>
            📦 Manajemen Pesanan ({orders.length})
          </button>
          <button onClick={() => setActiveTab('chats')} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'chats' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-150'}`}>
            💬 Live Chat Pembeli ({chatRooms.length})
          </button>
          <button onClick={() => setActiveTab('products')} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'products' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-150'}`}>
            🛍️ Upload & Kelola Katalog ({products.length})
          </button>
          <button onClick={() => setActiveTab('settings')} className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'settings' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-150'}`}>
            ⚙️ CMS Banner Slider Hero ({heroSlides.length})
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
                      const cleanItemsText = ord.items ? ord.items.split('||')[0] : ''
                      const urls = extractFileUrls(ord.items)
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
                          <td className="p-3 align-top space-y-3 max-w-xs">
                            <p className="font-semibold text-black">{cleanItemsText}</p>
                            <div className="grid grid-cols-2 gap-3 pt-1 max-w-[280px]">
                              <div className="bg-gray-50 p-2.5 rounded-xl border text-center space-y-1.5">
                                <span className="text-[9px] font-black text-gray-600 block">Desain Depan</span>
                                {urls.desFront ? (
                                  <>
                                    <a href={urls.desFront} target="_blank" rel="noreferrer"><img src={urls.desFront} alt="" className="w-full h-20 object-contain rounded bg-white border" /></a>
                                    <button onClick={() => handleDownloadFile(urls.desFront, `depan-${ord.id}.png`)} className="w-full bg-black text-white text-[9px] font-bold py-1.5 rounded cursor-pointer">📥 Download</button>
                                  </>
                                ) : <span className="text-[10px] text-gray-400 block py-6">Tidak ada</span>}
                              </div>
                              <div className="bg-gray-50 p-2.5 rounded-xl border text-center space-y-1.5">
                                <span className="text-[9px] font-black text-gray-600 block">Desain Belakang</span>
                                {urls.desBack ? (
                                  <>
                                    <a href={urls.desBack} target="_blank" rel="noreferrer"><img src={urls.desBack} alt="" className="w-full h-20 object-contain rounded bg-white border" /></a>
                                    <button onClick={() => handleDownloadFile(urls.desBack, `belakang-${ord.id}.png`)} className="w-full bg-black text-white text-[9px] font-bold py-1.5 rounded cursor-pointer">📥 Download</button>
                                  </>
                                ) : <span className="text-[10px] text-gray-400 block py-6">Tidak ada</span>}
                              </div>
                            </div>
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

        {/* TAB 2: PRODUK */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-red-600 border-b pb-2">+ Tambah Produk & Upload Foto</h2>
              <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
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
                  <label className="block font-bold mb-1">Kategori</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black cursor-pointer">
                    <option value="Custom Kaos">Custom Kaos</option>
                    <option value="Custom Oversized">Custom Oversized</option>
                    <option value="Custom Hoodie">Custom Hoodie</option>
                    <option value="Custom Topi">Custom Topi</option>
                    <option value="Polosan">Polosan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Upload Foto Contoh Baju</label>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full bg-gray-50 border rounded-xl p-2 text-xs font-semibold text-black file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-black file:text-white cursor-pointer" />
                </div>
                <button type="submit" disabled={uploadingImage} className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer">
                  {uploadingImage ? 'Mengunggah & Menyimpan...' : 'SIMPAN & TAYANGKAN REAL-TIME'}
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-black border-b pb-2">Daftar Katalog Aktif ({products.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="bg-gray-50 p-4 rounded-2xl border flex items-center justify-between gap-3">
                    {p.image && <img src={p.image} alt="" className="w-14 h-14 object-cover rounded-xl bg-white shadow-sm flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-black truncate">{p.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-red-600 font-black">{p.price}</span>
                        {p.original_price && <span className="text-[10px] text-gray-400 line-through">{p.original_price}</span>}
                      </div>
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">{p.category}</span>
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer">Hapus</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CMS BANNER SLIDER HERO DENGAN TOGGLE */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            {/* TOGGLE SECTION */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-black">Status Tampilkan Teks Banner Hero</h3>
                <p className="text-xs text-gray-400 mt-0.5">Aktifkan untuk menampilkan teks slide promo di halaman utama. Nonaktifkan untuk menyembunyikan / mengosongkan teks banner.</p>
              </div>
              
              {/* Toggle Switch Button */}
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
              
              {/* Form Tambah Slide */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-red-600 border-b pb-2">+ Tambah Slide Banner Hero Baru</h2>
                <form onSubmit={handleAddHeroSlide} className="space-y-3 text-xs">
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
                    <textarea rows={3} placeholder="Kualitas sablon tajam, detail warna akurat..." value={slideSubtitle} onChange={(e) => setSlideSubtitle(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none" required></textarea>
                  </div>
                  <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer">
                    SIMPAN SLIDER BARU
                  </button>
                </form>
              </div>

              {/* Daftar Slide Aktif */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-black border-b pb-2">Daftar Slider Hero Aktif ({heroSlides.length})</h2>
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {heroSlides.length === 0 ? <p className="text-xs text-gray-400 italic">Belum ada slide banner.</p> : heroSlides.map((slide) => (
                    <div key={slide.id} className="bg-gray-50 p-4 rounded-2xl border flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded-full font-bold uppercase">{slide.tag}</span>
                        <h4 className="font-black text-xs text-black uppercase">{slide.title}</h4>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{slide.subtitle}</p>
                      </div>
                      <button onClick={() => handleDeleteHeroSlide(slide.id)} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer">Hapus</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  )
}