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

  const filteredProducts = products.filter((p) => {
    if (categoryParam === 'Semua Katalog') return true
    
    const cat = (p.category || '').toLowerCase()

    if (categoryParam === 'Custom Oversized') {
      return cat.includes('oversized') || cat.includes('oversize') || p.title.toLowerCase().includes('oversize')
    }

    const target = categoryParam.toLowerCase().replace('custom ', '')
    return cat.includes(target)
  })

  const categoriesList = [
    { name: 'Semua', value: 'Semua Katalog' },
    { name: 'Oversized', value: 'Custom Oversized' },
    { name: 'Kaos', value: 'Custom Kaos' },
    { name: 'Hoodie', value: 'Custom Hoodie' },
    { name: 'Topi', value: 'Custom Topi' },
    { name: 'Tas', value: 'Custom Tas' },
    { name: 'Merchandise', value: 'Custom Merchandise' },
    { name: 'Polosan', value: 'Polosan' }
  ]

  // Daftar warna bahan persis seperti di studio 3D
  const availableColors = [
    { name: 'White', hex: '#ffffff', border: 'border-zinc-300' },
    { name: 'Black', hex: '#111111', border: 'border-black' },
    { name: 'Gray', hex: '#71717a', border: 'border-zinc-500' },
    { name: 'Navy', hex: '#1e1b4b', border: 'border-indigo-950' },
    { name: 'Red', hex: '#7f1d1d', border: 'border-red-900' }
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
    <main className="min-h-screen bg-white text-black py-6 px-3 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Kategori Horizontal Scroll ala Uniqlo */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-100">
          {categoriesList.map((cat, idx) => {
            const isActive = categoryParam.toLowerCase() === cat.value.toLowerCase()
            return (
              <button
                key={idx}
                onClick={() => router.push(`/products?category=${encodeURIComponent(cat.value)}`)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-bold uppercase transition cursor-pointer ${
                  isActive 
                    ? 'text-black border-b-2 border-black -mb-[9px]' 
                    : 'text-zinc-500 hover:text-black'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Header Kategori */}
        <div className="flex justify-between items-baseline pt-2">
          <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight text-zinc-900">
            {categoryParam}
          </h1>
          <span className="text-xs font-bold text-zinc-400">
            {filteredProducts.length} Produk
          </span>
        </div>

        {/* Grid Katalog Ala Uniqlo dengan Indikator Warna Studio 3D */}
        <div className="space-y-6">
          {loadingProducts ? (
            <div className="py-24 text-center">
              <p className="text-xs font-bold text-zinc-400 tracking-wider">Memuat produk...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center space-y-2 bg-zinc-50 rounded-2xl">
              <span className="text-3xl">📦</span>
              <h4 className="font-bold text-zinc-800 text-xs uppercase">Belum ada produk untuk kategori ini.</h4>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
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
                    className="group bg-white flex flex-col justify-between cursor-pointer space-y-2 pb-3"
                  >
                    {/* Foto Produk Kotak Bersih */}
                    <div className="relative aspect-square bg-zinc-100 rounded-xl overflow-hidden">
                      {prod.image && (
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                        />
                      )}
                    </div>

                    {/* Detail Teks Ala Retail */}
                    <div className="space-y-1.5 px-0.5">
                      {/* Titik Warna Bahan (Sinkron dengan Studio 3D) */}
                      <div className="flex items-center gap-1.5 py-0.5">
                        {availableColors.map((c) => (
                          <span
                            key={c.name}
                            className={`w-3 h-3 rounded-full border ${c.border} shadow-sm`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          ></span>
                        ))}
                      </div>

                      {/* Judul Produk Tidak Terpotong */}
                      <h4 className="font-semibold text-xs md:text-sm text-zinc-900 line-clamp-2 leading-tight group-hover:underline">
                        {prod.title}
                      </h4>

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-xs md:text-sm font-black text-zinc-950">{prod.price}</span>
                        {prod.originalPrice && (
                          <span className="text-[10px] text-zinc-400 line-through font-medium">{prod.originalPrice}</span>
                        )}
                      </div>

                      {/* Rating & Tombol Custom */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold">
                          <span className="text-yellow-500">★</span> 4.8 <span className="text-zinc-300">|</span> <span className="text-[9px] font-normal text-zinc-400">Custom 3D</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/custom?type=${apparelType}&id=${prod.id}`)
                          }}
                          className="bg-zinc-900 hover:bg-black text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer"
                        >
                          Design ➔
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Ulasan Pelanggan */}
        <div className="border-t border-zinc-200 pt-16 space-y-8 mt-20">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-zinc-900">
            Ulasan Pelanggan ({reviews.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-900">{rev.name}</span>
                      <span className="text-[10px] text-zinc-400">{rev.date}</span>
                    </div>
                    <div className="text-yellow-500 text-[10px]">★★★★★</div>
                    <p className="text-xs text-zinc-700">{rev.comment}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-red-500 text-xs font-bold p-1 hover:bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddReview} className="bg-zinc-50 p-6 rounded-xl border border-zinc-200/60 space-y-3 text-xs">
              <h4 className="font-bold text-zinc-900 uppercase">Tulis Ulasan Anda</h4>
              <input
                type="text"
                placeholder="Nama Anda"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={60}
                className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 font-medium text-black focus:outline-none"
                required
              />
              <textarea
                rows={2}
                placeholder="Bagaimana pengalaman Anda berbelanja di DSCPL WEAR?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
                className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 font-medium text-black focus:outline-none resize-none"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-2.5 rounded-lg uppercase tracking-wider transition cursor-pointer"
              >
                Kirim Ulasan
              </button>
            </form>
          </div>
        </div>

      </div>
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white text-black flex items-center justify-center text-xs font-bold">Memuat halaman...</div>}>
      <ProductsContent />
    </Suspense>
  )
}