'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Store, LogOut, Clock, Ban, XCircle, MessageCircle, AlertTriangle, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import { moi } from '@/lib/api'
import Avatar from '@/components/ui/Avatar'

const nav = [
  { href: '/artisan',               icone: <LayoutDashboard className="w-5 h-5" />, label: 'Tableau de bord' },
  { href: '/artisan/produits',      icone: <Package className="w-5 h-5" />,         label: 'Mes produits' },
  { href: '/artisan/commandes',     icone: <ShoppingBag className="w-5 h-5" />,     label: 'Commandes' },
  { href: '/artisan/boutique',      icone: <Store className="w-5 h-5" />,           label: 'Ma boutique' },
  { href: '/artisan/messages',      icone: <MessageCircle className="w-5 h-5" />,   label: 'Messages' },
  { href: '/artisan/stats',         icone: <BarChart2 className="w-5 h-5" />,       label: 'Statistiques' },
  { href: '/artisan/litiges',       icone: <AlertTriangle className="w-5 h-5" />,   label: 'Litiges' },
]

const STATUT_BLOQUE: Record<string, { icone: React.ReactNode; titre: string; message: string; couleur: string }> = {
  EN_ATTENTE: {
    icone: <Clock className="w-12 h-12 text-amber-500" />,
    titre: 'Compte en attente de validation',
    message: 'Votre dossier est en cours d\'examen par notre équipe. Vous recevrez une notification dès que votre boutique sera validée (24-48h).',
    couleur: 'bg-amber-50 border-amber-200',
  },
  SUSPENDU: {
    icone: <Ban className="w-12 h-12 text-red-500" />,
    titre: 'Compte suspendu',
    message: 'Votre compte a été suspendu par l\'administration. Pour plus d\'informations, contactez le support.',
    couleur: 'bg-red-50 border-red-200',
  },
  REJETE: {
    icone: <XCircle className="w-12 h-12 text-gray-500" />,
    titre: 'Demande rejetée',
    message: 'Votre demande d\'inscription en tant qu\'artisan a été rejetée. Contactez l\'administration pour connaître les raisons.',
    couleur: 'bg-gray-50 border-gray-200',
  },
}

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, setAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [chargement, setChargement] = useState(true)
  const [statut, setStatut] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'ARTISAN') {
      router.push('/connexion')
      return
    }
    // Toujours aller chercher le statut frais depuis le backend
    moi()
      .then(res => {
        const userData = res.data
        setAuth(userData, useAuthStore.getState().token!)
        // Bloqué si user.actif=false OU artisan.statut != VALIDE
        if (!userData.actif) {
          setStatut('SUSPENDU')
        } else {
          setStatut(userData.artisan?.statut ?? 'VALIDE')
        }
      })
      .catch(() => setStatut('EN_ATTENTE'))
      .finally(() => setChargement(false))
  }, [])

  if (!user || user.role !== 'ARTISAN') return null

  if (chargement) return (
    <div className="min-h-screen bg-creme flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-foret border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const bloque = statut && statut !== 'VALIDE' ? STATUT_BLOQUE[statut] : null

  if (bloque) {
    return (
      <div className="min-h-screen bg-creme flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className={`max-w-md w-full text-center border rounded-2xl p-8 ${bloque.couleur}`}>
            <div className="flex justify-center mb-4">{bloque.icone}</div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">{bloque.titre}</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{bloque.message}</p>
            <button
              onClick={() => { logout(); router.push('/') }}
              className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-60 bg-foret text-white flex-col shrink-0">
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <Avatar prenom={user.prenom} nom={user.nom} taille={40} />
            <div className="min-w-0">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Espace artisan</p>
              <p className="font-semibold truncate text-sm">{user.artisan?.nomBoutique || `${user.prenom} ${user.nom}`}</p>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {nav.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${pathname === item.href ? 'bg-white/20 font-medium' : 'hover:bg-white/10'}`}>
                {item.icone} {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-white/10">
            <button onClick={() => { logout(); router.push('/') }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors w-full text-white/70">
              <LogOut className="w-5 h-5" /> Déconnexion
            </button>
          </div>
        </aside>
        <div className="flex-1 flex flex-col bg-gray-50 overflow-auto pb-20 md:pb-6">
          {pathname !== '/artisan' && (
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3">
              <button onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-foret transition-colors font-medium">
                <ChevronLeft className="w-4 h-4" /> Retour
              </button>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500 truncate">
                {nav.find(n => pathname.startsWith(n.href) && n.href !== '/artisan')?.label ?? 'Espace artisan'}
              </span>
            </div>
          )}
          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
