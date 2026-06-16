'use client'
import ReauthRequis from '@/components/auth/ReauthRequis'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { mesCommandesArtisan, mettreAJourStatut, proposerDevis } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { ChevronDown, ChevronUp, Send, Package } from 'lucide-react'

const STATUTS_SUIVANTS: Record<string, string> = {
  RECUE: 'EN_PREPARATION', EN_PREPARATION: 'PRETE', PRETE: 'EN_LIVRAISON', EN_LIVRAISON: 'LIVREE',
}
const LABEL: Record<string, string> = {
  RECUE: 'Reçue', EN_PREPARATION: 'En préparation', PRETE: 'Prête', EN_LIVRAISON: 'En livraison', LIVREE: 'Livrée',
}
const COULEUR: Record<string, string> = {
  RECUE: 'bg-blue-100 text-blue-700', EN_PREPARATION: 'bg-amber-100 text-amber-700',
  PRETE: 'bg-purple-100 text-purple-700', EN_LIVRAISON: 'bg-orange-100 text-orange-700', LIVREE: 'bg-green-100 text-green-700',
}
const DEVIS_LABEL: Record<string, string> = {
  EN_ATTENTE: 'Devis à envoyer', ENVOYE: 'Devis envoyé', ACCEPTE: 'Devis accepté', REFUSE: 'Devis refusé',
}
const DEVIS_COULEUR: Record<string, string> = {
  EN_ATTENTE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ENVOYE: 'bg-blue-50 text-blue-700 border-blue-200',
  ACCEPTE: 'bg-green-50 text-green-700 border-green-200',
  REFUSE: 'bg-red-50 text-red-700 border-red-200',
}

interface DetailsMesure {
  description?: string; couleur?: string; taille?: string; motif?: string
  quantite?: number; delaiSouhaite?: string; photoReference?: string
}

