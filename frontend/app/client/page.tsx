'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart, MessageCircle, TrendingUp, Bell, Clock, ChevronRight, Package, Star } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { mesCommandes, mesStatsClient, mesConversations, mesNotifications } from '@/lib/api'

interface Commande {
  id: number
  total: number
  statut: string
  createdAt: string
  articles: { produit: { titre: string; photos: string[] } }[]
}

const STATUT_STYLE: Record<string, { label: string; classe: string }> = {
  RECUE:          { label: 'Reçue',          classe: 'bg-blue-100 text-blue-700' },
  EN_PREPARATION: { label: 'En préparation', classe: 'bg-amber-100 text-amber-700' },
  PRETE:          { label: 'Prête',          classe: 'bg-purple-100 text-purple-700' },
  EN_LIVRAISON:   { label: 'En livraison',   classe: 'bg-orange-100 text-orange-700' },
  LIVREE:         { label: 'Livrée',         classe: 'bg-green-100 text-green-700' },
  ANNULEE:        { label: 'Annulée',        classe: 'bg-red-100 text-red-600' },
}

export default function EspaceClient() {
  const { user } = useAuthStore()

  const [stats, setStats]         = useState<{ totalCommandes: number; totalDepense: number; totalFavoris: number; totalAvis: number } | null>(null)
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [nonLusTotaux, setNonLusTotaux] = useState(0)
  const [nbNotifs, setNbNotifs]   = useState(0)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    Promise.all([
      mesStatsClient().then(r => setStats(r.data)).catch(() => {}),
      mesCommandes().then(r => setCommandes(r.data.slice(0, 5))).catch(() => {}),
      mesConversations().then(r => setNonLusTotaux(r.data.reduce((s: number, c: { nonLus: number }) => s + (c.nonLus || 0), 0))).catch(() => {}),
      mesNotifications().then(r => setNbNotifs(r.data.filter((n: { lu: boolean }) => !n.lu).length)).catch(() => {}),
    ]).finally(() => setChargement(false))
  }, [])

  const commandesEnCours = commandes.filter(c => !['LIVREE', 'ANNULEE'].includes(c.statut)).length

  const cartes = [
    {
      lien: '/client/commandes',
      icone: <ShoppingBag className="w-6 h-6" />,
      valeur: chargement ? '—' : stats?.totalCommandes ?? 0,
      label: 'Commandes',
      detail: commandesEnCours > 0 ? `${commandesEnCours} en cours` : 'aucune en cours',
      couleur: 'bg-blue-50 text-blue-600',
    },
    {
      lien: '/client/favoris',
      icone: <Heart className="w-6 h-6" />,
      valeur: chargement ? '—' : stats?.totalFavoris ?? 0,
      label: 'Favoris',
      detail: 'produits sauvegardés',
      couleur: 'bg-red-50 text-red-500',
    },
    {
      lien: '/client/messages',
      icone: <MessageCircle className="w-6 h-6" />,
      valeur: chargement ? '—' : nonLusTotaux,
      label: 'Messages non lus',
      detail: 'dans vos conversations',
      couleur: 'bg-green-50 text-green-600',
    },
    {
      lien: '/client/profil',
      icone: <TrendingUp className="w-6 h-6" />,
      valeur: chargement ? '—' : stats ? `${Number(stats.totalDepense).toLocaleString('fr-FR')} F` : '0 F',
      label: 'Total dépensé',
      detail: 'depuis votre inscription',
      couleur: 'bg-or/10 text-or',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Bonjour, {user?.prenom} 👋</h1>
          <p className="text-sm text-muted-foreground">Bienvenue dans votre espace personnel</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {nbNotifs > 0 && (
            <Link href="/client/notifications"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-or/30 bg-or/5 text-or text-sm font-medium hover:bg-or/10 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{nbNotifs} notification{nbNotifs > 1 ? 's' : ''}</span>
              <span className="sm:hidden">{nbNotifs}</span>
              <span className="w-2 h-2 bg-or rounded-full animate-pulse" />
            </Link>
          )}
          <Link href="/client/commande-sur-mesure"
            className="btn-primaire flex items-center gap-2 !py-2 !px-4 text-sm">
            <Clock className="w-4 h-4" /> Sur mesure
          </Link>
        </div>
      </div>

      {/* Cartes stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {cartes.map((c, i) => (
          <Link key={i} href={c.lien}
            className="bg-white rounded-2xl border border-creme-fonce p-5 hover:border-or/50 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.couleur}`}>
              {c.icone}
            </div>
            <p className="text-2xl font-bold text-foreground">{c.valeur}</p>
            <p className="text-xs font-medium text-foreground mt-0.5">{c.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.detail}</p>
          </Link>
        ))}
      </div>

      {/* Dernières commandes */}
      <div className="bg-white rounded-2xl border border-creme-fonce p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Dernières commandes</h2>
          <Link href="/client/commandes" className="text-sm text-or hover:underline flex items-center gap-0.5">
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {chargement ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : commandes.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-10 h-10 text-creme-fonce mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune commande pour l&apos;instant</p>
            <Link href="/produits" className="text-xs text-or hover:underline mt-1 inline-block">
              Découvrir les produits →
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {commandes.map(c => {
              const s = STATUT_STYLE[c.statut] || { label: c.statut, classe: 'bg-gray-100 text-gray-600' }
              const premierProduit = c.articles?.[0]?.produit
              return (
                <Link key={c.id} href={`/client/commandes/${c.id}`}
                  className="flex items-center justify-between py-3 border-b border-creme-fonce last:border-0 hover:bg-gray-100 -mx-2 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-creme-fonce shrink-0">
                      {premierProduit?.photos?.[0] ? (
                        <Image src={premierProduit.photos[0]} alt="" width={36} height={36} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package className="w-5 h-5 text-gray-200" /></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Commande #{c.id}
                        {c.articles.length > 1 && <span className="text-muted-foreground text-xs ml-1">+{c.articles.length - 1} article{c.articles.length > 2 ? 's' : ''}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{premierProduit?.titre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-sm text-or">{Number(c.total).toLocaleString('fr-FR')} F</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.classe}`}>{s.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Accès rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: '/client/favoris',  label: 'Mes favoris',  icone: <Heart className="w-4 h-4 text-foret" /> },
          { href: '/client/avis',     label: 'Mes avis',     icone: <Star className="w-4 h-4 text-foret" /> },
        ].map(({ href, label, icone }) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl border border-creme-fonce p-4 flex items-center gap-3 hover:border-or/40 hover:shadow-sm transition-all text-sm font-medium">
            <div className="w-8 h-8 bg-foret/8 rounded-lg flex items-center justify-center shrink-0">{icone}</div>
            {label}
          </Link>
        ))}
      </div>

    </div>
  )
}
