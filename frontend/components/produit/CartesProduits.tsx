'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, ShoppingCart, Plus, MapPin } from 'lucide-react'
import { listerProduits } from '@/lib/api'
import { usePanierStore, useAuthStore } from '@/lib/store'

interface Produit {
  id: number
  titre: string
  prix: number
  photos: string[]
  quantite: number
  statut: string
  artisan: { id: number; nomBoutique: string; localite: string }
  categorie: { nom: string }
  _count: { avis: number }
}

interface Props {
  params?: Record<string, unknown>
  produits?: Produit[]
  chargement?: boolean
}

function EtoilesDecoratives({ note = 4.5, max = 5 }: { note?: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const pleine = i < Math.floor(note)
        const demi   = !pleine && i < note
        return (
          <Star key={i}
            className={`w-3 h-3 ${pleine || demi ? 'fill-or-clair text-or-clair' : 'fill-gray-100 text-gray-200'}`}
          />
        )
      })}
    </div>
  )
}

export default function CartesProduits({ params, produits: produitsProp, chargement: chargementProp }: Props) {
  const [produits, setProduits]   = useState<Produit[]>(produitsProp || [])
  const [chargement, setChargement] = useState(chargementProp ?? true)
  const ajouterArticle = usePanierStore(s => s.ajouterArticle)
  const { user }       = useAuthStore()

  useEffect(() => {
    if (produitsProp !== undefined) {
      setProduits(produitsProp)
      setChargement(false)
      return
    }
    listerProduits(params)
      .then(r => setProduits(r.data.produits))
      .finally(() => setChargement(false))
  }, [produitsProp])

  /* ── Skeleton ── */
  if (chargement) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="skeleton aspect-[4/3] w-full" />
            <div className="p-4 space-y-2.5">
              <div className="skeleton h-3 w-1/3" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="flex gap-2 pt-1">
                <div className="skeleton h-7 flex-1 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (produits.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Aucun produit disponible</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
      {produits.map(produit => {
        const rupture = produit.statut === 'EN_RUPTURE' || produit.quantite === 0
        const stockFaible = !rupture && produit.quantite > 0 && produit.quantite <= 5
        const monProduit = user?.role === 'ARTISAN' && produit.artisan?.id === user.artisan?.id

        return (
          <div key={produit.id}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">

            {/* ── Image ── */}
            <Link href={`/produits/${produit.id}`} className="block relative overflow-hidden bg-gray-50 aspect-[4/3]">
              {produit.photos?.[0] ? (
                <Image
                  src={produit.photos[0]}
                  alt={produit.titre}
                  fill
                  className={`object-cover group-hover:scale-105 transition-transform duration-500 ${rupture ? 'opacity-50' : ''}`}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-5xl">
                  🧵
                </div>
              )}

              {/* Overlay gradient subtil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Badge catégorie */}
              <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-foret text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                {produit.categorie?.nom}
              </span>

              {/* Bouton favori */}
              <button
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-white"
                aria-label="Ajouter aux favoris">
                <Heart className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
              </button>

              {/* Badges stock */}
              {rupture && (
                <span className="absolute bottom-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  Rupture de stock
                </span>
              )}
              {stockFaible && (
                <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  Plus que {produit.quantite} !
                </span>
              )}
            </Link>

            {/* ── Infos ── */}
            <div className="p-4">
              {/* Artisan + localité */}
              <div className="flex items-center gap-1 mb-1.5">
                <div className="w-4 h-4 rounded-full bg-foret/10 flex items-center justify-center shrink-0">
                  <span className="text-foret text-[8px] font-bold">
                    {produit.artisan?.nomBoutique?.[0] || '?'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate font-medium">
                  {produit.artisan?.nomBoutique}
                </p>
                {produit.artisan?.localite && (
                  <>
                    <span className="text-gray-200 text-[10px]">·</span>
                    <MapPin className="w-2.5 h-2.5 text-gray-300 shrink-0" />
                    <span className="text-[10px] text-gray-300 truncate">{produit.artisan.localite}</span>
                  </>
                )}
              </div>

              {/* Titre */}
              <Link href={`/produits/${produit.id}`}>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 hover:text-foret transition-colors cursor-pointer">
                  {produit.titre}
                </h3>
              </Link>

              {/* Étoiles */}
              <div className="flex items-center gap-1.5 mb-3">
                <EtoilesDecoratives note={produit._count.avis > 0 ? 4.5 : 4} />
                {produit._count.avis > 0 ? (
                  <span className="text-[11px] text-gray-400">({produit._count.avis} avis)</span>
                ) : (
                  <span className="text-[11px] text-gray-300">Nouveau</span>
                )}
              </div>

              {/* Prix */}
              <p className="text-base font-bold text-foret mb-3">
                {Number(produit.prix).toLocaleString('fr-BJ')}
                <span className="text-xs font-normal text-gray-400 ml-1">FCFA</span>
              </p>

              {/* CTA */}
              {monProduit ? (
                <div className="w-full text-center text-xs text-gray-400 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  Votre produit
                </div>
              ) : rupture ? (
                <div className="w-full text-center text-xs text-red-400 font-medium py-2 bg-red-50 rounded-xl border border-red-100">
                  Rupture de stock
                </div>
              ) : (
                <button
                  onClick={() => ajouterArticle({
                    produitId: produit.id,
                    titre: produit.titre,
                    prix: Number(produit.prix),
                    photo: produit.photos?.[0] || '',
                    quantite: 1,
                    artisanNom: produit.artisan?.nomBoutique,
                  })}
                  className="w-full flex items-center justify-center gap-2 bg-foret text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-foret-clair active:scale-95 transition-all duration-200 shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter au panier
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
