'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminCMSPage() {
  const router = useRouter()

  const [texts, setTexts] = useState({
    topBanner: 'DSCPL WEAR, Stay Disciplined!',
    brandName: 'DSCPL',
    brandSub: '.wear',
    navCustom: 'Custom Apparel',
    navTools: 'Alat & Bahan DTF',
    navPolosan: 'Polosan',
    navDownload: 'Download',
    navLocation: 'Lokasi',
    heroTitle: 'Precision Apparel & Custom Print Workshop',
    heroDesc: 'Pusat layanan custom apparel, sablon DTF berkualitas tinggi, dan penyediaan polosan standar distro di Depok. Tampil presisi dan berdisiplin tinggi bersama DSCPL WEAR.',
    sectionTitle: 'Kategori Utama DSCPL WEAR',
    promoAnnouncement: 'Event 99% : Selengkapnya',
    footerText: '© 2026 DSCPL WEAR. Pusat Custom Apparel & Sablon DTF Depok.'
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('dscpl_admin_logged')
    if (!isLoggedIn) {
      router.replace('/admin/login')
      return
    }

    const savedTexts = localStorage.getItem('dscpl_site_texts')
    if (savedTexts) {
      try {
        const parsed = JSON.parse(savedTexts)
        setTexts(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error('Gagal memuat teks CMS', e)
      }
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTexts({ ...texts, [e.target.name]: e.target.value })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('dscpl_site_texts', JSON.stringify(texts))
    
    // Broadcast event agar Navbar & Home langsung update secara live
    window.dispatchEvent(new Event('dscpl_text_updated'))
    
    alert('Berhasil! Semua teks website telah diperbarui secara real-time.')
  }

  const handleReset = () => {
    localStorage.removeItem('dscpl_site_texts')
    window.dispatchEvent(new Event('dscpl_text_updated'))
    alert('Konfigurasi teks dikembalikan ke default.')
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <div>
            <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              CMS ADMIN PANEL MASTER
            </span>
            <h1 className="text-2xl font-black text-black mt-2">Pusat Edit Teks Seluruh Website</h1>
          </div>
          <div>
            <Link href="/admin/orders" className="bg-gray-100 hover:bg-gray-200 text-black font-bold px-4 py-2.5 rounded-xl text-xs transition">
              ← Kelola Pesanan
            </Link>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-8">
          
          {/* Bagian 1: Header & Navbar */}
          <div className="space-y-4 border-b border-gray-200 pb-6">
            <h2 className="text-xs font-black text-red-600 uppercase tracking-widest">1. Bagian Atas & Navbar</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Banner Atas</label>
                <input
                  type="text"
                  name="topBanner"
                  value={texts.topBanner}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Nama Brand</label>
                <input
                  type="text"
                  name="brandName"
                  value={texts.brandName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Menu Custom</label>
                <input
                  type="text"
                  name="navCustom"
                  value={texts.navCustom}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Menu Alat & Bahan</label>
                <input
                  type="text"
                  name="navTools"
                  value={texts.navTools}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Menu Polosan</label>
                <input
                  type="text"
                  name="navPolosan"
                  value={texts.navPolosan}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Hero & Konten Utama */}
          <div className="space-y-4 border-b border-gray-200 pb-6">
            <h2 className="text-xs font-black text-red-600 uppercase tracking-widest">2. Halaman Utama (Hero & Judul)</h2>
            
            <div>
              <label className="block text-xs font-bold text-black uppercase mb-1">Judul Hero (Slogan Besar)</label>
              <input
                type="text"
                name="heroTitle"
                value={texts.heroTitle}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase mb-1">Deskripsi Hero</label>
              <textarea
                name="heroDesc"
                rows={3}
                value={texts.heroDesc}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Judul Kategori</label>
                <input
                  type="text"
                  name="sectionTitle"
                  value={texts.sectionTitle}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Pengumuman Promo</label>
                <input
                  type="text"
                  name="promoAnnouncement"
                  value={texts.promoAnnouncement}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bagian 3: Footer */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-red-600 uppercase tracking-widest">3. Bagian Footer</h2>
            <div>
              <label className="block text-xs font-bold text-black uppercase mb-1">Teks Hak Cipta / Footer</label>
              <textarea
                name="footerText"
                rows={2}
                value={texts.footerText}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-black hover:bg-gray-800 text-white font-black py-4 rounded-xl transition text-xs shadow-md uppercase tracking-wider cursor-pointer"
            >
              💾 Simpan & Perbarui Semua Teks Real-Time
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-200 hover:bg-gray-300 text-black font-bold px-6 py-4 rounded-xl transition text-xs cursor-pointer"
            >
              Reset Default
            </button>
          </div>

        </form>

      </div>
    </main>
  )
}