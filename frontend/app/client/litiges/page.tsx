'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { mesLitiges } from '@/lib/api'

interface Litige {
  id: number
  commandeId: number
  motif: string
  description: string
  statut: string
  reponseArtisan: string | null
  resolution: string | null
  createdAt: string
}

const STATUT: Record<string, { label: string; classe: string }> = {
  OUVERT:   { label: 'Ouvert',     classe: 'bg-red-100 text-red-700' },
  EN_COURS: { label: 'En cours',   classe: 'bg-amber-100 text-amber-700' },
  RESOLU:   { label: 'Résolu',     classe: 'bg-green-100 text-green-700' },
  REJETE:   { label: 'Clôturé',    classe: 'bg-gray-100 text-gray-600' },
}

export default function MesLitiges() {
  const [litiges, setLitiges] = useState<Litige[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    mesLitiges().then(r => setLitiges(r.data)).finally(() => setChargement(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">Mes litiges</h1>

      {chargement ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : litiges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-creme-fonce p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-creme-fonce mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Aucun litige ouvert</p>
          <Link href="/client/commandes" className="text-xs text-or hover:underline mt-1 inline-block">
            Voir mes commandes →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {litiges.map(l => {
            const s = STATUT[l.statut] || { label: l.statut, classe: 'bg-gray-100 text-gray-600' }
            return (
              <div key={l.id} className="bg-white rounded-2xl border border-creme-fonce p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">Litige #{l.id} — Commande #{l.commandeId}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.motif}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${s.classe}`}>{s.label}</span>
                </div>

                <p className="text-sm text-gray-600 bg-creme rounded-xl p-3">{l.description}</p>

                {l.reponseArtisan && (
                  <div className="border-l-2 border-foret pl-3">
                    <p className="text-xs font-semibold text-foret mb-0.5">Réponse de l'artisan</p>
                    <p className="text-sm text-gray-600">{l.reponseArtisan}</p>
                  </div>
                )}

                {l.resolution && (
                  <div className={`rounded-xl p-3 ${l.statut === 'RESOLU' ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}>
                    <p className="text-xs font-semibold mb-0.5">{l.statut === 'RESOLU' ? 'Résolution' : 'Décision de l\'équipe'}</p>
                    <p className="text-sm text-gray-600">{l.resolution}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Ouvert le {new Date(l.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
