'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Package } from 'lucide-react'
import { mesFavoris, retirerFavori } from '@/lib/api'
import { usePanierStore } from '@/lib/store'
import { toast } from '@/components/ui/toaster'

interface Produit {
  id: number; titre: string; prix: number
  photos: string[]; artisan: { nomBoutique: string }
}

export default function Favoris() {
  const [favoris, setFavoris] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)
  const { ajouterArticle } = usePanierStore()

  const charger = () => mesFavoris().then(r => setFavoris(r.data)).finally(() => setChargement(false))
  useEffect(() => { charger() }, [])

  const handleRetirer = async (id: number) => {
    await retirerFavori(id)
    setFavoris(f => f.filter(p => p.id !== id))
    toast('Retiré des favoris.', 'info')
  }

  const handleAjouter = (p: Produit) => {
    ajouterArticle({ produitId: p.id, titre: p.titre, prix: p.prix, photo: p.photos?.[0] || '', quantite: 1, artisanNom: p.artisan?.nomBoutique || '' })
    toast('Ajouté au panier !', 'success')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">Mes favoris</h1>

      {chargement ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>
      ) : favoris.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-creme-fonce">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold">Aucun favori</p>
          <p className="text-sm text-muted-foreground mb-4">Ajoutez des produits à vos favoris depuis le catalogue</p>
          <Link href="/produits" className="btn-primaire inline-block text-sm">Parcourir le catalogue</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoris.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-creme-fonce overflow-hidden">
              <div className="relative h-40">
                {p.photos?.[0] ? (
                  <Image src={p.photos[0]} alt={p.titre} fill className="object-cover" sizes="400px" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center"><Package className="w-10 h-10 text-gray-200" /></div>
                )}
                <button onClick={() => handleRetirer(p.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                </button>
              </div>
              <div className="p-4">
                <Link href={`/produits/${p.id}`}>
                  <p className="font-medium text-sm hover:text-or transition-colors line-clamp-1">{p.titre}</p>
                </Link>
                <p className="text-xs text-muted-foreground">{p.artisan?.nomBoutique}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="font-bold text-or">{Number(p.prix).toLocaleString('fr-FR')} FCFA</p>
                  <button onClick={() => handleAjouter(p)}
                    className="flex items-center gap-1.5 text-xs bg-foret text-white px-3 py-1.5 rounded-lg hover:bg-foret/90 transition-colors">
                    <ShoppingBag className="w-3.5 h-3.5" /> Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
