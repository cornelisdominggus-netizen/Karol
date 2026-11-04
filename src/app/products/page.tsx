'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category') || 'Semua Katalog'

  const [products, setProducts] = useState<any[]>([])

  // State untuk Ulasan Pelanggan yang tersimpan permanen di localStorage
  const [reviews, setReviews] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    // 1. Muat Produk Admin
    const fetchAdminProducts = () => {
      const data = localStorage.getItem('dscpl_store_products')
      if (data) {
        try {
          setProducts(JSON.parse(data))
        } catch (err) {
          setProducts([])
        }
      }
    }

    // 2. Muat Ulasan Permanen dari localStorage
    const fetchReviews = () => {
      const savedReviews = localStorage.getItem('dscpl_product_reviews')
      if (savedReviews) {
        try {
          setReviews(JSON.parse(savedReviews))
        } catch (err) {
          setReviews([])
        }
      } else {
        // Ulasan default awal jika kosong
        const defaultReviews = [
          { id: 1, name: 'Reza Pratama', rating: 5, comment: 'Kualitas sablon DTF-nya tajam banget, bahan topinya kokoh. Mantap DSCPL WEAR!', date: '2 Nov 2026' },
          { id: 2, name: 'Dimas Anggara', rating: 5, comment: 'Pengiriman cepat area Depok, admin ramah dan hasil kaosnya pas di badan.', date: '3 Nov 2026' }
        ]
        setReviews(defaultReviews)
        localStorage.setItem('dscpl_product_reviews', JSON.stringify(defaultReviews))
      }
    }

    fetchAdminProducts()
    fetchReviews()

    window.addEventListener('storage', fetchAdminProducts)
    window.addEventListener('dscpl_products_updated', fetchAdminProducts)

    return () => {
      window.removeEventListener('storage', fetchAdminProducts)
      window.removeEventListener('dscpl_products_updated', fetchAdminProducts)
    }
  }, [])

  const filteredProducts = categoryParam === 'Semua Katalog'
    ? products
    : products.filter(p => p.category?.toLowerCase() === categoryParam.toLowerCase())

  const categoriesList = [
    { name: 'Semua Katalog', value: 'Semua Katalog' },
    { name: 'Download', value: 'Download' },
    { name: 'Dtf & Tools', value: 'Alat & Bahan DTF' },
    { name: 'Custom Hoodie', value: 'Custom Hoodie' },
    { name: 'Custom Kaos', value: 'Custom Kaos' },
    { name: 'Custom Merchandise', value: 'Custom Merchandise' },
    { name: 'Custom Tas', value: 'Custom Tas' },
    { name: 'Custom Topi', value: 'Custom Topi' },
    { name: 'Polosan', value: 'Polosan' }
  ]

  // Fungsi Kirim Ulasan (Disimpan Permanen)
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newComment) return

    const review = {
      id: Date.now(),
      name: newName,
      rating: 5,
      comment: newComment,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const updatedReviews = [review, ...reviews]
    setReviews(updatedReviews)
    localStorage.setItem('dscpl_product_reviews', JSON.stringify(updatedReviews))

    setNewName('')
    setNewComment('')
    alert('Terima kasih! Ulasan Anda berhasil ditambahkan dan tersimpan permanen.')
  }

  // Fungsi Hapus Ulasan (Khusus Mode Admin)
  const handleDeleteReview = (id: number) => {
    const isAdmin = confirm('Hapus ulasan ini? (Fitur khusus Mode Admin)')
    if (isAdmin) {
      const updatedReviews = reviews.filter(rev => rev.id !== id)
      setReviews(updatedReviews)
      localStorage.setItem('dscpl_product_reviews', JSON.stringify(updatedReviews))
    }
  }

  return (
    <main className="min-h-screen bg-white text-black py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-black">Beranda</Link> / 
            <span className="text-black font-black ml-1 uppercase">Produk Custom / {categoryParam}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Urutkan menurut:</span>
            <select className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-black focus:outline-none">
              <option>Yang Terbaru</option>
              <option>Terpopuler</option>
            </select>
          </div>
        </div>

        {/* Layout Utama */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Sidebar Kategori */}
          <div className="md:col-span-1 space-y-6 bg-gray-50 p-6 rounded-3xl border border-gray-200">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-black mb-4 pb-2 border-b border-gray-200">
                Kategori Produk
              </h3>
              <ul className="space-y-2 text-xs font-semibold text-gray-700">
                {categoriesList.map((cat, idx) => {
                  const isActive = categoryParam.toLowerCase() === cat.value.toLowerCase()
                  return (
                    <li key={idx}>
                      <button
                        onClick={() => router.push(`/products?category=${encodeURIComponent(cat.value)}`)}
                        className={`w-full text-left py-2 px-3 rounded-xl transition cursor-pointer ${
                          isActive ? 'bg-black text-white font-bold shadow-sm' : 'hover:bg-gray-200 text-black'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Sisi Kanan: Produk & Ulasan */}
          <div className="md:col-span-3 space-y-8">
            
            {/* Banner Kategori Atas */}
            <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  DSCPL WEAR STORE
                </span>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                  {categoryParam}
                </h1>
                <p className="text-xs text-gray-600 max-w-md">
                  Pusat custom apparel dan sablon DTF berkualitas tinggi langsung dari workshop kami di Depok.
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                <span className="text-2xl font-black text-black block">{filteredProducts.length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Produk Tersedia</span>
              </div>
            </div>

            {/* Grid Daftar Produk */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-black border-b pb-2">
                Daftar Produk ({filteredProducts.length})
              </h3>

              {filteredProducts.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-16 text-center space-y-3">
                  <span className="text-4xl">📦</span>
                  <h4 className="font-bold text-black text-sm">Belum ada produk untuk kategori "{categoryParam}".</h4>
                  <p className="text-xs text-gray-500">Silakan tambahkan produk baru melalui panel admin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => router.push(`/products/detail/${prod.id}`)}
                      className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="relative h-64 bg-gray-100 overflow-hidden">
                        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 uppercase">
                          {prod.category}
                        </span>
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                        <div>
                          <h4 className="font-bold text-xs text-black line-clamp-2 group-hover:underline">{prod.title}</h4>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-400 line-through block">{prod.originalPrice}</span>
                            <span className="text-sm font-black text-red-600">{prod.price}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/products/detail/${prod.id}`)
                            }}
                            className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider hover:bg-gray-800 transition cursor-pointer"
                          >
                            Pesan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BAGIAN ULASAN PERMANEN + HAPUS KHUSUS ADMIN */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm mt-12">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  Ulasan Pelanggan ({reviews.length})
                </h3>
                <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-lg">
                  🔒 Hapus ulasan khusus Mode Admin
                </span>
              </div>

              {/* List Testimoni */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-black">{rev.name}</span>
                        <span className="text-[10px] text-gray-400">• {rev.date}</span>
                      </div>
                      <div className="text-yellow-500 text-xs">★★★★★</div>
                      <p className="text-xs text-gray-700 font-medium">{rev.comment}</p>
                    </div>

                    {/* Tombol Hapus Khusus Admin */}
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                      title="Hapus ulasan (Mode Admin)"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                ))}
              </div>

              {/* Form Tulis Ulasan Baru */}
              <form onSubmit={handleAddReview} className="space-y-3 pt-4 border-t">
                <h4 className="text-xs font-bold uppercase text-black">Tulis Ulasan Anda</h4>
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-black focus:outline-none placeholder:text-gray-400"
                  required
                />
                <textarea
                  rows={2}
                  placeholder="Bagaimana pengalaman Anda berbelanja di DSCPL WEAR?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-black focus:outline-none placeholder:text-gray-400"
                  required
                ></textarea>
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Kirim Ulasan
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </main>
  )
}