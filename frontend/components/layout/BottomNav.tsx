'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, MessageCircle, Heart, User, Package, Store, BarChart2, Bell } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

const NAV_CLIENT = [
  { href: '/client',          icone: LayoutDashboard, label: 'Accueil' },
  { href: '/client/commandes',icone: ShoppingBag,     label: 'Commandes' },
  { href: '/client/messages', icone: MessageCircle,   label: 'Messages' },
  { href: '/client/favoris',  icone: Heart,           label: 'Favoris' },
  { href: '/client/profil',   icone: User,            label: 'Profil' },
]

const NAV_ARTISAN = [
  { href: '/artisan',           icone: LayoutDashboard, label: 'Accueil' },
  { href: '/artisan/produits',  icone: Package,         label: 'Produits' },
  { href: '/artisan/commandes', icone: ShoppingBag,     label: 'Commandes' },
  { href: '/artisan/messages',  icone: MessageCircle,   label: 'Messages' },
  { href: '/artisan/boutique',  icone: Store,           label: 'Boutique' },
]

export default function BottomNav() {
  const { user } = useAuthStore()
  const pathname = usePathname()

  if (!user || user.role === 'ADMIN') return null

  const liens = user.role === 'ARTISAN' ? NAV_ARTISAN : NAV_CLIENT

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-foret border-t border-white/10 flex">
      {liens.map(({ href, icone: Ic, label }) => {
        const actif = href === '/client' || href === '/artisan'
          ? pathname === href
          : pathname.startsWith(href)
        return (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              actif ? 'text-or-clair' : 'text-white/50 hover:text-white'
            }`}>
            <Ic className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
            {actif && <span className="absolute top-0 w-8 h-0.5 bg-or-clair rounded-full" />}
          </Link>
        )
      })}
    </nav>
  )
}
