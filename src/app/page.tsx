'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Product = {
  id: number
  title: string
  category: string
  price: string
  original_price: string | null
  image: string | null
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)

      if (!error && data) {
        setProducts(data as Product[])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white pb-16">
      
      {/* HERO SECTION VISUAL-FIRST (Gaya Grateful Apparel: Bersih & Fokus Produk) */}
      <section className="px-4 md:px-8 pt-4 md:pt-8 max-w-7xl mx-auto">
        <div className="rounded-3xl overflow-hidden bg-black text-white relative min-h-[420px] md:min-h-[520px] flex items-end p-6 md:p-12 shadow-xl">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          
          <div className="relative z-10 space-y-3 max-w-xl">
            <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Custom Apparel & DTF Print
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
              PRECISION APPAREL & CUSTOM WORKSHOP.
            </h1>
            <p className="text-gray-300 text-xs font-medium leading-relaxed">
              Wujudkan desain streetwear impianmu di atas bahan standar distro terbaik. Cetak tajam, presisi, dan berkualitas tinggi.
            </p>
            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link href="/products" className="bg-white text-black text-[11px] font-black px-5 py-3 rounded-xl uppercase tracking-wider hover:bg-gray-200 transition">
                Jelajahi Produk ➔
              </Link>
              <Link href="/checkout" className="border border-white/40 text-white text-[11px] font-black px-5 py-3 rounded-xl uppercase tracking-wider hover:bg-white/10 transition">
                Mulai Custom
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* GRID KATALOG PRODUK */}
      <section className="px-4 md:px-8 pt-12 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end border-b border-gray-200 pb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Koleksi Pilihan</p>
            <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight">Featured Products</h2>
          </div>
          <Link href="/products" className="text-xs font-black uppercase tracking-wider hover:underline">
            Lihat Semua (→)
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-gray-100 rounded-2xl h-56 md:h-64"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-xs font-bold text-gray-400">Belum ada produk di katalog. Silakan tambahkan lewat panel admin.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <Link href="/products" key={p.id} className="group space-y-2.5 cursor-pointer">
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-100">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">No Image</div>
                  )}
                  <span className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {p.category}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-xs text-black group-hover:text-red-600 transition truncate">{p.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-red-600">{p.price}</span>
                    {p.original_price && (
                      <span className="text-[10px] text-gray-400 line-through">{p.original_price}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 mt-16 px-4 md:px-8 max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500 text-center md:text-left">
        <p>© 2026 DSCPL WEAR. All rights reserved.</p>
        <div className="flex gap-6 uppercase tracking-wider">
          <Link href="/products" className="hover:text-black">Katalog</Link>
          <Link href="/track" className="hover:text-black">Lacak Pesanan</Link>
          <Link href="/admin/login" className="hover:text-black">Admin Panel</Link>
        </div>
      </footer>

    </main>
  )
}