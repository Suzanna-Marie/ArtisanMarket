'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { getLitiges, resoudreLitige } from '@/lib/api'

interface Litige {
  id: number; commandeId: number; clientId: number; artisanId: number
  motif: string; description: string; statut: string
  reponseArtisan: string | null; resolution: string | null; createdAt: string
}

const STATUT: Record<string, { label: string; classe: string }> = {
  OUVERT:   { label: 'Ouvert',   classe: 'bg-red-100 text-red-700' },
  EN_COURS: { label: 'En cours', classe: 'bg-amber-100 text-amber-700' },
  RESOLU:   { label: 'Résolu',   classe: 'bg-green-100 text-green-700' },
  REJETE:   { label: 'Clôturé', classe: 'bg-gray-100 text-gray-600' },
}

export default function LitigesAdmin() {
  const [litiges, setLitiges] = useState<Litige[]>([])
  const [chargement, setChargement] = useState(true)
  const [resolutions, setResolutions] = useState<Record<number, string>>({})
  const [envoi, setEnvoi] = useState<number | null>(null)
  const [filtre, setFiltre] = useState('tous')

  const charger = () => getLitiges().then(r => setLitiges(r.data)).finally(() => setChargement(false))
  useEffect(() => { charger() }, [])

  const handleResoudre = async (id: number, statut: 'RESOLU' | 'REJETE') => {
    const resolution = resolutions[id]?.trim()
    if (!resolution) return
    setEnvoi(id)
    try {
      await resoudreLitige(id, resolution, statut)
      setResolutions(r => ({ ...r, [id]: '' }))
      charger()
    } catch (e) { console.error(e) }
    finally { setEnvoi(null) }
  }

  const litesFiltres = filtre === 'tous' ? litiges : litiges.filter(l => l.statut === filtre)

  const counts = {
    OUVERT: litiges.filter(l => l.statut === 'OUVERT').length,
    EN_COURS: litiges.filter(l => l.statut === 'EN_COURS').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des litiges</h1>
          <p className="text-sm text-slate-500 mt-1">
            {counts.OUVERT} ouvert{counts.OUVERT > 1 ? 's' : ''} · {counts.EN_COURS} en cours
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { val: 'tous', label: `Tous (${litiges.length})` },
          { val: 'OUVERT', label: `Ouverts (${counts.OUVERT})` },
          { val: 'EN_COURS', label: `En cours (${counts.EN_COURS})` },
          { val: 'RESOLU', label: 'Résolus' },
          { val: 'REJETE', label: 'Clôturés' },
        ].map(f => (
          <button key={f.val} onClick={() => setFiltre(f.val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtre === f.val ? 'bg-foret text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {chargement ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : litesFiltres.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Aucun litige</p>
        </div>
      ) : (
        <div className="space-y-4">
          {litesFiltres.map(l => {
            const s = STATUT[l.statut] || { label: l.statut, classe: 'bg-gray-100 text-gray-600' }
            const peutResoudre = ['OUVERT', 'EN_COURS'].includes(l.statut)

            return (
              <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Litige #{l.id} — Commande #{l.commandeId}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Client #{l.clientId} · Artisan #{l.artisanId} · {l.motif}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${s.classe}`}>
                    {s.label}
                  </span>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 mb-1">Réclamation du client</p>
                  <p className="text-sm text-slate-700">{l.description}</p>
                </div>

                {l.reponseArtisan && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Réponse de l'artisan</p>
                    <p className="text-sm text-slate-700">{l.reponseArtisan}</p>
                  </div>
                )}

                {l.resolution && (
                  <div className={`rounded-xl p-4 ${l.statut === 'RESOLU' ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className="text-xs font-semibold mb-1">Décision</p>
                    <p className="text-sm text-slate-700">{l.resolution}</p>
                  </div>
                )}

                {peutResoudre && (
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <textarea
                      value={resolutions[l.id] || ''}
                      onChange={e => setResolutions(r => ({ ...r, [l.id]: e.target.value }))}
                      rows={2} placeholder="Décision de l'administration (visible par client et artisan)..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-foret/30 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleResoudre(l.id, 'RESOLU')}
                        disabled={envoi === l.id || !resolutions[l.id]?.trim()}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60">
                        {envoi === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Résoudre
                      </button>
                      <button onClick={() => handleResoudre(l.id, 'REJETE')}
                        disabled={envoi === l.id || !resolutions[l.id]?.trim()}
                        className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-60">
                        {envoi === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Clôturer sans résolution
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-400">
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
