'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react'
import { loginAdmin } from '@/lib/api'

export default function LoginAdmin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [voirMdp, setVoirMdp] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setErreur('Veuillez remplir tous les champs.')
      return
    }
    setChargement(true)
    setErreur('')
    try {
      const res = await loginAdmin(form)
      const { token, user } = res.data
      if (user.role !== 'ADMIN') {
        setErreur('Accès refusé. Ce panneau est réservé aux administrateurs.')
        return
      }
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      router.push('/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number }; message?: string; code?: string }
      if (!axiosErr.response) {
        setErreur(`Impossible de joindre le serveur (${axiosErr.code || axiosErr.message}). Vérifiez que le backend tourne sur le port 5000.`)
      } else {
        setErreur(axiosErr.response.data?.message || 'Identifiants incorrects.')
      }
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-foret rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-or-clair" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-or-clair">Artisan</span>Market
          </h1>
          <p className="text-slate-400 text-sm mt-1">Panneau d'administration</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-7">
          {erreur && (
            <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl mb-5 border border-red-500/20">
              {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email administrateur</label>
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErreur('') }}
                placeholder="admin@artisanmarket.bj"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-or-clair/40 focus:border-or-clair/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={voirMdp ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErreur('') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-or-clair/40 focus:border-or-clair/50 transition-all"
                />
                <button type="button" onClick={() => setVoirMdp(!voirMdp)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {voirMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={chargement}
              className="w-full bg-foret text-white py-3 rounded-xl font-medium text-sm hover:bg-foret/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2">
              {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
              {chargement ? 'Connexion...' : 'Accéder au panneau'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          ArtisanMarket · Administration · Accès restreint
        </p>
      </div>
    </div>
  )
}
