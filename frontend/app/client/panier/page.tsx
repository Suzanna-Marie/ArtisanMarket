'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package, Lock, Eye, EyeOff, Loader2, X } from 'lucide-react'
import { usePanierStore, useAuthStore } from '@/lib/store'
import { passerCommande, simulerPaiement, connexion } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import KKiapaySimulateur from '@/components/ui/kkiapay-simulateur'

const REAUTH_KEY = 'reauth_ts'
const REAUTH_DUREE = 30 * 60 * 1000 // 30 minutes

type Etape = 'idle' | 'reauth' | 'paiement'

export default function PagePanier() {
  const { articles, retirerArticle, modifierQuantite, viderPanier, total, nbArticles } = usePanierStore()
  const { user, setAuth } = useAuthStore()
  const router = useRouter()

  const [etape, setEtape] = useState<Etape>('idle')
  const [commandeEnCours, setCommandeEnCours] = useState(false)

  // Champs re-auth
  const [mdp, setMdp] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [erreurMdp, setErreurMdp] = useState('')
  const [reauthEnCours, setReauthEnCours] = useState(false)

  const fermerModal = () => {
    setEtape('idle')
    setMdp('')
    setErreurMdp('')
    setVoirMdp(false)
  }

  const handlePayer = () => {
    if (!user) { router.push('/connexion'); return }
    if (articles.length === 0) return
    // Vérifier si l'utilisateur s'est ré-authentifié récemment
    const ts = sessionStorage.getItem(REAUTH_KEY)
    if (ts && Date.now() - Number(ts) < REAUTH_DUREE) {
      setEtape('paiement')
    } else {
      setEtape('reauth')
    }
  }

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mdp.trim()) { setErreurMdp('Entrez votre mot de passe.'); return }
    setReauthEnCours(true)
    try {
      const res = await connexion({ email: user?.email, password: mdp })
      setAuth(res.data.user, res.data.token)
      sessionStorage.setItem(REAUTH_KEY, Date.now().toString())
      setMdp('')
      setErreurMdp('')
      setVoirMdp(false)
      setEtape('paiement')
    } catch {
      setErreurMdp('Mot de passe incorrect. Réessayez.')
    } finally {
      setReauthEnCours(false)
    }
  }

  const handleConfirmerPaiement = async (telephone: string, reseau: string) => {
    setCommandeEnCours(true)
    let commandeId: number | null = null
    try {
      const res = await passerCommande({
        articles: articles.map(a => ({ produitId: a.produitId, quantite: a.quantite })),
      })
      commandeId = res.data.id
      await simulerPaiement(commandeId)
      viderPanier()
      fermerModal()
      toast('Paiement confirmé ! Commande enregistrée.', 'success')
      router.push(`/client/commandes/${commandeId}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast(msg || 'Erreur lors du paiement.', 'error')
      if (commandeId) {
        viderPanier()
        fermerModal()
        router.push(`/client/commandes/${commandeId}`)
      } else {
        throw err
      }
    } finally {
      setCommandeEnCours(false)
    }
  }

  if (articles.length === 0) return (
    <div className="max-w-2xl mx-auto py-14 text-center">
      <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Votre panier est vide</h2>
      <p className="text-muted-foreground text-sm mb-6">Découvrez nos produits artisanaux</p>
      <Link href="/produits" className="btn-primaire inline-flex items-center gap-2">
        Explorer le catalogue <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">

      {/* Modal re-authentification */}
      {etape === 'reauth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-[#2D5016] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-white" />
                <div>
                  <p className="text-white font-bold text-base">Confirmez votre identité</p>
                  <p className="text-white/70 text-xs">Sécurité avant paiement</p>
                </div>
              </div>
              <button onClick={fermerModal} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Pour procéder au paiement, confirmez votre mot de passe.
              </p>
              <form onSubmit={handleReauth} className="space-y-4">
                <div className="relative">
                  <input
                    type={voirMdp ? 'text' : 'password'}
                    value={mdp}
                    onChange={e => { setMdp(e.target.value); setErreurMdp('') }}
                    placeholder="Votre mot de passe"
                    autoFocus
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm"
                  />
                  <button type="button" onClick={() => setVoirMdp(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {voirMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {erreurMdp && <p className="text-red-500 text-sm text-center">{erreurMdp}</p>}
                <button type="submit" disabled={reauthEnCours}
                  className="w-full bg-[#2D5016] text-white rounded-xl py-3 font-bold text-sm hover:bg-[#2D5016]/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {reauthEnCours && <Loader2 className="w-4 h-4 animate-spin" />}
                  {reauthEnCours ? 'Vérification...' : 'Confirmer et payer'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal paiement KKiaPay */}
      {etape === 'paiement' && (
        <KKiapaySimulateur
          montant={Math.round(total())}
          onConfirmer={handleConfirmerPaiement}
          onFermer={fermerModal}
        />
      )}

      <h1 className="text-2xl font-bold mb-6">Mon panier <span className="text-muted-foreground text-lg font-normal">({nbArticles()} article{nbArticles() > 1 ? 's' : ''})</span></h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Articles */}
        <div className="lg:col-span-2 space-y-3">
          {articles.map(article => (
            <div key={article.produitId} className="bg-white rounded-2xl border border-creme-fonce p-4 flex gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-creme-fonce">
                {article.photo ? (
                  <Image src={article.photo} alt={article.titre} fill className="object-cover" sizes="80px" />
                ) : <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package className="w-6 h-6 text-gray-200" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{article.titre}</p>
                <p className="text-xs text-muted-foreground">{article.artisanNom}</p>
                <p className="font-bold text-or mt-1">{Number(article.prix).toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => retirerArticle(article.produitId)} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center border border-creme-fonce rounded-xl overflow-hidden">
                  <button onClick={() => article.quantite > 1 ? modifierQuantite(article.produitId, article.quantite - 1) : retirerArticle(article.produitId)}
                    className="p-1.5 hover:bg-gray-100 transition-colors"><Minus className="w-3 h-3" /></button>
                  <span className="px-3 text-sm font-medium">{article.quantite}</span>
                  <button onClick={() => modifierQuantite(article.produitId, article.quantite + 1)}
                    className="p-1.5 hover:bg-gray-100 transition-colors"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-creme-fonce p-6 sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Récapitulatif</h2>
            <div className="space-y-2 mb-4">
              {articles.map(a => (
                <div key={a.produitId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">{a.titre} ×{a.quantite}</span>
                  <span className="shrink-0">{(a.prix * a.quantite).toLocaleString('fr-FR')} F</span>
                </div>
              ))}
            </div>
            <div className="border-t border-creme-fonce pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-or">{total().toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
            <button
              onClick={handlePayer}
              disabled={commandeEnCours}
              className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {commandeEnCours ? 'Paiement en cours...' : 'Payer avec Mobile Money'}
            </button>
            <p className="text-xs text-center text-muted-foreground mt-3">MTN · Moov · Celtiis — sécurisé par KKiaPay</p>
          </div>
        </div>
      </div>
    </div>
  )
}
