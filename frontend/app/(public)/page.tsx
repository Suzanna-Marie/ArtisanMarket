'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowRight, ShieldCheck, HeartHandshake, MessageCircle, Gem, Search, ShoppingBag, CheckCircle, Store, Package } from 'lucide-react'
import HeroCarousel from '@/components/layout/HeroCarousel'
import ArtisansAccueil from '@/components/layout/ArtisansAccueil'
import CartesProduits from '@/components/produit/CartesProduits'
import { statsPubliques } from '@/lib/api'

/* ─── Données statiques ────────────────────────────────────────── */

const categories = [
  { nom: 'Pagnes tissés',    slug: 'kanvo',       photo: '/images/kanvo (2).jpg',        fit: 'object-fill' },
  { nom: 'Créations au crochet', slug: 'tenues-tricotees', photo: '/images/tricot (3).jpg', fit: 'object-cover object-center' },
  { nom: 'Accessoires',      slug: 'accessoires', photo: '/images/accessoires (2).jpg',  fit: 'object-fill' },
]

const etapesClient = [
  { num: '01', icone: <Search className="w-5 h-5" />,       titre: 'Parcourez le catalogue',    desc: 'Explorez des centaines de créations artisanales authentiques.' },
  { num: '02', icone: <ShoppingBag className="w-5 h-5" />,  titre: 'Choisissez & commandez',    desc: 'Ajoutez au panier et payez en toute sécurité avec Mobile Money.' },
  { num: '03', icone: <MessageCircle className="w-5 h-5" />, titre: 'Contactez l\'artisan',      desc: 'Échangez directement avec l\'artisan pour personnaliser votre commande.' },
  { num: '04', icone: <CheckCircle className="w-5 h-5" />,  titre: 'Recevez votre commande',    desc: 'L\'artisan prépare et vous remet votre commande.' },
]

const etapesArtisan = [
  { num: '01', icone: <Store className="w-5 h-5" />,        titre: 'Créez votre boutique',      desc: 'Inscription gratuite et validation par notre équipe sous 48h.' },
  { num: '02', icone: <Package className="w-5 h-5" />,      titre: 'Publiez vos créations',     desc: 'Ajoutez vos produits avec photos, prix et description.' },
  { num: '03', icone: <ShoppingBag className="w-5 h-5" />,  titre: 'Recevez des commandes',     desc: 'Les clients commandent directement sur votre boutique.' },
  { num: '04', icone: <CheckCircle className="w-5 h-5" />,  titre: 'Développez votre activité', desc: 'Suivez vos ventes et grandissez avec la communauté ArtisanMarket.' },
]

const pourquoi = [
  { icone: <Gem className="w-6 h-6 text-or" />,          titre: 'Produits authentiques',    desc: 'Créations réalisées par de vrais artisans béninois avec des matériaux de qualité.' },
  { icone: <HeartHandshake className="w-6 h-6 text-or" />, titre: 'Soutien local',           desc: 'Chaque achat valorise le savoir-faire et améliore la vie des artisans.' },
  { icone: <ShieldCheck className="w-6 h-6 text-or" />,  titre: 'Paiement sécurisé',        desc: 'Transactions protégées via MTN MoMo, Moov Money et Celtiis.' },
  { icone: <MessageCircle className="w-6 h-6 text-or" />, titre: 'Contact direct',           desc: 'Échangez facilement avec l\'artisan pour des commandes sur mesure.' },
]

const temoignages = [
  { nom: 'Adjoua M.',  ville: 'Cotonou',    note: 5, texte: "J'ai trouvé un magnifique pagne tissé pour ma cérémonie. L'artisan était très professionnel et attentionné." },
  { nom: 'Rodrigue K.', ville: 'Porto-Novo', note: 5, texte: "Très belle qualité pour les accessoires commandés. Je recommande vivement ArtisanMarket à tous." },
  { nom: 'Fatouma B.', ville: 'Parakou',    note: 5, texte: "Une plateforme qui valorise vraiment nos artisans. J'ai commandé une tenue tricotée sur mesure, parfait !" },
]

/* ─── Page ─────────────────────────────────────────────────────── */

