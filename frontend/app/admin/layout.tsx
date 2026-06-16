'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Store, Package, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

const nav = [
  { href: '/admin',           icone: <LayoutDashboard className="w-5 h-5" />, label: 'Tableau de bord' },
  { href: '/admin/artisans',  icone: <Store className="w-5 h-5" />,          label: 'Artisans' },
  { href: '/admin/produits',  icone: <Package className="w-5 h-5" />,        label: 'Produits' },
  { href: '/admin/utilisateurs', icone: <Users className="w-5 h-5" />,       label: 'Utilisateurs' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') router.push('/connexion')
  }, [user])

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-900 text-white flex-col flex shrink-0">
        <div className="p-5 border-b border-white/10">
          <span className="text-or-clair font-bold text-lg">Artisan</span><span className="font-bold text-lg">Market</span>
          <p className="text-xs text-white/40 mt-0.5">Administration</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${pathname === item.href ? 'bg-white/20 font-medium' : 'hover:bg-white/10 text-white/70'}`}>
              {item.icone} {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors w-full text-white/50">
            <LogOut className="w-5 h-5" /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  )
}
