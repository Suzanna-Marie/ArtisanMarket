import Link from 'next/link'
import { ArrowRight, Heart, ShieldCheck, Users, Gem } from 'lucide-react'

export default function PageAPropos() {
  return (
    <div className="overflow-x-hidden">

      {/* Hero */}
      <section className="bg-[#1C3010] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-or-clair text-xs font-semibold uppercase tracking-widest mb-4">Notre histoire</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            Valoriser l&apos;artisanat béninois,<br />
            <span className="text-or-clair">une création à la fois.</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-2xl mx-auto">
            ArtisanMarket est né d&apos;une conviction simple : les artisans béninois méritent une vitrine
            numérique à la hauteur de leur talent. Nous connectons les créateurs locaux avec des clients
            qui valorisent l&apos;authenticité et le fait main.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-or text-xs font-semibold uppercase tracking-widest mb-3">Notre mission</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">
                Digitaliser l&apos;artisanat béninois
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Au Bénin, des milliers d&apos;artisans talentueux créent chaque jour des œuvres uniques —
                pagnes tissés, tenues tricotées, accessoires — mais peinent à atteindre
                une clientèle au-delà de leur quartier.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                ArtisanMarket leur offre un espace numérique pour présenter leurs créations, recevoir
                des commandes et développer leur activité, tout en préservant l&apos;authenticité de
                leur savoir-faire.
              </p>
              <Link href="/artisans" className="inline-flex items-center gap-2 bg-foret text-white font-semibold px-6 py-3 rounded-lg hover:bg-foret/90 transition-colors text-sm">
                Découvrir nos artisans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icone: <Heart className="w-6 h-6 text-or" />,        titre: 'Passion',      desc: 'Chaque artisan met son cœur dans chaque création.' },
                { icone: <Gem className="w-6 h-6 text-or" />,          titre: 'Authenticité', desc: 'Des produits 100% faits main, sans compromis.' },
                { icone: <Users className="w-6 h-6 text-or" />,        titre: 'Communauté',   desc: 'Une famille d\'artisans et de clients unis.' },
                { icone: <ShieldCheck className="w-6 h-6 text-or" />,  titre: 'Confiance',    desc: 'Chaque artisan est vérifié par notre équipe.' },
              ].map((v, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="w-10 h-10 bg-or/10 rounded-xl flex items-center justify-center mb-3">
                    {v.icone}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{v.titre}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foret py-14 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-3">Rejoignez l&apos;aventure ArtisanMarket</h2>
          <p className="text-white/70 text-sm mb-8">Que vous soyez artisan ou client, votre place est ici.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/inscription?role=ARTISAN"
              className="inline-flex items-center gap-2 bg-white text-foret font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Devenir artisan <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/produits"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm">
              Explorer la boutique
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
