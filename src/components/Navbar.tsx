'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

// Alamat halaman studio mockup. Ubah kalau alamat studio kamu berbeda.
const STUDIO_PATH = '/custom'

export default function Navbar() {
  const router = useRouter()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  // Keranjang (tersimpan di browser pembeli)
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

  // Status login admin (dari Supabase) dan teks website (dari database)
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
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      
      {/* Top Banner */}
      <div className="bg-black text-gray-300 text-[10px] md:text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium">
          <span className="truncate pr-2">{siteText.topBanner}</span>
          <div className="hidden sm:flex space-x-6 flex-shrink-0">
            <Link href="/track" className="hover:text-white transition font-bold text-yellow-400">🔍 Lacak Pesanan</Link>
            <Link href="/contact" className="hover:text-white transition">Hubungi Kami</Link>
            <Link href="/location" className="hover:text-white transition">Lokasi</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 relative">
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-xl font-black p-1 focus:outline-none cursor-pointer"
            title="Menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <Link href="/" className="text-xl md:text-2xl font-black tracking-wider text-black flex items-center gap-1">
            {siteText.brandName}<span className="text-[10px] md:text-xs font-bold text-gray-500">{siteText.brandSub}</span>
          </Link>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full bg-gray-100 text-sm text-black rounded-full py-2 pl-4 pr-10 border border-gray-300 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-500 cursor-pointer">🔍</button>
          </div>
        </form>

        <div className="flex items-center space-x-2 md:space-x-3 relative">

          <Link
            href={STUDIO_PATH}
            className="hidden sm:inline-block bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-2 rounded-full transition whitespace-nowrap uppercase tracking-wider"
          >
            🎨 Mulai Desain
          </Link>
          
          <div 
            className="relative"
            onMouseEnter={() => setIsCartOpen(true)}
            onMouseLeave={() => setIsCartOpen(false)}
          >
            <Link href="/checkout" className="bg-gray-100 hover:bg-gray-200 text-black px-3 md:px-4 py-2 rounded-full text-xs font-bold transition border border-gray-300 flex items-center gap-1.5">
              🛒 <span className="hidden sm:inline">Keranjang</span> <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px]">{cart.length}</span>
            </Link>

            {isCartOpen && (
              <div className="absolute right-0 top-full w-72 md:w-80 bg-white shadow-2xl rounded-3xl border border-gray-200 p-4 z-50 space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {cart.length === 0 ? (
                    <p className="text-xs text-center text-gray-500 py-4">Keranjang belanja kosong.</p>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={item.cartId ?? idx} className="flex items-center gap-3 border-b pb-3">
                        {item.image && (
                          <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-black truncate">{item.title}</h4>
                          <p className="text-[11px] text-gray-500">{item.quantity} x {item.price}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t pt-3 flex justify-between items-center text-xs font-black">
                  <span>Subtotal:</span>
                  <span className="text-red-600">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>

                <div className="space-y-2 pt-1">
                  <Link href="/checkout" className="block text-center bg-black hover:bg-gray-800 text-white text-xs font-black py-2.5 rounded-xl uppercase tracking-wider transition">
                    LIHAT KERANJANG
                  </Link>
                </div>
              </div>
            )}
          </div>

          {isAdminLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <Link href="/admin/orders" className="bg-black text-white text-[10px] md:text-xs font-black px-3 md:px-4 py-2 rounded-full hover:bg-gray-800 transition">
                ⚙️ Admin
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 font-bold px-2.5 py-2 rounded-full text-[10px] md:text-xs border border-red-200 cursor-pointer"
                title="Keluar / Logout"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link href="/admin/login" className="bg-black text-white text-xs font-bold px-3 md:px-4 py-2 rounded-full hover:bg-gray-800 transition whitespace-nowrap">
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
            className="w-full bg-gray-100 text-xs text-black rounded-full py-2 pl-4 pr-10 border border-gray-300 focus:outline-none"
          />
          <button type="submit" className="absolute right-3 top-2 text-gray-500 text-xs cursor-pointer">🔍</button>
        </form>
      </div>

      {/* Menu desktop: hanya yang penting */}
      <div className="border-t border-gray-200 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-8 text-sm font-bold text-black py-2.5 relative">
          
          <div 
            className="relative"
            onMouseEnter={() => setIsCustomDropdownOpen(true)}
            onMouseLeave={() => setIsCustomDropdownOpen(false)}
          >
            <Link href="/products" className="flex items-center gap-1 py-1 hover:text-gray-600 transition cursor-pointer">
              {siteText.navCustom} ▾
            </Link>

            {isCustomDropdownOpen && (
              <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-2xl border border-gray-200 py-2 z-50">
                <Link href="/products?category=Custom Kaos" className="block px-4 py-2 hover:bg-gray-100 text-black text-xs font-semibold">Kaos</Link>
                <Link href="/products?category=Custom Hoodie" className="block px-4 py-2 hover:bg-gray-100 text-black text-xs font-semibold">Hoodie</Link>
                <Link href="/products?category=Custom Topi" className="block px-4 py-2 hover:bg-gray-100 text-black text-xs font-semibold">Topi</Link>
                <Link href="/products?category=Custom Tas" className="block px-4 py-2 hover:bg-gray-100 text-black text-xs font-semibold">Tas</Link>
                <Link href="/products?category=Custom Merchandise" className="block px-4 py-2 hover:bg-gray-100 text-black text-xs font-semibold">Merchandise</Link>
              </div>
            )}
          </div>

          <Link href="/products?category=Polosan" className="hover:text-gray-600 transition">{siteText.navPolosan}</Link>
          <Link href="/location" className="hover:text-gray-600 transition">{siteText.navLocation}</Link>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-2 text-xs font-bold text-black">
            <Link href={STUDIO_PATH} onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-gray-100 text-red-600 font-black">🎨 Mulai Desain</Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-gray-100">👕 Katalog</Link>
            <Link href="/products?category=Polosan" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-gray-100">📦 Polosan</Link>
            <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-gray-100 text-yellow-600 font-black">🔍 Lacak Pesanan</Link>
            <Link href="/location" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-gray-100">📍 Lokasi</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="py-2">📞 Hubungi Kami</Link>
          </div>
        </div>
      )}

    </header>
  )
}