export default function PageAccueil() {
  const [stats, setStats] = useState<{ totalProduits: number; totalArtisans: number; totalClients: number } | null>(null)

  useEffect(() => {
    statsPubliques().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const statsAffichees = [
    { chiffre: stats ? `${stats.totalProduits}+` : '—', label: 'Produits disponibles' },
    { chiffre: stats ? `${stats.totalArtisans}+`  : '—', label: 'Artisans vérifiés' },
    { chiffre: stats ? `${stats.totalClients}+`   : '—', label: 'Clients inscrits' },
    { chiffre: '100%', label: 'Fait main au Bénin' },
  ]

  return (
    <div className="overflow-x-hidden">

      {/* 1. HERO CAROUSEL */}
      <HeroCarousel />

      {/* 2. TRUST BADGES */}
      <section className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {[
              { icone: <ShieldCheck className="w-4 h-4 text-foret" />, titre: 'Paiement sécurisé', desc: 'MTN · Moov · Celtiis' },
              { icone: <Store className="w-4 h-4 text-foret" />,         titre: '100% béninois',    desc: 'Artisans vérifiés' },
              { icone: <MessageCircle className="w-4 h-4 text-foret" />, titre: 'Contact direct',   desc: 'Messagerie intégrée' },
              { icone: <HeartHandshake className="w-4 h-4 text-foret" />, titre: 'Fait main',       desc: 'Qualité garantie' },
            ].map((b, i) => (
              <div key={i} className="shrink-0 flex items-center gap-2.5 py-1">
                <div className="w-8 h-8 bg-foret/8 rounded-lg flex items-center justify-center shrink-0">
                  {b.icone}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{b.titre}</p>
                  <p className="text-xs text-gray-400 whitespace-nowrap">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATÉGORIES */}
      <section className="py-8 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-5 md:mb-8">
            <div>
              <p className="text-or text-xs font-semibold uppercase tracking-widest mb-1">Nos catégories</p>
              <h2 className="text-xl md:text-3xl font-bold text-gray-900">Explorez nos univers artisanaux</h2>
            </div>
            <Link href="/produits" className="text-foret font-medium text-sm flex items-center gap-1 whitespace-nowrap">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile : scroll horizontal */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 md:hidden">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/produits?categorie=${cat.slug}`}
                className="shrink-0 w-40 group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="relative h-36 overflow-hidden bg-gray-100">
                  <Image src={cat.photo} alt={cat.nom} fill className={`${cat.fit} group-hover:scale-105 transition-transform duration-500`} sizes="160px" />
                </div>
                <div className="p-2.5 bg-white">
                  <h3 className="font-semibold text-gray-900 text-xs leading-tight">{cat.nom}</h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop : grille 3 colonnes égales */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/produits?categorie=${cat.slug}`}
                className="group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Image src={cat.photo} alt={cat.nom} fill className={`${cat.fit} group-hover:scale-105 transition-transform duration-500`} sizes="33vw" />
                </div>
                <div className="p-3 bg-white">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{cat.nom}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRODUITS VEDETTES */}
      <section className="py-8 md:py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-5 md:mb-8">
            <div>
              <p className="text-or text-xs font-semibold uppercase tracking-widest mb-1">Sélection</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Produits vedettes</h2>
            </div>
            <Link href="/produits" className="text-foret font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <CartesProduits params={{ limite: 4 }} />
        </div>
      </section>

      {/* 4b. KANVÔ À L'HONNEUR */}
      <section className="py-8 md:py-14 bg-[#1C3010]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 md:mb-8 gap-4">
            <div>
              <p className="text-or-clair text-xs font-semibold uppercase tracking-widest mb-1">Savoir-faire béninois</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Le Kanvô à l&apos;honneur</h2>
              <p className="text-white/60 text-sm mt-2 max-w-lg leading-relaxed">
                Tissu traditionnel béninois tissé à la main, le kanvô est bien plus qu&apos;un pagne — c&apos;est un symbole d&apos;identité et de fierté culturelle.
              </p>
            </div>
            <Link href="/produits?categorie=kanvo"
              className="shrink-0 inline-flex items-center gap-2 border border-or-clair/50 text-or-clair font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-or-clair hover:text-foret transition-all whitespace-nowrap">
              Voir tous les kanvô <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <CartesProduits params={{ categorie: 'kanvo', limite: 4 }} />
        </div>
      </section>

      {/* 5. NOUVEAUTÉS */}
      <section className="py-8 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-5 md:mb-8">
            <div>
              <p className="text-or text-xs font-semibold uppercase tracking-widest mb-1">Récemment ajoutés</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Nouveautés</h2>
            </div>
            <Link href="/produits" className="text-foret font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <CartesProduits params={{ limite: 4, page: 2 }} />
        </div>
      </section>

      {/* 6. ARTISANS */}
      <ArtisansAccueil />

      {/* 5. COMMENT ÇA MARCHE */}
      <section className="py-8 md:py-14 bg-[#1C3010]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-or-clair text-xs font-semibold uppercase tracking-widest mb-2">Simple & rapide</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Comment ça marche ?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Clients */}
            <div>
              <h3 className="text-or-clair font-semibold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Pour les clients
              </h3>
              <div className="space-y-5">
                {etapesClient.map((e, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-9 h-9 bg-or-clair/20 border border-or-clair/30 rounded-xl flex items-center justify-center text-or-clair shrink-0">
                      {e.icone}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{e.titre}</p>
                      <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Artisans */}
            <div>
              <h3 className="text-or-clair font-semibold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <Store className="w-4 h-4" /> Pour les artisans
              </h3>
              <div className="space-y-5">
                {etapesArtisan.map((e, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-9 h-9 bg-or-clair/20 border border-or-clair/30 rounded-xl flex items-center justify-center text-or-clair shrink-0">
                      {e.icone}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{e.titre}</p>
                      <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. POURQUOI NOUS CHOISIR */}
      <section className="py-8 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-or text-xs font-semibold uppercase tracking-widest mb-2">Nos engagements</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Pourquoi choisir <span className="text-or">ArtisanMarket</span> ?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pourquoi.map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-or/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icone}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{item.titre}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TÉMOIGNAGES */}
      <section className="py-8 md:py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-or text-xs font-semibold uppercase tracking-widest mb-2">Ils nous font confiance</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ce que disent nos clients</h2>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
            {temoignages.map((t, i) => (
              <div key={i} className="shrink-0 w-72 md:w-auto bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className="text-or-clair text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">&ldquo;{t.texte}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.nom}</p>
                  <p className="text-gray-400 text-xs">{t.ville}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. STATS */}
      <section className="py-14 bg-white border-y border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-foret/[0.03] via-transparent to-foret/[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statsAffichees.map((s, i) => (
              <div key={i} className="group cursor-default">
                <p className="text-4xl md:text-5xl font-bold text-foret group-hover:scale-105 transition-transform duration-300 origin-bottom">{s.chiffre}</p>
                <div className="w-8 h-0.5 bg-or-clair mx-auto my-2.5 rounded-full" />
                <p className="text-gray-400 text-xs uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA FINAL */}
      <section className="grid md:grid-cols-2">
        <div className="relative bg-foret py-16 px-8 md:px-16 flex flex-col justify-center overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-36 translate-x-36 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 pointer-events-none" />
          <div className="relative">
            <p className="text-or-clair text-xs font-semibold uppercase tracking-widest mb-4">Pour les artisans</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">Vous êtes artisan ?</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
              Rejoignez ArtisanMarket, créez votre boutique gratuitement et faites connaître votre talent à travers le Bénin.
            </p>
            <Link href="/inscription?role=ARTISAN"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white hover:text-foret transition-all duration-200 text-sm shadow-sm hover:shadow-md">
              Créer mon espace artisan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="relative bg-white py-16 px-8 md:px-16 flex flex-col justify-center overflow-hidden border-t md:border-t-0 border-gray-100">
          <div className="absolute top-0 right-0 w-72 h-72 bg-foret/[0.03] rounded-full -translate-y-36 translate-x-36 pointer-events-none" />
          <div className="relative">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Pour les clients</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-snug">Des créations uniques vous attendent</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
              Parcourez notre boutique et découvrez des produits artisanaux authentiques faits main au Bénin.
            </p>
            <Link href="/produits"
              className="inline-flex items-center gap-2 bg-foret text-white font-semibold px-6 py-3 rounded-xl hover:bg-foret-clair transition-all duration-200 text-sm shadow-sm hover:shadow-md hover:gap-3">
              Explorer la boutique <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
