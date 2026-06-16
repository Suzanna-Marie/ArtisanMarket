'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Package, BadgeCheck, ArrowRight } from 'lucide-react'
import { listerArtisans } from '@/lib/api'

interface Artisan {
  id: number
  nomBoutique: string
  specialite: string
  localite: string
  description: string
  photoCouverture: string | null
  user: { nom: string; prenom: string; avatar: string | null }
  _count: { produits: number }
  totalAvis?: number
}

const GRADIENTS = [
  'from-emerald-600 to-teal-500',
  'from-green-700 to-emerald-500',
  'from-teal-600 to-green-500',
  'from-foret to-foret-clair',
  'from-green-600 to-teal-400',
  'from-emerald-700 to-green-500',
]

const specialites = ['Kanvô', 'Tenue traditionnelle', 'Tenue tricotée', 'Accessoire', 'Broderie', 'Maroquinerie']

export default function PageArtisans() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [specialite, setSpecialite] = useState('')

  useEffect(() => {
    setChargement(true)
    listerArtisans({ recherche, specialite })
      .then(r => setArtisans(r.data))
      .finally(() => setChargement(false))
  }, [recherche, specialite])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-foret text-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1.5">Nos artisans</h1>
          <p className="text-white/70 text-sm">Découvrez les créateurs béninois qui font vivre l&apos;artisanat</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un artisan..."
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-foret/30 focus:border-foret/40"
              />
            </div>
            <select
              value={specialite}
              onChange={e => setSpecialite(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-foret/30 text-gray-700"
            >
              <option value="">Toutes les spécialités</option>
              {specialites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Grille */}
        {chargement ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="skeleton h-14 w-full" />
                <div className="px-4 pt-10 pb-4 space-y-2 text-center">
                  <div className="skeleton h-4 w-32 mx-auto" />
                  <div className="skeleton h-3 w-24 mx-auto" />
                  <div className="skeleton h-3 w-20 mx-auto" />
                  <div className="skeleton h-8 w-full mt-3 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : artisans.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">Aucun artisan trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Essayez d&apos;autres critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {artisans.map((a, idx) => {
              const initiales = `${a.user.prenom[0] ?? ''}${a.user.nom[0] ?? ''}`.toUpperCase()
              const gradient  = GRADIENTS[idx % GRADIENTS.length]

              return (
                <div key={a.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">

                  {/* Strip coloré */}
                  <div className={`h-14 bg-gradient-to-r ${gradient}`} />

                  {/* Avatar */}
                  <div className="flex justify-center -mt-7 mb-2">
                    <div className="relative w-14 h-14 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                      {a.user.avatar ? (
                        <Image src={a.user.avatar} alt={`${a.user.prenom} ${a.user.nom}`}
                          fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">{initiales}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-4 text-center">
                    {/* Nom + badge */}
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <h3 className="font-bold text-gray-900 text-sm">{a.user.prenom} {a.user.nom}</h3>
                      <BadgeCheck className="w-3.5 h-3.5 text-foret shrink-0" />
                    </div>

                    <p className="text-foret text-xs font-semibold mb-1">{a.nomBoutique}</p>

                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="text-[11px]">{a.localite}</span>
                    </div>

                    {/* Spécialité + produits */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="bg-foret/8 text-foret text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {a.specialite}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                        <Package className="w-3 h-3" />
                        {a._count.produits} produit{a._count.produits > 1 ? 's' : ''}
                      </span>
                    </div>

                    {a.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                        {a.description}
                      </p>
                    )}

                    <Link href={`/artisans/${a.id}`}
                      className="flex items-center justify-center gap-1.5 w-full bg-foret text-white text-xs font-semibold py-2 rounded-xl hover:bg-foret-clair active:scale-95 transition-all duration-200">
                      En savoir plus <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
