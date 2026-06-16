'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, Eye, EyeOff, Trash2 } from 'lucide-react'
import { getProduits, changerStatutProduit, supprimerProduit } from '@/lib/api'

interface Produit {
  id: number
  titre: string
  prix: number
  statut: string
  photos: string[]
  createdAt: string
  categorie: { nom: string }
  artisan: { nomBoutique: string }
}

const STATUT: Record<string, { label: string; classe: string }> = {
  PUBLIE:    { label: 'Publié',    classe: 'bg-green-100 text-green-700' },
  BROUILLON: { label: 'Brouillon', classe: 'bg-slate-100 text-slate-500' },
  RETIRE:    { label: 'Retiré',   classe: 'bg-red-100 text-red-600' },
}

export default function PageProduits() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('')

  const charger = () => {
    setChargement(true)
    getProduits({ recherche: recherche || undefined, statut: filtre || undefined })
      .then(r => setProduits(r.data.produits || r.data))
      .finally(() => setChargement(false))
  }

  useEffect(() => { charger() }, [recherche, filtre])

  const handleStatut = async (id: number, statut: string) => {
    await changerStatutProduit(id, statut)
    charger()
  }

  const handleSupprimer = async (id: number, titre: string) => {
    if (!confirm(`Supprimer définitivement "${titre}" ?`)) return
    await supprimerProduit(id)
    charger()
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Modération des produits</h1>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Rechercher un produit..." value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-foret/30" />
        </div>
        <select value={filtre} onChange={e => setFiltre(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Produit</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Boutique</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Catégorie</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prix</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
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
            ) : produits.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">Aucun produit trouvé</td>
              </tr>
            ) : produits.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {p.photos?.[0] ? (
                        <Image src={p.photos[0]} alt={p.titre} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🧵</div>
                      )}
                    </div>
                    <p className="font-medium text-slate-800 line-clamp-1">{p.titre}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600 hidden md:table-cell">{p.artisan?.nomBoutique}</td>
                <td className="px-5 py-3 text-slate-600 hidden lg:table-cell">{p.categorie?.nom}</td>
                <td className="px-5 py-3 font-medium text-or">{Number(p.prix).toLocaleString('fr-FR')} F</td>
                <td className="px-5 py-3">
                  <span className={`badge ${STATUT[p.statut]?.classe || 'bg-slate-100 text-slate-500'}`}>
                    {STATUT[p.statut]?.label || p.statut}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1.5 justify-end">
                    <button
                      onClick={() => handleStatut(p.id, p.statut === 'PUBLIE' ? 'RETIRE' : 'PUBLIE')}
                      title={p.statut === 'PUBLIE' ? 'Retirer' : 'Publier'}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                      {p.statut === 'PUBLIE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleSupprimer(p.id, p.titre)}
                      className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
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
