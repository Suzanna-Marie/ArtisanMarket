'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Store, Package, Users, LogOut, Shield, Menu, X, Bell, AlertTriangle, ShoppingBag, MessageSquare, ChevronLeft, Star
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',                       label: 'Vue d\'ensemble',    icone: LayoutDashboard },
  { href: '/dashboard/artisans',              label: 'Artisans',           icone: Store },
  { href: '/dashboard/produits',              label: 'Produits',           icone: Package },
  { href: '/dashboard/commandes',             label: 'Commandes',          icone: ShoppingBag },
  { href: '/dashboard/utilisateurs',          label: 'Utilisateurs',       icone: Users },
  { href: '/dashboard/litiges',               label: 'Litiges',            icone: AlertTriangle },
  { href: '/dashboard/avis',                  label: 'Avis clients',       icone: Star },
  { href: '/dashboard/messages-contact',      label: 'Messages contact',   icone: MessageSquare },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ nom: string; prenom: string; email: string } | null>(null)
  const [menuOuvert, setMenuOuvert] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    try {
      const u = JSON.parse(userData)
      if (u.role !== 'ADMIN') { router.push('/login'); return }
      setUser(u)
    } catch {
      router.push('/login')
    }
  }, [])

  const deconnecter = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/login')
  }

  if (!user) return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-or-clair border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-200
        lg:static lg:translate-x-0
        ${menuOuvert ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-foret rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-or-clair" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">
              <span className="text-or-clair">Artisan</span>Market
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Administration</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icone: Icone }) => {
            const actif = pathname === href
            return (
              <Link key={href} href={href} onClick={() => setMenuOuvert(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  actif
                    ? 'bg-foret text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}>
                <Icone className="w-4.5 h-4.5 w-5 h-5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Profil + déconnexion */}
        <div className="p-3 border-t border-white/10">
          <div className="px-3.5 py-2.5 mb-1">
            <p className="text-sm font-medium text-white truncate">{user.prenom} {user.nom}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <button onClick={deconnecter}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-all w-full">
            <LogOut className="w-5 h-5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {menuOuvert && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuOuvert(false)} />
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between shrink-0">
          <button className="lg:hidden text-slate-500" onClick={() => setMenuOuvert(!menuOuvert)}>
            {menuOuvert ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-3">
            {pathname !== '/dashboard' && (
              <button onClick={() => router.back()}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 transition-colors font-medium">
                <ChevronLeft className="w-4 h-4" /> Retour
              </button>
            )}
            <h2 className="font-semibold text-slate-700 text-sm">
              {NAV.find(n => n.href === pathname)?.label ?? 'Administration'}
            </h2>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-foret flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
