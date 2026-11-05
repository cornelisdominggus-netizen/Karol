'use client'

import { useState, useEffect } from 'react'
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

export default function AdminDashboardPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders')

  // State Pesanan
  const [orders, setOrders] = useState<Order[]>([])

  // State Produk Katalog
  const [products, setProducts] = useState<Product[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newOriginalPrice, setNewOriginalPrice] = useState('')
  const [newCategory, setNewCategory] = useState('Custom Kaos')
  const [newImage, setNewImage] = useState('')

  // State Pengaturan Website
  const [siteText, setSiteText] = useState({
    heroTitle: 'Precision Apparel & Custom Print Workshop',
    heroDesc: 'Pusat layanan custom apparel, sablon DTF berkualitas tinggi, dan penyediaan polosan standar distro di Depok.',
    promoAnnouncement: 'Event 99% : Selengkapnya'
  })

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/admin/login')
        return
      }
      setAuthed(true)

      const [ordersRes, productsRes, settingsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('data').eq('id', 1).maybeSingle()
      ])

      if (ordersRes.data) setOrders(ordersRes.data as Order[])
      if (productsRes.data) setProducts(productsRes.data as Product[])
      if (settingsRes.data?.data) {
        setSiteText((prev) => ({ ...prev, ...(settingsRes.data!.data as any) }))
      }
    }

    init()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  // Handler Pesanan
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

  // Handler Produk
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice) return

    const { data, error } = await supabase
      .from('products')
      .insert({
        title: newTitle,
        price: newPrice,
        original_price: newOriginalPrice || null,
        category: newCategory,
        image:
          newImage ||
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500'
      })
      .select()
      .single()

    if (error || !data) {
      alert('Gagal menambahkan produk.')
      return
    }

    setProducts([data as Product, ...products])
    setNewTitle('')
    setNewPrice('')
    setNewOriginalPrice('')
    setNewImage('')
    alert('Produk baru berhasil ditambahkan ke katalog!')
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('site_settings').upsert({ id: 1, data: siteText })
    if (error) {
      alert('Gagal menyimpan pengaturan website.')
      return
    }
    alert('Pengaturan website berhasil diperbarui!')
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-bold text-black">
        Memeriksa akses admin...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Admin */}
        <div className="bg-black text-white p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow">
          <div>
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              PANEL SUPER ADMIN DSCPL WEAR
            </span>
            <h1 className="text-2xl font-black mt-2">Pusat Kendali & Manajemen Toko ⚙️</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/products" className="bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl transition hover:bg-gray-100">
              Lihat Website Toko ➔
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Tab Navigasi Admin */}
        <div className="flex flex-wrap gap-3 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'orders' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'
            }`}
          >
            📦 Manajemen Pesanan ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'products' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'
            }`}
          >
            🛍️ Kelola & Tambah Katalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'settings' ? 'bg-black text-white shadow' : 'bg-white text-black border border-gray-200 hover:bg-gray-100'
            }`}
          >
            ⚙️ Pengaturan Promo & Teks Web
          </button>
        </div>

        {/* TAB 1: MANAJEMEN PESANAN */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b pb-2">
              Daftar Pesanan Masuk Pelanggan (Supabase Database)
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <span className="text-4xl">📭</span>
                <p className="text-xs text-gray-500 font-semibold">Belum ada pesanan masuk dari halaman checkout.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-500 uppercase">
                      <th className="p-3">ID / Waktu</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Detail Item & File Desain</th>
                      <th className="p-3">Total Harga</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-gray-500">
                          #{ord.id}
                          <span className="block text-[10px] text-gray-400">
                            {new Date(ord.created_at).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-black">{ord.customer_name}</p>
                          <p className="text-[11px] text-gray-500">{ord.phone}</p>
                          <p className="text-[10px] text-gray-400">{ord.address}</p>
                        </td>
                        <td className="p-3 font-medium text-gray-800 max-w-xs">{ord.items}</td>
                        <td className="p-3 font-black text-red-600">{ord.total_price}</td>
                        <td className="p-3">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                            className="font-bold px-3 py-1.5 rounded-xl border text-xs focus:outline-none bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Dikirim">Dikirim</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </td>
                        <td className="p-3 text-center space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TAMBAH & KELOLA KATALOG */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-red-600 border-b pb-2">
                + Tambah Produk Baru
              </h2>

              <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Custom Kaos Oversized"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Harga Jual Diskon *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 90.000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Harga Asli / Coret (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rp 180.000"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black"
                  >
                    <option value="Custom Kaos">Custom Kaos</option>
                    <option value="Custom Hoodie">Custom Hoodie</option>
                    <option value="Custom Topi">Custom Topi</option>
                    <option value="Custom Tas">Custom Tas</option>
                    <option value="Custom Merchandise">Custom Merchandise</option>
                    <option value="Alat & Bahan DTF">Alat & Bahan DTF</option>
                    <option value="Polosan">Polosan</option>
                    <option value="Download">Download</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">URL Gambar (Foto Produk)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer"
                >
                  SIMPAN PRODUK
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-black border-b pb-2">
                Daftar Katalog Aktif ({products.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="bg-gray-50 p-4 rounded-2xl border flex items-center justify-between gap-3">
                    {p.image && (
                      <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-xl bg-white" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-black truncate">{p.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-red-600 font-black">{p.price}</span>
                        {p.original_price && (
                          <span className="text-[10px] text-gray-400 line-through">{p.original_price}</span>
                        )}
                      </div>
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">{p.category}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PENGATURAN PROMO & TEKS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6 max-w-2xl">
            <h2 className="text-sm font-black uppercase tracking-wider text-red-600 border-b pb-2">
              ⚙️ Pengaturan CMS & Promo Website
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Judul Utama Hero (Beranda)</label>
                <input
                  type="text"
                  value={siteText.heroTitle}
                  onChange={(e) => setSiteText({ ...siteText, heroTitle: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Deskripsi Hero (Beranda)</label>
                <textarea
                  rows={3}
                  value={siteText.heroDesc}
                  onChange={(e) => setSiteText({ ...siteText, heroDesc: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block font-bold mb-1">Pengumuman Promo / Event</label>
                <input
                  type="text"
                  value={siteText.promoAnnouncement}
                  onChange={(e) => setSiteText({ ...siteText, promoAnnouncement: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-semibold text-black focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl uppercase tracking-wider transition cursor-pointer"
              >
                SIMPAN PERUBAHAN WEBSITE
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  )
}