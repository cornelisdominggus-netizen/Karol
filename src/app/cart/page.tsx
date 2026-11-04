"use client"

import Navbar from "@/components/Navbar"
import Link from "next/link"
import { useState } from "react"

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      name: "DTF Meteran Siap Cetak (Custom Design)",
      price: 45000,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600",
    },
  ])

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const formatRupiah = (num: number) => `Rp${num.toLocaleString("id-ID")}`

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Keranjang Belanja Anda</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-500 mb-4">Keranjang belanja Anda masih kosong.</p>
            <Link href="/products" className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-sm font-extrabold text-black mt-1">{formatRupiah(item.price)}</p>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, -1)} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                    <span className="px-3 py-1 text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 h-fit">
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Ringkasan Belanja</h3>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold text-black">{formatRupiah(subtotal)}</span>
              </div>
              <Link href="/checkout" className="block w-full text-center bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition">
                Lanjut ke Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}