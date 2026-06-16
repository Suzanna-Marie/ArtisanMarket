'use client'
import { useEffect, useState } from 'react'
import { Search, UserX, UserCheck, Trash2 } from 'lucide-react'
import { tousLesUtilisateurs, bloquerUtilisateur, debloquerUtilisateur, supprimerUtilisateur } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

interface Utilisateur {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  telephone: string | null
  actif: boolean
  createdAt: string
  _count: { commandes: number }
}

export default function AdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('')

  const charger = () =>
    tousLesUtilisateurs({ recherche, role: filtre })
      .then(r => setUtilisateurs(r.data))
      .finally(() => setChargement(false))

  useEffect(() => { charger() }, [recherche, filtre])

  const handleBloquer = async (id: number) => {
    if (!confirm('Bloquer cet utilisateur ?')) return
    await bloquerUtilisateur(id)
    toast('Utilisateur bloqué.', 'info')
    charger()
  }

  const handleDebloquer = async (id: number) => {
    await debloquerUtilisateur(id)
    toast('Utilisateur débloqué.', 'success')
    charger()
  }

  const handleSupprimer = async (id: number, nom: string) => {
    if (!confirm(`Supprimer définitivement "${nom}" ? Cette action est irréversible.`)) return
    try {
      await supprimerUtilisateur(id)
      toast('Utilisateur supprimé.', 'success')
      charger()
    } catch {
      toast('Erreur lors de la suppression.', 'error')
    }
  }

  const ROLE_STYLE: Record<string, string> = {
    CLIENT: 'bg-blue-100 text-blue-700',
    ARTISAN: 'bg-green-100 text-green-700',
    ADMIN: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Nom, prénom, email..." value={recherche} onChange={e => setRecherche(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-or/40" />
        </div>
        <select value={filtre} onChange={e => setFiltre(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
          <option value="">Tous les rôles</option>
          <option value="CLIENT">Clients</option>
          <option value="ARTISAN">Artisans</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {chargement ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : utilisateurs.length === 0 ? (
          <p className="text-center py-12 text-gray-500">Aucun utilisateur trouvé</p>
        ) : (
          utilisateurs.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                {u.prenom?.[0]}{u.nom?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{u.prenom} {u.nom}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                  {!u.actif && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Bloqué</span>}
                </div>
                <p className="text-xs text-gray-400">{u.email} {u.telephone && `· ${u.telephone}`} · {u._count.commandes} commande{u._count.commandes > 1 ? 's' : ''}</p>
              </div>
              <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                {new Date(u.createdAt).toLocaleDateString('fr-FR')}
              </p>
              {u.role !== 'ADMIN' && (
                <div className="flex gap-2 shrink-0">
                  {u.actif ? (
                    <button onClick={() => handleBloquer(u.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                      <UserX className="w-3.5 h-3.5" /> Bloquer
                    </button>
                  ) : (
                    <button onClick={() => handleDebloquer(u.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                      <UserCheck className="w-3.5 h-3.5" /> Débloquer
                    </button>
                  )}
                  <button onClick={() => handleSupprimer(u.id, `${u.prenom} ${u.nom}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
