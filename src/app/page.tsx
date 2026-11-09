'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [latestProducts, setLatestProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil Produk Pilihan Terbaru (untuk di-swipe)
      const { data: latestData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)

      if (latestData) setLatestProducts(latestData)

      // 2. Ambil Katalog Keseluruhan (untuk grid ke bawah)
      const { data: allData } = await supabase
        .from('products')
        .select('*')
        .order('title', { ascending: true })
        .limit(8)

      if (allData) setAllProducts(allData)

      setLoading(false)
    }

    fetchData()
  }, [])

  // Kategori Utama
  const categories = [
    {
      name: 'Kaos',
      categoryValue: 'Custom Kaos',
      icon: (
        <svg className="w-5 h-5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
        </svg>
      )
    },
    {
      name: 'Oversized',
      categoryValue: 'Custom Oversized',
      icon: (
        <svg className="w-5 h-5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 4l-4-1.5a5 5 0 00-10 0L3 4l-.8 4.2a1 1 0 00.8 1.2H5v10.6a1 1 0 001 1h12a1 1 0 001-1V9.4h2a1 1 0 00.8-1.2L21 4z" />
        </svg>
      )
    },
    {
      name: 'Hoodie',
      categoryValue: 'Custom Hoodie',
      icon: (
        <svg className="w-5 h-5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 00-4 4v1H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2V6a4 4 0 00-4-4z" />
        </svg>
      )
    },
    {
      name: 'Topi',
      categoryValue: 'Custom Topi',
      icon: (
        <svg className="w-5 h-5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 13H5a2 2 0 01-2-2v-1a6 6 0 0112 0v1h4a1 1 0 011 1v1a1 1 0 01-1 1z" />
        </svg>
      )
    }
  ]

  // Komponen Kartu Produk Mungil (Digunakan untuk Swipe maupun Grid)
  const renderProductCard = (prod: any) => {
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
        className="group bg-white border border-zinc-200/80 hover:border-black rounded-2xl p-2 flex flex-col justify-between cursor-pointer transition shadow-sm w-full"
      >
        <div className="relative w-full h-36 bg-zinc-100 rounded-xl overflow-hidden">
          <span className="absolute top-2 left-2 bg-black text-white text-[7px] font-black px-1.5 py-0.5 rounded-full z-10 uppercase">
            {prod.category}
          </span>
          {prod.image && (
            <img src={prod.image} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          )}
        </div>

        <div className="pt-2 px-1 space-y-1">
          <h4 className="font-bold text-[11px] text-zinc-900 line-clamp-1">{prod.title}</h4>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-zinc-950">{prod.price}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/custom?type=${apparelType}&id=${prod.id}`)}
              }
              className="bg-black hover:bg-zinc-800 text-white text-[8px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider transition"
            >
              Custom
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black pb-16">
      
      {/* 1. MULAI DESAIN (HERO SECTION) */}
      <section className="bg-zinc-950 text-white py-6 px-6 md:px-12 flex justify-center">
        <Link
          href="/custom"
          className="group w-full max-w-xs bg-white text-black rounded-2xl p-4 flex flex-col items-center justify-center shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-16 h-16 my-2 flex items-center justify-center">
            <img 
              src="/art.png" 
              alt="Mulai Desain" 
              className="w-full h-full object-contain filter drop-shadow group-hover:rotate-6 transition duration-300" 
            />
          </div>

          <div className="w-full bg-black group-hover:bg-zinc-800 text-white font-black text-[11px] py-2.5 px-4 rounded-xl uppercase tracking-widest text-center shadow transition duration-300">
            Mulai Desain ➔
          </div>
        </Link>
      </section>

      {/* 2. PRODUK PILIHAN TERBARU (SISTEM SWIPE / HORIZONTAL SCROLL) */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 pt-8 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">
            Produk Pilihan Terbaru
          </h2>
          <Link href="/products" className="text-[11px] font-bold text-zinc-400 hover:text-black transition">
            Katalog Lengkap ➔
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs font-bold text-zinc-400">Memuat produk...</div>
        ) : latestProducts.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-400">Belum ada produk.</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {latestProducts.map((prod) => (
              <div key={prod.id} className="w-[170px] sm:w-[190px] flex-shrink-0 snap-start">
                {renderProductCard(prod)}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. KATEGORI UTAMA */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 pt-8 space-y-3">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">
            Kategori Utama
          </h2>
          <Link href="/products" className="text-[11px] font-bold text-zinc-400 hover:text-black transition">
            Lihat Semua ➔
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => router.push(`/products?category=${encodeURIComponent(cat.categoryValue)}`)}
              className="group bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 hover:border-black rounded-2xl py-3.5 px-4 flex items-center justify-between cursor-pointer transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {cat.icon}
                <span className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                  {cat.name}
                </span>
              </div>
              <span className="text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 transition text-xs font-bold">
                ➔
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PRODUK PILIHAN KESELURUHAN (GRID MUNGIL KE BAWAH) */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 pt-10 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">
            Produk Pilihan Keseluruhan
          </h2>
          <Link href="/products" className="text-[11px] font-bold text-zinc-400 hover:text-black transition">
            Lihat Semua ➔
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs font-bold text-zinc-400">Memuat produk...</div>
        ) : allProducts.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-400">Belum ada produk.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {allProducts.map(renderProductCard)}
          </div>
        )}
      </section>

    </main>
  )
}