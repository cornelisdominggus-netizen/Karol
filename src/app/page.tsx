'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import EventBanner from '@/components/EventBanner'

export default function Home() {
  const [siteText, setSiteText] = useState({
    heroTitle: 'Precision Apparel & Custom Print Workshop',
    heroDesc: 'Pusat layanan custom apparel, sablon DTF berkualitas tinggi, dan penyediaan polosan standar distro di Depok. Tampil presisi dan berdisiplin tinggi bersama DSCPL WEAR.',
    sectionTitle: 'Kategori Utama DSCPL WEAR',
    promoAnnouncement: 'Event 99% : Selengkapnya',
    footerText: '© 2026 DSCPL WEAR. Pusat Custom Apparel & Sablon DTF Depok.'
  })

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

  useEffect(() => {
    const loadData = () => {
      // Cek status login admin
      const adminStatus = localStorage.getItem('dscpl_is_admin')
      setIsAdminLoggedIn(adminStatus === 'true')

      // Load Teks CMS
      const savedTexts = localStorage.getItem('dscpl_site_texts')
      if (savedTexts) {
        try {
          const parsed = JSON.parse(savedTexts)
          setSiteText(prev => ({ ...prev, ...parsed }))
        } catch (e) {}
      }
    }

    loadData()

    window.addEventListener('storage', loadData)
    window.addEventListener('dscpl_text_updated', loadData)
    window.addEventListener('dscpl_auth_updated', loadData)

    return () => {
      window.removeEventListener('storage', loadData)
      window.removeEventListener('dscpl_text_updated', loadData)
      window.removeEventListener('dscpl_auth_updated', loadData)
    }
  }, [])

  return (
    <main className="min-h-screen bg-white text-black">
      
      {/* Event Banner Berjalan & Hitung Mundur */}
      <EventBanner />

      <div className="max-w-7xl mx-auto py-12 px-4 space-y-12">
        
        {/* Hero Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Official DSCPL WEAR Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">
              {siteText.heroTitle}
            </h1>
            <p className="text-gray-800 text-sm md:text-base font-semibold leading-relaxed">
              {siteText.heroDesc}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/products"
                className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-sm uppercase cursor-pointer inline-block"
              >
                Lihat Semua Katalog 👕
              </Link>

              {/* Tombol Admin di Beranda HANYA MUNCUL jika akun admin sudah login */}
              {isAdminLoggedIn && (
                <Link
                  href="/admin/orders"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow uppercase cursor-pointer inline-block"
                >
                  ⚙️ Panel Super Admin Aktif
                </Link>
              )}
            </div>
          </div>

          <div className="w-full md:w-96 h-64 bg-gray-200 rounded-2xl flex items-center justify-center border border-gray-300 text-center p-6 shadow-inner">
            <div>
              <span className="text-4xl block mb-2">⚡</span>
              <span className="text-xs font-black uppercase tracking-widest text-gray-800">DSCPL WEAR WORKSHOP</span>
              <p className="text-[11px] text-gray-700 font-bold mt-1">Depok, West Java, Indonesia</p>
              <span className="inline-block mt-3 bg-white text-black text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
                {siteText.promoAnnouncement}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Category Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-wider pb-2 border-b border-gray-200">
            {siteText.sectionTitle}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { title: 'Custom Kaos', type: 'Custom Kaos', icon: '👕' },
              { title: 'Custom Hoodie', type: 'Custom Hoodie', icon: '🧥' },
              { title: 'Custom Topi', type: 'Custom Topi', icon: '🧢' },
              { title: 'Custom Tas', type: 'Custom Tas', icon: '👜' },
              { title: 'Merchandise', type: 'Merchandise', icon: '🎁' }
            ].map((cat, idx) => (
              <Link
                key={idx}
                href="/products"
                className="bg-gray-50 hover:bg-black hover:text-white transition border border-gray-200 rounded-2xl p-6 text-center group shadow-sm flex flex-col items-center justify-center cursor-pointer"
              >
                <span className="text-3xl mb-2">{cat.icon}</span>
                <h3 className="font-bold text-xs uppercase">{cat.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-gray-200 text-center text-xs text-gray-600 font-semibold">
          {siteText.footerText}
        </footer>

      </div>
    </main>
  )
}