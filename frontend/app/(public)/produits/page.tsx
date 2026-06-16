'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, SlidersHorizontal, X, Star, ShoppingCart, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { listerProduits, listerCategories } from '@/lib/api'
import { usePanierStore } from '@/lib/store'
import { toast } from '@/components/ui/toaster'

interface Produit {
  id: number
  titre: string
  prix: number
  photos: string[]
  quantite: number
  statut: string
  artisan: { nomBoutique: string; localite: string }
  categorie: { nom: string; slug: string }
  _count: { avis: number }
}

interface Categorie { id: number; nom: string; slug: string; icone?: string }

interface Pagination { total: number; page: number; pages: number }

function CatalogueProduits() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ajouterArticle = usePanierStore(s => s.ajouterArticle)

  const [produits, setProduits] = useState<Produit[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1 })
  const [chargement, setChargement] = useState(true)
  const [filtresOuverts, setFiltresOuverts] = useState(false)

  const [filtres, setFiltres] = useState({
    recherche: searchParams.get('recherche') || '',
    categorie: searchParams.get('categorie') || '',
    minPrix: searchParams.get('minPrix') || '',
    maxPrix: searchParams.get('maxPrix') || '',
    page: Number(searchParams.get('page') || 1),
  })

  useEffect(() => {
    listerCategories().then(r => setCategories(r.data.filter((c: Categorie) => c.slug !== 'tenues-cousues')))
  }, [])

  useEffect(() => {
    setChargement(true)
    const params: Record<string, unknown> = { limite: 12, page: filtres.page }
    if (filtres.recherche) params.recherche = filtres.recherche
    if (filtres.categorie) params.categorie = filtres.categorie
    if (filtres.minPrix) params.minPrix = filtres.minPrix
    if (filtres.maxPrix) params.maxPrix = filtres.maxPrix

    listerProduits(params)
      .then(r => { setProduits(r.data.produits); setPagination(r.data.pagination) })
      .finally(() => setChargement(false))
  }, [filtres])

  const appliquerFiltre = (key: string, value: string) => {
    setFiltres(f => ({ ...f, [key]: value, page: 1 }))
  }

  const reinitialiserFiltres = () => {
    setFiltres({ recherche: '', categorie: '', minPrix: '', maxPrix: '', page: 1 })
  }

  const aFiltresActifs = filtres.categorie || filtres.minPrix || filtres.maxPrix || filtres.recherche

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catalogue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{pagination.total} produits disponibles</p>
        </div>
        <button
          onClick={() => setFiltresOuverts(!filtresOuverts)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-creme-fonce bg-white hover:border-or/50 transition-colors text-sm font-medium md:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres {aFiltresActifs && <span className="w-2 h-2 bg-or rounded-full" />}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filtres */}
        <aside className={`${filtresOuverts ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <div className="bg-white rounded-2xl border border-creme-fonce p-5 sticky top-20 space-y-6">
            {/* Recherche */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Mot-clé..."
                  value={filtres.recherche}
                  onChange={e => appliquerFiltre('recherche', e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm"
                />
              </div>
            </div>

            {/* Catégories */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Catégorie</label>
              <div className="space-y-1">
                <button
                  onClick={() => appliquerFiltre('categorie', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filtres.categorie ? 'bg-or-pale text-or font-medium' : 'hover:bg-gray-100'}`}
                >
                  Toutes les catégories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => appliquerFiltre('categorie', cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${filtres.categorie === cat.slug ? 'bg-or-pale text-or font-medium' : 'hover:bg-gray-100'}`}
                  >
                    {cat.icone && <span>{cat.icone}</span>}
                    {cat.nom}
                  </button>
                ))}
              </div>
            </div>

            {/* Prix */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Prix (FCFA)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filtres.minPrix}
                  onChange={e => appliquerFiltre('minPrix', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filtres.maxPrix}
                  onChange={e => appliquerFiltre('maxPrix', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm"
                />
              </div>
            </div>

            {aFiltresActifs && (
              <button onClick={reinitialiserFiltres} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors">
                <X className="w-4 h-4" /> Réinitialiser les filtres
              </button>
            )}
          </div>
        </aside>

        {/* Grille produits */}
        <div className="flex-1">
          {chargement ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden">
                  <div className="skeleton h-52 w-full" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : produits.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground">Aucun produit trouvé</p>
              <p className="text-sm text-muted-foreground mt-1">Essayez d&apos;autres filtres</p>
              <button onClick={reinitialiserFiltres} className="btn-primaire mt-4 !py-2 !px-5 text-sm">Voir tous les produits</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {produits.map(produit => (
                  <div key={produit.id} className="carte-produit group">
                    <Link href={`/produits/${produit.id}`}>
                      <div className="relative h-52 overflow-hidden">
                        {produit.photos?.[0] ? (
                          <Image src={produit.photos[0]} alt={produit.titre} fill className={`object-cover group-hover:scale-105 transition-transform duration-300 ${produit.statut === 'EN_RUPTURE' ? 'opacity-60' : ''}`} sizes="(max-width: 768px) 50vw, 33vw" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
                            <Package className="w-10 h-10 text-gray-200" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 badge-categorie">{produit.categorie?.nom}</span>
                        {produit.statut === 'EN_RUPTURE' && (
                          <span className="absolute bottom-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            Rupture de stock
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/produits/${produit.id}`}>
                        <h3 className="font-semibold text-sm line-clamp-2 hover:text-or transition-colors mb-1">{produit.titre}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mb-2">{produit.artisan?.nomBoutique} · {produit.artisan?.localite}</p>
                      {produit._count.avis > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 fill-or-clair text-or-clair" />
                          <span className="text-xs text-muted-foreground">({produit._count.avis} avis)</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-or">{Number(produit.prix).toLocaleString('fr-FR')} FCFA</span>
                        {produit.statut === 'EN_RUPTURE' ? (
                          <span className="text-xs text-red-500 font-medium">Indisponible</span>
                        ) : (
                          <button
                            onClick={() => {
                              ajouterArticle({ produitId: produit.id, titre: produit.titre, prix: Number(produit.prix), photo: produit.photos?.[0] || '', quantite: 1, artisanNom: produit.artisan?.nomBoutique })
                              toast('Ajouté au panier !', 'success')
                            }}
                            className="w-8 h-8 bg-or rounded-full flex items-center justify-center hover:bg-or/90 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setFiltres(f => ({ ...f, page: f.page - 1 }))}
                    disabled={filtres.page === 1}
                    className="p-2 rounded-xl border border-creme-fonce hover:border-or/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFiltres(f => ({ ...f, page: i + 1 }))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${filtres.page === i + 1 ? 'bg-or text-white' : 'border border-creme-fonce hover:border-or/50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setFiltres(f => ({ ...f, page: f.page + 1 }))}
                    disabled={filtres.page === pagination.pages}
                    className="p-2 rounded-xl border border-creme-fonce hover:border-or/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PageCatalogue() {
  return <Suspense><CatalogueProduits /></Suspense>
}
