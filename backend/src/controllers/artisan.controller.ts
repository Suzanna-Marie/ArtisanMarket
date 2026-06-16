import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export const listerArtisans = async (req: Request, res: Response) => {
  const { localite, specialite } = req.query
  const where: Record<string, unknown> = { statut: 'VALIDE' }
  if (localite) where.localite = { contains: String(localite) }
  if (specialite) where.specialite = { contains: String(specialite) }

  const artisans = await prisma.artisan.findMany({
    where,
    include: {
      user: { select: { nom: true, prenom: true, avatar: true, createdAt: true } },
      _count: { select: { produits: true } }
    }
  })

  const artisansAvecStats = await Promise.all(artisans.map(async (artisan) => {
    const stats = await prisma.avis.aggregate({
      where: { produit: { artisanId: artisan.id } },
      _count: { _all: true },
      _avg: { note: true },
    })
    return {
      ...artisan,
      totalAvis: stats._count._all,
      notesMoyenne: stats._avg.note ? Math.round(stats._avg.note * 10) / 10 : null,
    }
  }))

  return res.json(artisansAvecStats)
}

export const obtenirBoutique = async (req: Request, res: Response) => {
  const artisan = await prisma.artisan.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      user: { select: { nom: true, prenom: true, avatar: true, createdAt: true } },
      _count: { select: { produits: true } }
    }
  })
  if (!artisan) return res.status(404).json({ message: 'Boutique introuvable.' })
  return res.json(artisan)
}

export const produitsBoutique = async (req: Request, res: Response) => {
  const produits = await prisma.produit.findMany({
    where: { artisanId: Number(req.params.id), statut: 'PUBLIE' },
    include: { categorie: true, _count: { select: { avis: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return res.json(produits)
}

export const mesProduits = async (req: AuthRequest, res: Response) => {
  const artisan = await prisma.artisan.findUnique({ where: { userId: req.user!.id } })
  if (!artisan) return res.status(404).json({ message: 'Compte artisan introuvable.' })

  const produits = await prisma.produit.findMany({
    where: { artisanId: artisan.id },
    include: { categorie: true, _count: { select: { avis: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(produits)
}

export const modifierBoutique = async (req: AuthRequest, res: Response) => {
  const { nomBoutique, description, localite, specialite, mobileMoneyNum } = req.body
  const file = req.file as Express.Multer.File & { path: string }

  try {
    const artisan = await prisma.artisan.update({
      where: { userId: req.user!.id },
      data: {
        nomBoutique, description, localite, specialite, mobileMoneyNum,
        ...(file && { photoCouverture: file.path })
      }
    })
    return res.json(artisan)
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const mesCommandes = async (req: AuthRequest, res: Response) => {
  const artisan = await prisma.artisan.findUnique({ where: { userId: req.user!.id } })
  if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' })

  const commandes = await prisma.commande.findMany({
    where: {
      OR: [
        { articles: { some: { produit: { artisanId: artisan.id } } } },
        { artisanId: artisan.id, surMesure: true },
      ]
    },
    include: {
      articles: { where: { produit: { artisanId: artisan.id } }, include: { produit: true } },
      client: { select: { nom: true, prenom: true, telephone: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return res.json(commandes)
}

export const mesStatistiques = async (req: AuthRequest, res: Response) => {
  const artisan = await prisma.artisan.findUnique({ where: { userId: req.user!.id } })
  if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' })

  // Commandes standard (articles appartenant à cet artisan)
  const commandes = await prisma.commande.findMany({
    where: { articles: { some: { produit: { artisanId: artisan.id } } } },
    include: { articles: { where: { produit: { artisanId: artisan.id } }, include: { produit: true } } }
  })

  // Commandes sur mesure (liées directement à cet artisan + payées)
  const commandesSurMesure = await prisma.commande.findMany({
    where: { artisanId: artisan.id, surMesure: true, paiementStatut: 'paye' }
  })

  const totalVentes = commandes.length + commandesSurMesure.length

  // Revenu standard : articles payés (paiementStatut = 'paye')
  const revenuStandard = commandes
    .filter(c => c.paiementStatut === 'paye')
    .reduce((sum, c) => sum + c.articles.reduce((s, a) => s + Number(a.prixUnitaire) * a.quantite, 0), 0)

  // Revenu sur mesure : total du devis accepté et payé
  const revenuSurMesure = commandesSurMesure
    .reduce((sum, c) => sum + Number(c.total), 0)

  const revenuTotal = revenuStandard + revenuSurMesure

  const toutesCommandes = [...commandes, ...commandesSurMesure]
  const commandesParStatut: Record<string, number> = {}
  for (const c of toutesCommandes) {
    commandesParStatut[c.statut] = (commandesParStatut[c.statut] || 0) + 1
  }

  const totalProduits = await prisma.produit.count({ where: { artisanId: artisan.id, statut: 'PUBLIE' } })

  const avgNote = await prisma.avis.aggregate({
    where: { produit: { artisanId: artisan.id } },
    _avg: { note: true }
  })

  const ventesParProduit = await prisma.articleCommande.groupBy({
    by: ['produitId'],
    where: { produit: { artisanId: artisan.id } },
    _sum: { quantite: true },
    orderBy: { _sum: { quantite: 'desc' } },
    take: 5
  })

  const produitsPopulaires = await Promise.all(
    ventesParProduit.map(async v => {
      const p = await prisma.produit.findUnique({ where: { id: v.produitId }, select: { id: true, titre: true } })
      return { id: v.produitId, titre: p?.titre || '', total: v._sum.quantite || 0 }
    })
  )

  return res.json({
    totalVentes,
    revenuTotal,
    totalProduits,
    noteMoyenne: avgNote._avg.note ? Math.round((avgNote._avg.note) * 10) / 10 : null,
    commandesParStatut,
    produitsPopulaires
  })
}
