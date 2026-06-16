'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Store, Package, ShoppingBag, Clock } from 'lucide-react'
import { tableauDeBord, artisansEnAttente, validerArtisan, rejeterArtisan } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

export default function DashboardAdmin() {
  const [stats, setStats] = useState<{ totalUsers: number; totalArtisans: number; totalProduits: number; totalCommandes: number } | null>(null)
  const [enAttente, setEnAttente] = useState<Record<string, unknown>[]>([])

  const charger = () => {
    tableauDeBord().then(r => setStats(r.data)).catch(() => {})
    artisansEnAttente().then(r => setEnAttente(r.data)).catch(() => {})
  }

  useEffect(() => { charger() }, [])

  const handleValider = async (id: number) => {
    await validerArtisan(id)
    toast('Artisan validé !', 'success')
    charger()
  }

  const handleRejeter = async (id: number) => {
    const motif = prompt('Motif du rejet (optionnel) :')
    await rejeterArtisan(id, motif || '')
    toast('Artisan rejeté.', 'info')
    charger()
  }

  const cartes = [
    { icone: <Users className="w-6 h-6" />, valeur: stats?.totalUsers ?? '—', label: 'Clients', lien: '/admin/utilisateurs', couleur: 'bg-blue-50 text-blue-600' },
    { icone: <Store className="w-6 h-6" />, valeur: stats?.totalArtisans ?? '—', label: 'Artisans validés', lien: '/admin/artisans', couleur: 'bg-green-50 text-green-600' },
    { icone: <Package className="w-6 h-6" />, valeur: stats?.totalProduits ?? '—', label: 'Produits publiés', lien: '/admin/produits', couleur: 'bg-or-pale text-or' },
    { icone: <ShoppingBag className="w-6 h-6" />, valeur: stats?.totalCommandes ?? '—', label: 'Commandes totales', lien: '#', couleur: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cartes.map((c, i) => (
          <Link key={i} href={c.lien} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.couleur}`}>{c.icone}</div>
            <p className="text-2xl font-bold text-gray-900">{c.valeur}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Artisans en attente */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900">Artisans en attente de validation ({enAttente.length})</h2>
        </div>
        {enAttente.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Aucune demande en attente ✓</p>
        ) : (
          <div className="space-y-3">
            {enAttente.map(artisan => {
              const user = artisan.user as { nom: string; prenom: string; email: string }
              return (
                <div key={artisan.id as number} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{artisan.nomBoutique as string}</p>
                    <p className="text-xs text-gray-500">{user?.prenom} {user?.nom} · {user?.email}</p>
                    <p className="text-xs text-gray-400">{artisan.specialite as string} · {artisan.localite as string}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleValider(artisan.id as number)}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                      Valider
                    </button>
                    <button onClick={() => handleRejeter(artisan.id as number)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors">
                      Rejeter
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
