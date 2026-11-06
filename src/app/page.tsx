'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// Alamat halaman studio mockup. Ubah kalau alamat studio kamu berbeda.
const STUDIO_PATH = '/custom'

// Gambar sementara. Ganti dengan foto sendiri (simpan di folder public/images lalu tulis '/images/nama-file.jpg').
const HOME_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1800&auto=format&fit=crop&q=80',
  kaos: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80',
  oversized: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80',
  hoodie: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80',
  topi: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=80',
}

const PRODUCTS = [
  { label: 'Kaos', type: 'kaos', image: HOME_IMAGES.kaos },
  { label: 'Oversize', type: 'oversized', image: HOME_IMAGES.oversized },
  { label: 'Hoodie', type: 'hoodie', image: HOME_IMAGES.hoodie },
  { label: 'Topi', type: 'topi', image: HOME_IMAGES.topi },
]

export default function Home() {
  const [siteText, setSiteText] = useState({
    heroTitle: 'Desain kaosmu. Lihat hasilnya.',
    footerText: '© 2026 DSCPL WEAR. Depok.'
  })

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAdminLoggedIn(!!data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminLoggedIn(!!session)
    })

    const loadTexts = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('data')
        .eq('id', 1)
        .maybeSingle()

      if (data?.data) {
        const d = data.data as any
        setSiteText(prev => ({
          heroTitle: d.heroTitle || prev.heroTitle,
          footerText: d.footerText || prev.footerText
        }))
      }
    }
    loadTexts()

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="min-h-screen bg-white text-black">

      {/* HERO: gambar penuh, teks seminimal mungkin */}
      <section className="relative w-full h-[80vh] min-h-[480px] overflow-hidden bg-black">
        <img
          src={HOME_IMAGES.hero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {isAdminLoggedIn && (
          <Link
            href="/admin/orders"
            className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition"
          >
            ⚙️ Panel Admin
          </Link>
        )}

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-12 md:pb-16">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white max-w-3xl leading-[1.05]">
            {siteText.heroTitle}
          </h1>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href={STUDIO_PATH}
              className="bg-white hover:bg-gray-200 text-black font-black text-xs md:text-sm px-7 py-3.5 rounded-full uppercase tracking-wider transition"
            >
              Mulai Desain ➔
            </Link>
            <Link
              href="/products"
              className="border border-white/70 hover:bg-white hover:text-black text-white font-black text-xs md:text-sm px-7 py-3.5 rounded-full uppercase tracking-wider transition"
            >
              Katalog
            </Link>
          </div>
        </div>
      </section>

      {/* PILIH PRODUK: klik langsung membuka studio dengan jenis itu terpilih */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {PRODUCTS.map((p) => (
            <Link
              key={p.type}
              href={`${STUDIO_PATH}?type=${p.type}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-2xl md:rounded-3xl bg-gray-100"
            >
              <img
                src={p.image}
                alt={p.label}
                loading="lazy"
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between">
                <span className="text-white font-black text-lg md:text-2xl uppercase tracking-wide">{p.label}</span>
                <span className="text-white text-xl transition group-hover:translate-x-1">➔</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="py-8 text-center text-[11px] text-gray-500 font-semibold border-t border-gray-100">
        {siteText.footerText}
      </footer>

    </main>
  )
}