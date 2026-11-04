"use client"

export default function DownloadsPage() {
  const files = [
    { 
      id: "1", 
      title: "Template Mockup Kaos Hitam PSD", 
      desc: "File mockup high resolution siap edit untuk preview desain kaos.", 
      isMember: false,
      size: "14.2 MB"
    },
    { 
      id: "2", 
      title: "Profil Warna RIP Software DTF v2", 
      desc: "Pengaturan color profile agar hasil cetak lebih pekat dan akurat.", 
      isMember: true,
      size: "2.5 MB"
    },
    { 
      id: "3", 
      title: "Kumpulan Vector Pola Cutting Polyflex", 
      desc: "Format CDR & AI siap potong untuk keperluan sablon jersey.", 
      isMember: true,
      size: "8.1 MB"
    },
  ]

  const handleDownload = (title: string) => {
    alert(`Memulai unduhan untuk: "${title}"`)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Pusat Unduhan
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-2">Area Download Komunitas DTF</h1>
          <p className="text-gray-500 text-sm mt-1">
            Unduh template desain, profil warna, dan aset pendukung sablon digital secara gratis.
          </p>
        </header>

        <div className="space-y-4">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-200 transition"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{file.title}</h3>
                  {file.isMember && (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      Khusus Member
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 max-w-xl">{file.desc}</p>
                <span className="text-xs text-gray-400 mt-2 inline-block">Ukuran: {file.size}</span>
              </div>

              <button 
                onClick={() => handleDownload(file.title)} 
                className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap"
              >
                Unduh File &darr;
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}