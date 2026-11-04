'use client'

import { useState, useEffect } from 'react'

export default function EventBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 12, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-gradient-to-r from-red-600 to-black text-white py-3 px-4 text-xs font-bold flex flex-col md:flex-row justify-between items-center gap-2 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="bg-white text-black px-2 py-0.5 rounded-md text-[10px] font-black uppercase">PROMO EVENT 99%</span>
        <span>Subsidi Ongkir & Diskon Spesial Custom Apparel di Depok!</span>
      </div>
      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-xl">
        <span className="text-gray-300">Berakhir dalam:</span>
        <span className="font-mono text-yellow-400 font-black">
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}