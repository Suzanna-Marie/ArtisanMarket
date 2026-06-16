import Link from 'next/link'

export default function CGV() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-foret py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-or-clair text-xs font-semibold uppercase tracking-widest mb-2">Légal</p>
          <h1 className="text-3xl font-bold text-white">Conditions Générales de Vente</h1>
          <p className="text-white/60 text-sm mt-2">En vigueur au 1er janvier 2026</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        {[
          {
            titre: '1. Objet',
            contenu: `Les présentes Conditions Générales de Vente (CGV) régissent les relations entre ArtisanMarket (ci-après "la Plateforme") et toute personne effectuant un achat sur le site artisanmarket.bj (ci-après "le Client"). Tout achat implique l'acceptation pleine et entière de ces CGV.`,
          },
          {
            titre: '2. Produits',
            contenu: `Les produits proposés sur ArtisanMarket sont des créations artisanales faites main par des artisans béninois vérifiés. Chaque artisan est responsable de la description, des photos et du prix de ses produits. ArtisanMarket ne fabrique pas les produits mais facilite leur mise en vente.`,
          },
          {
            titre: '3. Prix',
            contenu: `Les prix sont affichés en Francs CFA (FCFA) et sont ceux en vigueur au moment de la commande. ArtisanMarket se réserve le droit de modifier ses prix à tout moment. Une commission de 10% est prélevée sur chaque transaction au profit de la plateforme pour assurer son fonctionnement.`,
          },
          {
            titre: '4. Commande',
            contenu: `Le Client passe commande en ajoutant des produits au panier puis en validant le paiement. La commande est confirmée dès réception du paiement. L'artisan est alors notifié et prend en charge la préparation.`,
          },
          {
            titre: '5. Paiement',
            contenu: `Les paiements sont effectués via Mobile Money (MTN MoMo, Moov Money, Celtiis) sécurisé par KKiaPay. Aucune donnée bancaire n'est stockée sur nos serveurs. Le paiement est exigé à la commande.`,
          },
          {
            titre: '6. Livraison',
            contenu: `La livraison est organisée directement entre le client et l'artisan via la messagerie intégrée à la plateforme. ArtisanMarket n'assure pas directement la livraison mais met à disposition des outils de communication pour coordonner la remise des commandes. Les délais sont convenus entre les deux parties.`,
          },
          {
            titre: '7. Commandes sur mesure',
            contenu: `Pour les commandes sur mesure, un devis est proposé par l'artisan. Le client peut l'accepter ou le refuser. Le paiement n'intervient qu'après acceptation du devis. Aucun remboursement n'est possible après que la fabrication a débuté, sauf accord de l'artisan.`,
          },
          {
            titre: '8. Retours et remboursements',
            contenu: `En cas de produit non conforme à la description, le client dispose de 48h après réception pour signaler le problème via la messagerie ou en contactant le support. ArtisanMarket facilite la résolution à l'amiable entre le client et l'artisan.`,
          },
          {
            titre: '9. Responsabilités',
            contenu: `ArtisanMarket est une plateforme d'intermédiation. La responsabilité de la qualité des produits incombe à l'artisan vendeur. ArtisanMarket ne peut être tenue responsable d'un défaut de fabrication, d'un retard de livraison ou de tout litige entre client et artisan.`,
          },
          {
            titre: '10. Droit applicable',
            contenu: `Les présentes CGV sont soumises au droit béninois. Tout litige sera soumis aux juridictions compétentes de la République du Bénin.`,
          },
        ].map((article, i) => (
          <section key={i} className="bg-white rounded-2xl border border-gray-100 p-7">
            <h2 className="text-base font-bold text-gray-900 mb-3">{article.titre}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{article.contenu}</p>
          </section>
        ))}

        <div className="bg-or/10 border border-or/20 rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-700 mb-4">
            Des questions sur nos conditions ? Notre équipe est disponible pour vous répondre.
          </p>
          <Link href="/contact" className="btn-primaire inline-flex items-center gap-2 !py-2.5 !px-6 text-sm">
            Contacter le support
          </Link>
        </div>

      </div>
    </div>
  )
}
