'use client'

import Link from 'next/link'

export default function LocationPage() {
  const locations = [
    {
      city: 'KOTA DEPOK',
      badge: 'WORKSHOP UTAMA',
      address: 'Jl. H Husin no.18b Kalimulya Kecamatan Cilodong, Kota Depok 16413',
      hours: 'Mon - Sat (10.00 - 21.00 WIB)',
      phone: '+62895345414336',
      email: 'dscpl.wears@gmail.com',
      mapUrl: 'https://maps.app.goo.gl/JQjd5WPrVQhn6zhK6?g_st=ic',
    },
    {
      city: 'KOTA AMBON',
      badge: 'WORKSHOP CABANG',
      address: 'Jl. Waitatiri no.36A Desa Suli Kecamatan Salahutu, Maluku Tengah, Provinsi Maluku, Suli, Kec. Salahutu, Ambon, Maluku 97582',
      hours: 'Mon - Sat (10.00 - 21.00 WIT)',
      phone: '+62895345414336',
      email: 'dscpl.wears@gmail.com',
      mapUrl: 'https://maps.app.goo.gl/KkoXNmtHSK29QKJTA?g_st=ic',
    },
  ]

  return (
    <main className="min-h-screen bg-white text-black py-12 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER JUDUL HALAMAN */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            WORKSHOP RESMI DSCPL WEAR
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
            Lokasi & Titik Operasional
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Kunjungi workshop kami untuk konsultasi langsung, pickup pesanan, atau melihat sampel bahan kaos dan sablon DTF berkualitas tinggi.
          </p>
        </div>

        {/* 2 KARTU LOKASI (DEPOK & AMBON) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {locations.map((loc, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-zinc-200/80 hover:border-black rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-zinc-100 text-zinc-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-black group-hover:text-white transition">
                    {loc.badge}
                  </span>
                  <span className="text-xs font-bold text-zinc-400">Lokasi 0{idx + 1}</span>
                </div>

                <h3 className="text-xl font-black text-zinc-950 uppercase tracking-tight">
                  {loc.city}
                </h3>

                <div className="space-y-3 text-xs text-zinc-600 font-medium">
                  <p className="leading-relaxed flex items-start gap-2">
                    <span className="text-black font-bold">📍 Alamat:</span> 
                    <span>{loc.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-black font-bold">⏰ Jam:</span> 
                    <span>{loc.hours}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-black font-bold">📞 Telp:</span> 
                    <span>{loc.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-black font-bold">✉️ Email:</span> 
                    <span>{loc.email}</span>
                  </p>
                </div>
              </div>

              {/* TOMBOL AKSI MAPS & WHATSAPP */}
              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                <a
                  href={loc.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-black hover:bg-zinc-800 text-white font-black py-3 px-4 rounded-2xl text-xs uppercase tracking-wider text-center transition shadow"
                >
                  Buka Google Maps ➔
                </a>
                <a
                  href={`https://wa.me/${loc.phone.replace('+', '')}?text=Halo%20DSCPL%20Wear,%20saya%20ingin%20mengunjungi%20workshop%20${encodeURIComponent(loc.city)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-zinc-100 hover:bg-zinc-200 text-black font-bold py-3 px-4 rounded-2xl text-xs uppercase tracking-wider text-center transition"
                >
                  Chat WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}