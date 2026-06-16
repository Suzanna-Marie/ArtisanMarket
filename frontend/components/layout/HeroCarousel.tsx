'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function Etoile({ size = 16, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden>
      <path d="M12 0 L13.8 9.5 L24 12 L13.8 14.5 L12 24 L10.2 14.5 L0 12 L10.2 9.5 Z" fill="currentColor" />
    </svg>
  )
}

const etoilesCommunes = [
  { size: 8,  top: '4%',  left: '8%',  color: '#E8B84B', opacity: 0.35 },
  { size: 14, top: '8%',  left: '20%', color: '#ffffff', opacity: 0.20 },
  { size: 6,  top: '5%',  left: '38%', color: '#E8B84B', opacity: 0.28 },
  { size: 20, top: '10%', left: '58%', color: '#E8B84B', opacity: 0.25 },
  { size: 10, top: '7%',  left: '75%', color: '#ffffff', opacity: 0.22 },
  { size: 6,  top: '14%', left: '92%', color: '#E8B84B', opacity: 0.20 },
  { size: 16, top: '22%', left: '5%',  color: '#ffffff', opacity: 0.18 },
  { size: 8,  top: '28%', left: '32%', color: '#E8B84B', opacity: 0.20 },
  { size: 12, top: '30%', left: '62%', color: '#ffffff', opacity: 0.18 },
  { size: 6,  top: '35%', left: '88%', color: '#E8B84B', opacity: 0.22 },
  { size: 22, top: '45%', left: '2%',  color: '#E8B84B', opacity: 0.15 },
  { size: 8,  top: '48%', left: '48%', color: '#ffffff', opacity: 0.15 },
  { size: 14, top: '50%', left: '78%', color: '#E8B84B', opacity: 0.20 },
  { size: 6,  top: '58%', left: '15%', color: '#ffffff', opacity: 0.18 },
  { size: 18, top: '62%', left: '55%', color: '#E8B84B', opacity: 0.18 },
  { size: 10, top: '65%', left: '90%', color: '#ffffff', opacity: 0.20 },
  { size: 6,  top: '72%', left: '30%', color: '#E8B84B', opacity: 0.22 },
  { size: 12, top: '75%', left: '70%', color: '#ffffff', opacity: 0.18 },
  { size: 8,  top: '82%', left: '8%',  color: '#E8B84B', opacity: 0.20 },
  { size: 16, top: '85%', left: '45%', color: '#ffffff', opacity: 0.15 },
  { size: 6,  top: '88%', left: '82%', color: '#E8B84B', opacity: 0.22 },
  { size: 10, top: '93%', left: '60%', color: '#ffffff', opacity: 0.18 },
  { size: 20, top: '95%', left: '25%', color: '#E8B84B', opacity: 0.15 },
  { size: 6,  top: '97%', left: '95%', color: '#ffffff', opacity: 0.20 },
]

const slides = [
  {
    photo: '/images/fme.png',
    overlay: 'from-black/75 via-black/45 to-black/20',
    label: 'Artisanat béninois',
    titre: 'Valorisons notre artisanat,\ncélébrons notre culture.',
    message: 'Découvrez des créations uniques, authentiques et faites main par des artisans passionnés du Bénin.',
    cta: { texte: 'Découvrir la boutique', lien: '/produits' },
  },
  {
    photo: '/images/Kanvo.jpg',
    overlay: 'from-black/60 via-black/20 to-transparent',
    label: 'Kanvô & Tissage',
    titre: 'Le pagne béninois,\nun art ancestral.',
    message: 'Chaque fil tissé à la main raconte des siècles de tradition et de savoir-faire béninois.',
    cta: { texte: 'Explorer les pagnes', lien: '/produits?categorie=kanvo' },
  },
  {
    photo: '/images/accessoires.jpg',
    overlay: 'from-black/60 via-black/20 to-transparent',
    label: 'Accessoires & Bijoux',
    titre: 'Des créations uniques\npour vous démarquer.',
    message: 'Bijoux, sacs, colliers — chaque pièce est fabriquée à la main et porte l\'âme du Bénin.',
    cta: { texte: 'Voir les accessoires', lien: '/produits?categorie=accessoires' },
  },
  {
    photo: '/images/tricot.jpg',
    overlay: 'from-black/60 via-black/20 to-transparent',
    label: 'Tenues tricotées',
    titre: 'Des mains expertes\npour des pièces uniques.',
    message: 'Nos artisans créent des tenues tricotées originales avec amour et passion.',
    cta: { texte: 'Voir les tenues tricotées', lien: '/produits?categorie=tricot' },
  },
]

export default function HeroCarousel() {
  const [actif, setActif] = useState(0)
  const [pause, setPause] = useState(false)

  const suivant = useCallback(() => setActif(i => (i + 1) % slides.length), [])

  useEffect(() => {
    if (pause) return
    const timer = setInterval(suivant, 5000)
    return () => clearInterval(timer)
  }, [pause, suivant])

  return (
    <div
      className="relative w-full h-[260px] sm:h-[380px] md:h-[500px] lg:h-[560px] overflow-hidden"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-1000 ${
            i === actif
              ? 'opacity-100 z-10 translate-x-0'
              : 'opacity-0 z-0 translate-x-4'
          }`}
        >
          {/* Image avec effet Ken Burns */}
          <div className={`absolute inset-0 ${i === actif ? 'ken-burns' : ''}`}>
            <Image src={slide.photo} alt={slide.label} fill className="object-cover object-center" priority={i === 0} sizes="100vw" />
          </div>
          {/* Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

          {/* Étoiles décoratives */}
          {etoilesCommunes.map((e, j) => (
            <div key={j} className="absolute pointer-events-none" style={{ top: e.top, left: e.left }}>
              <Etoile size={e.size} style={{ color: e.color, opacity: e.opacity }} />
            </div>
          ))}

          {/* Texte */}
          <div className="absolute inset-0 flex items-center z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className={`max-w-xl transition-all duration-700 delay-300 ${
                i === actif ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}>
                <span className="inline-block bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-widest">
                  {slide.label}
                </span>
                <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-white leading-tight mb-3 md:mb-5 whitespace-pre-line">
                  {slide.titre}
                </h2>
                <p className="text-white/75 text-xs sm:text-sm md:text-base leading-relaxed mb-4 md:mb-8 max-w-md hidden sm:block">
                  {slide.message}
                </p>
                <Link
                  href={slide.cta.lien}
                  className="inline-flex items-center gap-2 bg-white text-foret font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm shadow-md"
                >
                  {slide.cta.texte} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActif(i)}
            className={`transition-all duration-300 rounded-full ${i === actif ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>

      {/* Barre de progression */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
        <div key={actif} className="h-full bg-or-clair" style={{ animation: pause ? 'none' : 'progression 5s linear forwards' }} />
      </div>

      <style jsx>{`
        @keyframes progression {
          from { width: 0% }
          to   { width: 100% }
        }
        @keyframes kenBurns {
          from { transform: scale(1)    translate(0, 0) }
          to   { transform: scale(1.08) translate(-1%, -1%) }
        }
        .ken-burns {
          animation: kenBurns 5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
