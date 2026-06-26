'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, Smartphone, ArrowLeft, Package } from 'lucide-react'
import { usePanierStore, useAuthStore } from '@/lib/store'
import { connexion, passerCommande, simulerPaiement } from '@/lib/api'

type Etape = 'identite' | 'paiement' | 'traitement' | 'succes'
type Reseau = 'MTN' | 'MOOV' | 'CELTIIS'

const RESEAUX: { id: Reseau; label: string; sublabel: string; bg: string; border: string; text: string }[] = [
  { id: 'MTN', label: 'MTN', sublabel: 'Mobile Money', bg: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-900' },
  { id: 'MOOV', label: 'Moov', sublabel: 'Africa Money', bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-white' },
  { id: 'CELTIIS', label: 'Celtiis', sublabel: 'Mobile', bg: 'bg-red-600', border: 'border-red-600', text: 'text-white' },
]

export default function PagePaiement() {
  const { articles, total, viderPanier } = usePanierStore()
  const { user, setAuth } = useAuthStore()
  const router = useRouter()

  const [etape, setEtape] = useState<Etape>('identite')
  const [commandeId, setCommandeId] = useState<number | null>(null)

  // Étape 1 — identité
  const [mdp, setMdp] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [erreurMdp, setErreurMdp] = useState('')
  const [identiteEnCours, setIdentiteEnCours] = useState(false)

  // Étape 2 — paiement
  const [reseau, setReseau] = useState<Reseau | null>(null)
  const [telephone, setTelephone] = useState('')
  const [erreurPaiement, setErreurPaiement] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!user) { router.replace('/connexion'); return }
    // Ne pas rediriger si on est sur la page succès (le panier vient d'être vidé volontairement)
    if (articles.length === 0 && etape !== 'succes') { router.replace('/client/panier'); return }
  }, [user, articles.length, etape, router])

  const totalMontant = total()

  /* ── Étape 1 : confirmation identité ── */
  const handleConfirmerIdentite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mdp.trim()) { setErreurMdp('Entrez votre mot de passe.'); return }
    setIdentiteEnCours(true)
    try {
      const res = await connexion({ email: user?.email, password: mdp })
      setAuth(res.data.user, res.data.token)
      setEtape('paiement')
    } catch {
      setErreurMdp('Mot de passe incorrect. Réessayez.')
    } finally {
      setIdentiteEnCours(false)
    }
  }

  /* ── Étape 2 : paiement KKiaPay ── */
  const handlePayer = async () => {
    if (!reseau) { setErreurPaiement('Choisissez un réseau.'); return }
    if (!/^01[0-9]{8}$/.test(telephone)) { setErreurPaiement('Numéro invalide — 10 chiffres commençant par 01.'); return }
    setErreurPaiement('')
    setEtape('traitement')
    await new Promise(r => setTimeout(r, 3000))

    let cmdId = commandeId
    try {
      if (!cmdId) {
        const res = await passerCommande({
          articles: articles.map(a => ({ produitId: a.produitId, quantite: a.quantite })),
        })
        cmdId = res.data.id
        setCommandeId(cmdId)
      }
      await simulerPaiement(cmdId!)
      setEtape('succes')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setEtape('paiement')
      setErreurPaiement(msg || 'Paiement échoué. Réessayez.')
    }
  }

  /* ── Étape 3 : fermer ── */
  const handleFermer = () => {
    viderPanier()
    router.push('/produits')
  }

  if (!user || articles.length === 0) return null

  /* ── Résumé panier (affiché sur les 2 premières étapes) ── */
  const ResumeCommande = () => (
    <div className="bg-creme/60 border border-creme-fonce rounded-2xl p-4 mb-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Votre commande</p>
      <div className="space-y-2 mb-3">
        {articles.map(a => (
          <div key={a.produitId} className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-creme-fonce shrink-0">
              {a.photo
                ? <Image src={a.photo} alt={a.titre} fill className="object-cover" sizes="40px" />
                : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-1">{a.titre}</p>
              <p className="text-[11px] text-muted-foreground">×{a.quantite}</p>
            </div>
            <p className="text-xs font-semibold shrink-0">{(a.prix * a.quantite).toLocaleString('fr-FR')} F</p>
          </div>
        ))}
      </div>
      <div className="border-t border-creme-fonce pt-3 flex justify-between items-center">
        <span className="text-sm font-semibold">Total</span>
        <span className="text-base font-bold text-or">{totalMontant.toLocaleString('fr-FR')} FCFA</span>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto py-10 px-4">

      {/* Barre d'étapes */}
      {etape !== 'succes' && (
        <div className="flex items-center mb-8">
          {(['identite', 'paiement'] as const).map((s, i) => {
            const actif = etape === s || (etape === 'traitement' && s === 'paiement')
            const fait = (etape === 'paiement' || etape === 'traitement') && s === 'identite'
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${fait ? 'bg-green-500 text-white' : actif ? 'bg-[#2D5016] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {fait ? '✓' : i + 1}
                </div>
                <div className="flex-1 mx-3">
                  <p className={`text-xs font-medium ${actif ? 'text-foreground' : fait ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {s === 'identite' ? 'Confirmer mon identité' : 'Paiement Mobile Money'}
                  </p>
                </div>
                {i < 1 && <div className={`w-8 h-0.5 shrink-0 ${fait ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Étape 1 : Identité ── */}
      {etape === 'identite' && (
        <div className="bg-white rounded-2xl border border-creme-fonce overflow-hidden shadow-sm">
          <div className="bg-[#2D5016] px-6 py-5 flex items-center gap-3">
            <Lock className="w-5 h-5 text-white shrink-0" />
            <div>
              <p className="text-white font-bold">Confirmer votre identité</p>
              <p className="text-white/70 text-xs">Sécurité avant paiement</p>
            </div>
          </div>
          <div className="p-6">
            <ResumeCommande />
            <form onSubmit={handleConfirmerIdentite} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <input
                    type={voirMdp ? 'text' : 'password'}
                    value={mdp}
                    onChange={e => { setMdp(e.target.value); setErreurMdp('') }}
                    placeholder="Votre mot de passe"
                    autoFocus
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-creme-fonce focus:outline-none focus:ring-2 focus:ring-or/40 text-sm bg-white"
                  />
                  <button type="button" onClick={() => setVoirMdp(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {voirMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {erreurMdp && <p className="text-red-500 text-sm mt-1.5">{erreurMdp}</p>}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => router.back()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button type="submit" disabled={identiteEnCours}
                  className="flex-1 bg-[#2D5016] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#2D5016]/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                  {identiteEnCours && <Loader2 className="w-4 h-4 animate-spin" />}
                  {identiteEnCours ? 'Vérification...' : 'Continuer vers le paiement →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Étape 2 : KKiaPay ── */}
      {etape === 'paiement' && (
        <div className="bg-white rounded-2xl border border-creme-fonce overflow-hidden shadow-sm">
          <div className="bg-[#2D5016] px-6 py-5">
            <p className="text-white font-bold">Paiement Mobile Money</p>
            <p className="text-white/70 text-xs">Sécurisé · Instantané · Bénin</p>
          </div>
          <div className="p-6">
            <ResumeCommande />

            {/* Montant */}
            <div className="bg-gradient-to-r from-foret/5 to-or/5 border border-foret/20 rounded-xl p-4 text-center mb-6">
              <p className="text-xs text-gray-500 mb-1">Montant à payer</p>
              <p className="text-3xl font-bold text-foret">{Math.round(totalMontant).toLocaleString('fr-FR')}</p>
              <p className="text-sm text-gray-500 font-medium">FCFA</p>
            </div>

            {/* Choix réseau */}
            <p className="text-sm font-semibold text-gray-700 mb-3">Choisissez votre réseau</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {RESEAUX.map(r => (
                <button key={r.id} onClick={() => { setReseau(r.id); setErreurPaiement('') }}
                  className={`relative rounded-2xl py-4 px-2 flex flex-col items-center gap-1.5 transition-all border-2 ${
                    reseau === r.id ? `${r.bg} ${r.border} scale-105 shadow-lg` : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reseau === r.id ? 'bg-white/20' : r.bg}`}>
                    <span className={`text-xs font-black ${reseau === r.id ? r.text : 'text-white'}`}>
                      {r.id === 'MTN' ? 'M' : r.id === 'MOOV' ? 'Mv' : 'C'}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${reseau === r.id ? r.text : 'text-gray-700'}`}>{r.label}</span>
                  <span className={`text-[10px] text-center ${reseau === r.id ? `${r.text} opacity-80` : 'text-gray-400'}`}>{r.sublabel}</span>
                  {reseau === r.id && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Numéro */}
            <p className="text-sm font-semibold text-gray-700 mb-2">Numéro de téléphone</p>
            <div className={`flex items-center border-2 rounded-xl overflow-hidden mb-1 transition-colors ${reseau ? RESEAUX.find(r => r.id === reseau)?.border : 'border-gray-200'}`}>
              <div className={`px-3 py-3 border-r-2 ${reseau ? `${RESEAUX.find(r => r.id === reseau)?.bg} border-white/30` : 'bg-gray-50 border-gray-200'}`}>
                <Smartphone className={`w-4 h-4 ${reseau ? RESEAUX.find(r => r.id === reseau)?.text : 'text-gray-400'}`} />
              </div>
              <input
                type="tel"
                placeholder="ex: 0196000000"
                value={telephone}
                onChange={e => { setTelephone(e.target.value.replace(/\D/g, '')); setErreurPaiement('') }}
                maxLength={10}
                className="flex-1 px-3 py-3 text-sm outline-none bg-white"
              />
              <span className="px-3 text-xs text-gray-400 font-medium">+229</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">10 chiffres commençant par 01</p>

            {erreurPaiement && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                <p className="text-xs text-red-500">{erreurPaiement}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setEtape('identite')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handlePayer}
                disabled={!reseau || !/^01[0-9]{8}$/.test(telephone)}
                className="flex-1 bg-[#2D5016] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#2D5016]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                Payer {Math.round(totalMontant).toLocaleString('fr-FR')} FCFA
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">🔒 Paiement sécurisé par KKiaPay</p>
          </div>
        </div>
      )}

      {/* ── Traitement en cours ── */}
      {etape === 'traitement' && (
        <div className="bg-white rounded-2xl border border-creme-fonce p-10 text-center shadow-sm">
          <div className="w-20 h-20 bg-foret/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-10 h-10 text-[#2D5016] animate-spin" />
          </div>
          <p className="font-bold text-gray-800 text-lg mb-2">Traitement en cours...</p>
          <p className="text-sm text-gray-500">Un code USSD a été envoyé sur votre téléphone.</p>
          <p className="text-xs text-gray-400 mt-1">Entrez votre PIN pour confirmer.</p>
        </div>
      )}

      {/* ── Succès ── */}
      {etape === 'succes' && (
        <div className="bg-white rounded-2xl border border-creme-fonce overflow-hidden shadow-sm">
          <div className="bg-green-500 px-6 py-5 text-center">
            <CheckCircle className="w-10 h-10 text-white mx-auto mb-2" />
            <p className="text-white font-bold text-xl">Paiement confirmé !</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-1">Votre commande a bien été enregistrée.</p>
            <p className="text-gray-500 text-sm mb-2">Référence : <span className="font-semibold text-foret">#{commandeId}</span></p>
            <p className="text-gray-400 text-xs mb-8">L&apos;artisan va préparer votre commande. Vous serez notifié à chaque étape.</p>

            <div className="flex flex-col gap-3">
              <button onClick={handleFermer}
                className="w-full bg-[#2D5016] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#2D5016]/90 transition-colors">
                Fermer
              </button>
              <button onClick={() => { viderPanier(); router.push(`/client/commandes/${commandeId}`) }}
                className="w-full py-3 rounded-xl border border-foret text-foret font-medium text-sm hover:bg-foret/5 transition-colors">
                Voir ma commande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
