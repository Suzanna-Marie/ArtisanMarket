'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Heart, MessageCircle, Clock,
  Bell, Star, User, LogOut, ShoppingCart, AlertTriangle, ChevronLeft,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import Avatar from '@/components/ui/Avatar'

const nav = [
  { href: '/client',                  icone: <LayoutDashboard className="w-5 h-5" />, label: 'Tableau de bord' },
  { href: '/client/commandes',        icone: <ShoppingBag className="w-5 h-5" />,     label: 'Commandes' },
  { href: '/client/messages',         icone: <MessageCircle className="w-5 h-5" />,   label: 'Messages' },
  { href: '/client/favoris',          icone: <Heart className="w-5 h-5" />,           label: 'Favoris' },
  { href: '/client/panier',           icone: <ShoppingCart className="w-5 h-5" />,    label: 'Panier' },
  { href: '/client/commande-sur-mesure', icone: <Clock className="w-5 h-5" />,        label: 'Sur mesure' },
  { href: '/client/litiges',          icone: <AlertTriangle className="w-5 h-5" />,   label: 'Litiges' },
  { href: '/client/notifications',    icone: <Bell className="w-5 h-5" />,            label: 'Notifications' },
  { href: '/client/avis',             icone: <Star className="w-5 h-5" />,            label: 'Mes avis' },
  { href: '/client/profil',           icone: <User className="w-5 h-5" />,            label: 'Mon profil' },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user) { router.push('/connexion'); return }
    if (user.role === 'ADMIN') { router.push('/admin'); return }
  }, [user])

  if (!user || user.role === 'ADMIN') return null

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-60 bg-foret text-white flex-col shrink-0">
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <Avatar prenom={user.prenom} nom={user.nom} taille={40} />
            <div className="min-w-0">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Espace client</p>
              <p className="font-semibold truncate text-sm">{user.prenom} {user.nom}</p>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {nav.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-white/20 font-medium'
                    : 'hover:bg-white/10'
                }`}>
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
          {pathname !== '/client' && (
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3">
              <button onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-foret transition-colors font-medium">
                <ChevronLeft className="w-4 h-4" /> Retour
              </button>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500 truncate">
                {nav.find(n => pathname.startsWith(n.href) && n.href !== '/client')?.label ?? 'Espace client'}
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
