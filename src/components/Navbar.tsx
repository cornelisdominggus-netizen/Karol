'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Navbar() {
  const router = useRouter()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false)
  const [isMobilePolosanOpen, setIsMobilePolosanOpen] = useState(false)
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false)
  const [isPolosanDropdownOpen, setIsPolosanDropdownOpen] = useState(false)
  
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(['Christmas Series', 'Tas', 'Merchandise'])
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

    const loadSettingsAndCategories = async () => {
      const [settingsRes, productsRes] = await Promise.all([
        supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
        supabase.from('products').select('category')
      ])

      const settingsResult = settingsRes as { data: { data: any } | null }
      if (settingsResult?.data?.data) {
        setSiteText(prev => ({ ...prev, ...(settingsResult.data.data as any) }))
      }

      if (productsRes?.data) {
        const excluded = ['kaos', 'oversized', 'hoodie', 'topi', 'custom kaos', 'custom oversized', 'custom hoodie', 'custom topi', 'polosan']
        const dbCats = productsRes.data
          .map((p: any) => p.category)
          .filter((cat: string) => cat && !excluded.includes(cat.toLowerCase()))
        
        const combined = Array.from(new Set(['Christmas Series', 'Tas', 'Merchandise', ...dbCats]))
        setDynamicCategories(combined)
      }
    }
    loadSettingsAndCategories()

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

      {/* HEADER UTAMA SATU BARIS (DESKTOP) */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Kiri: Logo & Pencarian */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 text-black hover:bg-zinc-200 transition focus:outline-none cursor-pointer"
            title="Menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <Link href="/" className="flex items-center py-1 flex-shrink-0">
            <img 
              src="/logo-dscpl.png" 
              alt="DSCPL WEAR" 
              className="h-8 md:h-9 w-auto object-contain max-w-[120px]" 
            />
          </Link>

          <form onSubmit={handleSearchSubmit} className="w-48 lg:w-60 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full bg-zinc-50 text-xs text-black rounded-full py-2 pl-3.5 pr-8 border border-zinc-200 focus:outline-none focus:border-black transition"
              />
              <button type="submit" className="absolute right-2.5 top-2 text-zinc-400 text-xs cursor-pointer">🔍</button>
            </div>
          </form>
        </div>

        {/* Kanan: Navigasi & Keranjang */}
        <div className="hidden lg:flex flex-col items-end space-y-1 flex-shrink-0">
          
          <nav className="flex items-center space-x-5 text-[9px] font-black uppercase tracking-wider text-zinc-600">
            
            {/* KATALOG DROPDOWN */}
            <div 
              className="relative py-0.5"
              onMouseEnter={() => setIsCatalogDropdownOpen(true)}
              onMouseLeave={() => setIsCatalogDropdownOpen(false)}
            >
              <Link href="/products" className="flex items-center gap-0.5 hover:text-red-600 transition cursor-pointer">
                Katalog ▾
              </Link>

              {isCatalogDropdownOpen && (
                <div className="absolute top-full right-0 w-48 bg-white shadow-2xl rounded-2xl border border-zinc-100 py-2 z-50 space-y-1">
                  {dynamicCategories.map((cat, idx) => (
                    <Link 
                      key={idx} 
                      href={`/products?category=${encodeURIComponent(cat)}`} 
                      className="block px-4 py-1.5 hover:bg-zinc-50 text-black text-[9px] font-bold uppercase truncate"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* POLOSAN DROPDOWN */}
            <div 
              className="relative py-0.5"
              onMouseEnter={() => setIsPolosanDropdownOpen(true)}
              onMouseLeave={() => setIsPolosanDropdownOpen(false)}
            >
              <Link href="/products?category=Polosan" className="flex items-center gap-0.5 hover:text-red-600 transition cursor-pointer">
                Polosan ▾
              </Link>

              {isPolosanDropdownOpen && (
                <div className="absolute top-full right-0 w-44 bg-white shadow-2xl rounded-2xl border border-zinc-100 py-2 z-50 space-y-1">
                  <Link href="/products?category=Custom Kaos" className="block px-4 py-1.5 hover:bg-zinc-50 text-black text-[9px] font-bold uppercase">Kaos</Link>
                  <Link href="/products?category=Custom Oversized" className="block px-4 py-1.5 hover:bg-zinc-50 text-black text-[9px] font-bold uppercase">Oversized</Link>
                  <Link href="/products?category=Custom Hoodie" className="block px-4 py-1.5 hover:bg-zinc-50 text-black text-[9px] font-bold uppercase">Hoodie</Link>
                  <Link href="/products?category=Custom Topi" className="block px-4 py-1.5 hover:bg-zinc-50 text-black text-[9px] font-bold uppercase">Topi</Link>
                </div>
              )}
            </div>

            <Link href="/location" className="hover:text-red-600 transition">{siteText.navLocation}</Link>
            <Link href="/track" className="hover:text-black transition">🔍 Lacak</Link>
            <Link href="/chat" className="text-red-600 hover:text-black transition">💬 Hubungi Admin</Link>
          </nav>

          <div className="flex items-center space-x-2 relative">
            <div 
              className="relative hidden md:block"
              onMouseEnter={() => setIsCartOpen(true)}
              onMouseLeave={() => setIsCartOpen(false)}
            >
              <Link href="/checkout" className="bg-zinc-50 hover:bg-zinc-100 text-black px-3 py-1.5 rounded-full text-xs font-bold transition border border-zinc-200 flex items-center gap-1.5 shadow-sm">
                🛒 <span className="bg-black text-white px-1.5 py-0.5 rounded-full text-[10px]">{cart.length}</span>
              </Link>

              {isCartOpen && (
                <div className="absolute right-0 top-full w-80 bg-white shadow-2xl rounded-3xl border border-zinc-100 p-4 z-50 space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                    {cart.length === 0 ? (
                      <p className="text-xs text-center text-zinc-400 py-4 font-medium">Keranjang belanja kosong.</p>
                    ) : (
                      cart.map((item, idx) => (
                        <div key={item.cartId ?? idx} className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                          {item.frontDesignImage ? (
                            <img src={item.frontDesignImage} alt="" className="w-10 h-10 object-contain rounded-xl bg-zinc-50 border flex-shrink-0 p-0.5" />
                          ) : (
                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex-shrink-0" />
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
              <div className="hidden md:flex items-center gap-1.5">
                <Link href="/admin/orders" className="bg-black text-white text-xs font-black px-3 py-1.5 rounded-full hover:bg-zinc-800 transition">
                  ⚙️ Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 font-bold px-2.5 py-1.5 rounded-full text-xs border border-red-200 cursor-pointer"
                  title="Keluar"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link href="/admin/login" className="hidden md:inline-block bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-full hover:bg-zinc-800 transition whitespace-nowrap shadow-sm">
                MASUK
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Search */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk..."
            className="w-full bg-zinc-50 text-xs text-black rounded-full py-2 pl-3.5 pr-8 border border-zinc-200 focus:outline-none focus:border-black transition"
          />
          <button type="submit" className="absolute right-2.5 top-2 text-zinc-400 text-xs cursor-pointer">🔍</button>
        </form>
      </div>

      {/* MOBILE MENU: TRUE LIQUID GLASS / FROSTED GLASS */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[57px] bottom-0 z-50 md:hidden bg-white/50 backdrop-blur-2xl text-black px-5 py-6 space-y-3 overflow-y-auto border-t border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-fadeIn">
          <div className="max-w-md mx-auto flex flex-col space-y-2 text-[11px] font-bold text-zinc-900">
            
            <Link 
              href="/checkout" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="py-3 px-4 bg-white/70 hover:bg-white/90 backdrop-blur-md border border-white/80 text-black rounded-2xl font-black flex items-center justify-between transition shadow-sm mb-1"
            >
              <span className="flex items-center gap-2">🛒 Keranjang Belanja</span>
              <span className="bg-black text-white px-2 py-0.5 rounded-full text-[9px]">{cart.length}</span>
            </Link>

            {/* KATALOG PRODUK MOBILE */}
            <div className="border-b border-zinc-200/50 pb-2">
              <button
                onClick={() => setIsMobileCatalogOpen(!isMobileCatalogOpen)}
                className="w-full flex items-center justify-between py-2 px-1 text-black font-black uppercase tracking-wider cursor-pointer"
              >
                <span>Katalog Produk</span>
                <span className="text-zinc-500 text-xs font-bold">{isMobileCatalogOpen ? '−' : '+'}</span>
              </button>

              {isMobileCatalogOpen && (
                <div className="flex flex-col space-y-0.5 pl-3 py-1.5 bg-white/40 backdrop-blur-md rounded-2xl my-1 border border-white/60 shadow-sm">
                  {dynamicCategories.map((cat, idx) => (
                    <Link 
                      key={idx}
                      href={`/products?category=${encodeURIComponent(cat)}`} 
                      onClick={() => { setIsMobileMenuOpen(false); setIsMobileCatalogOpen(false); }} 
                      className="py-2 px-2 text-zinc-700 hover:text-black text-[10px] font-bold uppercase flex items-center justify-between border-b border-zinc-200/30 last:border-0 transition"
                    >
                      <span>{cat}</span>
                      <span className="text-zinc-400">›</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* POLOSAN CUSTOM 3D MOBILE */}
            <div className="border-b border-zinc-200/50 pb-2">
              <button
                onClick={() => setIsMobilePolosanOpen(!isMobilePolosanOpen)}
                className="w-full flex items-center justify-between py-2 px-1 text-black font-black uppercase tracking-wider cursor-pointer"
              >
                <span>Polosan Custom 3D</span>
                <span className="text-zinc-500 text-xs font-bold">{isMobilePolosanOpen ? '−' : '+'}</span>
              </button>

              {isMobilePolosanOpen && (
                <div className="flex flex-col space-y-0.5 pl-3 py-1.5 bg-white/40 backdrop-blur-md rounded-2xl my-1 border border-white/60 shadow-sm">
                  <Link href="/products?category=Custom Kaos" onClick={() => { setIsMobileMenuOpen(false); setIsMobilePolosanOpen(false); }} className="py-2 px-2 text-zinc-700 hover:text-black text-[10px] font-bold uppercase flex items-center justify-between border-b border-zinc-200/30">
                    <span>Kaos</span><span className="text-zinc-400">›</span>
                  </Link>
                  <Link href="/products?category=Custom Oversized" onClick={() => { setIsMobileMenuOpen(false); setIsMobilePolosanOpen(false); }} className="py-2 px-2 text-zinc-700 hover:text-black text-[10px] font-bold uppercase flex items-center justify-between border-b border-zinc-200/30">
                    <span>Oversized</span><span className="text-zinc-400">›</span>
                  </Link>
                  <Link href="/products?category=Custom Hoodie" onClick={() => { setIsMobileMenuOpen(false); setIsMobilePolosanOpen(false); }} className="py-2 px-2 text-zinc-700 hover:text-black text-[10px] font-bold uppercase flex items-center justify-between border-b border-zinc-200/30">
                    <span>Hoodie</span><span className="text-zinc-400">›</span>
                  </Link>
                  <Link href="/products?category=Custom Topi" onClick={() => { setIsMobileMenuOpen(false); setIsMobilePolosanOpen(false); }} className="py-2 px-2 text-zinc-700 hover:text-black text-[10px] font-bold uppercase flex items-center justify-between">
                    <span>Topi</span><span className="text-zinc-400">›</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-1 text-[11px] font-semibold">
              <Link href="/location" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 hover:text-black border-b border-zinc-200/50 transition">
                <span className="uppercase tracking-wider font-bold">Lokasi Workshop</span>
                <span className="text-zinc-400">›</span>
              </Link>

              <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 hover:text-black border-b border-zinc-200/50 transition">
                <span className="uppercase tracking-wider font-bold">🔍 Lacak Pesanan</span>
                <span className="text-zinc-400">›</span>
              </Link>

              <Link href="/chat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-red-600 font-black border-b border-zinc-200/50 transition">
                <span className="uppercase tracking-wider">💬 Hubungi Admin</span>
                <span className="text-red-400">›</span>
              </Link>

              {isAdminLoggedIn ? (
                <>
                  <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 hover:text-black border-b border-zinc-200/50 transition">
                    <span className="flex items-center gap-2 uppercase tracking-wider font-bold">Admin Panel</span>
                    <span className="text-zinc-400">›</span>
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                    className="w-full flex items-center justify-between py-2.5 px-1 text-red-600 font-black cursor-pointer"
                  >
                    <span className="flex items-center gap-2 uppercase tracking-wider">🚪 Keluar Akun</span>
                    <span>›</span>
                  </button>
                </>
              ) : (
                <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-1 text-zinc-800 hover:text-black transition">
                  <span className="flex items-center gap-2 uppercase tracking-wider font-bold">Masuk Akun / Admin</span>
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