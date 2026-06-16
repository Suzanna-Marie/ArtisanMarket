'use client'
import ReauthRequis from '@/components/auth/ReauthRequis'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from 'lucide-react'
import { usePanierStore, useAuthStore } from '@/lib/store'
import { passerCommande, simulerPaiement } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import KKiapaySimulateur from '@/components/ui/kkiapay-simulateur'

function WrappedPagePanier() {
  const { articles, retirerArticle, modifierQuantite, viderPanier, total, nbArticles } = usePanierStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const [commandeEnCours, setCommandeEnCours] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const handlePayer = () => {
    if (!user) { router.push('/connexion'); return }
    if (articles.length === 0) return
    setModalVisible(true)
  }

  const handleConfirmerPaiement = async (telephone: string, reseau: string) => {
    setCommandeEnCours(true)
    try {
      const res = await passerCommande({
        articles: articles.map(a => ({ produitId: a.produitId, quantite: a.quantite })),
      })
      const commandeId = res.data.id
      await simulerPaiement(commandeId)
      viderPanier()
      setModalVisible(false)
      toast('Paiement confirmé ! Commande enregistrée.', 'success')
      router.push(`/client/commandes/${commandeId}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast(msg || 'Erreur lors du paiement.', 'error')
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

      {modalVisible && (
        <KKiapaySimulateur
          montant={Math.round(total())}
          onConfirmer={handleConfirmerPaiement}
          onFermer={() => setModalVisible(false)}
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

export default function PagePanier() {
  return <ReauthRequis message="Pour procéder au paiement, confirmez votre identité."><WrappedPagePanier /></ReauthRequis>
}
