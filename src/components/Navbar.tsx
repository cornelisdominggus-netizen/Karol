'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const STUDIO_PATH = '/custom'

export default function Navbar() {
  const router = useRouter()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false)
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [siteText, setSiteText] = useState({
    topBanner: 'DSCPL WEAR, Stay Disciplined!',
    brandName: 'DSCPL',
    brandSub: '.wear',
    navCustom: 'Katalog',
    navPolosan: 'Polosan',
    navLocation: 'Lokasi'
  })

  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('dscpl_cart')
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)) } catch (e) { setCart([]) }
      } else {
        setCart([])
      }
    }

    loadCart()
    window.addEventListener('storage', loadCart)
    window.addEventListener('dscpl_cart_updated', loadCart)

    return () => {
      window.removeEventListener('storage', loadCart)
      window.removeEventListener('dscpl_cart_updated', loadCart)
    }
  }, [])

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
        setSiteText(prev => ({ ...prev, ...(data.data as any) }))
      }
    }
    loadTexts()

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    if (confirm('Yakin ingin keluar dari akun Admin?')) {
      await supabase.auth.signOut()
      setIsAdminLoggedIn(false)
      alert('Berhasil Logout!')
      router.push('/')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setIsMobileMenuOpen(false)
    }
  }

  const subtotal = cart.reduce((acc, item) => {
    const p = parseInt(item.price.replace(/[^0-9]/g, '')) || 0
    return acc + (p * (item.quantity || 1))
  }, 0)

  return (
    <header className="w-full bg-white border-b border-zinc-100 sticky top-0 z-50">
      
      {/* Top Banner */}
      <div className="bg-zinc-950 text-zinc-400 text-[10px] md:text-xs py-2 px-4 tracking-widest font-medium">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="truncate pr-2">{siteText.topBanner}</span>
          <div className="hidden sm:flex space-x-6 flex-shrink-0">
            <Link href="/track" className="hover:text-white transition font-bold text-red-500">🔍 Lacak Pesanan</Link>
            <Link href="/contact" className="hover:text-white transition">Hubungi Kami</Link>
            <Link href="/location" className="hover:text-white transition">Lokasi</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3 relative">
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 text-black hover:bg-zinc-200 transition focus:outline-none cursor-pointer"
            title="Menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <Link href="/" className="text-xl md:text-2xl font-black tracking-widest text-black flex items-center gap-1">
            {siteText.brandName}<span className="text-[10px] md:text-xs font-bold text-zinc-400">{siteText.brandSub}</span>
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full bg-zinc-50 text-sm text-black rounded-full py-2 pl-4 pr-10 border border-zinc-200 focus:outline-none focus:border-black transition"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-zinc-400 cursor-pointer">🔍</button>
          </div>
        </form>

        <div className="flex items-center space-x-2 md:space-x-3 relative">

          <Link
            href={STUDIO_PATH}
            className="hidden sm:inline-block bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2.5 rounded-full transition whitespace-nowrap uppercase tracking-widest shadow-sm"
          >
            🎨 Mulai Desain
          </Link>
          
          <div 
            className="relative"
            onMouseEnter={() => setIsCartOpen(true)}
            onMouseLeave={() => setIsCartOpen(false)}
          >
            <Link href="/checkout" className="bg-zinc-50 hover:bg-zinc-100 text-black px-4 py-2 rounded-full text-xs font-bold transition border border-zinc-200 flex items-center gap-1.5 shadow-sm">
              🛒 <span className="hidden sm:inline">Keranjang</span> <span className="bg-black text-white px-1.5 py-0.5 rounded-full text-[10px]">{cart.length}</span>
            </Link>

            {isCartOpen && (
              <div className="absolute right-0 top-full w-72 md:w-80 bg-white shadow-2xl rounded-3xl border border-zinc-100 p-4 z-50 space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {cart.length === 0 ? (
                    <p className="text-xs text-center text-zinc-400 py-4 font-medium">Keranjang belanja kosong.</p>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={item.cartId ?? idx} className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                        {item.image && (
                          <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-xl bg-zinc-50 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-black truncate">{item.title}</h4>
                          <p className="text-[11px] text-zinc-500">{item.quantity} x {item.price}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-100 pt-3 flex justify-between items-center text-xs font-black">
                  <span>Subtotal:</span>
                  <span className="text-red-600">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>

                <div className="space-y-2 pt-1">
                  <Link href="/checkout" className="block text-center bg-black hover:bg-zinc-800 text-white text-xs font-black py-3 rounded-2xl uppercase tracking-wider transition shadow">
                    LIHAT KERANJANG
                  </Link>
                </div>
              </div>
            )}
          </div>

          {isAdminLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <Link href="/admin/orders" className="bg-black text-white text-[10px] md:text-xs font-black px-4 py-2 rounded-full hover:bg-zinc-800 transition">
                ⚙️ Admin
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 font-bold px-3 py-2 rounded-full text-[10px] md:text-xs border border-red-200 cursor-pointer"
                title="Keluar"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link href="/admin/login" className="bg-black text-white text-xs font-bold px-4.5 py-2 rounded-full hover:bg-zinc-800 transition whitespace-nowrap shadow-sm">
              MASUK
            </Link>
          )}

        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk..."
            className="w-full bg-zinc-50 text-xs text-black rounded-full py-2.5 pl-4 pr-10 border border-zinc-200 focus:outline-none focus:border-black transition"
          />
          <button type="submit" className="absolute right-3.5 top-2.5 text-zinc-400 text-xs cursor-pointer">🔍</button>
        </form>
      </div>

      {/* Menu Desktop */}
      <div className="border-t border-zinc-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-8 text-xs font-black uppercase tracking-widest text-black py-3 relative">
          
          <div 
            className="relative"
            onMouseEnter={() => setIsCustomDropdownOpen(true)}
            onMouseLeave={() => setIsCustomDropdownOpen(false)}
          >
            <Link href="/products" className="flex items-center gap-1 py-1 hover:text-red-600 transition cursor-pointer">
              {siteText.navCustom} ▾
            </Link>

            {isCustomDropdownOpen && (
              <div className="absolute top-full left-0 w-56 bg-white shadow-2xl rounded-3xl border border-zinc-100 py-3 z-50 space-y-1">
                <Link href="/products?category=Custom Kaos" className="block px-5 py-2 hover:bg-zinc-50 text-black text-xs font-bold">Kaos</Link>
                <Link href="/products?category=Custom Oversized" className="block px-5 py-2 hover:bg-zinc-50 text-black text-xs font-bold">Oversized</Link>
                <Link href="/products?category=Custom Hoodie" className="block px-5 py-2 hover:bg-zinc-50 text-black text-xs font-bold">Hoodie</Link>
                <Link href="/products?category=Custom Topi" className="block px-5 py-2 hover:bg-zinc-50 text-black text-xs font-bold">Topi</Link>
                <Link href="/products?category=Custom Tas" className="block px-5 py-2 hover:bg-zinc-50 text-black text-xs font-bold">Tas</Link>
                <Link href="/products?category=Custom Merchandise" className="block px-5 py-2 hover:bg-zinc-50 text-black text-xs font-bold">Merchandise</Link>
              </div>
            )}
          </div>

          <Link href="/products?category=Polosan" className="hover:text-red-600 transition">{siteText.navPolosan}</Link>
          <Link href="/location" className="hover:text-red-600 transition">{siteText.navLocation}</Link>
        </div>
      </div>

      {/* Menu Mobile dengan Ikon Hitam Presisi di Semua Bagian */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 px-6 py-6 space-y-5 shadow-2xl animate-fadeIn">
          <div className="flex flex-col space-y-3 text-xs font-bold text-black">
            
            <Link 
              href={STUDIO_PATH} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="py-3.5 px-5 bg-zinc-950 text-white rounded-2xl font-black uppercase tracking-widest text-center shadow-lg hover:bg-zinc-800 transition"
            >
              🎨 Mulai Studio Desain 3D
            </Link>

            {/* Tombol Katalog dengan Toggle Dropdown dan Ikon Hitam */}
            <div className="border-b border-zinc-100 pb-2">
              <button
                onClick={() => setIsMobileCatalogOpen(!isMobileCatalogOpen)}
                className="w-full flex items-center justify-between py-2.5 text-zinc-900 font-black uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Katalog Produk
                </span>
                <span className="text-zinc-400 text-sm font-bold">{isMobileCatalogOpen ? '−' : '+'}</span>
              </button>

              {isMobileCatalogOpen && (
                <div className="grid grid-cols-2 gap-2 pt-2 pb-1 pl-1">
                  
                  {/* KAOS */}
                  <Link 
                    href="/products?category=Custom Kaos" 
                    onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} 
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition border border-zinc-100 flex items-center gap-2.5 group"
                  >
                    <svg className="w-4 h-4 text-zinc-900 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H5v10a2 2 0 002 2h10a2 2 0 002-2V10h1.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
                    </svg>
                    <span className="text-[11px] font-extrabold text-zinc-900 uppercase">Kaos</span>
                  </Link>

                  {/* OVERSIZED */}
                  <Link 
                    href="/products?category=Custom Oversized" 
                    onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} 
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition border border-zinc-100 flex items-center gap-2.5 group"
                  >
                    <svg className="w-4 h-4 text-zinc-900 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4l-4-1.5a5 5 0 00-10 0L3 4l-.8 4.2a1 1 0 00.8 1.2H5v10.6a1 1 0 001 1h12a1 1 0 001-1V9.4h2a1 1 0 00.8-1.2L21 4z" />
                    </svg>
                    <span className="text-[11px] font-extrabold text-zinc-900 uppercase">Oversized</span>
                  </Link>

                  {/* HOODIE */}
                  <Link 
                    href="/products?category=Custom Hoodie" 
                    onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} 
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition border border-zinc-100 flex items-center gap-2.5 group"
                  >
                    <svg className="w-4 h-4 text-zinc-900 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 00-4 4v1H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2V6a4 4 0 00-4-4z" />
                    </svg>
                    <span className="text-[11px] font-extrabold text-zinc-900 uppercase">Hoodie</span>
                  </Link>

                  {/* TOPI */}
                  <Link 
                    href="/products?category=Custom Topi" 
                    onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} 
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition border border-zinc-100 flex items-center gap-2.5 group"
                  >
                    <svg className="w-4 h-4 text-zinc-900 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 13H5a2 2 0 01-2-2v-1a6 6 0 0112 0v1h4a1 1 0 011 1v1a1 1 0 01-1 1z" />
                    </svg>
                    <span className="text-[11px] font-extrabold text-zinc-900 uppercase">Topi</span>
                  </Link>

                  {/* TAS */}
                  <Link 
                    href="/products?category=Custom Tas" 
                    onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} 
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition border border-zinc-100 flex items-center gap-2.5 group"
                  >
                    <svg className="w-4 h-4 text-zinc-900 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
                      <path d="M4 6v14a2 2 0 002 2h12a2 2 0 002-2V6" />
                    </svg>
                    <span className="text-[11px] font-extrabold text-zinc-900 uppercase">Tas</span>
                  </Link>

                  {/* MERCHANDISE */}
                  <Link 
                    href="/products?category=Custom Merchandise" 
                    onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} 
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition border border-zinc-100 flex items-center gap-2.5 group"
                  >
                    <svg className="w-4 h-4 text-zinc-900 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8l4 4-4 4M8 12h8" />
                    </svg>
                    <span className="text-[11px] font-extrabold text-zinc-900 uppercase">Merch</span>
                  </Link>

                </div>
              )}
            </div>

            {/* Menu Navigasi Sekunder dengan Ikon Hitam Elegan */}
            <div className="space-y-2 text-xs font-bold">
              <Link href="/products?category=Polosan" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 hover:text-black border-b border-zinc-100">
                <span className="flex items-center gap-2.5 uppercase tracking-wider">
                  <svg className="w-4 h-4 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                  Polosan Standar Distro
                </span>
                <span className="text-zinc-400">›</span>
              </Link>
              
              <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-red-600 font-black border-b border-zinc-100">
                <span className="flex items-center gap-2.5 uppercase tracking-wider">
                  <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Lacak Pesanan
                </span>
                <span className="text-red-400">›</span>
              </Link>

              <Link href="/location" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 hover:text-black border-b border-zinc-100">
                <span className="flex items-center gap-2.5 uppercase tracking-wider">
                  <svg className="w-4 h-4 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Lokasi Workshop Depok
                </span>
                <span className="text-zinc-400">›</span>
              </Link>

              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 hover:text-black">
                <span className="flex items-center gap-2.5 uppercase tracking-wider">
                  <svg className="w-4 h-4 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  Hubungi Kami
                </span>
                <span className="text-zinc-400">›</span>
              </Link>
            </div>

          </div>
        </div>
      )}

    </header>
  )
}