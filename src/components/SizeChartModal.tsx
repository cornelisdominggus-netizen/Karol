'use client'

export default function SizeChartModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl relative">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-sm font-black uppercase text-black">Panduan Ukuran (Size Chart) DSCPL WEAR</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black font-black text-base px-2">✕</button>
        </div>

        <div className="text-xs space-y-4 text-gray-700">
          <p>Standar ukuran lokal distro premium untuk Kaos & Hoodie:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-black font-bold">
                  <th className="p-2 border">Ukuran</th>
                  <th className="p-2 border">Panjang (cm)</th>
                  <th className="p-2 border">Lebar Dada (cm)</th>
                  <th className="p-2 border">Estimasi BB</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-bold">S</td>
                  <td className="p-2 border">66 cm</td>
                  <td className="p-2 border">48 cm</td>
                  <td className="p-2 border">45 - 55 kg</td>
                </tr>
                <tr>
                  <td className="p-2 border font-bold">M</td>
                  <td className="p-2 border">68 cm</td>
                  <td className="p-2 border">52 cm</td>
                  <td className="p-2 border">55 - 65 kg</td>
                </tr>
                <tr>
                  <td className="p-2 border font-bold">L</td>
                  <td className="p-2 border">71 cm</td>
                  <td className="p-2 border">56 cm</td>
                  <td className="p-2 border">65 - 75 kg</td>
                </tr>
                <tr>
                  <td className="p-2 border font-bold">XL</td>
                  <td className="p-2 border">74 cm</td>
                  <td className="p-2 border">60 cm</td>
                  <td className="p-2 border">75 - 85 kg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-500">* Toleransi ukuran sekitar 1-2 cm karena proses jahit.</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-black text-white text-xs font-black py-3 rounded-xl uppercase tracking-wider hover:bg-gray-800 transition"
        >
          Tutup Panduan
        </button>
      </div>
    </div>
  )
}