function WrappedCommandesArtisan() {
  const [commandes, setCommandes] = useState<Record<string, unknown>[]>([])
  const [chargement, setChargement] = useState(true)
  const [commandeOuverte, setCommandeOuverte] = useState<number | null>(null)
  const [devisForms, setDevisForms] = useState<Record<number, { prix: string; message: string }>>({})
  const [envoi, setEnvoi] = useState<number | null>(null)

  const charger = () => mesCommandesArtisan().then(r => setCommandes(r.data)).finally(() => setChargement(false))
  useEffect(() => { charger() }, [])

  const avancer = async (id: number, statutSuivant: string) => {
    await mettreAJourStatut(id, statutSuivant)
    toast(`Statut mis à jour : ${LABEL[statutSuivant]}`, 'success')
    charger()
  }

  const handleEnvoyerDevis = async (id: number) => {
    const form = devisForms[id]
    if (!form?.prix || Number(form.prix) <= 0) { toast('Entrez un prix valide.', 'error'); return }
    setEnvoi(id)
    try {
      await proposerDevis(id, Number(form.prix), form.message)
      toast('Devis envoyé au client !', 'success')
      charger()
    } catch {
      toast('Erreur lors de l\'envoi du devis.', 'error')
    } finally {
      setEnvoi(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Commandes reçues</h1>
      {chargement ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : commandes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-creme-fonce">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold">Aucune commande pour le moment</p>
        </div>
      ) : (
        commandes.map(cmd => {
          const id = cmd.id as number
          const client = cmd.client as { nom: string; prenom: string; telephone?: string }
          const articles = cmd.articles as { produit: { titre: string }; quantite: number }[]
          const surMesure = cmd.surMesure as boolean
          const devisStatut = (cmd.devisStatut as string) || 'EN_ATTENTE'
          const devisPrix = cmd.devisPrix as number | null
          const suivant = STATUTS_SUIVANTS[cmd.statut as string]
          const details = cmd.detailsMesure as DetailsMesure | null
          const estOuverte = commandeOuverte === id
          const form = devisForms[id] || { prix: '', message: '' }

          return (
            <div key={id} className="bg-white rounded-2xl border border-creme-fonce overflow-hidden">
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold">Commande #{id}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${COULEUR[cmd.statut as string] || 'bg-gray-100 text-gray-600'}`}>
                      {LABEL[cmd.statut as string] || String(cmd.statut)}
                    </span>
                    {/* Statut paiement */}
                    {cmd.paiementStatut === 'paye' && cmd.fondsLiberes ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                        Fonds reçus
                      </span>
                    ) : cmd.paiementStatut === 'paye' && cmd.statut === 'LIVREE' ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-700">
                        En attente confirmation client
                      </span>
                    ) : cmd.paiementStatut === 'paye' ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                        Paiement reçu
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
                        Paiement en attente
                      </span>
                    )}
                    {surMesure && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${DEVIS_COULEUR[devisStatut]}`}>
                        {DEVIS_LABEL[devisStatut]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {client?.prenom} {client?.nom} {client?.telephone && `· ${client.telephone}`}
                  </p>
                  {!surMesure && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {articles?.map(a => `${a.produit.titre} ×${a.quantite}`).join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(cmd.createdAt as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' à '}
                    {new Date(cmd.createdAt as string).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-bold text-or">
                    {Number(cmd.total) > 0 ? `${Number(cmd.total).toLocaleString('fr-FR')} FCFA` : 'Prix à définir'}
                  </p>
                  <div className="flex gap-2">
                    {!surMesure && suivant && (
                      <button onClick={() => avancer(id, suivant)}
                        className="text-xs bg-foret text-white px-3 py-1.5 rounded-lg hover:bg-foret/90 transition-colors">
                        → {LABEL[suivant]}
                      </button>
                    )}
                    {surMesure && (
                      <button onClick={() => setCommandeOuverte(estOuverte ? null : id)}
                        className="text-xs border border-foret text-foret px-3 py-1.5 rounded-lg hover:bg-foret/5 transition-colors flex items-center gap-1">
                        {estOuverte ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        Détails
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {surMesure && estOuverte && (
                <div className="border-t border-creme-fonce p-5 space-y-4 bg-gray-50">
                  {details && (
                    <div>
                      <p className="text-sm font-semibold mb-3">Demande du client</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-white rounded-xl p-4 border border-creme-fonce">
                        {details.description && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Description</p>
                            <p>{details.description}</p>
                          </div>
                        )}
                        {details.couleur && <div><p className="text-xs font-medium text-muted-foreground mb-0.5">Couleur</p><p>{details.couleur}</p></div>}
                        {details.taille && <div><p className="text-xs font-medium text-muted-foreground mb-0.5">Taille</p><p>{details.taille}</p></div>}
                        {details.motif && <div><p className="text-xs font-medium text-muted-foreground mb-0.5">Motif</p><p>{details.motif}</p></div>}
                        {details.quantite && <div><p className="text-xs font-medium text-muted-foreground mb-0.5">Quantité</p><p>{details.quantite}</p></div>}
                        {details.delaiSouhaite && <div className="col-span-2"><p className="text-xs font-medium text-muted-foreground mb-0.5">Délai souhaité</p><p>{details.delaiSouhaite}</p></div>}
                        {details.photoReference && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Photo de référence</p>
                            <a href={details.photoReference} target="_blank" rel="noopener noreferrer">
                              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-creme-fonce">
                                <Image src={details.photoReference} alt="Référence" fill className="object-cover" sizes="112px" />
                              </div>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {devisStatut === 'EN_ATTENTE' && (
                    <div className="bg-white rounded-xl border border-creme-fonce p-4 space-y-3">
                      <p className="text-sm font-semibold">Proposer un devis</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Prix (FCFA) *</label>
                          <input type="number" value={form.prix}
                            onChange={e => setDevisForms(f => ({ ...f, [id]: { ...form, prix: e.target.value } }))}
                            placeholder="Ex: 15000"
                            className="w-full px-3 py-2 rounded-lg border border-creme-fonce bg-creme text-sm focus:outline-none focus:ring-2 focus:ring-foret/30" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Message (optionnel)</label>
                          <input type="text" value={form.message}
                            onChange={e => setDevisForms(f => ({ ...f, [id]: { ...form, message: e.target.value } }))}
                            placeholder="Délai de réalisation..."
                            className="w-full px-3 py-2 rounded-lg border border-creme-fonce bg-creme text-sm focus:outline-none focus:ring-2 focus:ring-foret/30" />
                        </div>
                      </div>
                      <button onClick={() => handleEnvoyerDevis(id)} disabled={envoi === id || !form.prix}
                        className="w-full bg-foret text-white rounded-lg py-2.5 text-sm font-medium hover:bg-foret/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                        <Send className="w-4 h-4" />
                        {envoi === id ? 'Envoi...' : 'Envoyer le devis au client'}
                      </button>
                    </div>
                  )}

                  {devisStatut === 'ENVOYE' && devisPrix && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm font-medium text-blue-800">Devis envoyé — en attente de réponse du client</p>
                      <p className="text-xl font-bold text-blue-900 mt-1">{Number(devisPrix).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  )}

                  {devisStatut === 'ACCEPTE' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-green-800">Devis accepté — préparez la commande</p>
                      {suivant && (
                        <button onClick={() => avancer(id, suivant)}
                          className="w-full bg-foret text-white rounded-lg py-2.5 text-sm font-medium hover:bg-foret/90 transition-colors">
                          → Passer à : {LABEL[suivant]}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default function CommandesArtisan() {
  return <ReauthRequis message="Pour consulter vos commandes, confirmez votre identité."><WrappedCommandesArtisan /></ReauthRequis>
}
