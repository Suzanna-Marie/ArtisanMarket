'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, Eye, EyeOff, Trash2, Package } from 'lucide-react'
import { tousLesProduits, modifierStatutProduitAdmin, supprimerProduitAdmin } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

interface Produit {
  id: number
  titre: string
  prix: number
  statut: string
  photos: string[]
  categorie: { nom: string }
  artisan: { nomBoutique: string }
}

export default function AdminProduits() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('')

  const charger = () =>
    tousLesProduits({ recherche, statut: filtre })
      .then(r => setProduits(r.data.produits || r.data))
      .finally(() => setChargement(false))

  useEffect(() => { charger() }, [recherche, filtre])

  const handleStatut = async (id: number, statut: string) => {
    await modifierStatutProduitAdmin(id, statut)
    toast(statut === 'PUBLIE' ? 'Produit publié.' : 'Produit retiré.', 'success')
    charger()
  }

  const handleSupprimer = async (id: number) => {
    if (!confirm('Supprimer définitivement ce produit ?')) return
    await supprimerProduitAdmin(id)
    toast('Produit supprimé.', 'success')
    charger()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Modération des produits</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher un produit..." value={recherche} onChange={e => setRecherche(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-or/40" />
        </div>
        <select value={filtre} onChange={e => setFiltre(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
          <option value="">Tous les statuts</option>
          <option value="PUBLIE">Publiés</option>
          <option value="BROUILLON">Brouillons</option>
          <option value="RETIRE">Retirés</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {chargement ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : produits.length === 0 ? (
          <p className="text-center py-12 text-gray-500">Aucun produit trouvé</p>
        ) : (
          produits.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {p.photos?.[0] ? (
                  <Image src={p.photos[0]} alt={p.titre} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package className="w-6 h-6 text-gray-200" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{p.titre}</p>
                <p className="text-xs text-gray-500">{p.artisan?.nomBoutique} · {p.categorie?.nom}</p>
                <p className="text-xs font-semibold text-or">{Number(p.prix).toLocaleString('fr-FR')} FCFA</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                p.statut === 'PUBLIE' ? 'bg-green-100 text-green-700' :
                p.statut === 'RETIRE' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                {p.statut === 'PUBLIE' ? 'Publié' : p.statut === 'RETIRE' ? 'Retiré' : 'Brouillon'}
              </span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleStatut(p.id, p.statut === 'PUBLIE' ? 'RETIRE' : 'PUBLIE')}
                  title={p.statut === 'PUBLIE' ? 'Retirer' : 'Publier'}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                  {p.statut === 'PUBLIE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => handleSupprimer(p.id)}
                  className="p-2 rounded-xl hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
