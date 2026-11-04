import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          ✓
        </div>
        
        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Pesanan Berhasil Dibuat
        </span>
        
        <h1 className="text-2xl font-black text-gray-900 mt-3">Terima Kasih!</h1>
        <p className="text-gray-500 text-sm mt-2">
          Pesanan sablon dan cetak DTF Anda telah tercatat di sistem KREASY.id. Tim workshop kami di Depok akan segera memproses pesanan Anda.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 my-6 text-left border border-gray-100">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Instruksi Pembayaran:</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Silakan lakukan transfer pembayaran melalui rekening BCA / GoPay atas nama KREASY.id, lalu konfirmasikan bukti transfer via WhatsApp admin kami.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}