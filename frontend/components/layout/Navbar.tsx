'use client'
import Link from 'next/link'
import Logo from '@/components/layout/Logo'
import {
  ShoppingCart, Search, X, Bell, User,
  LogOut, Store, LayoutDashboard, ChevronDown,
  Star, Package, Menu, ArrowRight,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore, usePanierStore } from '@/lib/store'
import { useRouter, usePathname } from 'next/navigation'

const NAV = [
  { href: '/',         label: 'Accueil' },
  { href: '/produits', label: 'Produits' },
  { href: '/artisans', label: 'Artisans' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact',  label: 'Contact' },
]

export default function Navbar() {
  const [menuOuvert, setMenuOuvert]             = useState(false)
  const [dropdownOuvert, setDropdownOuvert]     = useState(false)
  const [rechercheOuverte, setRechercheOuverte] = useState(false)
  const [recherche, setRecherche]               = useState('')
  const [mounted, setMounted]                   = useState(false)

  const { user, logout } = useAuthStore()
  const nbArticles = usePanierStore(s => s.nbArticles())
  const router     = useRouter()
  const pathname   = usePathname()
  const dropdownRef  = useRef<HTMLDivElement>(null)
  const rechercheRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOuvert(false)
      if (rechercheRef.current && !rechercheRef.current.contains(e.target as Node))
        setRechercheOuverte(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const goSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (recherche.trim()) router.push(`/produits?recherche=${encodeURIComponent(recherche.trim())}`)
    setRecherche('')
    setRechercheOuverte(false)
    setMenuOuvert(false)
  }

  const dashboard = () => {
    if (user?.role === 'ARTISAN') return '/artisan'
    if (user?.role === 'ADMIN')   return '/admin'
    return '/client'
  }

  const actif = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const initiales = user ? `${user.prenom[0]}${user.nom[0]}` : ''

  return (
    <header className="bg-white border-b-2 border-foret/20 sticky top-0 z-50 shadow-sm" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(45,80,22,0.04) 0%, transparent 100%)' }}>

      {/* ── Barre principale ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4 lg:gap-8">

          {/* Logo */}
          <Logo taille="sm" variante="clair" />

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`relative px-3 py-2 text-[14px] rounded-lg font-medium transition-all duration-200 ${
                  actif(href)
                    ? 'text-foret'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-foret/5'
                }`}>
                {label}
                {actif(href) && (
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-foret rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-1">

            {/* Recherche */}
            <div ref={rechercheRef} className="relative">
              {rechercheOuverte ? (
                <form onSubmit={goSearch}
                  className="flex items-center bg-foret/5 border border-foret/25 rounded-full overflow-hidden pr-1 focus-within:border-foret/50 focus-within:bg-foret/8 transition-all shadow-sm">
                  <Search className="w-4 h-4 text-foret/60 ml-3 shrink-0" />
                  <input
                    autoFocus
                    value={recherche}
                    onChange={e => setRecherche(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-44 px-2 py-2 text-sm bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                  <button type="button" onClick={() => setRechercheOuverte(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-full transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button onClick={() => setRechercheOuverte(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-foret/5 hover:bg-foret/10 border border-foret/15 hover:border-foret/30 rounded-full text-gray-400 hover:text-foret transition-all duration-200 shadow-sm group">
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm text-gray-400 group-hover:text-foret">Rechercher...</span>
                </button>
              )}
            </div>

            {/* Notifications */}
            {mounted && user && (
              <Link
                href={user.role === 'ARTISAN' ? '/artisan/notifications' : '/client/notifications'}
                className="p-2 text-gray-400 hover:text-foret hover:bg-foret/5 rounded-xl transition-colors">
                <Bell className="w-[18px] h-[18px]" />
              </Link>
            )}

            {/* Panier */}
            <Link href="/client/panier"
              className="relative p-2 text-gray-400 hover:text-foret hover:bg-foret/5 rounded-xl transition-colors">
              <ShoppingCart className="w-[18px] h-[18px]" />
              {mounted && nbArticles > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-foret text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                  {nbArticles}
                </span>
              )}
            </Link>

            {/* Séparateur */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Utilisateur connecté */}
            {mounted && user ? (
              <div ref={dropdownRef} className="relative">
                <button onClick={() => setDropdownOuvert(v => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-foret/5 transition-colors border border-transparent hover:border-foret/15">
                  <div className="w-7 h-7 rounded-full bg-foret flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-[11px] leading-none">{initiales}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.prenom}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOuvert ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOuvert && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl overflow-hidden z-50 border border-gray-100">
                    {/* Header utilisateur */}
                    <div className="px-4 py-3.5 flex items-center gap-3 border-b border-gray-50">
                      <div className="w-10 h-10 rounded-full bg-foret flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">{initiales}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user.prenom} {user.nom}</p>
                        <p className="text-gray-400 text-xs truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-1.5">
                      {[
                        { href: dashboard(), icone: LayoutDashboard, label: 'Mon espace' },
                        ...(user.role === 'ARTISAN' ? [
                          { href: '/artisan/boutique', icone: Store,   label: 'Ma boutique' },
                          { href: '/artisan/produits', icone: Package, label: 'Mes produits' },
                        ] : []),
                        ...(user.role === 'CLIENT' ? [
                          { href: '/client/profil',   icone: User,   label: 'Mon profil' },
                          { href: '/client/avis',     icone: Star,   label: 'Mes avis' },
                        ] : []),
                      ].map(({ href, icone: Ic, label }) => (
                        <Link key={href} href={href} onClick={() => setDropdownOuvert(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-foret transition-colors">
                          <Ic className="w-4 h-4 text-foret/70" /> {label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button onClick={() => { logout(); router.push('/'); setDropdownOuvert(false) }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                        <LogOut className="w-4 h-4" /> Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/connexion"
                  className="text-sm font-medium text-gray-600 hover:text-foret px-3 py-2 rounded-xl transition-colors hover:bg-foret/5">
                  Connexion
                </Link>
                <Link href="/inscription"
                  className="text-sm font-semibold bg-foret text-white px-4 py-2 rounded-xl hover:bg-foret-clair transition-colors shadow-sm">
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile — panier + hamburger */}
          <div className="md:hidden flex items-center gap-1 ml-auto">
            <Link href="/client/panier" className="relative p-2 text-gray-500">
              <ShoppingCart className="w-5 h-5" />
              {mounted && nbArticles > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-foret text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {nbArticles}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOuvert(v => !v)}
              className="p-2 text-gray-500 hover:text-foret transition-colors rounded-xl hover:bg-foret/5">
              {menuOuvert ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Menu mobile ── */}
      {menuOuvert && (
        <div className="md:hidden border-t border-white/10 bg-white shadow-lg">

          {/* Barre de recherche */}
          <div className="px-4 pt-3 pb-2">
            <form onSubmit={goSearch}
              className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-foret/40">
              <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
              <input value={recherche} onChange={e => setRecherche(e.target.value)}
                placeholder="Rechercher un produit..."
                className="flex-1 px-3 py-2.5 text-sm bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none" />
            </form>
          </div>

          {/* Liens */}
          <nav className="px-3 pb-2">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOuvert(false)}
                className={`flex items-center justify-between px-3 py-3 rounded-xl my-0.5 text-sm transition-colors ${
                  actif(href)
                    ? 'text-foret font-semibold bg-foret/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {label}
                {actif(href) && <span className="w-1.5 h-1.5 bg-foret rounded-full" />}
              </Link>
            ))}
          </nav>

          {/* Section utilisateur */}
          <div className="border-t border-gray-100 px-3 py-3">
            {mounted && user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2.5 mb-1 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-foret flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">{initiales}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold text-sm">{user.prenom} {user.nom}</p>
                    <p className="text-gray-400 text-xs truncate">{user.email}</p>
                  </div>
                </div>
                <Link href={dashboard()} onClick={() => setMenuOuvert(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-foret hover:bg-gray-50 rounded-xl transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Mon espace
                </Link>
                <button onClick={() => { logout(); router.push('/'); setMenuOuvert(false) }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full text-left mt-1">
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/connexion" onClick={() => setMenuOuvert(false)}
                  className="text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Connexion
                </Link>
                <Link href="/inscription" onClick={() => setMenuOuvert(false)}
                  className="text-center py-2.5 text-sm font-semibold bg-foret text-white rounded-xl hover:bg-foret-clair transition-colors flex items-center justify-center gap-2">
                  S&apos;inscrire <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
