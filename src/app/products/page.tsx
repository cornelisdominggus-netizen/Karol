'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Product = {
  id: number
  title: string
  category: string
  price: string
  originalPrice: string | null
  image: string | null
}

type Review = {
  id: number
  name: string
  rating: number
  comment: string
  date: string
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category') || 'Semua Katalog'

  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [reviews, setReviews] = useState<Review[]>([])
  const [newName, setNewName] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Gagal memuat produk', error.message)
        setProducts([])
      } else {
        setProducts(
          (data || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price: p.price,
            originalPrice: p.original_price,
            image: p.image
          }))
        )
      }
      setLoadingProducts(false)
    }

    const loadReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Gagal memuat ulasan', error.message)
        setReviews([])
      } else {
        setReviews(
          (data || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          }))
        )
      }
    }

    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAdmin(!!data.session)
    }

    loadProducts()
    loadReviews()
    checkAdmin()
  }, [])

  const filteredProducts =
    categoryParam === 'Semua Katalog'
      ? products
      : products.filter((p) => p.category?.toLowerCase() === categoryParam.toLowerCase())

  const categoriesList = [
    { name: 'Semua Katalog', value: 'Semua Katalog' },
    { name: 'Custom Hoodie', value: 'Custom Hoodie' },
    { name: 'Custom Kaos', value: 'Custom Kaos' },
    { name: 'Custom Merchandise', value: 'Custom Merchandise' },
    { name: 'Custom Tas', value: 'Custom Tas' },
    { name: 'Custom Topi', value: 'Custom Topi' },
    { name: 'Polosan', value: 'Polosan' }
  ]

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newComment.trim()) return

    const { data, error } = await supabase
      .from('reviews')
      .insert({ name: newName.trim(), rating: 5, comment: newComment.trim() })
      .select()
      .single()

    if (error || !data) {
      alert('Maaf, ulasan gagal dikirim. Coba lagi sebentar lagi.')
      return
    }

    const review: Review = {
      id: data.id,
      name: data.name,
      rating: data.rating,
      comment: data.comment,
      date: new Date(data.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }

    setReviews([review, ...reviews])
    setNewName('')
    setNewComment('')
    alert('Terima kasih! Ulasan Anda berhasil ditambahkan.')
  }

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Hapus ulasan ini?')) return

    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) {
      alert('Gagal menghapus ulasan.')
      return
    }
    setReviews(reviews.filter((rev) => rev.id !== id))
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
                  Pusat custom apparel berkualitas tinggi langsung dari workshop kami di Depok.
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

              {loadingProducts ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-16 text-center">
                  <p className="text-xs font-bold text-gray-500">Memuat produk...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-16 text-center space-y-3">
                  <span className="text-4xl">📦</span>
                  <h4 className="font-bold text-black text-sm">Belum ada produk untuk kategori "{categoryParam}".</h4>
                  <p className="text-xs text-gray-500">Silakan tambahkan produk baru melalui panel admin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => {
                    let apparelType = 'kaos'
                    const cat = prod.category?.toLowerCase() || ''
                    const title = prod.title?.toLowerCase() || ''
                    
                    if (cat.includes('hoodie') || title.includes('hoodie')) apparelType = 'hoodie'
                    else if (cat.includes('topi') || title.includes('topi')) apparelType = 'topi'
                    else if (cat.includes('tas') || title.includes('tas')) apparelType = 'tas'
                    else if (cat.includes('oversize') || title.includes('oversize')) apparelType = 'oversized'

                    return (
                      <div
                        key={prod.id}
                        onClick={() => router.push(`/custom?type=${apparelType}&id=${prod.id}`)}
                        className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="relative h-64 bg-gray-100 overflow-hidden">
                          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 uppercase">
                            {prod.category}
                          </span>
                          {prod.image && (
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          )}
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
                                router.push(`/custom?type=${apparelType}&id=${prod.id}`)
                              }}
                              className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider hover:bg-gray-800 transition cursor-pointer"
                            >
                              Custom 3D
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* BAGIAN ULASAN */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm mt-12">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  Ulasan Pelanggan ({reviews.length})
                </h3>
                {isAdmin && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-lg">
                    🔒 Mode Admin aktif
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-black">{rev.name}</span>
                        <span className="text-[10px] text-gray-400">{rev.date}</span>
                      </div>
                      <div className="text-yellow-500 text-xs">★★★★★</div>
                      <p className="text-xs text-gray-700 font-medium">{rev.comment}</p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-red-50 transition flex-shrink-0 cursor-pointer"
                        title="Hapus ulasan"
                      >
                        🗑️ Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddReview} className="space-y-3 pt-4 border-t">
                <h4 className="text-xs font-bold uppercase text-black">Tulis Ulasan Anda</h4>
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={60}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-black focus:outline-none placeholder:text-gray-400"
                  required
                />
                <textarea
                  rows={2}
                  placeholder="Bagaimana pengalaman Anda berbelanja di DSCPL WEAR?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white text-black flex items-center justify-center text-xs font-bold">Memuat halaman produk...</div>}>
      <ProductsContent />
    </Suspense>
  )
}