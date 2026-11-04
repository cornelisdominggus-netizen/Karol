'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    // Jika sudah login, langsung lempar ke dashboard admin, tidak boleh akses halaman login
    const isLoggedIn = localStorage.getItem('dscpl_is_admin')
    if (isLoggedIn === 'true') {
      router.replace('/admin/orders')
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi login admin (bisa disesuaikan, misal admin / dscpl2026)
    if (username === 'admin' && password === 'dscpl123') {
      localStorage.setItem('dscpl_is_admin', 'true')
      window.dispatchEvent(new Event('dscpl_auth_updated'))
      alert('Login Berhasil! Selamat datang di Panel Super Admin DSCPL WEAR.')
      router.replace('/admin/orders')
    } else {
      alert('Username atau Password salah! (Coba: admin / dscpl123)')
    }
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
            <label className="block font-bold mb-1 text-black">Username</label>
            <input
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            className="w-full bg-black hover:bg-gray-800 text-white font-black py-3.5 rounded-xl uppercase tracking-wider transition cursor-pointer text-xs shadow-md"
          >
            MASUK DASHBOARD
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