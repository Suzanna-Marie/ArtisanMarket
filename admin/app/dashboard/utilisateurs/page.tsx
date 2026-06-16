'use client'
import { useEffect, useState } from 'react'
import { Search, UserX, UserCheck, Trash2 } from 'lucide-react'
import { getUtilisateurs, bloquerUtilisateur, debloquerUtilisateur, supprimerUtilisateur } from '@/lib/api'

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

const ROLE: Record<string, string> = {
  CLIENT:  'bg-blue-100 text-blue-700',
  ARTISAN: 'bg-green-100 text-green-700',
  ADMIN:   'bg-purple-100 text-purple-700',
}

export default function PageUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('')

  const charger = () => {
    setChargement(true)
    getUtilisateurs({ recherche: recherche || undefined, role: filtre || undefined })
      .then(r => setUtilisateurs(r.data))
      .finally(() => setChargement(false))
  }

  useEffect(() => { charger() }, [recherche, filtre])

  const handleBloquer = async (id: number, nom: string) => {
    if (!confirm(`Bloquer ${nom} ?`)) return
    await bloquerUtilisateur(id)
    charger()
  }

  const handleDebloquer = async (id: number) => {
    await debloquerUtilisateur(id)
    charger()
  }

  const handleSupprimer = async (id: number, nom: string) => {
    if (!confirm(`Supprimer définitivement "${nom}" ? Cette action est irréversible.`)) return
    await supprimerUtilisateur(id)
    charger()
  }

  const total = utilisateurs.length
  const actifs = utilisateurs.filter(u => u.actif).length
  const bloques = total - actifs

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gestion des utilisateurs</h1>
        <div className="flex gap-2 mt-2">
          <span className="badge bg-slate-100 text-slate-600">{total} total</span>
          <span className="badge bg-green-100 text-green-700">{actifs} actifs</span>
          {bloques > 0 && <span className="badge bg-red-100 text-red-600">{bloques} bloqués</span>}
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Nom, prénom, email..." value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-foret/30" />
        </div>
        <select value={filtre} onChange={e => setFiltre(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white">
          <option value="">Tous les rôles</option>
          <option value="CLIENT">Clients</option>
          <option value="ARTISAN">Artisans</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Utilisateur</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rôle</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Commandes</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Inscrit le</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {chargement ? (
              [...Array(7)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : utilisateurs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">Aucun utilisateur trouvé</td>
              </tr>
            ) : utilisateurs.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-foret flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {u.prenom?.[0]}{u.nom?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{u.prenom} {u.nom}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`badge ${ROLE[u.role] || 'bg-slate-100 text-slate-500'}`}>{u.role}</span>
                </td>
                <td className="px-5 py-3 text-slate-600 hidden sm:table-cell">
                  {u._count.commandes}
                </td>
                <td className="px-5 py-3 text-slate-400 text-xs hidden md:table-cell">
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-5 py-3">
                  <span className={`badge ${u.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.actif ? 'Actif' : 'Bloqué'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {u.role !== 'ADMIN' && (
                    <div className="flex items-center gap-1.5">
                      {u.actif ? (
                        <button onClick={() => handleBloquer(u.id, `${u.prenom} ${u.nom}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                          <UserX className="w-3.5 h-3.5" /> Bloquer
                        </button>
                      ) : (
                        <button onClick={() => handleDebloquer(u.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                          <UserCheck className="w-3.5 h-3.5" /> Débloquer
                        </button>
                      )}
                      <button onClick={() => handleSupprimer(u.id, `${u.prenom} ${u.nom}`)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
