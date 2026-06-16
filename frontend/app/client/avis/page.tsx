'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MessageSquare, Package } from 'lucide-react'
import { mesAvisClient } from '@/lib/api'

interface Avis {
  id: number
  note: number
  commentaire: string | null
  createdAt: string
  produit: { id: number; titre: string; photos: string[] }
}

function Etoiles({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= note ? 'fill-or-clair text-or-clair' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

export default function PageMesAvis() {
  const [avis, setAvis] = useState<Avis[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    mesAvisClient().then(r => setAvis(r.data)).finally(() => setChargement(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">Mes avis</h1>

      {chargement ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : avis.length === 0 ? (
        <div className="bg-white rounded-2xl border border-creme-fonce p-12 text-center">
          <MessageSquare className="w-10 h-10 text-creme-fonce mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Vous n'avez pas encore laissé d'avis</p>
          <Link href="/produits" className="text-xs text-or hover:underline mt-1 inline-block">
            Parcourir les produits →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {avis.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-creme-fonce p-4 flex gap-4">
              <Link href={`/produits/${a.produit.id}`} className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-creme-fonce">
                {a.produit.photos?.[0] ? (
                  <Image src={a.produit.photos[0]} alt={a.produit.titre} width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package className="w-6 h-6 text-gray-200" /></div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/produits/${a.produit.id}`} className="font-semibold text-sm hover:text-or transition-colors line-clamp-1">
                  {a.produit.titre}
                </Link>
                <div className="flex items-center gap-2 my-1">
                  <Etoiles note={a.note} />
                  <span className="text-xs text-muted-foreground">{a.note}/5</span>
                </div>
                {a.commentaire && <p className="text-sm text-gray-600 line-clamp-2">{a.commentaire}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(a.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
