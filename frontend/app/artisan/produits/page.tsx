'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff, PackageX, RefreshCw, Loader2, Package } from 'lucide-react'
import { mesProduits, supprimerProduit, modifierProduit } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

interface Produit {
  id: number; titre: string; prix: number; quantite: number
  photos: string[]; statut: string; categorie: { nom: string }
}

const STATUT_CONFIG: Record<string, { label: string; classe: string }> = {
  PUBLIE:    { label: 'Publié',    classe: 'bg-green-100 text-green-700' },
  BROUILLON: { label: 'Brouillon', classe: 'bg-gray-100 text-gray-600' },
  EN_RUPTURE:{ label: 'Rupture',   classe: 'bg-red-100 text-red-600' },
  RETIRE:    { label: 'Retiré',    classe: 'bg-orange-100 text-orange-600' },
}

export default function MesProduits() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)
  const [restockId, setRestockId] = useState<number | null>(null)
  const [restockQuantite, setRestockQuantite] = useState<Record<number, string>>({})
  const [restockEnvoi, setRestockEnvoi] = useState<number | null>(null)

  const charger = () => {
    mesProduits()
      .then(r => setProduits(r.data))
      .finally(() => setChargement(false))
  }

  useEffect(() => { charger() }, [])

  const handleSupprimer = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return
    await supprimerProduit(id)
    toast('Produit supprimé.', 'success')
    charger()
  }

  const toggleStatut = async (p: Produit) => {
    if (p.statut === 'EN_RUPTURE') {
      toast('Ce produit est en rupture. Mettez à jour le stock pour le republier.', 'error')
      return
    }
    const nouveau = p.statut === 'PUBLIE' ? 'BROUILLON' : 'PUBLIE'
    const fd = new FormData()
    fd.append('statut', nouveau)
    await modifierProduit(p.id, fd)
    toast(nouveau === 'PUBLIE' ? 'Produit publié.' : 'Produit mis en pause.', 'success')
    charger()
  }

  const handleRestock = async (id: number) => {
    const qte = Number(restockQuantite[id])
    if (!qte || qte <= 0) { toast('Entrez une quantité valide.', 'error'); return }
    setRestockEnvoi(id)
    try {
      const fd = new FormData()
      fd.append('quantite', String(qte))
      await modifierProduit(id, fd)
      toast(`Stock mis à jour : ${qte} unités. Produit republié automatiquement.`, 'success')
      setRestockId(null)
      setRestockQuantite(q => ({ ...q, [id]: '' }))
      charger()
    } catch {
      toast('Erreur lors de la mise à jour du stock.', 'error')
    } finally {
      setRestockEnvoi(null)
    }
  }

  const enRupture = produits.filter(p => p.statut === 'EN_RUPTURE').length

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Mes produits</h1>
          {enRupture > 0 && (
            <p className="text-sm text-red-600 mt-0.5 flex items-center gap-1">
              <PackageX className="w-3.5 h-3.5" />
              {enRupture} produit{enRupture > 1 ? 's' : ''} en rupture de stock
            </p>
          )}
        </div>
        <Link href="/artisan/produits/nouveau" className="btn-primaire flex items-center gap-2 !py-2 !px-4 text-sm">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Ajouter un produit</span><span className="sm:hidden">Ajouter</span>
        </Link>
      </div>

      {chargement ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : produits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-creme-fonce">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold mb-1">Aucun produit</p>
          <p className="text-sm text-muted-foreground mb-4">Publiez votre premier produit</p>
          <Link href="/artisan/produits/nouveau" className="btn-primaire inline-block text-sm">Ajouter un produit</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {produits.map(p => {
            const config = STATUT_CONFIG[p.statut] || { label: p.statut, classe: 'bg-gray-100 text-gray-600' }
            const isRupture = p.statut === 'EN_RUPTURE'
            const afficherRestock = restockId === p.id

            return (
              <div key={p.id} className={`bg-white rounded-2xl border overflow-hidden ${isRupture ? 'border-red-200' : 'border-creme-fonce'}`}>
                <div className="p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-creme-fonce shrink-0">
                    {p.photos?.[0]
                      ? <Image src={p.photos[0]} alt={p.titre} fill className={`object-cover ${isRupture ? 'opacity-60' : ''}`} sizes="64px" />
                      : <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package className="w-6 h-6 text-gray-200" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{p.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{p.categorie?.nom}</p>
                      <span className="text-muted-foreground">·</span>
                      <span className={`text-xs font-medium ${isRupture ? 'text-red-600' : p.quantite <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                        {isRupture ? 'Rupture de stock' : `${p.quantite} en stock`}
                        {p.quantite > 0 && p.quantite <= 5 && !isRupture && ' ⚠️'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-or">{Number(p.prix).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${config.classe}`}>
                    {config.label}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {isRupture ? (
                      <button onClick={() => setRestockId(afficherRestock ? null : p.id)}
                        title="Réapprovisionner"
                        className="p-2 rounded-xl hover:bg-red-50 transition-colors text-red-500 hover:text-red-700">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => toggleStatut(p)} title={p.statut === 'PUBLIE' ? 'Mettre en pause' : 'Publier'}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-muted-foreground hover:text-or">
                        {p.statut === 'PUBLIE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                    <Link href={`/artisan/produits/${p.id}/modifier`}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-muted-foreground hover:text-or">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleSupprimer(p.id)}
                      className="p-2 rounded-xl hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Panneau de restockage rapide */}
                {afficherRestock && (
                  <div className="border-t border-red-100 bg-red-50 px-4 py-3 flex items-center gap-3">
                    <PackageX className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 flex-1">Nouveau stock disponible :</p>
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantité"
                      value={restockQuantite[p.id] || ''}
                      onChange={e => setRestockQuantite(q => ({ ...q, [p.id]: e.target.value }))}
                      className="w-24 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                    <button
                      onClick={() => handleRestock(p.id)}
                      disabled={restockEnvoi === p.id}
                      className="flex items-center gap-1.5 bg-foret text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-foret/90 transition-colors disabled:opacity-60">
                      {restockEnvoi === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Réapprovisionner
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
