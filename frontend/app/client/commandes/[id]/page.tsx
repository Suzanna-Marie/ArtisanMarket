'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, ThumbsUp, ThumbsDown, CreditCard, AlertTriangle, Package } from 'lucide-react'
import { obtenirCommande, repondreDevis, verifierPaiement, simulerPaiement, ouvrirLitige, confirmerReception } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/components/ui/toaster'
import KKiapaySimulateur from '@/components/ui/kkiapay-simulateur'

declare global {
  interface Window {
    openKkiapayWidget: (options: Record<string, unknown>) => void
    addSuccessListener: (fn: (response: { transactionId: string }) => void) => void
    addFailedListener: (fn: (response: unknown) => void) => void
  }
}

const ETAPES = [
  { statut: 'RECUE', label: 'Commande reçue' },
  { statut: 'EN_PREPARATION', label: 'En préparation' },
  { statut: 'PRETE', label: 'Prête' },
  { statut: 'EN_LIVRAISON', label: 'En livraison' },
  { statut: 'LIVREE', label: 'Livrée' },
]

const LABEL_DEVIS: Record<string, string> = {
  EN_ATTENTE: 'En attente de devis', ENVOYE: 'Devis reçu', ACCEPTE: 'Devis accepté', REFUSE: 'Devis refusé',
}
const COULEUR_DEVIS: Record<string, string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700', ENVOYE: 'bg-blue-100 text-blue-700',
  ACCEPTE: 'bg-green-100 text-green-700', REFUSE: 'bg-red-100 text-red-700',
}

interface DetailsMesure {
  description?: string; couleur?: string; taille?: string; motif?: string
  quantite?: number; delaiSouhaite?: string; photoReference?: string
}

interface Commande {
  id: number; statut: string; total: number; surMesure: boolean
  devisStatut?: string; devisPrix?: number; devisMessage?: string
  detailsMesure?: DetailsMesure; paiementStatut?: string; receptionConfirmee?: boolean
  createdAt: string; updatedAt: string
  articles: { produit: { titre: string; photos: string[] }; quantite: number; prixUnitaire: number }[]
}

