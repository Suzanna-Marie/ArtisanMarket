'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, User, Store, Upload, X, ShieldCheck, HeartHandshake, Star } from 'lucide-react'
import { inscription } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

// ── Fonctions de validation ────────────────────────────────────────────────
const REGEX_NOM = /^[a-zA-ZÀ-ÿ\s\-']+$/
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
const REGEX_TEL = /^(\+229)?01[0-9]{8}$/

const validerNom = (val: string, label: string) => {
  if (!val.trim()) return `${label} est requis(e).`
  if (val.trim().length < 2) return `${label} doit contenir au moins 2 lettres.`
  if (val.trim().length > 50) return `${label} est trop long(ue) (max 50 caractères).`
  if (!REGEX_NOM.test(val.trim())) return `${label} ne doit contenir que des lettres (pas de chiffres ni de symboles).`
  return ''
}

const validerEmail = (val: string) => {
  if (!val.trim()) return "L'adresse email est requise."
  if (!REGEX_EMAIL.test(val.trim())) return 'Email invalide. Exemple : nom@domaine.com'
  return ''
}

const validerTelephone = (val: string) => {
  if (!val.trim()) return ''
  if (!REGEX_TEL.test(val.trim().replace(/\s/g, '')))
    return 'Numéro invalide. Entrez 10 chiffres commençant par 01 (ex: 0140202000) ou avec indicatif +229 (ex: +2290140202000).'
  return ''
}

const validerMotDePasse = (val: string) => {
  if (!val) return 'Le mot de passe est requis.'
  if (val.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.'
  if (!/[A-Z]/.test(val)) return 'Le mot de passe doit contenir au moins 1 lettre majuscule.'
  if (!/\d/.test(val)) return 'Le mot de passe doit contenir au moins 1 chiffre.'
  return ''
}
// ──────────────────────────────────────────────────────────────────────────

const avantages = [
  { icone: <ShieldCheck className="w-5 h-5" />, texte: 'Paiement Mobile Money sécurisé' },
  { icone: <HeartHandshake className="w-5 h-5" />, texte: 'Artisans vérifiés par notre équipe' },
  { icone: <Star className="w-5 h-5" />, texte: 'Commandes sur mesure disponibles' },
]

function InscriptionContent() {
  const params = useSearchParams()
  const [role, setRole] = useState<'CLIENT' | 'ARTISAN'>(
    (params.get('role') as 'CLIENT' | 'ARTISAN') || 'CLIENT'
  )
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', telephone: '',
    boutique: '', localite: '', specialite: '',
  })
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [voirMdp, setVoirMdp] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreurGlobal, setErreurGlobal] = useState('')
  const [pieceIdentite, setPieceIdentite] = useState<File | null>(null)
  const [photosOeuvres, setPhotosOeuvres] = useState<File[]>([])
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    if (erreurs[key]) setErreurs(prev => ({ ...prev, [key]: '' }))
  }

  const validerTout = () => {
    const e: Record<string, string> = {}

    e.prenom = validerNom(form.prenom, 'Le prénom')
    e.nom = validerNom(form.nom, 'Le nom')
    e.email = validerEmail(form.email)
    e.telephone = validerTelephone(form.telephone)
    e.password = validerMotDePasse(form.password)

    if (role === 'ARTISAN') {
      if (!form.boutique.trim()) e.boutique = 'Le nom de la boutique est requis.'
      else if (form.boutique.trim().length < 2) e.boutique = 'Nom de boutique trop court (min 2 caractères).'

      if (!form.localite.trim()) e.localite = 'La localité est requise.'

      if (!form.specialite) e.specialite = 'Choisissez une spécialité.'

      if (!pieceIdentite) e.pieceIdentite = 'La pièce d\'identité est obligatoire.'

      if (photosOeuvres.length < 2) e.photosOeuvres = 'Ajoutez au moins 2 photos de vos œuvres.'
    }

    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreurGlobal('')

    const erreursValidation = validerTout()
    const aDesErreurs = Object.values(erreursValidation).some(v => v !== '')
    setErreurs(erreursValidation)
    if (aDesErreurs) return

    setChargement(true)
    try {
      const formData = new FormData()
      Object.entries({ ...form, role }).forEach(([k, v]) => formData.append(k, v))
      if (pieceIdentite) formData.append('pieceIdentite', pieceIdentite)
      photosOeuvres.forEach(f => formData.append('photosOeuvres', f))
      const res = await inscription(formData)
      router.push(`/verification-email?email=${encodeURIComponent(res.data.email)}`)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErreurGlobal(message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setChargement(false)
    }
  }

  const champClasse = (champ: string) =>
    `w-full px-4 py-3 rounded-xl border ${erreurs[champ] ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-creme-fonce bg-creme focus:ring-or/40'} focus:outline-none focus:ring-2 transition-all text-sm`

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">

      {/* ── Panneau gauche — photo & branding (sticky desktop) ── */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <div className="relative w-full h-full">
          {/* Photo de fond */}
          <Image
            src="/images/tata.jpg"
            alt="Artisanat béninois"
            fill
            className="object-cover"
            priority
          />
          {/* Dégradé sombre pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-br from-foret/85 via-foret/60 to-black/50" />

          <div className="absolute inset-0 flex flex-col justify-between p-12">
            {/* Logo */}
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-or-clair">Artisan</span>
              <span className="text-2xl font-bold text-white">Market</span>
            </Link>

            {/* Contenu central */}
            <div>
              <span className="inline-block bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full mb-5 border border-white/20">
                🇧🇯 Plateforme de l&apos;artisanat béninois
              </span>
              <h2 className="text-2xl font-bold text-white mb-3 leading-snug">
                Rejoignez notre communauté d&apos;artisans et de clients
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                Inscription gratuite. Accédez à des centaines de créations authentiques ou vendez vos propres œuvres.
              </p>
              <div className="space-y-3">
                {avantages.map((av, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-or-clair/20 rounded-lg flex items-center justify-center text-or-clair shrink-0">
                      {av.icone}
                    </div>
                    <span className="text-white/80 text-sm">{av.texte}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge bas */}
            <div className="flex items-center gap-3 border-t border-white/20 pt-6">
              <div className="w-10 h-10 bg-or-clair/20 rounded-full flex items-center justify-center text-lg">
                🔒
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                Vos données sont protégées et ne sont jamais partagées avec des tiers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire (scrollable) ── */}
      <div className="px-4 sm:px-8 lg:px-12 py-12 bg-creme flex justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            {/* Logo visible seulement sur mobile */}
            <Link href="/" className="inline-block lg:hidden mb-4">
              <span className="text-3xl font-bold text-or">Artisan</span>
              <span className="text-3xl font-bold text-foret">Market</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
            <p className="text-muted-foreground text-sm mt-1">C&apos;est gratuit et rapide</p>
          </div>

          {/* Choix du rôle */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => setRole('CLIENT')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'CLIENT' ? 'border-or bg-or-pale' : 'border-creme-fonce bg-white hover:border-or/50'}`}>
              <User className={`w-6 h-6 ${role === 'CLIENT' ? 'text-or' : 'text-muted-foreground'}`} />
              <span className={`font-medium text-sm ${role === 'CLIENT' ? 'text-or' : 'text-foreground'}`}>Je suis client</span>
              <span className="text-xs text-muted-foreground text-center">Acheter des produits artisanaux</span>
            </button>
            <button type="button" onClick={() => setRole('ARTISAN')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'ARTISAN' ? 'border-foret bg-foret/10' : 'border-creme-fonce bg-white hover:border-foret/50'}`}>
              <Store className={`w-6 h-6 ${role === 'ARTISAN' ? 'text-foret' : 'text-muted-foreground'}`} />
              <span className={`font-medium text-sm ${role === 'ARTISAN' ? 'text-foret' : 'text-foreground'}`}>Je suis artisan</span>
              <span className="text-xs text-muted-foreground text-center">Vendre mes créations</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-creme-fonce p-8">
            {erreurGlobal && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 border border-red-200">
                {erreurGlobal}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Prénom + Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Prénom *</label>
                  <input type="text" value={form.prenom} onChange={set('prenom')}
                    placeholder="Marie" autoComplete="given-name"
                    className={champClasse('prenom')} />
                  {erreurs.prenom && <p className="text-red-500 text-xs mt-1">{erreurs.prenom}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nom *</label>
                  <input type="text" value={form.nom} onChange={set('nom')}
                    placeholder="Dognon" autoComplete="family-name"
                    className={champClasse('nom')} />
                  {erreurs.nom && <p className="text-red-500 text-xs mt-1">{erreurs.nom}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Adresse email *</label>
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="votre@email.com" autoComplete="email"
                  className={champClasse('email')} />
                {erreurs.email && <p className="text-red-500 text-xs mt-1">{erreurs.email}</p>}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Téléphone <span className="text-muted-foreground font-normal">(optionnel)</span>
                </label>
                <input type="tel" value={form.telephone} onChange={set('telephone')}
                  placeholder="0140202000" autoComplete="tel"
                  className={champClasse('telephone')} />
                {erreurs.telephone
                  ? <p className="text-red-500 text-xs mt-1">{erreurs.telephone}</p>
                  : <p className="text-xs text-muted-foreground mt-1">Format béninois : 0140202000 ou +2290140202000</p>
                }
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <input type={voirMdp ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre" autoComplete="new-password"
                    className={champClasse('password') + ' pr-12'} />
                  <button type="button" onClick={() => setVoirMdp(!voirMdp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded">
                    {voirMdp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {erreurs.password && <p className="text-red-500 text-xs mt-1">{erreurs.password}</p>}
              </div>

              {/* Champs artisan */}
              {role === 'ARTISAN' && (
                <div className="border-t border-creme-fonce pt-4 space-y-4">
                  <p className="text-sm font-semibold text-foret">Informations de votre boutique</p>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Nom de la boutique *</label>
                    <input type="text" value={form.boutique} onChange={set('boutique')}
                      placeholder="Ex: Kanvô de Parakou"
                      className={champClasse('boutique')} />
                    {erreurs.boutique && <p className="text-red-500 text-xs mt-1">{erreurs.boutique}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Localité *</label>
                      <input type="text" value={form.localite} onChange={set('localite')}
                        placeholder="Parakou"
                        className={champClasse('localite')} />
                      {erreurs.localite && <p className="text-red-500 text-xs mt-1">{erreurs.localite}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Spécialité *</label>
                      <select value={form.specialite} onChange={set('specialite')}
                        className={champClasse('specialite')}>
                        <option value="">Choisir...</option>
                        <option value="Kanvô">Kanvô (tisserand)</option>
                        <option value="Couture">Couture traditionnelle</option>
                        <option value="Tenue tricotée">Tenue tricotée / Crochet</option>
                        <option value="Accessoires">Accessoires & bijoux</option>
                        <option value="Mixte">Plusieurs spécialités</option>
                      </select>
                      {erreurs.specialite && <p className="text-red-500 text-xs mt-1">{erreurs.specialite}</p>}
                    </div>
                  </div>

                  {/* Pièce d'identité */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Pièce d&apos;identité valide (CIP, passeport...) *
                    </label>
                    <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${erreurs.pieceIdentite ? 'border-red-400 bg-red-50' : 'border-creme-fonce bg-creme hover:border-foret/50'}`}>
                      <Upload className="w-4 h-4 text-foret shrink-0" />
                      <span className="text-sm text-muted-foreground truncate">
                        {pieceIdentite ? pieceIdentite.name : 'Choisir une photo de votre pièce d\'identité'}
                      </span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => { setPieceIdentite(e.target.files?.[0] || null); setErreurs(p => ({ ...p, pieceIdentite: '' })) }} />
                    </label>
                    {erreurs.pieceIdentite && <p className="text-red-500 text-xs mt-1">{erreurs.pieceIdentite}</p>}
                  </div>

                  {/* Photos des œuvres */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Photos de vos œuvres * <span className="text-muted-foreground font-normal">({photosOeuvres.length}/5 — min. 2)</span>
                    </label>

                    {/* Grille d'aperçus */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {photosOeuvres.map((f, i) => (
                        <div key={i} className="relative h-20 rounded-xl overflow-hidden border border-creme-fonce bg-creme-fonce group">
                          <Image src={URL.createObjectURL(f)} alt={f.name} fill className="object-cover" sizes="(max-width: 640px) 30vw, 200px" />
                          <button
                            type="button"
                            onClick={() => setPhotosOeuvres(p => p.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Bouton ajouter — visible si moins de 5 photos */}
                      {photosOeuvres.length < 5 && (
                        <label className={`h-20 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${erreurs.photosOeuvres ? 'border-red-400 bg-red-50' : 'border-creme-fonce bg-creme hover:border-foret/50'}`}>
                          <Upload className="w-4 h-4 text-foret" />
                          <span className="text-xs text-muted-foreground">Ajouter</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => {
                              const nouvelles = Array.from(e.target.files || [])
                              setPhotosOeuvres(prev => {
                                const cumul = [...prev, ...nouvelles]
                                const uniques = cumul.filter((f, i, arr) => arr.findIndex(x => x.name === f.name) === i)
                                return uniques.slice(0, 5)
                              })
                              setErreurs(p => ({ ...p, photosOeuvres: '' }))
                              e.target.value = ''
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">Cliquez sur + pour ajouter des photos une par une ou plusieurs à la fois.</p>
                    {erreurs.photosOeuvres && <p className="text-red-500 text-xs mt-1">{erreurs.photosOeuvres}</p>}
                  </div>

                  <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200">
                    Votre compte artisan sera activé après validation par notre équipe (24-48h).
                  </div>
                </div>
              )}

              <button type="submit" disabled={chargement}
                className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
                {chargement ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="text-or font-medium hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default function PageInscription() {
  return <Suspense><InscriptionContent /></Suspense>
}
