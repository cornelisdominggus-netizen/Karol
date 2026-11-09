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

      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3 relative">
        
        {/* Kiri: Tombol Hamburger (Hanya muncul di Mobile) & Logo Brushstroke */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 text-black hover:bg-zinc-200 transition focus:outline-none cursor-pointer"
            title="Menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <Link href="/" className="flex items-center py-1">
            <img 
              src="/logo-dscpl.png" 
              alt="DSCPL WEAR" 
              className="h-8 md:h-10 w-auto object-contain" 
            />
          </Link>
        </div>

        {/* Form Pencarian Desktop */}
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

        {/* Kanan (Desktop) */}
        <div className="flex items-center space-x-2 md:space-x-3 relative">

          <Link
            href={STUDIO_PATH}
            className="hidden sm:inline-block bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2.5 rounded-full transition whitespace-nowrap uppercase tracking-widest shadow-sm"
          >
            🎨 Mulai Desain
          </Link>
          
          {/* Keranjang Desktop */}
          <div 
            className="relative hidden md:block"
            onMouseEnter={() => setIsCartOpen(true)}
            onMouseLeave={() => setIsCartOpen(false)}
          >
            <Link href="/checkout" className="bg-zinc-50 hover:bg-zinc-100 text-black px-4 py-2 rounded-full text-xs font-bold transition border border-zinc-200 flex items-center gap-1.5 shadow-sm">
              🛒 Keranjang <span className="bg-black text-white px-1.5 py-0.5 rounded-full text-[10px]">{cart.length}</span>
            </Link>

            {isCartOpen && (
              <div className="absolute right-0 top-full w-80 bg-white shadow-2xl rounded-3xl border border-zinc-100 p-4 z-50 space-y-4">
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

          {/* Tombol Masuk / Admin Desktop */}
          {isAdminLoggedIn ? (
            <div className="hidden md:flex items-center gap-1.5">
              <Link href="/admin/orders" className="bg-black text-white text-xs font-black px-4 py-2 rounded-full hover:bg-zinc-800 transition">
                ⚙️ Admin
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 font-bold px-3 py-2 rounded-full text-xs border border-red-200 cursor-pointer"
                title="Keluar"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link href="/admin/login" className="hidden md:inline-block bg-black text-white text-xs font-bold px-4.5 py-2 rounded-full hover:bg-zinc-800 transition whitespace-nowrap shadow-sm">
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
            className="w-full bg-zinc-50 text-sm text-black rounded-full py-2.5 pl-4 pr-10 border border-zinc-200 focus:outline-none focus:border-black transition"
          />
          <button type="submit" className="absolute right-3.5 top-2.5 text-zinc-400 text-xs cursor-pointer">🔍</button>
        </form>
      </div>

      {/* Menu Desktop */}
      <div className="border-t border-zinc-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-8 text-xs font-black uppercase tracking-widest text-black py-3">
          
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
          <Link href="/track" className="text-red-600 hover:text-black transition">🔍 Lacak Pesanan</Link>

        </div>
      </div>

      {/* Menu Mobile (Hanya tampil di HP) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 px-6 py-6 space-y-5 shadow-2xl animate-fadeIn">
          <div className="flex flex-col space-y-3 text-xs font-bold text-black">
            
            {/* Tombol Keranjang di Menu Kiri */}
            <Link 
              href="/checkout" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="py-3 px-4 bg-zinc-100 text-black rounded-2xl font-black flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">🛒 Keranjang Belanja</span>
              <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px]">{cart.length}</span>
            </Link>

            {/* Katalog Dropdown */}
            <div className="border-b border-zinc-100 pb-2">
              <button
                onClick={() => setIsMobileCatalogOpen(!isMobileCatalogOpen)}
                className="w-full flex items-center justify-between py-2.5 text-zinc-900 font-black uppercase tracking-wider cursor-pointer"
              >
                <span>Katalog Produk</span>
                <span className="text-zinc-400 text-sm font-bold">{isMobileCatalogOpen ? '−' : '+'}</span>
              </button>

              {isMobileCatalogOpen && (
                <div className="grid grid-cols-2 gap-2 pt-2 pb-1 pl-1">
                  <Link href="/products?category=Custom Kaos" onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-[11px] font-extrabold uppercase">Kaos</Link>
                  <Link href="/products?category=Custom Oversized" onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-[11px] font-extrabold uppercase">Oversized</Link>
                  <Link href="/products?category=Custom Hoodie" onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-[11px] font-extrabold uppercase">Hoodie</Link>
                  <Link href="/products?category=Custom Topi" onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-[11px] font-extrabold uppercase">Topi</Link>
                </div>
              )}
            </div>

            {/* Menu Navigasi Lainnya termasuk Profil Elegan */}
            <div className="space-y-2 text-xs font-bold">
              <Link href="/products?category=Polosan" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 border-b border-zinc-100">
                <span className="uppercase tracking-wider">Polosan Standar Distro</span>
                <span className="text-zinc-400">›</span>
              </Link>
              
              <Link href="/location" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 border-b border-zinc-100">
                <span className="uppercase tracking-wider">Lokasi Workshop Depok</span>
                <span className="text-zinc-400">›</span>
              </Link>

              <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-red-600 font-black border-b border-zinc-100">
                <span className="uppercase tracking-wider">🔍 Lacak Pesanan</span>
                <span className="text-red-400">›</span>
              </Link>

              {/* Menu Profil Elegan Pengganti Tombol Besar */}
              {isAdminLoggedIn ? (
                <>
                  <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 border-b border-zinc-100">
                    <span className="flex items-center gap-2.5 uppercase tracking-wider">
                      <svg className="w-4 h-4 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Admin Panel
                    </span>
                    <span className="text-zinc-400">›</span>
                  </Link>

                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                    className="w-full flex items-center justify-between py-2.5 px-1 text-red-600 font-black cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 uppercase tracking-wider">
                      🚪 Keluar Akun
                    </span>
                    <span>›</span>
                  </button>
                </>
              ) : (
                <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800">
                  <span className="flex items-center gap-2.5 uppercase tracking-wider">
                    <svg className="w-4 h-4 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Masuk Akun / Admin
                  </span>
                  <span className="text-zinc-400">›</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  )
}