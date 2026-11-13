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

  // State untuk Multi-Slide Banner Gambar + Teks dari Supabase
  const [bannerSlides, setBannerSlides] = useState<any[]>([
    {
      title: "PREMIUM DTF PRINTING",
      subtitle: "Kualitas sablon tajam, detail warna akurat, tahan lama & tidak luntur.",
      tag: "WORKSHOP HIGHLIGHT",
      image_url: null
    }
  ])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showBannerText, setShowBannerText] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [bannersRes, settingsRes] = await Promise.all([
        supabase.from('hero_banners').select('*').order('created_at', { ascending: true }),
        supabase.from('site_settings').select('data').eq('id', 1).maybeSingle()
      ])

      if (bannersRes.data && bannersRes.data.length > 0) {
        setBannerSlides(bannersRes.data)
      }

      if (settingsRes.data?.data) {
        const settingsData = settingsRes.data.data as any
        if (typeof settingsData.showBannerText === 'boolean') {
          setShowBannerText(settingsData.showBannerText)
        }
      }

      const { data: latestData } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(10)

      if (latestData) setLatestProducts(latestData)

      const { data: allData } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })

      if (allData) setAllProducts(allData)

      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (bannerSlides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [bannerSlides.length])

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

  const renderProductCard = (prod: any) => {
    const cat = (prod.category || '').toLowerCase()
    
    const isCustom3D = 
      cat.includes('custom kaos') || 
      cat.includes('custom oversized') || 
      cat.includes('custom hoodie') || 
      cat.includes('custom topi') ||
      cat === 'kaos' ||
      cat === 'oversized' ||
      cat === 'hoodie' ||
      cat === 'topi'

    const targetUrl = `/products/${prod.id}`

    const rating = prod.rating || 4.9
    const soldCount = prod.sold_count || 25

    return (
      <div
        key={prod.id}
        onClick={() => router.push(targetUrl)}
        className="group bg-white border border-zinc-200/80 hover:border-black rounded-2xl p-2.5 flex flex-col justify-between cursor-pointer transition shadow-sm w-full h-full"
      >
        <div className="relative w-full h-36 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
          <span className="absolute top-2 left-2 bg-black text-white text-[7px] font-black px-1.5 py-0.5 rounded-full z-10 uppercase">
            {prod.category}
          </span>
          {prod.image && (
            <img src={prod.image} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          )}
        </div>

        <div className="pt-2 px-1 space-y-1.5 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            {prod.colors && Array.isArray(prod.colors) && prod.colors.length > 0 && (
              <div className="flex items-center gap-1 py-0.5">
                {prod.colors.map((hex: string, i: number) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-zinc-300 shadow-xs"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            )}

            <h4 className="font-bold text-[11px] text-zinc-900 line-clamp-1">{prod.title}</h4>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold pt-0.5">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-zinc-800 font-bold">{rating}</span>
              </div>
              <span>Terjual {soldCount}+</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 mt-1">
            <span className="text-[11px] font-black text-zinc-950">{prod.price}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(targetUrl)
              }}
              className="bg-black hover:bg-zinc-800 text-white text-[8px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider transition"
            >
              {isCustom3D ? 'Custom' : 'Beli'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeSlide = bannerSlides[currentSlide] || bannerSlides[0]

  return (
    <main className="min-h-screen bg-white text-black pb-16">
      
      {/* HERO SECTION */}
      <section className="bg-zinc-950 text-white py-12 px-6 md:px-12 relative overflow-hidden min-h-[340px] flex items-center">
        {activeSlide?.image_url && (
          <div className="absolute inset-0 z-0 transition-opacity duration-1000">
            <img src={activeSlide.image_url} alt="Banner" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          </div>
        )}

        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          {showBannerText && bannerSlides.length > 0 ? (
            <div className="flex-1 space-y-4 text-left z-10">
              <span className="bg-white/10 border border-white/20 text-zinc-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {activeSlide?.tag || 'WORKSHOP HIGHLIGHT'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                {activeSlide?.title || 'PREMIUM DTF PRINTING'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed font-medium">
                {activeSlide?.subtitle || 'Kualitas sablon tajam, detail warna akurat, tahan lama & tidak luntur.'}
              </p>
              <div className="flex items-center gap-2 pt-2">
                {bannerSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="hidden md:block flex-1" />
          )}

          <div className="w-full md:w-auto flex justify-end z-10">
            <Link
              href="/custom"
              className="group w-64 h-64 sm:w-72 sm:h-72 bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer text-center mx-auto md:mx-0"
            >
              <div className="w-16 h-16 my-1 flex items-center justify-center brightness-0 invert">
                <img src="/art.png" alt="Mulai Desain" className="w-full h-full object-contain filter drop-shadow group-hover:rotate-6 transition duration-300" />
              </div>
              <h3 className="font-black text-white text-[11px] uppercase tracking-widest mt-1">Custom Studio</h3>
              <div className="w-full mt-3 bg-white text-black hover:bg-zinc-200 font-black text-[11px] py-2.5 px-4 rounded-xl uppercase tracking-widest text-center shadow transition duration-300">
                Mulai Desain ➔
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PRODUK PILIHAN TERBARU (KOTAK UKURAN KONSISTEN) */}
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
              <div key={prod.id} className="w-[180px] sm:w-[200px] flex-shrink-0 snap-start flex">
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

      {/* 4. PRODUK KESELURUHAN */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 pt-10 space-y-6">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">
            PRODUK KESELURUHAN
          </h2>
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Total: {allProducts.length} Produk</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-zinc-400">Memuat produk keseluruhan...</div>
        ) : allProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">Belum ada produk tersimpan.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {allProducts.map(renderProductCard)}
          </div>
        )}
      </section>

    </main>
  )
}