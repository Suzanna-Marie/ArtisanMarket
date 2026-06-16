'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, Send, Loader2 } from 'lucide-react'
import { litigesArtisan, repondreAuLitige } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

interface Litige {
  id: number; commandeId: number; motif: string; description: string
  statut: string; reponseArtisan: string | null; resolution: string | null; createdAt: string
}

const STATUT: Record<string, { label: string; classe: string }> = {
  OUVERT:   { label: 'Ouvert',   classe: 'bg-red-100 text-red-700' },
  EN_COURS: { label: 'En cours', classe: 'bg-amber-100 text-amber-700' },
  RESOLU:   { label: 'Résolu',   classe: 'bg-green-100 text-green-700' },
  REJETE:   { label: 'Clôturé', classe: 'bg-gray-100 text-gray-600' },
}

export default function LitigesArtisan() {
  const [litiges, setLitiges] = useState<Litige[]>([])
  const [chargement, setChargement] = useState(true)
  const [reponses, setReponses] = useState<Record<number, string>>({})
  const [envoi, setEnvoi] = useState<number | null>(null)

  const charger = () => litigesArtisan().then(r => setLitiges(r.data)).finally(() => setChargement(false))
  useEffect(() => { charger() }, [])

  const handleRepondre = async (id: number) => {
    const rep = reponses[id]?.trim()
    if (!rep) { toast('Entrez votre réponse.', 'error'); return }
    setEnvoi(id)
    try {
      await repondreAuLitige(id, rep)
      toast('Réponse envoyée au client.', 'success')
      setReponses(r => ({ ...r, [id]: '' }))
      charger()
    } catch { toast('Erreur lors de l\'envoi.', 'error') }
    finally { setEnvoi(null) }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">Litiges</h1>
      <p className="text-sm text-muted-foreground">Litiges ouverts par des clients sur vos commandes.</p>

      {chargement ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : litiges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-creme-fonce p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-creme-fonce mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucun litige en cours</p>
        </div>
      ) : litiges.map(l => {
        const s = STATUT[l.statut] || { label: l.statut, classe: 'bg-gray-100 text-gray-600' }
        const peutRepondre = l.statut === 'OUVERT' && !l.reponseArtisan

        return (
          <div key={l.id} className="bg-white rounded-2xl border border-creme-fonce p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">Litige #{l.id} — Commande #{l.commandeId}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{l.motif}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${s.classe}`}>{s.label}</span>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Réclamation du client</p>
              <p className="text-sm text-gray-700">{l.description}</p>
            </div>

            {l.reponseArtisan && (
              <div className="border-l-2 border-foret pl-3">
                <p className="text-xs font-semibold text-foret mb-0.5">Votre réponse</p>
                <p className="text-sm text-gray-600">{l.reponseArtisan}</p>
              </div>
            )}

            {l.resolution && (
              <div className={`rounded-xl p-3 ${l.statut === 'RESOLU' ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}>
                <p className="text-xs font-semibold mb-0.5">Décision de l'administration</p>
                <p className="text-sm text-gray-600">{l.resolution}</p>
              </div>
            )}

            {peutRepondre && (
              <div className="space-y-2">
                <textarea
                  value={reponses[l.id] || ''}
                  onChange={e => setReponses(r => ({ ...r, [l.id]: e.target.value }))}
                  rows={3} placeholder="Répondez à la réclamation du client..."
                  className="w-full px-4 py-2.5 rounded-xl border border-creme-fonce bg-creme text-sm focus:outline-none focus:ring-2 focus:ring-foret/30 resize-none"
                />
                <button onClick={() => handleRepondre(l.id)} disabled={envoi === l.id}
                  className="flex items-center gap-2 bg-foret text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-foret/90 transition-colors disabled:opacity-60">
                  {envoi === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Envoyer ma réponse
                </button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Ouvert le {new Date(l.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )
      })}
    </div>
  )
}
