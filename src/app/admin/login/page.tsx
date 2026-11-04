'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Jika sudah login, langsung arahkan ke dashboard admin
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/admin/orders')
      }
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    setLoading(false)

    if (error) {
      alert('Email atau password salah.')
      return
    }

    router.replace('/admin/orders')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            OTENTIKASI ADMIN
          </span>
          <h1 className="text-2xl font-black text-black">Login Super Admin</h1>
          <p className="text-xs text-gray-500">Masuk untuk mengelola pesanan, katalog, dan pengaturan website.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1 text-black">Email</label>
            <input
              type="email"
              placeholder="email@admin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 font-semibold text-black focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-black">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 font-semibold text-black focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 disabled:opacity-60 text-white font-black py-3.5 rounded-xl uppercase tracking-wider transition cursor-pointer text-xs shadow-md"
          >
            {loading ? 'MEMPROSES...' : 'MASUK DASHBOARD'}
          </button>
        </form>

        <div className="text-center pt-2 border-t">
          <Link href="/" className="text-xs font-bold text-gray-500 hover:text-black transition">
            ← Kembali ke Beranda Toko
          </Link>
        </div>

      </div>
    </main>
  )
}
