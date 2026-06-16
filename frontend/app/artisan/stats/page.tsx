'use client'
import ReauthRequis from '@/components/auth/ReauthRequis'
import { useEffect, useState } from 'react'
import { TrendingUp, Package, ShoppingBag, Star } from 'lucide-react'
import { statsArtisan } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

interface Stats {
  totalVentes: number
  revenuTotal: number
  totalProduits: number
  noteMoyenne: number
  commandesParStatut: Record<string, number>
  produitsPopulaires: { id: number; titre: string; total: number }[]
}

function WrappedStatsArtisan() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    statsArtisan().then(r => setStats(r.data)).finally(() => setChargement(false))
  }, [])

  const cartes = stats ? [
    { icone: <ShoppingBag className="w-5 h-5" />, valeur: stats.totalVentes, label: 'Commandes reçues', couleur: 'bg-blue-50 text-blue-600' },
    { icone: <TrendingUp className="w-5 h-5" />, valeur: `${Number(stats.revenuTotal).toLocaleString('fr-FR')} F`, label: 'Revenus totaux', couleur: 'bg-green-50 text-green-600' },
    { icone: <Package className="w-5 h-5" />, valeur: stats.totalProduits, label: 'Produits actifs', couleur: 'bg-or-pale text-or' },
    { icone: <Star className="w-5 h-5" />, valeur: stats.noteMoyenne ? `${stats.noteMoyenne}/5` : '—', label: 'Note moyenne', couleur: 'bg-amber-50 text-amber-600' },
  ] : []

  const statutsLabels: Record<string, string> = {
    RECUE: 'Reçues', EN_PREPARATION: 'En préparation', PRETE: 'Prêtes',
    EN_LIVRAISON: 'En livraison', LIVREE: 'Livrées',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Statistiques</h1>

      {chargement ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cartes.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-creme-fonce p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.couleur}`}>{c.icone}</div>
                <p className="text-2xl font-bold text-gray-900">{c.valeur}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commandes par statut */}
            <div className="bg-white rounded-2xl border border-creme-fonce p-5">
              <h2 className="font-semibold mb-4">Commandes par statut</h2>
              {stats?.commandesParStatut && Object.entries(stats.commandesParStatut).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.commandesParStatut).map(([statut, count]) => (
                    <div key={statut} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{statutsLabels[statut] || statut}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-creme-fonce rounded-full w-24">
                          <div className="h-2 bg-foret rounded-full" style={{ width: `${Math.min(100, (count / (stats.totalVentes || 1)) * 100)}%` }} />
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Aucune commande</p>
              )}
            </div>

            {/* Produits les plus vendus */}
            <div className="bg-white rounded-2xl border border-creme-fonce p-5">
              <h2 className="font-semibold mb-4">Produits populaires</h2>
              {stats?.produitsPopulaires && stats.produitsPopulaires.length > 0 ? (
                <div className="space-y-3">
                  {stats.produitsPopulaires.slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-or/10 text-or text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-sm flex-1 line-clamp-1">{p.titre}</span>
                      <span className="text-sm font-medium text-gray-500 shrink-0">{p.total} vente{p.total > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Aucune vente enregistrée</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function StatsArtisan() {
  return <ReauthRequis message="Pour consulter vos revenus et statistiques, confirmez votre identité."><WrappedStatsArtisan /></ReauthRequis>
}
