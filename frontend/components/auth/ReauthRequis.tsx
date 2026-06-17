'use client'
import { useState, useEffect } from 'react'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { connexion } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const REAUTH_KEY = 'reauth_ts'
const REAUTH_DUREE = 30 * 60 * 1000 // valide 30 minutes après confirmation

export default function ReauthRequis({ children, message }: { children: React.ReactNode; message?: string }) {
  const { user } = useAuthStore()
  const [ok, setOk] = useState(false)
  const [mdp, setMdp] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [voirMdp, setVoirMdp] = useState(false)

  useEffect(() => {
    const ts = sessionStorage.getItem(REAUTH_KEY)
    if (ts && Date.now() - Number(ts) < REAUTH_DUREE) setOk(true)
  }, [])

  if (ok) return <>{children}</>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mdp.trim()) { setErreur('Entrez votre mot de passe.'); return }
    setChargement(true)
    try {
      await connexion({ email: user?.email, password: mdp })
      sessionStorage.setItem(REAUTH_KEY, Date.now().toString())
      setOk(true)
    } catch {
      setErreur('Mot de passe incorrect. Réessayez.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl border border-creme-fonce p-8 text-center shadow-sm">
      <div className="w-14 h-14 bg-foret/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock className="w-7 h-7 text-foret" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Confirmez votre identité</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {message || 'Pour accéder à cette section, entrez votre mot de passe.'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="relative">
          <input
            type={voirMdp ? 'text' : 'password'}
            value={mdp}
            onChange={e => { setMdp(e.target.value); setErreur('') }}
            placeholder="Votre mot de passe actuel"
            autoFocus
            className="w-full px-4 py-3 pr-12 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm"
          />
          <button type="button" onClick={() => setVoirMdp(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {voirMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {erreur && <p className="text-red-500 text-sm text-center">{erreur}</p>}
        <button type="submit" disabled={chargement}
          className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60">
          {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
          {chargement ? 'Vérification...' : 'Confirmer et continuer'}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Mot de passe oublié ?{' '}
          <Link href="/mot-de-passe-oublie" className="text-or hover:underline font-medium">Réinitialiser</Link>
        </p>
      </form>
    </div>
  )
}
