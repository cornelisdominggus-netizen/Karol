'use client'

import { useState } from 'react'

export default function ProductReviews() {
  const [reviews, setReviews] = useState([
    { id: 1, name: 'Reza Pratama', rating: 5, comment: 'Kualitas sablon DTF-nya tajam banget, bahan topinya kokoh. Mantap DSCPL WEAR!', date: '2 Nov 2026' },
    { id: 2, name: 'Dimas Anggara', rating: 5, comment: 'Pengiriman cepat area Depok, admin ramah dan hasil kaosnya pas di badan.', date: '3 Nov 2026' }
  ])

  const [newName, setNewName] = useState('')
  const [newComment, setNewComment] = useState('')

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newComment) return

    const review = {
      id: Date.now(),
      name: newName,
      rating: 5,
      comment: newComment,
      date: 'Baru saja'
    }

    setReviews([review, ...reviews])
    setNewName('')
    setNewComment('')
    alert('Terima kasih! Ulasan Anda berhasil ditambahkan.')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm mt-8">
      <h3 className="text-sm font-black uppercase tracking-wider text-black border-b pb-3">
        Ulasan Pelanggan ({reviews.length})
      </h3>

      {/* List Ulasan */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-black">{rev.name}</span>
              <span className="text-[10px] text-gray-400">{rev.date}</span>
            </div>
            <div className="text-yellow-500 text-xs">★★★★★</div>
            <p className="text-xs text-gray-700 font-medium">{rev.comment}</p>
          </div>
        ))}
      </div>

      {/* Form Tambah Ulasan */}
      <form onSubmit={handleAddReview} className="space-y-3 pt-4 border-t">
        <h4 className="text-xs font-bold uppercase text-black">Tulis Ulasan Anda</h4>
        <input
          type="text"
          placeholder="Nama Anda"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs font-semibold text-black focus:outline-none"
          required
        />
        <textarea
          rows={2}
          placeholder="Bagaimana pengalaman Anda dengan produk ini?"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs font-semibold text-black focus:outline-none"
          required
        ></textarea>
        <button
          type="submit"
          className="bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
        >
          Kirim Ulasan
        </button>
      </form>
    </div>
  )
}