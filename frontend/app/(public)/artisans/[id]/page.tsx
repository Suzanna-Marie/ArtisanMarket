'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { MapPin, Package, Star, MessageCircle } from 'lucide-react'
import { profilArtisan, listerProduits } from '@/lib/api'
import CartesProduits from '@/components/produit/CartesProduits'
import Avatar from '@/components/ui/Avatar'

interface ArtisanDetail {
  id: number
  nomBoutique: string
  specialite: string
  localite: string
  description: string
  photoCouverture: string | null
  user: { nom: string; prenom: string }
  _count: { produits: number }
}

export default function BoutiqueArtisan() {
  const { id } = useParams()
  const [artisan, setArtisan] = useState<ArtisanDetail | null>(null)
  const [produits, setProduits] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      profilArtisan(Number(id)).then(r => setArtisan(r.data)),
      listerProduits({ artisanId: Number(id), statut: 'PUBLIE', limite: 20 }).then(r => setProduits(r.data.produits)),
    ]).finally(() => setChargement(false))
  }, [id])

  if (chargement) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="skeleton h-48 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
    </div>
  )

  if (!artisan) return <div className="text-center py-16 text-gray-500">Boutique introuvable.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière boutique */}
      <div className="bg-foret text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 flex items-center gap-6">
          <Avatar
            prenom={artisan.user.prenom}
            nom={artisan.user.nom}
            photo={artisan.photoCouverture}
            taille={80}
          />
          <div>
            <h1 className="text-2xl font-bold">{artisan.nomBoutique}</h1>
            <p className="text-white/70 text-sm">{artisan.user.prenom} {artisan.user.nom}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {artisan.localite}</span>
              <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {artisan._count.produits} produits</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{artisan.specialite}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {artisan.description && (
          <div className="bg-white rounded-2xl border border-creme-fonce p-5 mb-6">
            <h2 className="font-semibold mb-2">À propos de la boutique</h2>
            <p className="text-sm text-muted-foreground">{artisan.description}</p>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">Produits ({produits.length})</h2>
        {produits.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-creme-fonce">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Aucun produit disponible pour le moment</p>
          </div>
        ) : (
          <CartesProduits produits={produits} chargement={false} />
        )}
      </div>
    </div>
  )
}
