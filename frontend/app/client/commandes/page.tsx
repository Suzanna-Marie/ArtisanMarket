'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ChevronRight, Ruler, Check, RefreshCw, AlertTriangle } from 'lucide-react'
import { mesCommandes, confirmerReception } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

const STATUTS: Record<string, { label: string; couleur: string }> = {
  RECUE:          { label: 'Reçue',          couleur: 'bg-blue-100 text-blue-700' },
  EN_PREPARATION: { label: 'En préparation', couleur: 'bg-amber-100 text-amber-700' },
  PRETE:          { label: 'Prête',          couleur: 'bg-purple-100 text-purple-700' },
  EN_LIVRAISON:   { label: 'En livraison',   couleur: 'bg-orange-100 text-orange-700' },
  LIVREE:         { label: 'Livrée',         couleur: 'bg-green-100 text-green-700' },
  ANNULEE:        { label: 'Annulée',        couleur: 'bg-red-100 text-red-700' },
}

const DEVIS_BADGE: Record<string, { label: string; couleur: string }> = {
  EN_ATTENTE: { label: 'Devis en attente',  couleur: 'bg-gray-100 text-gray-600' },
  ENVOYE:     { label: 'Devis reçu !',      couleur: 'bg-amber-100 text-amber-700' },
  ACCEPTE:    { label: 'Devis accepté',     couleur: 'bg-green-100 text-green-700' },
  REFUSE:     { label: 'Devis refusé',      couleur: 'bg-red-100 text-red-700' },
}

export default function MesCommandes() {
  const [commandes, setCommandes] = useState<unknown[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(false)
  const [confirmation, setConfirmation] = useState<number | null>(null)

  const charger = () => {
    setChargement(true)
    setErreur(false)
    mesCommandes()
      .then(r => setCommandes(r.data))
      .catch(() => setErreur(true))
      .finally(() => setChargement(false))
  }

  useEffect(() => { charger() }, [])

  const handleConfirmer = async (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    setConfirmation(id)
    try {
      await confirmerReception(id)
      toast('Réception confirmée ! Les fonds ont été envoyés à l\'artisan.', 'success')
      charger()
    } catch {
      toast('Erreur, réessayez.', 'error')
    } finally {
      setConfirmation(null)
    }
  }

  if (chargement) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  )

  if (erreur) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
      <div className="text-center py-16 bg-white rounded-2xl border border-creme-fonce">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="font-semibold text-foreground mb-1">Impossible de charger vos commandes</p>
        <p className="text-sm text-muted-foreground mb-5">Le serveur met quelques secondes à démarrer, réessayez.</p>
        <button onClick={charger}
          className="inline-flex items-center gap-2 bg-foret text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-foret/90 transition-colors">
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
      {commandes.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-14 h-14 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">Aucune commande</p>
          <p className="text-sm text-muted-foreground mb-4">Vous n'avez pas encore passé de commande</p>
          <Link href="/produits" className="btn-primaire inline-block">Explorer le catalogue</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(commandes as Record<string, unknown>[]).map((cmd) => {
            const s = STATUTS[cmd.statut as string] || { label: String(cmd.statut), couleur: 'bg-gray-100 text-gray-700' }
            const articles = cmd.articles as { produit: { titre: string } }[]
            const surMesure = cmd.surMesure as boolean
            const devisStatut = cmd.devisStatut as string
            const devisBadge = surMesure ? DEVIS_BADGE[devisStatut] : null
            const receptionConfirmee = cmd.receptionConfirmee as boolean
            const paiementStatut = cmd.paiementStatut as string
            const aConfirmer = cmd.statut === 'LIVREE' && paiementStatut === 'paye' && !receptionConfirmee
            const id = cmd.id as number

            return (
              <div key={id} className={`bg-white rounded-2xl border overflow-hidden ${aConfirmer ? 'border-foret/40' : 'border-creme-fonce'}`}>
                <Link href={`/client/commandes/${id}`}
                  className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">Commande #{id}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.couleur}`}>{s.label}</span>
                      {surMesure && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-foret/10 text-foret flex items-center gap-1 font-medium">
                          <Ruler className="w-3 h-3" /> Sur mesure
                        </span>
                      )}
                      {devisBadge && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${devisBadge.couleur}`}>
                          {devisBadge.label}
                        </span>
                      )}
                      {receptionConfirmee && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Réception confirmée
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {surMesure ? 'Commande personnalisée' : articles?.map((a) => a.produit.titre).join(', ')}
                    </p>
                    <p className="text-sm font-bold text-or mt-1">
                      {Number(cmd.total) > 0 ? `${Number(cmd.total).toLocaleString('fr-FR')} FCFA` : 'Prix en attente'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(cmd.createdAt as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' à '}
                      {new Date(cmd.createdAt as string).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 ml-3" />
                </Link>

                {/* Bloc confirmation réception — directement visible sur la liste */}
                {aConfirmer && (
                  <div className="border-t border-foret/20 bg-foret/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foret">Avez-vous reçu votre commande ?</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Confirmez pour que l'administrateur débloque les fonds vers l'artisan.</p>
                    </div>
                    <button
                      onClick={(e) => handleConfirmer(e, id)}
                      disabled={confirmation === id}
                      className="shrink-0 flex items-center gap-2 bg-foret text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-foret/90 transition-colors disabled:opacity-60 whitespace-nowrap"
                    >
                      <Check className="w-4 h-4" />
                      {confirmation === id ? 'Confirmation...' : 'Oui, j\'ai reçu ma commande'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
