"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"

export default function CalculatorPage() {
  const [filmCost, setFilmCost] = useState<number>(25000)
  const [inkPowderCost, setInkPowderCost] = useState<number>(15000)
  const [electricityLabor, setElectricityLabor] = useState<number>(5000)
  const [desiredMargin, setDesiredMargin] = useState<number>(40)

  const totalHpp = filmCost + inkPowderCost + electricityLabor
  const profitAmount = (totalHpp * desiredMargin) / 100
  const recommendedPrice = totalHpp + profitAmount

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number)
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Kalkulator HPP & Saran Harga Jual DTF</h1>
          <p className="text-gray-500 text-sm mb-6">
            Hitung estimasi Harga Pokok Produksi (HPP) sablon digital DTF per meter secara akurat dan tentukan margin keuntungan Anda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Modal Cetak PET Film (per meter)
                </label>
                <input
                  type="number"
                  value={filmCost}
                  onChange={(e) => setFilmCost(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Biaya Tinta & Hot Melt Powder (per meter)
                </label>
                <input
                  type="number"
                  value={inkPowderCost}
                  onChange={(e) => setInkPowderCost(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Biaya Listrik, Press & Penyusutan Alat
                </label>
                <input
                  type="number"
                  value={electricityLabor}
                  onChange={(e) => setElectricityLabor(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Target Margin Keuntungan (%)
                </label>
                <input
                  type="number"
                  value={desiredMargin}
                  onChange={(e) => setDesiredMargin(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-md">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-4">
                  Hasil Analisis Kalkulator
                </h3>

                <div className="space-y-4">
                  <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                    <span className="text-sm text-gray-300">Total HPP (Modal Dasar):</span>
                    <span className="text-lg font-bold">{formatRupiah(totalHpp)}</span>
                  </div>

                  <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                    <span className="text-sm text-gray-300">Estimasi Keuntungan ({desiredMargin}%):</span>
                    <span className="text-lg font-semibold text-green-400">+{formatRupiah(profitAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white/10 rounded-lg p-4">
                <span className="text-xs text-gray-300 block mb-1">Saran Harga Jual ke Pelanggan:</span>
                <span className="text-3xl font-black text-yellow-400">{formatRupiah(recommendedPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}