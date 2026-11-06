'use client'

import Navbar from "@/components/Navbar"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([])

  useEffect(() => {
    const loadCart = () => {
      const saved = localStorage.getItem('dscpl_cart')
      if (saved) {
        try {
          setCartItems(JSON.parse(saved))
        } catch (e) {
          setCartItems([])
        }
      }
    }
    loadCart()
    window.addEventListener('dscpl_cart_updated', loadCart)
    return () => window.removeEventListener('dscpl_cart_updated', loadCart)
  }, [])

  const updateQuantity = (cartId: number, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    setCartItems(updated)
    localStorage.setItem('dscpl_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('dscpl_cart_updated'))
  }

  const removeItem = (cartId: number) => {
    const updated = cartItems.filter(item => item.cartId !== cartId)
    setCartItems(updated)
    localStorage.setItem('dscpl_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('dscpl_cart_updated'))
  }

  const subtotal = cartItems.reduce((acc, item) => {
    const priceNum = parseInt(String(item.price).replace(/[^0-9]/g, '')) || 0
    return acc + priceNum * (item.quantity || 1)
  }, 0)

  const formatRupiah = (num: number) => `Rp${num.toLocaleString("id-ID")}`

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Keranjang Belanja Anda</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-4 font-medium">Keranjang belanja Anda masih kosong.</p>
            <Link href="/products" className="bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const itemPriceNum = parseInt(String(item.price).replace(/[^0-9]/g, '')) || 0
                return (
                  <div key={item.cartId || item.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 shadow-sm">
                    {item.image && (
                      <img src={item.image} alt={item.title || item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0 border" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{item.title || item.name}</h3>
                      {item.size && <p className="text-xs text-gray-500 font-semibold mt-0.5">Ukuran: {item.size}</p>}
                      {item.designFile && <p className="text-[10px] text-gray-400 truncate mt-0.5">📁 {item.designFile}</p>}
                      <p className="text-sm font-extrabold text-red-600 mt-1">{formatRupiah(itemPriceNum)}</p>
                    </div>

                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <button onClick={() => updateQuantity(item.cartId || item.id, -1)} className="px-2.5 py-1 font-bold hover:bg-gray-200 transition">-</button>
                      <span className="px-3 py-1 text-sm font-black text-black">{item.quantity || 1}</span>
                      <button onClick={() => updateQuantity(item.cartId || item.id, 1)} className="px-2.5 py-1 font-bold hover:bg-gray-200 transition">+</button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.cartId || item.id)} 
                      className="text-red-500 hover:text-red-700 font-bold p-2 text-xs rounded-lg hover:bg-red-50 transition"
                      title="Hapus item"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 h-fit shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 pb-2 border-b border-gray-100">Ringkasan Belanja</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold text-black">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pengiriman</span>
                <span className="font-bold text-black">Rp15.000</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t font-black">
                <span className="text-gray-900">Total</span>
                <span className="text-red-600">{formatRupiah(subtotal + 15000)}</span>
              </div>
              <Link href="/checkout" className="block w-full text-center bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider">
                Lanjut ke Checkout ➔
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}