'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ShoppingCart, Heart, Star, MapPin, Clock, Palette, ArrowLeft, MessageCircle, Send } from 'lucide-react'
import { obtenirProduit, toggleFavori, ajouterAvis } from '@/lib/api'
import { usePanierStore, useAuthStore } from '@/lib/store'
import { toast } from '@/components/ui/toaster'
import Avatar from '@/components/ui/Avatar'

interface Produit {
  id: number; titre: string; description: string; prix: number
  photos: string[]; quantite: number; delaiLivraison?: string
  personnalisable: boolean; statut: string
  artisan: { id: number; userId: number; nomBoutique: string; localite: string; description?: string; photoCouverture?: string; user: { nom: string; prenom: string; telephone?: string } }
  categorie: { nom: string }
  avis: { id: number; note: number; commentaire?: string; client: { nom: string; prenom: string; avatar?: string }; createdAt: string }[]
  _count?: { avis: number }
}

export default function FicheProduit() {
  const { id } = useParams()
  const router = useRouter()
  const [produit, setProduit] = useState<Produit | null>(null)
  const [photoActive, setPhotoActive] = useState(0)
  const [quantite, setQuantite] = useState(1)
  const [chargement, setChargement] = useState(true)
  const [surMesure, setSurMesure] = useState(false)
  const [detailsMesure, setDetailsMesure] = useState({ couleur: '', motif: '', taille: '', message: '' })
  const [estFavori, setEstFavori] = useState(false)
  const [favoriChargement, setFavoriChargement] = useState(false)
  const [noteForm, setNoteForm] = useState(0)
  const [commentaireForm, setCommentaireForm] = useState('')
  const [envoiAvis, setEnvoiAvis] = useState(false)
  const ajouterArticle = usePanierStore(s => s.ajouterArticle)
  const { user } = useAuthStore()

  useEffect(() => {
    obtenirProduit(Number(id))
      .then(r => setProduit(r.data))
      .catch(() => router.push('/produits'))
      .finally(() => setChargement(false))
  }, [id])

  const handleToggleFavori = async () => {
    if (!user) { router.push('/connexion'); return }
    if (favoriChargement) return
    setFavoriChargement(true)
    try {
      const res = await toggleFavori(Number(id))
      setEstFavori(res.data.favori)
      toast(res.data.favori ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris', res.data.favori ? 'success' : 'info')
    } catch {
      toast('Erreur, réessayez.', 'error')
    } finally {
      setFavoriChargement(false)
    }
  }

  const noteMoyenne = produit?.avis.length
    ? (produit.avis.reduce((s, a) => s + a.note, 0) / produit.avis.length).toFixed(1)
    : null

  const handleAjouterPanier = () => {
    if (!produit) return
    ajouterArticle({
      produitId: produit.id, titre: produit.titre,
      prix: Number(produit.prix), photo: produit.photos?.[0] || '',
      quantite, artisanNom: produit.artisan.nomBoutique,
    })
    toast('Ajouté au panier !', 'success')
  }

  const handleCommandeSurMesure = () => {
    if (!user) { router.push('/connexion'); return }
    router.push(`/client/commande-sur-mesure?produitId=${produit?.id}`)
  }

  const handleSoumettreAvis = async () => {
    if (!user) { router.push('/connexion'); return }
    if (noteForm === 0) { toast('Veuillez choisir une note.', 'error'); return }
    setEnvoiAvis(true)
    try {
      const res = await ajouterAvis(Number(id), { note: noteForm, commentaire: commentaireForm.trim() || undefined })
      setProduit(p => p ? { ...p, avis: [{ ...res.data, client: { nom: user.nom, prenom: user.prenom } }, ...p.avis] } : p)
      setNoteForm(0)
      setCommentaireForm('')
      toast('Votre avis a été publié !', 'success')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast(msg || 'Erreur lors de la publication.', 'error')
    } finally {
      setEnvoiAvis(false)
    }
  }

  if (chargement) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="skeleton h-96 w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-10 w-1/3" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    </div>
  )

  if (!produit) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Retour */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour au catalogue
      </button>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Galerie photos */}
        <div>
          <div className="relative h-96 rounded-2xl overflow-hidden bg-creme-fonce mb-3">
            {produit.photos?.[photoActive] ? (
              <Image src={produit.photos[photoActive]} alt={produit.titre} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Package className="w-14 h-14 text-gray-200" />
              </div>
            )}
            {!(user?.role === 'ARTISAN' && produit?.artisan.userId === user.id) && (
              <button
                onClick={handleToggleFavori}
                className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 rounded-full px-3 py-2 hover:bg-white shadow transition-all text-sm font-medium"
              >
                <Heart className={`w-4 h-4 transition-colors ${estFavori ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                <span className={estFavori ? 'text-red-500' : 'text-muted-foreground'}>
                  {estFavori ? 'Favori' : 'Ajouter aux favoris'}
                </span>
              </button>
            )}
          </div>
          {produit.photos?.length > 1 && (
            <div className="flex gap-2">
              {produit.photos.map((p, i) => (
                <button key={i} onClick={() => setPhotoActive(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${photoActive === i ? 'border-or' : 'border-transparent'}`}>
                  <Image src={p} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos produit */}
        <div className="space-y-5">
          <div>
            <span className="badge-categorie">{produit.categorie?.nom}</span>
            <h1 className="text-2xl font-bold text-foreground mt-2">{produit.titre}</h1>
            <Link href={`/artisans/${produit.artisan.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 hover:text-or transition-colors">
              <MapPin className="w-3.5 h-3.5" />
              {produit.artisan.nomBoutique} · {produit.artisan.localite}
            </Link>
          </div>

          {noteMoyenne && (
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${Number(i) <= Math.round(Number(noteMoyenne)) ? 'fill-or-clair text-or-clair' : 'text-creme-fonce'}`} />
              ))}
              <span className="text-sm font-medium">{noteMoyenne}</span>
              <span className="text-sm text-muted-foreground">({produit.avis.length} avis)</span>
            </div>
          )}

          <div className="text-3xl font-bold text-or">{Number(produit.prix).toLocaleString('fr-FR')} FCFA</div>

          <p className="text-sm text-foreground leading-relaxed">{produit.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {produit.statut === 'EN_RUPTURE' || produit.quantite === 0 ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                Rupture de stock
              </span>
            ) : produit.quantite <= 5 ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                Plus que {produit.quantite} en stock !
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                {produit.quantite} disponibles
              </span>
            )}
            {produit.delaiLivraison && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {produit.delaiLivraison}</span>
            )}
          </div>

          {/* Boutons action — bloqués uniquement si l'artisan consulte son propre produit */}
          {user?.role === 'ARTISAN' && produit.artisan.userId === user.id ? (
            <div className="bg-creme border border-creme-fonce rounded-xl px-4 py-3 text-sm text-muted-foreground text-center">
              C&apos;est votre produit — vous ne pouvez pas commander vos propres créations.
            </div>
          ) : (
            <>
              {/* Quantité */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantité :</span>
                <div className="flex items-center border border-creme-fonce rounded-xl overflow-hidden">
                  <button onClick={() => setQuantite(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors text-lg">−</button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantite}</span>
                  <button onClick={() => setQuantite(q => Math.min(produit.quantite, q + 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors text-lg">+</button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={handleAjouterPanier}
                  disabled={produit.statut === 'EN_RUPTURE' || produit.quantite === 0}
                  className="btn-primaire flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ShoppingCart className="w-5 h-5" />
                  {produit.statut === 'EN_RUPTURE' || produit.quantite === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </button>
                {produit.personnalisable && (
                  <button onClick={handleCommandeSurMesure}
                    className="btn-secondaire flex items-center justify-center gap-2">
                    <Palette className="w-5 h-5" /> Commander sur mesure
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!user) { router.push('/connexion'); return }
                    router.push(`/client/messages?userId=${produit.artisan.userId}&nom=${encodeURIComponent(produit.artisan.nomBoutique)}`)
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-creme-fonce text-sm font-medium text-foreground hover:bg-gray-100 transition-colors">
                  <MessageCircle className="w-4 h-4 text-foret" /> Contacter l'artisan
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section avis */}
      <div className="border-t border-creme-fonce pt-10 space-y-8">
        <h2 className="text-xl font-bold">Avis clients ({produit.avis.length})</h2>

        {/* Formulaire laisser un avis */}
        {user?.role === 'CLIENT' && (
          <div className="bg-creme/60 border border-creme-fonce rounded-2xl p-6">
            <h3 className="font-semibold text-sm mb-4">Laisser un avis</h3>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Votre note *</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <button key={i} type="button" onClick={() => setNoteForm(i)}
                    className="focus:outline-none transition-transform hover:scale-110">
                    <Star className={`w-7 h-7 ${i <= noteForm ? 'fill-or-clair text-or-clair' : 'text-gray-300 hover:text-or-clair/50'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={commentaireForm}
              onChange={e => setCommentaireForm(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Partagez votre expérience avec ce produit... (optionnel)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-or/40 text-sm resize-none mb-3"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{commentaireForm.length}/500</span>
              <button onClick={handleSoumettreAvis} disabled={envoiAvis || noteForm === 0}
                className="flex items-center gap-2 btn-primaire !py-2 !px-4 text-sm disabled:opacity-50">
                <Send className="w-4 h-4" />
                {envoiAvis ? 'Publication...' : 'Publier mon avis'}
              </button>
            </div>
          </div>
        )}

        {!user && (
          <p className="text-sm text-muted-foreground">
            <Link href="/connexion" className="text-or hover:underline font-medium">Connectez-vous</Link> pour laisser un avis.
          </p>
        )}

        {/* Liste des avis */}
        {produit.avis.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun avis pour ce produit. Soyez le premier !</p>
        ) : (
          <div className="space-y-4">
            {produit.avis.map(avis => (
              <div key={avis.id} className="bg-white rounded-xl p-5 border border-creme-fonce">
                <div className="flex items-start gap-3">
                  <Avatar prenom={avis.client.prenom} nom={avis.client.nom} taille={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm">{avis.client.prenom} {avis.client.nom[0]}.</span>
                      <div className="flex gap-0.5 shrink-0">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i <= avis.note ? 'fill-or-clair text-or-clair' : 'text-creme-fonce'}`} />
                        ))}
                      </div>
                    </div>
                    {avis.commentaire && <p className="text-sm text-foreground">{avis.commentaire}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(avis.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
