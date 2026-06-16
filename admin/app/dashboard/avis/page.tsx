'use client'
import { useEffect, useState } from 'react'
import { Star, Trash2, Search, AlertTriangle } from 'lucide-react'

interface Avis {
  id: number
  note: number
  commentaire: string | null
  createdAt: string
  client: { nom: string; prenom: string }
  produit: { titre: string }
}

function Etoiles({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= note ? 'fill-or-clair text-or-clair' : 'text-slate-200'}`} />
      ))}
    </div>
  )
}

export default function PageAvisAdmin() {
  const [avis, setAvis] = useState<Avis[]>([])
  const [filtre, setFiltre] = useState('')
  const [chargement, setChargement] = useState(true)
  const [supprimant, setSupprimant] = useState<number | null>(null)
  const [confirmer, setConfirmer] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/avis`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setAvis)
      .finally(() => setChargement(false))
  }, [])

  const supprimer = async (id: number) => {
    setSupprimant(id)
    const token = localStorage.getItem('admin_token')
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/avis/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setAvis(prev => prev.filter(a => a.id !== id))
    } finally {
      setSupprimant(null)
      setConfirmer(null)
    }
  }

  const avisFiltre = avis.filter(a =>
    filtre === '' ||
    a.produit.titre.toLowerCase().includes(filtre.toLowerCase()) ||
    `${a.client.prenom} ${a.client.nom}`.toLowerCase().includes(filtre.toLowerCase()) ||
    (a.commentaire ?? '').toLowerCase().includes(filtre.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Avis clients</h1>
          <p className="text-sm text-slate-500 mt-0.5">{avis.length} avis au total</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filtre}
            onChange={e => setFiltre(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-foret/30 w-56"
          />
        </div>
      </div>

      {chargement ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : avisFiltre.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Star className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">{filtre ? 'Aucun avis ne correspond à votre recherche.' : 'Aucun avis pour l\'instant.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Note</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commentaire</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {avisFiltre.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                    {a.client.prenom} {a.client.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{a.produit.titre}</td>
                  <td className="px-4 py-3"><Etoiles note={a.note} /></td>
                  <td className="px-4 py-3 text-slate-500 max-w-[260px]">
                    {a.commentaire
                      ? <span className="line-clamp-2">{a.commentaire}</span>
                      : <span className="italic text-slate-300">Sans commentaire</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                    {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmer === a.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Confirmer ?
                        </span>
                        <button
                          onClick={() => supprimer(a.id)}
                          disabled={supprimant === a.id}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                        >
                          {supprimant === a.id ? '...' : 'Oui, supprimer'}
                        </button>
                        <button
                          onClick={() => setConfirmer(null)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmer(a.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer cet avis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
