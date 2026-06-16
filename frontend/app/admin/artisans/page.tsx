'use client'
import { useEffect, useState } from 'react'
import { Search, CheckCircle, XCircle, Clock, Ban, Trash2 } from 'lucide-react'
import { tousLesArtisans, validerArtisan, rejeterArtisan, suspendreArtisan, supprimerArtisan } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

interface Artisan {
  id: number
  nomBoutique: string
  specialite: string
  localite: string
  statut: string
  user: { nom: string; prenom: string; email: string }
  _count: { produits: number }
}

const STATUT_STYLE: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-100 text-amber-700',
  VALIDE: 'bg-green-100 text-green-700',
  REJETE: 'bg-red-100 text-red-700',
  SUSPENDU: 'bg-gray-100 text-gray-600',
}
const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente', VALIDE: 'Validé', REJETE: 'Rejeté', SUSPENDU: 'Suspendu',
}

export default function AdminArtisans() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('')

  const charger = () =>
    tousLesArtisans({ recherche, statut: filtre })
      .then(r => setArtisans(r.data))
      .finally(() => setChargement(false))

  useEffect(() => { charger() }, [recherche, filtre])

  const handleValider = async (id: number) => {
    await validerArtisan(id)
    toast('Artisan validé !', 'success')
    charger()
  }

  const handleRejeter = async (id: number) => {
    const motif = prompt('Motif du rejet :') || ''
    await rejeterArtisan(id, motif)
    toast('Artisan rejeté.', 'info')
    charger()
  }

  const handleSuspendre = async (id: number) => {
    if (!confirm('Suspendre cet artisan ?')) return
    await suspendreArtisan(id)
    toast('Artisan suspendu.', 'info')
    charger()
  }

  const handleSupprimer = async (id: number, nom: string) => {
    if (!confirm(`Supprimer définitivement "${nom}" ? Cette action est irréversible.`)) return
    try {
      await supprimerArtisan(id)
      toast('Artisan supprimé.', 'success')
      charger()
    } catch {
      toast('Erreur lors de la suppression.', 'error')
    }
  }

  const counts = {
    EN_ATTENTE: artisans.filter(a => a.statut === 'EN_ATTENTE').length,
    VALIDE: artisans.filter(a => a.statut === 'VALIDE').length,
    REJETE: artisans.filter(a => a.statut === 'REJETE').length,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des artisans</h1>
        <div className="flex gap-2 text-xs">
          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">{counts.EN_ATTENTE} en attente</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg">{counts.VALIDE} validés</span>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={recherche} onChange={e => setRecherche(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-or/40" />
        </div>
        <select value={filtre} onChange={e => setFiltre(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {chargement ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : artisans.length === 0 ? (
          <p className="text-center py-12 text-gray-500">Aucun artisan trouvé</p>
        ) : (
          artisans.map(a => (
            <div key={a.id} className="flex items-center justify-between p-4 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-sm">{a.nomBoutique}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_STYLE[a.statut] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUT_LABEL[a.statut] || a.statut}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{a.user.prenom} {a.user.nom} · {a.user.email}</p>
                <p className="text-xs text-gray-400">{a.specialite} · {a.localite} · {a._count.produits} produit{a._count.produits > 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {a.statut === 'EN_ATTENTE' && (
                  <>
                    <button onClick={() => handleValider(a.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Valider
                    </button>
                    <button onClick={() => handleRejeter(a.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Rejeter
                    </button>
                  </>
                )}
                {a.statut === 'VALIDE' && (
                  <button onClick={() => handleSuspendre(a.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    <Ban className="w-3.5 h-3.5" /> Suspendre
                  </button>
                )}
                {a.statut === 'SUSPENDU' && (
                  <button onClick={() => handleValider(a.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Réactiver
                  </button>
                )}
                <button onClick={() => handleSupprimer(a.id, a.nomBoutique)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
