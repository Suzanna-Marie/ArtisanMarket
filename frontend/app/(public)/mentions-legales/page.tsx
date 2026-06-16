import Link from 'next/link'

export default function MentionsLegales() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-foret py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-or-clair text-xs font-semibold uppercase tracking-widest mb-2">Légal</p>
          <h1 className="text-3xl font-bold text-white">Mentions légales</h1>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">

        <section className="bg-white rounded-2xl border border-gray-100 p-7 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">1. Éditeur de la plateforme</h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-1">
            <p><span className="font-semibold text-gray-800">Nom de la plateforme :</span> ArtisanMarket</p>
            <p><span className="font-semibold text-gray-800">Statut :</span> Projet académique — Mémoire de Licence Professionnelle</p>
            <p><span className="font-semibold text-gray-800">Établissement :</span> Institut Universitaire de Technologie (IUT) de Parakou, République du Bénin</p>
            <p><span className="font-semibold text-gray-800">Réalisé par :</span> ABOUTA Gloria & DOGNON Marie-Suzanne, étudiantes en Licence 3</p>
            <p><span className="font-semibold text-gray-800">Email :</span> contact@artisanmarket.bj</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-7 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">2. Hébergement</h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-1">
            <p><span className="font-semibold text-gray-800">Frontend :</span> Vercel Inc., 340 Pine Street Suite 701, San Francisco, CA 94104, États-Unis</p>
            <p><span className="font-semibold text-gray-800">Backend :</span> Railway Corp., San Francisco, CA, États-Unis</p>
            <p><span className="font-semibold text-gray-800">Base de données :</span> Neon Inc. (PostgreSQL serverless)</p>
            <p><span className="font-semibold text-gray-800">Images :</span> Cloudinary Inc.</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-7 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">3. Propriété intellectuelle</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            L'ensemble du contenu de la plateforme ArtisanMarket (textes, images, logos, code source) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable des auteurs.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les photos des produits appartiennent aux artisans qui les ont publiées. ArtisanMarket ne revendique aucun droit sur ces contenus.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-7 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">4. Données personnelles</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            ArtisanMarket collecte des données personnelles (nom, email, téléphone) uniquement dans le cadre de la création de compte et de la passation de commandes. Ces données ne sont jamais vendues ni transmises à des tiers à des fins commerciales.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Conformément aux principes de protection des données, tout utilisateur peut demander la modification ou la suppression de ses données depuis son espace personnel, ou en nous contactant à : <a href="mailto:contact@artisanmarket.bj" className="text-or hover:underline">contact@artisanmarket.bj</a>.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-7 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">5. Cookies</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            ArtisanMarket n'utilise pas de cookies publicitaires. Les données de session (authentification) sont stockées localement dans votre navigateur (localStorage) et ne sont pas transmises à des tiers.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-7 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">6. Responsabilité</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            ArtisanMarket agit en tant qu'intermédiaire entre les clients et les artisans. La plateforme ne peut être tenue responsable des litiges entre acheteurs et vendeurs. En cas de problème, nous nous engageons à faciliter la résolution à l'amiable.
          </p>
        </section>

        <div className="text-center">
          <Link href="/contact" className="btn-primaire inline-flex items-center gap-2 !py-2.5 !px-6 text-sm">
            Une question ? Contactez-nous
          </Link>
        </div>

      </div>
    </div>
  )
}
