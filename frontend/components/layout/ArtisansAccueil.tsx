'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, Package, Star, BadgeCheck } from 'lucide-react'
import { listerArtisans } from '@/lib/api'

type Artisan = {
  id: number
  nomBoutique: string
  specialite: string
  localite: string
  photoCouverture: string | null
  createdAt: string
  user: { nom: string; prenom: string; avatar: string | null; createdAt: string }
  _count: { produits: number }
  totalAvis: number
  notesMoyenne: number | null
}

const GRADIENTS = [
  'from-foret to-foret-clair',
  'from-[#1C3010] to-foret',
  'from-foret-clair to-foret',
  'from-foret to-[#1C3010]',
]

function ancienneteCourte(dateStr: string): string {
  const mois = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (mois < 12) return `${mois || 1} mois`
  const ans = Math.floor(mois / 12)
  return `${ans} an${ans > 1 ? 's' : ''}`
}

function NoteEtoiles({ note, count }: { note: number | null; count: number }) {
  const val = note ?? 0
  return (
    <div className="flex items-center justify-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i}
            className={`w-3.5 h-3.5 ${i <= Math.round(val) ? 'fill-or-clair text-or-clair' : i <= Math.ceil(val) ? 'fill-or-clair/40 text-or-clair/40' : 'fill-gray-100 text-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-[11px] text-gray-500 font-medium">
        {count > 0 ? `${count} avis` : 'Nouveau'}
      </span>
    </div>
  )
}

export default function ArtisansAccueil() {
  const [artisans, setArtisans] = useState<Artisan[]>([])

  useEffect(() => {
    listerArtisans().then(r => setArtisans(r.data.slice(0, 3))).catch(() => {})
  }, [])

  if (artisans.length === 0) return null

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-foret text-xs font-semibold uppercase tracking-widest mb-1.5">
              Nos artisans à l&apos;honneur
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Rencontrez nos artisans talentueux
            </h2>
          </div>
          <Link href="/artisans"
            className="hidden sm:flex items-center gap-1 text-foret font-semibold text-sm hover:gap-2 transition-all">
            Voir tous <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grille responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {artisans.map((a, idx) => {
            const initiales = `${a.user.prenom[0] ?? ''}${a.user.nom[0] ?? ''}`.toUpperCase()
            const gradient  = GRADIENTS[idx % GRADIENTS.length]
            const exp       = ancienneteCourte(a.user.createdAt)
            const note      = a.notesMoyenne

            return (
              <div key={a.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">

                {/* ── Strip coloré ── */}
                <div className={`h-14 bg-gradient-to-r ${gradient} relative shrink-0`} />

                {/* ── Avatar chevauchant le strip ── */}
                <div className="flex justify-center -mt-8 mb-3">
                  <div className="relative w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                    {a.user.avatar ? (
                      <Image
                        src={a.user.avatar}
                        alt={`${a.user.prenom} ${a.user.nom}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <span className="text-white font-bold text-base leading-none">{initiales}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Infos ── */}
                <div className="px-4 pb-4 text-center">

                  {/* Nom + badge vérifié */}
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">
                      {a.user.prenom} {a.user.nom}
                    </h3>
                    <BadgeCheck className="w-4 h-4 text-foret shrink-0" />
                  </div>

                  {/* Boutique */}
                  <p className="text-foret text-xs font-semibold mb-1">{a.nomBoutique}</p>

                  {/* Localité */}
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-3">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="text-[11px]">{a.localite}</span>
                  </div>

                  {/* Étoiles */}
                  <div className="mb-3">
                    <NoteEtoiles note={note} count={a.totalAvis} />
                  </div>

                  {/* Ligne de stats */}
                  <div className="flex items-center justify-center gap-4 py-2.5 border-y border-gray-50 mb-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{a._count.produits}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Produits</p>
                    </div>
                    <div className="w-px h-7 bg-gray-100" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{a.totalAvis > 0 ? a.totalAvis : '—'}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Avis</p>
                    </div>
                    <div className="w-px h-7 bg-gray-100" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{exp}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Expér.</p>
                    </div>
                  </div>

                  {/* Spécialité */}
                  <span className="inline-block bg-foret/8 text-foret text-[11px] font-semibold px-3 py-0.5 rounded-full mb-3">
                    {a.specialite}
                  </span>

                  {/* CTA */}
                  <Link href={`/artisans/${a.id}`}
                    className="flex items-center justify-center gap-1.5 w-full bg-foret text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-foret-clair active:scale-95 transition-all duration-200">
                    En savoir plus <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Lien mobile */}
        <div className="sm:hidden text-center mt-6">
          <Link href="/artisans"
            className="inline-flex items-center gap-2 text-foret font-semibold text-sm border border-foret/30 px-5 py-2 rounded-xl hover:bg-foret hover:text-white transition-colors">
            Voir tous les artisans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
