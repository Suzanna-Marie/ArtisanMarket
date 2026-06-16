'use client'
import { useEffect, useState } from 'react'
import { Users, Store, Package, ShoppingBag, Clock, TrendingUp, CheckCircle, XCircle, Banknote } from 'lucide-react'
import { getStats, getArtisansEnAttente, validerArtisan, rejeterArtisan } from '@/lib/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface Stats {
  totalUsers: number
  totalArtisans: number
  totalProduits: number
  totalCommandes: number
  totalCommissionsCFA: number
  totalVentesCFA: number
  totalCommandesPaye: number
}

interface Artisan {
  id: number
  nomBoutique: string
  specialite: string
  localite: string
  createdAt: string
  user: { nom: string; prenom: string; email: string }
}

const CARTES = (stats: Stats | null) => [
  {
    label: 'Clients inscrits',
    valeur: stats?.totalUsers ?? '—',
    icone: Users,
    couleur: 'bg-blue-500',
    bg: 'bg-blue-50',
    texte: 'text-blue-600',
  },
  {
    label: 'Artisans validés',
    valeur: stats?.totalArtisans ?? '—',
    icone: Store,
    couleur: 'bg-foret',
    bg: 'bg-green-50',
    texte: 'text-green-700',
  },
  {
    label: 'Produits publiés',
    valeur: stats?.totalProduits ?? '—',
    icone: Package,
    couleur: 'bg-or',
    bg: 'bg-amber-50',
    texte: 'text-amber-700',
  },
  {
    label: 'Commandes totales',
    valeur: stats?.totalCommandes ?? '—',
    icone: ShoppingBag,
    couleur: 'bg-purple-500',
    bg: 'bg-purple-50',
    texte: 'text-purple-700',
  },
]

const GRAPHIQUE_DEMO = [
  { jour: 'Lun', inscrits: 2, commandes: 1 },
  { jour: 'Mar', inscrits: 5, commandes: 3 },
  { jour: 'Mer', inscrits: 3, commandes: 2 },
  { jour: 'Jeu', inscrits: 7, commandes: 5 },
  { jour: 'Ven', inscrits: 4, commandes: 4 },
  { jour: 'Sam', inscrits: 9, commandes: 6 },
  { jour: 'Dim', inscrits: 6, commandes: 3 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [enAttente, setEnAttente] = useState<Artisan[]>([])
  const [chargement, setChargement] = useState(true)

  const charger = async () => {
    try {
      const [statsRes, attenteRes] = await Promise.all([
        getStats(),
        getArtisansEnAttente(),
      ])
      setStats(statsRes.data)
      setEnAttente(attenteRes.data)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  const handleValider = async (id: number) => {
    await validerArtisan(id)
    charger()
  }

  const handleRejeter = async (id: number) => {
    const motif = prompt('Motif du rejet (optionnel) :') || ''
    await rejeterArtisan(id, motif)
    charger()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Vue d'ensemble</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tableau de bord ArtisanMarket</p>
      </div>

      {/* Cartes stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {CARTES(stats).map(({ label, valeur, icone: Icone, bg, texte }, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icone className={`w-5 h-5 ${texte}`} />
            </div>
            {chargement ? (
              <div className="skeleton h-8 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-slate-800">{valeur}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Cartes revenus */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-foret">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="w-4 h-4 text-foret" />
            <p className="text-xs text-slate-500 font-medium">Commissions perçues (2%)</p>
          </div>
          {chargement ? <div className="skeleton h-8 w-32" /> : (
            <p className="text-2xl font-bold text-foret">
              {(stats?.totalCommissionsCFA ?? 0).toLocaleString('fr-FR')} FCFA
            </p>
          )}
        </div>
        <div className="card p-5 border-l-4 border-or">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-or" />
            <p className="text-xs text-slate-500 font-medium">Volume de ventes total</p>
          </div>
          {chargement ? <div className="skeleton h-8 w-32" /> : (
            <p className="text-2xl font-bold text-or">
              {(stats?.totalVentesCFA ?? 0).toLocaleString('fr-FR')} FCFA
            </p>
          )}
        </div>
        <div className="card p-5 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-slate-500 font-medium">Commandes payées</p>
          </div>
          {chargement ? <div className="skeleton h-8 w-16" /> : (
            <p className="text-2xl font-bold text-blue-600">
              {stats?.totalCommandesPaye ?? 0}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Graphique activité */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-foret" />
            <h2 className="font-semibold text-slate-800">Activité de la semaine</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={GRAPHIQUE_DEMO} barGap={4}>
              <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#f1f5f9', fontSize: 12 }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="inscrits" name="Inscrits" radius={[6, 6, 0, 0]} fill="#2D5016" />
              <Bar dataKey="commandes" name="Commandes" radius={[6, 6, 0, 0]} fill="#E8B84B" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-foret inline-block" /> Inscrits
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-or-clair inline-block" /> Commandes
            </span>
          </div>
        </div>

        {/* Artisans en attente */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-800">
              Demandes en attente
              {enAttente.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                  {enAttente.length}
                </span>
              )}
            </h2>
          </div>
          {chargement ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16" />)}
            </div>
          ) : enAttente.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Aucune demande en attente</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {enAttente.map(a => (
                <div key={a.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{a.nomBoutique}</p>
                    <p className="text-xs text-slate-500">{a.user.prenom} {a.user.nom}</p>
                    <p className="text-xs text-slate-400">{a.specialite} · {a.localite}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleValider(a.id)}
                      className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" title="Valider">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRejeter(a.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Rejeter">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
