'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { connexion } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

function ConnexionContent() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [erreurs, setErreurs] = useState({ email: '', password: '' })
  const [voirMdp, setVoirMdp] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreurGlobal, setErreurGlobal] = useState('')
  const { setAuth, user } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const expire = searchParams.get('expire') === '1'

  // Rediriger si déjà connecté
  if (user) {
    if (user.role === 'ARTISAN') router.replace('/artisan')
    else if (user.role === 'ADMIN') router.replace('/admin')
    else router.replace('/client')
    return null
  }

  const setChamp = (key: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    if (erreurs[key]) setErreurs(prev => ({ ...prev, [key]: '' }))
    if (erreurGlobal) setErreurGlobal('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreurGlobal('')

    const nouvellesErreurs = { email: '', password: '' }

    if (!form.email.trim()) {
      nouvellesErreurs.email = "L'adresse email est requise."
    } else if (!REGEX_EMAIL.test(form.email.trim())) {
      nouvellesErreurs.email = 'Email invalide. Exemple : nom@domaine.com'
    }

    if (!form.password) {
      nouvellesErreurs.password = 'Le mot de passe est requis.'
    }

    if (nouvellesErreurs.email || nouvellesErreurs.password) {
      setErreurs(nouvellesErreurs)
      return
    }

    setChargement(true)
    try {
      const res = await connexion(form)
      setAuth(res.data.user, res.data.token)
      const role = res.data.user.role
      if (role === 'ADMIN') router.push('/admin')
      else if (role === 'ARTISAN') router.push('/artisan')
      else router.push('/client')
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { message?: string; needsVerification?: boolean; email?: string } } })?.response?.data
      if (errData?.needsVerification && errData?.email) {
        router.push(`/verification-email?email=${encodeURIComponent(errData.email)}`)
        return
      }
      setErreurGlobal(errData?.message || 'Email ou mot de passe incorrect.')
    } finally {
      setChargement(false)
    }
  }

  const champClasse = (champ: 'email' | 'password') =>
    `w-full px-4 py-3 rounded-xl border ${erreurs[champ] ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-creme-fonce bg-creme focus:ring-or/40 focus:border-or'} focus:outline-none focus:ring-2 transition-all text-sm`

  return (
    <div className="min-h-screen flex">

      {/* ── Panneau gauche — photo & branding (desktop) ── */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* Photo de fond */}
        <Image
          src="/images/tata.jpg"
          alt="Tisserand béninois"
          fill
          className="object-cover"
          priority
        />
        {/* Dégradé sombre pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-foret/85 via-foret/60 to-black/50" />

        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-or-clair">Artisan</span>
            <span className="text-2xl font-bold text-white">Market</span>
          </Link>

          {/* Citation */}
          <div>
            <div className="w-10 h-0.5 bg-or-clair mb-6" />
            <blockquote className="text-white text-xl font-medium leading-relaxed mb-4">
              &ldquo;Chaque pièce raconte l&apos;histoire d&apos;un artisan béninois passionné.&rdquo;
            </blockquote>
            <p className="text-white/70 text-sm">
              Des créations authentiques, directement des mains qui les tissent.
            </p>
          </div>

          {/* Chiffres */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-8">
            {[
              { nb: '150+', label: 'Artisans' },
              { nb: '3 000+', label: 'Créations' },
              { nb: '🇧🇯', label: 'Made in Bénin' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-or-clair">{s.nb}</div>
                <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 lg:px-12 py-12 bg-creme">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {/* Logo visible seulement sur mobile */}
            <Link href="/" className="inline-block lg:hidden mb-4">
              <span className="text-3xl font-bold text-or">Artisan</span>
              <span className="text-3xl font-bold text-foret">Market</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Bon retour !</h1>
            <p className="text-muted-foreground text-sm mt-1">Connectez-vous à votre compte</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-creme-fonce p-8">
            {expire && (
              <div className="bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-lg mb-4 border border-amber-200">
                ⏱ Session expirée après 10 minutes d&apos;inactivité. Reconnectez-vous.
              </div>
            )}
            {erreurGlobal && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 border border-red-200">
                {erreurGlobal}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Adresse email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={setChamp('email')}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  className={champClasse('email')}
                />
                {erreurs.email && <p className="text-red-500 text-xs mt-1">{erreurs.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">Mot de passe *</label>
                  <Link href="/mot-de-passe-oublie" className="text-xs text-or hover:underline">Oublié ?</Link>
                </div>
                <div className="relative">
                  <input
                    type={voirMdp ? 'text' : 'password'}
                    value={form.password}
                    onChange={setChamp('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={champClasse('password') + ' pr-12'}
                  />
                  <button type="button" onClick={() => setVoirMdp(!voirMdp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded">
                    {voirMdp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {erreurs.password && <p className="text-red-500 text-xs mt-1">{erreurs.password}</p>}
              </div>

              <button type="submit" disabled={chargement}
                className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
                {chargement ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Pas encore de compte ?{' '}
              <Link href="/inscription" className="text-or font-medium hover:underline">S&apos;inscrire</Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default function PageConnexion() {
  return <Suspense><ConnexionContent /></Suspense>
}
