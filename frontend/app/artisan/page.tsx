'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingBag, TrendingUp, Plus, Bell } from 'lucide-react'
import { mesStatistiques, mesCommandesArtisan, mesNotifications } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const STATUTS: Record<string, { label: string; couleur: string }> = {
  RECUE:          { label: 'Nouvelle',       couleur: 'bg-blue-100 text-blue-700' },
  EN_PREPARATION: { label: 'En cours',       couleur: 'bg-amber-100 text-amber-700' },
  PRETE:          { label: 'Prête',          couleur: 'bg-purple-100 text-purple-700' },
  EN_LIVRAISON:   { label: 'En livraison',   couleur: 'bg-orange-100 text-orange-700' },
  LIVREE:         { label: 'Livrée',         couleur: 'bg-green-100 text-green-700' },
}

export default function DashboardArtisan() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<{ totalProduits: number; totalVentes: number; revenuTotal: number } | null>(null)
  const [commandes, setCommandes] = useState<unknown[]>([])
  const [nbNotifsNonLues, setNbNotifsNonLues] = useState(0)

  useEffect(() => {
    mesStatistiques().then(r => setStats(r.data)).catch(() => {})
    mesCommandesArtisan().then(r => setCommandes(r.data.slice(0, 5))).catch(() => {})
    mesNotifications().then(r => setNbNotifsNonLues(r.data.filter((n: { lu: boolean }) => !n.lu).length)).catch(() => {})
  }, [])

  const revenu = stats?.revenuTotal
    ? `${Number(stats.revenuTotal).toLocaleString('fr-FR')} F`
    : '0 F'

  const cartes = [
    { icone: <Package className="w-6 h-6" />,    valeur: stats?.totalProduits ?? '—', label: 'Produits publiés',    lien: '/artisan/produits' },
    { icone: <ShoppingBag className="w-6 h-6" />, valeur: stats?.totalVentes ?? '—', label: 'Commandes reçues',    lien: '/artisan/commandes' },
    { icone: <TrendingUp className="w-6 h-6" />,  valeur: revenu,                     label: 'Chiffre d\'affaires', lien: '/artisan/stats' },
  ]

  if (user?.artisan?.statut === 'EN_ATTENTE') return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="text-5xl mb-4">⏳</div>
      <h2 className="text-xl font-bold mb-2">Compte en attente de validation</h2>
      <p className="text-muted-foreground text-sm">Notre équipe vérifie votre inscription. Vous serez notifié(e) dans 24-48h.</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Bonjour, {user?.prenom} 👋</h1>
          </div>
          <p className="text-sm text-muted-foreground">{user?.artisan?.nomBoutique}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {nbNotifsNonLues > 0 && (
            <Link href="/artisan/notifications"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-or/30 bg-or/5 text-or text-sm font-medium hover:bg-or/10 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{nbNotifsNonLues} notification{nbNotifsNonLues > 1 ? 's' : ''}</span>
              <span className="sm:hidden">{nbNotifsNonLues}</span>
              <span className="w-2 h-2 bg-or rounded-full animate-pulse" />
            </Link>
          )}
          <Link href="/artisan/produits/nouveau" className="btn-primaire flex items-center gap-2 !py-2 !px-4 text-sm">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouveau produit</span><span className="sm:hidden">Ajouter</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cartes.map((c, i) => (
          <Link key={i} href={c.lien} className="bg-white rounded-2xl border border-creme-fonce p-5 hover:border-or/50 transition-colors">
            <div className="w-10 h-10 bg-or-pale rounded-xl flex items-center justify-center text-or mb-3">{c.icone}</div>
            <p className="text-2xl font-bold text-foreground">{c.valeur}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Dernières commandes */}
      <div className="bg-white rounded-2xl border border-creme-fonce p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Dernières commandes</h2>
          <Link href="/artisan/commandes" className="text-sm text-or hover:underline">Voir tout</Link>
        </div>
        {commandes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune commande pour le moment</p>
        ) : (
          <div className="space-y-3">
            {(commandes as Record<string, unknown>[]).map(cmd => {
              const s = STATUTS[cmd.statut as string] || { label: String(cmd.statut), couleur: 'bg-gray-100 text-gray-700' }
              const client = cmd.client as { nom: string; prenom: string }
              return (
                <div key={cmd.id as number} className="flex items-center justify-between py-2 border-b border-creme-fonce last:border-0">
                  <div>
                    <p className="text-sm font-medium">Commande #{cmd.id as number}</p>
                    <p className="text-xs text-muted-foreground">{client?.prenom} {client?.nom}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-or">{Number(cmd.total).toLocaleString('fr-FR')} F</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.couleur}`}>{s.label}</span>
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
