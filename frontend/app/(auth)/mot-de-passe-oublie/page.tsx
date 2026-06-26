'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { demanderReinitialisationMdp, reinitialiserMdp } from '@/lib/api'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

type Etape = 'email' | 'code' | 'succes'

export default function PageMotDePasseOublie() {
  const router = useRouter()
  const [etape, setEtape] = useState<Etape>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleDemanderCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (!email.trim() || !REGEX_EMAIL.test(email.trim())) {
      setErreur('Adresse email invalide.')
      return
    }
    setChargement(true)
    try {
      await demanderReinitialisationMdp(email.trim())
      setEtape('code')
    } catch {
      setErreur('Erreur serveur. Réessayez.')
    } finally {
      setChargement(false)
    }
  }

  const handleReinitialiser = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setErreur('Le code doit contenir 6 chiffres.')
      return
    }
    if (nouveauMdp.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (!/[A-Z]/.test(nouveauMdp)) {
      setErreur('Le mot de passe doit contenir au moins 1 lettre majuscule.')
      return
    }
    if (!/\d/.test(nouveauMdp)) {
      setErreur('Le mot de passe doit contenir au moins 1 chiffre.')
      return
    }
    setChargement(true)
    try {
      await reinitialiserMdp({ email, code, nouveauMotDePasse: nouveauMdp })
      setEtape('succes')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErreur(msg || 'Code incorrect ou expiré.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-creme flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-or">Artisan</span>
            <span className="text-3xl font-bold text-foret">Market</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-4">Mot de passe oublié</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {etape === 'email' && 'Entrez votre email pour recevoir un code de réinitialisation'}
            {etape === 'code' && 'Entrez le code reçu et votre nouveau mot de passe'}
            {etape === 'succes' && 'Votre mot de passe a été réinitialisé'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-creme-fonce p-8">

          {/* Indicateur d'étapes */}
          {etape !== 'succes' && (
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1 rounded-full ${etape === 'email' ? 'bg-or' : 'bg-green-500'}`} />
              <div className={`flex-1 h-1 rounded-full ${etape === 'code' ? 'bg-or' : 'bg-creme-fonce'}`} />
            </div>
          )}

          {erreur && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-5 border border-red-200">
              {erreur}
            </div>
          )}

          {/* Étape 1 — Email */}
          {etape === 'email' && (
            <form onSubmit={handleDemanderCode} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Adresse email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErreur('') }}
                    placeholder="votre@email.com"
                    autoComplete="email"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:ring-2 focus:ring-or/40 focus:border-or focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <button type="submit" disabled={chargement}
                className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
                {chargement ? 'Envoi...' : 'Recevoir le code'}
              </button>
            </form>
          )}

          {/* Étape 2 — Code + nouveau mdp */}
          {etape === 'code' && (
            <form onSubmit={handleReinitialiser} className="space-y-5" noValidate>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                Un code a été envoyé à <strong>{email}</strong>. Vérifiez aussi vos spams.
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Code à 6 chiffres *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setErreur('') }}
                  placeholder="123456"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:ring-2 focus:ring-or/40 focus:border-or focus:outline-none transition-all text-sm tracking-widest font-mono text-center text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={voirMdp ? 'text' : 'password'}
                    value={nouveauMdp}
                    onChange={e => { setNouveauMdp(e.target.value); setErreur('') }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full px-4 pr-12 py-3 rounded-xl border border-creme-fonce bg-creme focus:ring-2 focus:ring-or/40 focus:border-or focus:outline-none transition-all text-sm"
                  />
                  <button type="button" onClick={() => setVoirMdp(!voirMdp)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {voirMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Min. 8 caractères · 1 majuscule · 1 chiffre</p>
              </div>

              <button type="submit" disabled={chargement}
                className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
                {chargement ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </button>

              <button type="button" onClick={() => { setEtape('email'); setCode(''); setNouveauMdp(''); setErreur('') }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Changer d'adresse email
              </button>
            </form>
          )}

          {/* Succès */}
          {etape === 'succes' && (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Mot de passe réinitialisé !</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <button onClick={() => router.push('/connexion')}
                className="w-full btn-primaire">
                Se connecter
              </button>
            </div>
          )}

        </div>

        {etape !== 'succes' && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link href="/connexion" className="text-or hover:underline flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
            </Link>
          </p>
        )}

      </div>
    </div>
  )
}
