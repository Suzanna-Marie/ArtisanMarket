'use client'
import { useState } from 'react'
import { X, ShieldCheck, Phone } from 'lucide-react'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className="bg-or text-white text-xs py-2 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 flex-wrap">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-white/80 shrink-0" />
          Paiement sécurisé · MTN MoMo · Moov · Celtiis
        </span>
        <span className="text-white/30 hidden sm:block">|</span>
        <span className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-white/80 shrink-0" />
          Support WhatsApp disponible
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
        aria-label="Fermer">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
