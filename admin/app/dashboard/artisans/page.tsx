'use client'
import { useEffect, useState } from 'react'
import { Search, CheckCircle, XCircle, Ban, RefreshCw, Trash2 } from 'lucide-react'
import { getArtisans, validerArtisan, rejeterArtisan, suspendreArtisan, supprimerArtisan } from '@/lib/api'

interface Artisan {
  id: number
  nomBoutique: string
  specialite: string
  localite: string
  statut: string
  createdAt: string
  user: { nom: string; prenom: string; email: string }
  _count: { produits: number }
}

const STATUT: Record<string, { label: string; classe: string }> = {
  EN_ATTENTE: { label: 'En attente', classe: 'bg-amber-100 text-amber-700' },
  VALIDE:     { label: 'Validé',     classe: 'bg-green-100 text-green-700' },
  REJETE:     { label: 'Rejeté',     classe: 'bg-red-100 text-red-600' },
  SUSPENDU:   { label: 'Suspendu',   classe: 'bg-slate-100 text-slate-500' },
}

export default function PageArtisans() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('')

  const charger = () => {
    setChargement(true)
    getArtisans({ recherche: recherche || undefined, statut: filtre || undefined })
      .then(r => setArtisans(r.data))
      .finally(() => setChargement(false))
  }

  useEffect(() => { charger() }, [recherche, filtre])

  const action = async (fn: () => Promise<unknown>) => { await fn(); charger() }

  const counts = Object.fromEntries(
    Object.keys(STATUT).map(s => [s, artisans.filter(a => a.statut === s).length])
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des artisans</h1>
          <div className="flex gap-2 mt-2">
            {Object.entries(STATUT).map(([k, v]) => counts[k] > 0 && (
              <span key={k} className={`badge ${v.classe}`}>{counts[k]} {v.label.toLowerCase()}{counts[k] > 1 ? 's' : ''}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Boutique, spécialité, localité..." value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-foret/30" />
        </div>
        <select value={filtre} onChange={e => setFiltre(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Boutique</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Spécialité</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Localité</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Produits</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {chargement ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : artisans.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">Aucun artisan trouvé</td>
              </tr>
            ) : artisans.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">{a.nomBoutique}</p>
                  <p className="text-xs text-slate-400">{a.user.prenom} {a.user.nom} · {a.user.email}</p>
                </td>
                <td className="px-5 py-4 text-slate-600 hidden md:table-cell">{a.specialite}</td>
                <td className="px-5 py-4 text-slate-600 hidden lg:table-cell">{a.localite}</td>
                <td className="px-5 py-4">
                  <span className={`badge ${STATUT[a.statut]?.classe || 'bg-slate-100 text-slate-500'}`}>
                    {STATUT[a.statut]?.label || a.statut}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600 hidden sm:table-cell">{a._count.produits}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5 justify-end flex-wrap">
                    {a.statut === 'EN_ATTENTE' && (
                      <>
                        <button onClick={() => action(() => validerArtisan(a.id))} title="Valider"
                          className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => { const m = prompt('Motif :') || ''; action(() => rejeterArtisan(a.id, m)) }} title="Rejeter"
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {a.statut === 'VALIDE' && (
                      <>
                        <button onClick={() => action(() => suspendreArtisan(a.id))} title="Suspendre"
                          className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                          <Ban className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {a.statut === 'SUSPENDU' && (
                      <button onClick={() => action(() => validerArtisan(a.id))} title="Réactiver"
                        className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm(`Supprimer "${a.nomBoutique}" définitivement ?`)) action(() => supprimerArtisan(a.id)) }}
                      title="Supprimer"
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
