'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, TrendingUp, ShoppingBag, Heart, Star, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { modifierProfil, changerMotDePasse, mesStatsClient, supprimerMonCompte } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/components/ui/toaster'
import Avatar from '@/components/ui/Avatar'

const REGEX_NOM = /^[a-zA-ZÀ-ÿ\s\-']+$/
const REGEX_TEL = /^(\+229)?01[0-9]{8}$/

export default function Profil() {
  const { user, setAuth, logout } = useAuthStore()
  const router = useRouter()
  const [onglet, setOnglet] = useState<'infos' | 'mdp' | 'compte'>('infos')
  const [stats, setStats] = useState<{ totalCommandes: number; totalDepense: number; totalFavoris: number; totalAvis: number } | null>(null)
  const [mdpSuppression, setMdpSuppression] = useState('')
  const [suppressionChargement, setSuppressionChargement] = useState(false)

  useEffect(() => {
    mesStatsClient().then(r => setStats(r.data)).catch(() => {})
  }, [])
  const [chargement, setChargement] = useState(false)

  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    motDePasse: '',
  })
  const [erreursForm, setErreursForm] = useState({ nom: '', prenom: '', telephone: '', motDePasse: '' })

  const [mdpForm, setMdpForm] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmation: '',
  })
  const [erreursMdp, setErreursMdp] = useState({ ancien: '', nouveau: '', confirmation: '' })
  const [voirAncien, setVoirAncien] = useState(false)
  const [voirNouveau, setVoirNouveau] = useState(false)
  const [voirConfirmation, setVoirConfirmation] = useState(false)
  const [voirMotDePasse, setVoirMotDePasse] = useState(false)
  const [voirSuppression, setVoirSuppression] = useState(false)

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErreursForm(prev => ({ ...prev, [key]: '' }))
  }
  const setMdp = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setMdpForm(f => ({ ...f, [key]: e.target.value }))
    setErreursMdp(prev => ({ ...prev, [key]: '' }))
  }

  const handleProfil = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = { nom: '', prenom: '', telephone: '', motDePasse: '' }

    if (!form.prenom.trim()) errs.prenom = 'Le prénom est requis.'
    else if (!REGEX_NOM.test(form.prenom.trim())) errs.prenom = 'Le prénom ne doit contenir que des lettres.'
    else if (form.prenom.trim().length < 2) errs.prenom = 'Prénom trop court (min 2 lettres).'

    if (!form.nom.trim()) errs.nom = 'Le nom est requis.'
    else if (!REGEX_NOM.test(form.nom.trim())) errs.nom = 'Le nom ne doit contenir que des lettres.'
    else if (form.nom.trim().length < 2) errs.nom = 'Nom trop court (min 2 lettres).'

    if (form.telephone.trim() && !REGEX_TEL.test(form.telephone.trim().replace(/\s/g, '')))
      errs.telephone = 'Numéro invalide. Format : 0140202000 ou +2290140202000'

    if (!form.motDePasse) errs.motDePasse = 'Confirmez votre mot de passe pour enregistrer.'

    setErreursForm(errs)
    if (Object.values(errs).some(v => v)) return

    setChargement(true)
    try {
      const r = await modifierProfil(form)
      setAuth(r.data.user || r.data, useAuthStore.getState().token!)
      toast('Profil mis à jour !', 'success')
    } catch {
      toast('Erreur lors de la mise à jour.', 'error')
    } finally {
      setChargement(false)
    }
  }

  const handleSupprimerCompte = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mdpSuppression) { toast('Le mot de passe est requis.', 'error'); return }
    if (!confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return
    setSuppressionChargement(true)
    try {
      await supprimerMonCompte(mdpSuppression)
      toast('Compte supprimé.', 'success')
      logout()
      router.push('/')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast(message || 'Mot de passe incorrect.', 'error')
    } finally {
      setSuppressionChargement(false)
    }
  }

  const handleMdp = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = { ancien: '', nouveau: '', confirmation: '' }

    if (!mdpForm.ancienMotDePasse) errs.ancien = "L'ancien mot de passe est requis."
    if (!mdpForm.nouveauMotDePasse) errs.nouveau = 'Le nouveau mot de passe est requis.'
    else if (mdpForm.nouveauMotDePasse.length < 8) errs.nouveau = 'Le mot de passe doit contenir au moins 8 caractères.'
    else if (!/[A-Z]/.test(mdpForm.nouveauMotDePasse)) errs.nouveau = 'Le mot de passe doit contenir au moins 1 majuscule.'
    else if (!/\d/.test(mdpForm.nouveauMotDePasse)) errs.nouveau = 'Le mot de passe doit contenir au moins 1 chiffre.'
    if (mdpForm.nouveauMotDePasse !== mdpForm.confirmation) errs.confirmation = 'Les mots de passe ne correspondent pas.'

    setErreursMdp(errs)
    if (Object.values(errs).some(v => v)) return

    setChargement(true)
    try {
      await changerMotDePasse({ ancienMotDePasse: mdpForm.ancienMotDePasse, nouveauMotDePasse: mdpForm.nouveauMotDePasse })
      toast('Mot de passe modifié !', 'success')
      setMdpForm({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' })
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast(message || 'Ancien mot de passe incorrect.', 'error')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-creme-fonce p-5">
        <Avatar prenom={user?.prenom ?? ''} nom={user?.nom ?? ''} taille={72} />
        <div>
          <p className="font-semibold text-lg">{user?.prenom} {user?.nom}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="text-xs bg-creme-fonce text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
            {user?.role?.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Stats rapides */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icone: ShoppingBag, val: stats.totalCommandes, label: 'Commandes', couleur: 'text-blue-600 bg-blue-50' },
            { icone: TrendingUp, val: `${Number(stats.totalDepense).toLocaleString('fr-FR')} F`, label: 'Dépensé', couleur: 'text-or bg-or/10' },
            { icone: Heart, val: stats.totalFavoris, label: 'Favoris', couleur: 'text-red-500 bg-red-50' },
            { icone: Star, val: stats.totalAvis, label: 'Avis laissés', couleur: 'text-amber-500 bg-amber-50' },
          ].map(({ icone: Ic, val, label, couleur }, i) => (
            <div key={i} className="bg-white rounded-xl border border-creme-fonce p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${couleur}`}>
                <Ic className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm">{val}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-2 flex-wrap">
        {(['infos', 'mdp', 'compte'] as const).map(o => (
          <button key={o} onClick={() => setOnglet(o)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${onglet === o ? (o === 'compte' ? 'bg-red-600 text-white' : 'bg-foret text-white') : 'bg-white border border-creme-fonce text-gray-600 hover:bg-gray-100'}`}>
            {o === 'infos' ? 'Informations' : o === 'mdp' ? 'Mot de passe' : 'Supprimer mon compte'}
          </button>
        ))}
      </div>

      {onglet === 'compte' ? (
        <form onSubmit={handleSupprimerCompte} className="bg-white rounded-2xl border border-red-200 p-6 space-y-5" noValidate>
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Action irréversible</p>
              <p className="text-xs text-red-600 mt-0.5">Toutes vos données (commandes, favoris, messages, avis) seront définitivement supprimées. Cette action ne peut pas être annulée.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Confirmez avec votre mot de passe *</label>
            <div className="relative">
              <input type={voirSuppression ? 'text' : 'password'} value={mdpSuppression} onChange={e => setMdpSuppression(e.target.value)}
                placeholder="Votre mot de passe actuel"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-red-200 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm" />
              <button type="button" onClick={() => setVoirSuppression(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600">
                {voirSuppression ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={suppressionChargement || !mdpSuppression}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {suppressionChargement && <Loader2 className="w-4 h-4 animate-spin" />}
            Supprimer définitivement mon compte
          </button>
        </form>
      ) : onglet === 'infos' ? (
        <form onSubmit={handleProfil} className="bg-white rounded-2xl border border-creme-fonce p-6 space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Prénom *</label>
              <input type="text" value={form.prenom} onChange={set('prenom')} autoComplete="given-name"
                className={`w-full px-4 py-3 rounded-xl border ${erreursForm.prenom ? 'border-red-400 bg-red-50' : 'border-creme-fonce bg-creme'} focus:outline-none focus:ring-2 focus:ring-or/40 text-sm`} />
              {erreursForm.prenom && <p className="text-red-500 text-xs mt-1">{erreursForm.prenom}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Nom *</label>
              <input type="text" value={form.nom} onChange={set('nom')} autoComplete="family-name"
                className={`w-full px-4 py-3 rounded-xl border ${erreursForm.nom ? 'border-red-400 bg-red-50' : 'border-creme-fonce bg-creme'} focus:outline-none focus:ring-2 focus:ring-or/40 text-sm`} />
              {erreursForm.nom && <p className="text-red-500 text-xs mt-1">{erreursForm.nom}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Téléphone</label>
            <input type="tel" value={form.telephone} onChange={set('telephone')} placeholder="0140202000" autoComplete="tel"
              className={`w-full px-4 py-3 rounded-xl border ${erreursForm.telephone ? 'border-red-400 bg-red-50' : 'border-creme-fonce bg-creme'} focus:outline-none focus:ring-2 focus:ring-or/40 text-sm`} />
            {erreursForm.telephone
              ? <p className="text-red-500 text-xs mt-1">{erreursForm.telephone}</p>
              : <p className="text-xs text-muted-foreground mt-1">Format béninois : 0140202000 ou +2290140202000</p>
            }
          </div>
          {/* Confirmation mot de passe */}
          <div className="border-t border-creme-fonce pt-4">
            <label className="block text-sm font-semibold mb-1.5">
              Confirmez votre mot de passe *
              <span className="text-xs font-normal text-muted-foreground ml-1">(requis pour sauvegarder)</span>
            </label>
            <div className="relative">
              <input type={voirMotDePasse ? 'text' : 'password'} value={form.motDePasse} onChange={set('motDePasse')}
                placeholder="Entrez votre mot de passe actuel"
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${erreursForm.motDePasse ? 'border-red-400 bg-red-50' : 'border-creme-fonce bg-creme'} focus:outline-none focus:ring-2 focus:ring-or/40 text-sm`} />
              <button type="button" onClick={() => setVoirMotDePasse(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {voirMotDePasse ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {erreursForm.motDePasse && <p className="text-red-500 text-xs mt-1">{erreursForm.motDePasse}</p>}
          </div>
          <button type="submit" disabled={chargement} className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60">
            {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
            Enregistrer
          </button>
        </form>
      ) : (
        <form onSubmit={handleMdp} className="bg-white rounded-2xl border border-creme-fonce p-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Ancien mot de passe *</label>
            <div className="relative">
              <input type={voirAncien ? 'text' : 'password'} value={mdpForm.ancienMotDePasse} onChange={setMdp('ancienMotDePasse')}
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${erreursMdp.ancien ? 'border-red-400 bg-red-50' : 'border-creme-fonce bg-creme'} focus:outline-none focus:ring-2 focus:ring-or/40 text-sm`} />
              <button type="button" onClick={() => setVoirAncien(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {voirAncien ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {erreursMdp.ancien && <p className="text-red-500 text-xs mt-1">{erreursMdp.ancien}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nouveau mot de passe *</label>
            <div className="relative">
              <input type={voirNouveau ? 'text' : 'password'} value={mdpForm.nouveauMotDePasse} onChange={setMdp('nouveauMotDePasse')} placeholder="Min. 8 car., 1 majuscule, 1 chiffre"
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${erreursMdp.nouveau ? 'border-red-400 bg-red-50' : 'border-creme-fonce bg-creme'} focus:outline-none focus:ring-2 focus:ring-or/40 text-sm`} />
              <button type="button" onClick={() => setVoirNouveau(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {voirNouveau ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {erreursMdp.nouveau && <p className="text-red-500 text-xs mt-1">{erreursMdp.nouveau}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Confirmer le nouveau mot de passe *</label>
            <div className="relative">
              <input type={voirConfirmation ? 'text' : 'password'} value={mdpForm.confirmation} onChange={setMdp('confirmation')}
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${erreursMdp.confirmation ? 'border-red-400 bg-red-50' : 'border-creme-fonce bg-creme'} focus:outline-none focus:ring-2 focus:ring-or/40 text-sm`} />
              <button type="button" onClick={() => setVoirConfirmation(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {voirConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {erreursMdp.confirmation && <p className="text-red-500 text-xs mt-1">{erreursMdp.confirmation}</p>}
          </div>
          <button type="submit" disabled={chargement} className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60">
            {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
            Modifier le mot de passe
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Vous avez oublié votre mot de passe ?{' '}
            <a href="/mot-de-passe-oublie" className="text-or hover:underline font-medium">Réinitialiser</a>
          </p>
        </form>
      )}
    </div>
  )
}
