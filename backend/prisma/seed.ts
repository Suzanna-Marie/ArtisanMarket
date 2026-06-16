import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ── Admin ────────────────────────────────────────────────────────────────
  const hashAdmin = await bcrypt.hash('Admin2026!', 12)
  await prisma.user.upsert({
    where: { email: 'admin@artisanmarket.bj' },
    update: {},
    create: {
      email: 'admin@artisanmarket.bj',
      password: hashAdmin,
      nom: 'Admin',
      prenom: 'ArtisanMarket',
      role: 'ADMIN',
      emailVerifie: true,
    }
  })

  // ── Catégories ───────────────────────────────────────────────────────────
  const categories = [
    { nom: 'Kanvô', slug: 'kanvo', icone: '🧵' },
    { nom: 'Tenues cousues', slug: 'tenues-cousues', icone: '👗' },
    { nom: 'Tenues tricotées', slug: 'tenues-tricotees', icone: '🧶' },
    { nom: 'Accessoires', slug: 'accessoires', icone: '👜' },
  ]
  for (const cat of categories) {
    await prisma.categorie.upsert({ where: { slug: cat.slug }, update: {}, create: cat })
  }
  const cats = await prisma.categorie.findMany()
  const catBySlug = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  const hashArtisan = await bcrypt.hash('Artisan2026!', 12)

  // ── Artisan 1 : Kanvô ────────────────────────────────────────────────────
  const user1 = await prisma.user.upsert({
    where: { email: 'adaeze.kossou@artisanmarket.bj' },
    update: {},
    create: {
      email: 'adaeze.kossou@artisanmarket.bj',
      password: hashArtisan,
      nom: 'Kossou',
      prenom: 'Adaèze',
      telephone: '0196112233',
      role: 'ARTISAN',
      emailVerifie: true,
    }
  })
  const artisan1 = await prisma.artisan.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      nomBoutique: 'Kanvô de Parakou',
      localite: 'Parakou',
      specialite: 'Kanvô',
      statut: 'VALIDE',
      description: 'Tisserande depuis 15 ans, je perpétue les techniques ancestrales béninoises. Chaque pièce est tissée à la main avec du coton local.',
      photoCouverture: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    }
  })

  // ── Artisan 2 : Tricot / Couture ─────────────────────────────────────────
  const user2 = await prisma.user.upsert({
    where: { email: 'fatoumata.bello@artisanmarket.bj' },
    update: {},
    create: {
      email: 'fatoumata.bello@artisanmarket.bj',
      password: hashArtisan,
      nom: 'Bello',
      prenom: 'Fatoumata',
      telephone: '0199445566',
      role: 'ARTISAN',
      emailVerifie: true,
    }
  })
  const artisan2 = await prisma.artisan.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      nomBoutique: 'Créations Fata',
      localite: 'Cotonou',
      specialite: 'Tricot/Crochet',
      statut: 'VALIDE',
      description: 'Passionnée de tricot et crochet depuis 10 ans. Je crée des pièces uniques alliant modernité et tradition béninoise.',
      photoCouverture: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    }
  })

  // ── Artisan 3 : Accessoires ──────────────────────────────────────────────
  const user3 = await prisma.user.upsert({
    where: { email: 'kofi.agossou@artisanmarket.bj' },
    update: {},
    create: {
      email: 'kofi.agossou@artisanmarket.bj',
      password: hashArtisan,
      nom: 'Agossou',
      prenom: 'Kofi',
      telephone: '0197778899',
      role: 'ARTISAN',
      emailVerifie: true,
    }
  })
  const artisan3 = await prisma.artisan.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      nomBoutique: 'Art & Bijoux Agossou',
      localite: 'Abomey',
      specialite: 'Accessoires',
      statut: 'VALIDE',
      description: 'Artisan bijoutier basé à Abomey, berceau du Royaume du Dahomey. Je fabrique des bijoux et accessoires inspirés de l\'art royal béninois.',
      photoCouverture: 'https://images.unsplash.com/photo-1535268244668-91a80c5c8268?w=800&q=80',
    }
  })

  // ── Produits Kanvô (artisan1) ────────────────────────────────────────────
  const produitsKanvo = [
    {
      titre: 'Pagne Kanvô tissé main — motif royal',
      description: 'Pagne kanvô authentique tissé à la main selon les techniques ancestrales de Parakou. Motifs géométriques royaux en fils de coton naturel. Idéal pour tenues de cérémonie et occasions spéciales.',
      prix: 28000,
      quantite: 8,
      photos: [
        'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80',
        'https://images.unsplash.com/photo-1542223533-bfa1cbd335b4?w=800&q=80',
      ],
      delaiLivraison: '3-5 jours',
      personnalisable: true,
      categorieId: catBySlug['kanvo'],
    },
    {
      titre: 'Nappe Kanvô — décoration table',
      description: 'Nappe en tissu kanvô, parfaite pour décorer votre intérieur avec une touche béninoise authentique. Dimensions : 150x250 cm. Lavable à la main.',
      prix: 18500,
      quantite: 12,
      photos: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
      ],
      delaiLivraison: '2-3 jours',
      personnalisable: true,
      categorieId: catBySlug['kanvo'],
    },
    {
      titre: 'Tissu Kanvô au mètre — multicolore',
      description: 'Tissu kanvô vendu au mètre pour réaliser vos propres créations. Largeur 80 cm. Motifs multicolores traditionnels. Disponible en longueur de 1 à 10 mètres.',
      prix: 4500,
      quantite: 30,
      photos: [
        'https://images.unsplash.com/photo-1542223533-bfa1cbd335b4?w=800&q=80',
      ],
      delaiLivraison: '1-2 jours',
      personnalisable: false,
      categorieId: catBySlug['kanvo'],
    },
    {
      titre: 'Coussin décoratif Kanvô — ensemble 2 pièces',
      description: 'Paire de coussins en tissu kanvô, décoration idéale pour salon ou chambre. Intérieur en mousse haute densité. Housse lavable. Dimensions : 45x45 cm.',
      prix: 12000,
      quantite: 15,
      photos: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      ],
      delaiLivraison: '3-4 jours',
      personnalisable: true,
      categorieId: catBySlug['kanvo'],
    },
    {
      titre: 'Chemin de table Kanvô — cérémonie',
      description: 'Chemin de table en kanvô tissé pour embellir vos tables de fête. Longueur 2 mètres, largeur 35 cm. Motifs traditionnels béninois en or et vert.',
      prix: 9500,
      quantite: 20,
      photos: [
        'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80',
      ],
      delaiLivraison: '2-3 jours',
      personnalisable: false,
      categorieId: catBySlug['kanvo'],
    },
  ]

  // ── Produits Tricot/Couture (artisan2) ───────────────────────────────────
  const produitsTricot = [
    {
      titre: 'Robe africaine crochet — manches longues',
      description: 'Robe élégante au crochet, inspirée des motifs africains. Tailles disponibles : S, M, L, XL. Coton recyclé, lavable à 30°. Personnalisable en couleurs sur commande.',
      prix: 35000,
      quantite: 5,
      photos: [
        'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80',
      ],
      delaiLivraison: '7-10 jours',
      personnalisable: true,
      categorieId: catBySlug['tenues-tricotees'],
    },
    {
      titre: 'Châle tricot — motifs géométriques béninois',
      description: 'Grand châle tricoté main en laine mélangée, avec des motifs géométriques inspirés de l\'art béninois. Dimensions : 200x70 cm. Parfait pour les soirées fraîches.',
      prix: 22000,
      quantite: 8,
      photos: [
        'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80',
      ],
      delaiLivraison: '5-7 jours',
      personnalisable: true,
      categorieId: catBySlug['tenues-tricotees'],
    },
    {
      titre: 'Ensemble haut + jupe crochet — cérémonie',
      description: 'Ensemble deux pièces au crochet pour occasions spéciales. Haut court et jupe mi-longue avec fente. 100% coton. Disponible en blanc, beige ou coloré sur commande.',
      prix: 55000,
      quantite: 3,
      photos: [
        'https://images.unsplash.com/photo-1551854304-36c9a3fd4f29?w=800&q=80',
      ],
      delaiLivraison: '10-14 jours',
      personnalisable: true,
      categorieId: catBySlug['tenues-cousues'],
    },
    {
      titre: 'Tenue enfant brodée — fête traditionnelle',
      description: 'Tenue traditionnelle pour enfant (2-10 ans) brodée à la main. Tissu léger et respirant, idéal pour le climat béninois. Couleurs vives et durables.',
      prix: 15000,
      quantite: 10,
      photos: [
        'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80',
      ],
      delaiLivraison: '5-7 jours',
      personnalisable: true,
      categorieId: catBySlug['tenues-cousues'],
    },
    {
      titre: 'Bonnet et écharpe tricotés — ensemble',
      description: 'Set bonnet + écharpe tricoté main. Laine douce anti-allergie. Plusieurs coloris disponibles. Idéal cadeau pour toutes occasions.',
      prix: 8500,
      quantite: 20,
      photos: [
        'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80',
      ],
      delaiLivraison: '3-5 jours',
      personnalisable: false,
      categorieId: catBySlug['tenues-tricotees'],
    },
  ]

  // ── Produits Accessoires (artisan3) ─────────────────────────────────────
  const produitsAccessoires = [
    {
      titre: 'Collier perles royales — Abomey',
      description: 'Collier en perles de verre inspiré des ornements royaux du Dahomey. Chaque perle est choisie à la main. Fermoir en bronze. Longueur 45 cm. Pièce unique et authentique.',
      prix: 18000,
      quantite: 6,
      photos: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      ],
      delaiLivraison: '2-3 jours',
      personnalisable: true,
      categorieId: catBySlug['accessoires'],
    },
    {
      titre: 'Bracelet bronze artisanal — motif Fon',
      description: 'Bracelet en bronze fondu et sculpté à la main. Motifs inspirés de l\'art Fon d\'Abomey. Taille ajustable. Chaque pièce est unique, signée par l\'artisan.',
      prix: 12500,
      quantite: 10,
      photos: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      ],
      delaiLivraison: '3-4 jours',
      personnalisable: false,
      categorieId: catBySlug['accessoires'],
    },
    {
      titre: 'Sac à main tressé — paille et cuir',
      description: 'Sac à main artisanal en paille tressée et cuir naturel. Dimensions : 30x25 cm. Anse en cuir tressé. Intérieur doublé tissu. Idéal pour marché ou sortie décontractée.',
      prix: 24000,
      quantite: 7,
      photos: [
        'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
      ],
      delaiLivraison: '4-6 jours',
      personnalisable: true,
      categorieId: catBySlug['accessoires'],
    },
    {
      titre: 'Boucles d\'oreilles pendantes — perles colorées',
      description: 'Boucles d\'oreilles longues en perles multicolores faites à la main. Crochets en acier inoxydable anti-allergie. Longueur 8 cm. Plusieurs combinaisons de couleurs disponibles.',
      prix: 6500,
      quantite: 25,
      photos: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      ],
      delaiLivraison: '1-2 jours',
      personnalisable: true,
      categorieId: catBySlug['accessoires'],
    },
    {
      titre: 'Ceinture tressée — paille naturelle',
      description: 'Ceinture artisanale tressée en paille naturelle et raphia. Largeur 5 cm. Tailles S à XL. Se porte sur robe, jupe ou pantalon pour un look bohème et authentique.',
      prix: 7500,
      quantite: 18,
      photos: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      ],
      delaiLivraison: '2-3 jours',
      personnalisable: false,
      categorieId: catBySlug['accessoires'],
    },
  ]

  // ── Insertion des produits (seulement si pas déjà là) ───────────────────
  const tous = [
    ...produitsKanvo.map(p => ({ ...p, artisanId: artisan1.id, statut: 'PUBLIE' as const })),
    ...produitsTricot.map(p => ({ ...p, artisanId: artisan2.id, statut: 'PUBLIE' as const })),
    ...produitsAccessoires.map(p => ({ ...p, artisanId: artisan3.id, statut: 'PUBLIE' as const })),
  ]
  for (const p of tous) {
    const existe = await prisma.produit.findFirst({ where: { titre: p.titre } })
    if (!existe) await prisma.produit.create({ data: p })
  }

  console.log('✅ Base de données peuplée :')
  console.log('   - 3 artisans validés')
  console.log('   - 15 produits publiés')
  console.log('   - 4 catégories')
  console.log('')
  console.log('Comptes artisans (mot de passe : Artisan2026!) :')
  console.log('   adaeze.kossou@artisanmarket.bj  → Kanvô de Parakou')
  console.log('   fatoumata.bello@artisanmarket.bj → Créations Fata')
  console.log('   kofi.agossou@artisanmarket.bj   → Art & Bijoux Agossou')
}

main().catch(console.error).finally(() => prisma.$disconnect())