export default function DetailCommande() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [commande, setCommande] = useState<Commande | null>(null)
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [showLitige, setShowLitige] = useState(false)
  const [modalPaiement, setModalPaiement] = useState(false)
  const [litigeForm, setLitigeForm] = useState({ motif: '', description: '' })
  const [litigeEnvoi, setLitigeEnvoi] = useState(false)

  const charger = () => obtenirCommande(Number(id)).then(r => setCommande(r.data)).finally(() => setChargement(false))

  useEffect(() => { charger() }, [id])

  const handleConfirmerPaiement = async () => {
    if (!commande) return
    await simulerPaiement(commande.id)
    charger()
  }

  const handleConfirmerReception = async () => {
    setEnvoi(true)
    try {
      await confirmerReception(Number(id))
      toast('Réception confirmée ! Les fonds ont été envoyés à l\'artisan.', 'success')
      charger()
    } catch {
      toast('Erreur, réessayez.', 'error')
    } finally {
      setEnvoi(false)
    }
  }

  const handleRepondreDevis = async (accepte: boolean) => {
    setEnvoi(true)
    try {
      await repondreDevis(Number(id), accepte)
      toast(accepte ? 'Devis accepté ! Procédez au paiement.' : 'Devis refusé.', accepte ? 'success' : 'info')
      charger()
    } catch {
      toast('Erreur, réessayez.', 'error')
    } finally {
      setEnvoi(false)
    }
  }

  const handlePayer = () => {
    if (!commande || !user) return

    const ouvrirWidget = () => {
      window.openKkiapayWidget({
        amount: Math.round(Number(commande.devisPrix || commande.total)),
        api_key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
        sandbox: false,
        name: 'ArtisanMarket',
        phone: user.telephone || '',
      })
      window.addSuccessListener(async (response) => {
        try {
          await verifierPaiement(commande.id, response.transactionId)
          toast('Paiement confirmé !', 'success')
          charger()
        } catch {
          toast('Erreur lors de la vérification du paiement.', 'error')
        }
      })
      window.addFailedListener(() => toast('Paiement échoué ou annulé.', 'error'))
    }

    if (window.openKkiapayWidget) {
      ouvrirWidget()
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdn.kkiapay.me/k.js'
      script.onload = ouvrirWidget
      document.body.appendChild(script)
    }
  }

  if (chargement) return <div className="max-w-3xl mx-auto"><div className="skeleton h-64 rounded-2xl" /></div>
  if (!commande) return null

  const montantAPayer = Number(commande.devisPrix || commande.total)

  const etapeActive = ETAPES.findIndex(e => e.statut === commande.statut)
  const details = commande.detailsMesure

  return (
    <div className="max-w-3xl mx-auto">
      {modalPaiement && (
        <KKiapaySimulateur
          montant={montantAPayer}
          onConfirmer={handleConfirmerPaiement}
          onFermer={() => setModalPaiement(false)}
        />
      )}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="flex flex-wrap items-start justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Commande #{commande.id}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Passée le {new Date(commande.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            {' à '}
            {new Date(commande.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {commande.surMesure && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium mt-2 inline-block ${COULEUR_DEVIS[commande.devisStatut || 'EN_ATTENTE']}`}>
              {LABEL_DEVIS[commande.devisStatut || 'EN_ATTENTE']}
            </span>
          )}
        </div>
        <span className="font-bold text-or text-lg md:text-xl shrink-0">
          {Number(commande.devisPrix || commande.total) > 0
            ? `${Number(commande.devisPrix || commande.total).toLocaleString('fr-FR')} FCFA`
            : 'Prix en attente'}
        </span>
      </div>

      {/* Suivi */}
      {(!commande.surMesure || commande.devisStatut === 'ACCEPTE') && (
        <div className="bg-white rounded-2xl border border-creme-fonce p-4 md:p-6 mb-5">
          <h2 className="font-semibold mb-5">Suivi de commande</h2>
          {/* Desktop : horizontal */}
          <div className="hidden md:block relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-creme-fonce" />
            <div className="absolute top-5 left-5 h-0.5 bg-or transition-all duration-500"
              style={{ width: etapeActive >= 0 ? `${(etapeActive / (ETAPES.length - 1)) * 100}%` : '0%' }} />
            <div className="relative flex justify-between">
              {ETAPES.map((etape, i) => (
                <div key={etape.statut} className="flex flex-col items-center gap-2" style={{ width: `${100 / ETAPES.length}%` }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${i <= etapeActive ? 'bg-or text-white' : 'bg-white border-2 border-creme-fonce text-muted-foreground'}`}>
                    {i < etapeActive ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <span className={`text-xs text-center leading-tight ${i <= etapeActive ? 'font-semibold text-or' : 'text-muted-foreground'}`}>
                    {etape.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile : vertical */}
          <div className="md:hidden space-y-2">
            {ETAPES.map((etape, i) => (
              <div key={etape.statut} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${i <= etapeActive ? 'bg-or text-white' : 'bg-creme-fonce text-muted-foreground'}`}>
                  {i < etapeActive ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <span className={`text-sm ${i <= etapeActive ? 'font-semibold text-or' : 'text-muted-foreground'}`}>
                  {etape.label}
                </span>
                {i === etapeActive && <span className="text-xs bg-or/10 text-or px-2 py-0.5 rounded-full font-medium">En cours</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paiement en attente — commande classique non encore payée */}
      {!commande.surMesure && commande.paiementStatut === 'en_attente' && (
        <div className="bg-white rounded-2xl border border-or/40 p-5 mb-5 space-y-3">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-or shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Paiement en attente</p>
              <p className="text-xs text-muted-foreground mt-0.5">Votre commande est enregistrée mais le paiement n&apos;a pas encore été effectué.</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-or">{Number(commande.total).toLocaleString('fr-FR')} FCFA</p>
          <button onClick={() => setModalPaiement(true)}
            className="w-full bg-or text-white rounded-xl py-3 font-semibold hover:bg-or/90 transition-colors flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" /> Payer avec Mobile Money
          </button>
        </div>
      )}

      {/* Bloc devis pour commande sur mesure */}
      {commande.surMesure && (
        <div className="bg-white rounded-2xl border border-creme-fonce p-6 mb-5 space-y-4">
          <h2 className="font-semibold">Votre demande sur mesure</h2>

          {details && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-4">
              {details.description && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Description</p>
                  <p>{details.description}</p>
                </div>
              )}
              {details.couleur && <div><p className="text-xs font-medium text-muted-foreground mb-0.5">Couleur</p><p>{details.couleur}</p></div>}
              {details.taille && <div><p className="text-xs font-medium text-muted-foreground mb-0.5">Taille</p><p>{details.taille}</p></div>}
              {details.motif && <div><p className="text-xs font-medium text-muted-foreground mb-0.5">Motif</p><p>{details.motif}</p></div>}
              {details.delaiSouhaite && <div className="col-span-2"><p className="text-xs font-medium text-muted-foreground mb-0.5">Délai souhaité</p><p>{details.delaiSouhaite}</p></div>}
              {details.photoReference && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Photo de référence</p>
                  <a href={details.photoReference} target="_blank" rel="noopener noreferrer">
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-creme-fonce">
                      <Image src={details.photoReference} alt="Référence" fill className="object-cover" sizes="128px" />
                    </div>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Devis reçu → accepter ou refuser */}
          {commande.devisStatut === 'ENVOYE' && commande.devisPrix && (
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
              <p className="text-sm font-semibold text-blue-800">Devis proposé par l&apos;artisan</p>
              <p className="text-2xl font-bold text-blue-900">{Number(commande.devisPrix).toLocaleString('fr-FR')} FCFA</p>
              {commande.devisMessage && <p className="text-sm text-blue-700">{commande.devisMessage}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => handleRepondreDevis(false)} disabled={envoi}
                  className="flex-1 border border-red-300 text-red-600 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  <ThumbsDown className="w-4 h-4" /> Refuser
                </button>
                <button onClick={() => handleRepondreDevis(true)} disabled={envoi}
                  className="flex-1 bg-foret text-white rounded-xl py-2.5 text-sm font-medium hover:bg-foret/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  <ThumbsUp className="w-4 h-4" /> Accepter le devis
                </button>
              </div>
            </div>
          )}

          {/* Devis accepté → payer */}
          {commande.devisStatut === 'ACCEPTE' && commande.paiementStatut === 'en_attente' && (
            <div className="border border-green-200 rounded-xl p-4 bg-green-50 space-y-3">
              <p className="text-sm font-semibold text-green-800">Devis accepté — procédez au paiement</p>
              <p className="text-2xl font-bold text-green-900">{Number(commande.devisPrix).toLocaleString('fr-FR')} FCFA</p>
              <button onClick={() => setModalPaiement(true)}
                className="w-full bg-or text-white rounded-xl py-3 font-semibold hover:bg-or/90 transition-colors flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" /> Payer avec Mobile Money
              </button>
            </div>
          )}

          {commande.devisStatut === 'EN_ATTENTE' && (
            <p className="text-sm text-muted-foreground text-center py-2">
              En attente du devis de l&apos;artisan...
            </p>
          )}

          {commande.devisStatut === 'REFUSE' && (
            <p className="text-sm text-red-600 text-center py-2">Vous avez refusé ce devis.</p>
          )}
        </div>
      )}

      {/* Confirmer la réception */}
      {commande.statut === 'LIVREE' && commande.paiementStatut === 'paye' && !commande.receptionConfirmee && (
        <div className="bg-white rounded-2xl border border-foret/30 p-5 space-y-3">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Avez-vous bien reçu votre commande ?</p>
            <p className="text-xs text-muted-foreground mt-1">En confirmant la réception, vous autorisez le versement des fonds à l&apos;artisan.</p>
          </div>
          <button onClick={handleConfirmerReception} disabled={envoi}
            className="w-full bg-foret text-white rounded-xl py-3 font-semibold text-sm hover:bg-foret/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            <Check className="w-4 h-4" />
            {envoi ? 'Confirmation...' : 'Confirmer la réception'}
          </button>
        </div>
      )}

      {commande.statut === 'LIVREE' && commande.receptionConfirmee && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm text-green-800 font-medium">Réception confirmée — fonds débloqués pour l&apos;artisan.</p>
            <p className="text-xs text-green-700 mt-0.5">
              Le {new Date(commande.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' à '}
              {new Date(commande.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )}

      {/* Signaler un problème */}
      {['EN_PREPARATION', 'PRETE', 'EN_LIVRAISON', 'LIVREE'].includes(commande.statut) && (
        <div className="bg-white rounded-2xl border border-creme-fonce p-5">
          <button onClick={() => setShowLitige(v => !v)}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors font-medium">
            <AlertTriangle className="w-4 h-4" />
            Signaler un problème avec cette commande
          </button>

          {showLitige && (
            <form onSubmit={async e => {
              e.preventDefault()
              if (!litigeForm.motif || !litigeForm.description) {
                toast('Motif et description sont requis.', 'error'); return
              }
              setLitigeEnvoi(true)
              try {
                await ouvrirLitige({ commandeId: commande.id, ...litigeForm })
                toast('Litige ouvert. Notre équipe va examiner votre demande.', 'success')
                setShowLitige(false)
                setLitigeForm({ motif: '', description: '' })
              } catch (err: unknown) {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                toast(msg || 'Erreur lors de l\'ouverture du litige.', 'error')
              } finally { setLitigeEnvoi(false) }
            }} className="mt-4 space-y-3 border-t border-creme-fonce pt-4">
              <select value={litigeForm.motif} onChange={e => setLitigeForm(f => ({ ...f, motif: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-creme-fonce bg-creme text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                <option value="">Choisir un motif...</option>
                {['Produit non conforme', 'Produit non reçu', 'Qualité insuffisante', 'Commande sur mesure incorrecte', 'Autre'].map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <textarea value={litigeForm.description} onChange={e => setLitigeForm(f => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Décrivez le problème en détail..."
                className="w-full px-4 py-2.5 rounded-xl border border-creme-fonce bg-creme text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
              <button type="submit" disabled={litigeEnvoi}
                className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
                {litigeEnvoi ? 'Envoi...' : 'Confirmer le litige'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Articles commande standard */}
      {!commande.surMesure && commande.articles?.length > 0 && (
        <div className="bg-white rounded-2xl border border-creme-fonce p-6">
          <h2 className="font-semibold mb-4">Articles commandés</h2>
          <div className="space-y-3">
            {commande.articles.map((article, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-creme-fonce last:border-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-creme-fonce shrink-0">
                  {article.produit.photos?.[0] ? (
                    <Image src={article.produit.photos[0]} alt={article.produit.titre} fill className="object-cover" sizes="56px" />
                  ) : <div className="w-full h-full flex items-center justify-center bg-gray-50"><Package className="w-6 h-6 text-gray-200" /></div>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{article.produit.titre}</p>
                  <p className="text-xs text-muted-foreground">Quantité : {article.quantite}</p>
                </div>
                <span className="font-semibold text-sm">{(Number(article.prixUnitaire) * article.quantite).toLocaleString('fr-FR')} FCFA</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
