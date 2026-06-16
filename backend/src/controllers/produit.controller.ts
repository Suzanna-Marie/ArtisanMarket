import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export const listerProduits = async (req: Request, res: Response) => {
  const { categorie, recherche, artisanId, minPrix, maxPrix, vedette, page = 1, limite = 12 } = req.query
  const limiteNum = Math.min(Number(limite), 100)
  const skip = (Number(page) - 1) * limiteNum

  try {
    const where: Record<string, unknown> = { statut: { in: ['PUBLIE', 'EN_RUPTURE'] } }
    if (vedette === 'true') where.vedette = true
    if (categorie) where.categorie = { slug: categorie }
    if (artisanId) where.artisanId = Number(artisanId)
    if (recherche) where.OR = [
      { titre: { contains: String(recherche) } },
      { description: { contains: String(recherche) } },
    ]
    if (minPrix || maxPrix) {
      where.prix = {}
      if (minPrix) (where.prix as Record<string, unknown>).gte = Number(minPrix)
      if (maxPrix) (where.prix as Record<string, unknown>).lte = Number(maxPrix)
    }

    const [produits, total] = await Promise.all([
      prisma.produit.findMany({
        where,
        include: {
          artisan: { select: { id: true, nomBoutique: true, localite: true } },
          categorie: true,
          _count: { select: { avis: true } },
        },
        skip,
        take: limiteNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.produit.count({ where }),
    ])

    return res.json({
      produits,
      pagination: { total, page: Number(page), limite: Number(limite), pages: Math.ceil(total / Number(limite)) }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const obtenirProduit = async (req: Request, res: Response) => {
  try {
    const produit = await prisma.produit.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        artisan: { include: { user: { select: { nom: true, prenom: true, telephone: true } } } },
        categorie: true,
        avis: {
          include: { client: { select: { nom: true, prenom: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' })

    await prisma.produit.update({ where: { id: produit.id }, data: { vues: { increment: 1 } } })
    return res.json(produit)
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const listerCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.categorie.findMany()
  return res.json(categories)
}

export const creerProduit = async (req: AuthRequest, res: Response) => {
  const { titre, description, prix, quantite, categorieId, delaiLivraison, personnalisable } = req.body
  const files = req.files as Express.Multer.File[]
  const photos = files?.map(f => (f as unknown as { path: string }).path) || []

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user!.id } })
    if (!artisan) return res.status(403).json({ message: 'Compte artisan requis.' })

    const produit = await prisma.produit.create({
      data: {
        artisanId: artisan.id,
        categorieId: Number(categorieId),
        titre, description,
        prix: Number(prix),
        quantite: Number(quantite),
        photos,
        delaiLivraison,
        personnalisable: personnalisable === 'true',
      }
    })
    return res.status(201).json(produit)
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const modifierProduit = async (req: AuthRequest, res: Response) => {
  const { titre, description, prix, quantite, categorieId, delaiLivraison, personnalisable, statut } = req.body
  const files = req.files as Express.Multer.File[]

  try {
    const produit = await prisma.produit.findUnique({
      where: { id: Number(req.params.id) },
      include: { artisan: true }
    })
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' })
    if (produit.artisan.userId !== req.user!.id) return res.status(403).json({ message: 'Accès refusé.' })

    const photos = files?.length
      ? files.map(f => (f as unknown as { path: string }).path)
      : produit.photos as string[]

    const nouvelleQuantite = quantite !== undefined ? Number(quantite) : undefined

    let statutFinal = statut
    if (nouvelleQuantite !== undefined) {
      if (nouvelleQuantite === 0) {
        statutFinal = 'EN_RUPTURE'
      } else if (produit.statut === 'EN_RUPTURE' && !statut) {
        statutFinal = 'PUBLIE'
      }
    }

    const updated = await prisma.produit.update({
      where: { id: produit.id },
      data: {
        titre, description,
        prix: prix ? Number(prix) : undefined,
        quantite: nouvelleQuantite,
        categorieId: categorieId ? Number(categorieId) : undefined,
        delaiLivraison, personnalisable: personnalisable === 'true',
        statut: statutFinal, photos,
      }
    })
    return res.json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const supprimerProduit = async (req: AuthRequest, res: Response) => {
  try {
    const produit = await prisma.produit.findUnique({
      where: { id: Number(req.params.id) },
      include: { artisan: true }
    })
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' })

    if (req.user!.role === 'ARTISAN' && produit.artisan.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Accès refusé.' })
    }

    await prisma.produit.delete({ where: { id: Number(req.params.id) } })
    return res.json({ message: 'Produit supprimé.' })
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const ajouterAvis = async (req: AuthRequest, res: Response) => {
  const { note, commentaire } = req.body
  const noteNum = Number(note)

  if (!noteNum || noteNum < 1 || noteNum > 5 || !Number.isInteger(noteNum)) {
    return res.status(400).json({ message: 'La note doit être un entier entre 1 et 5.' })
  }
  if (commentaire && commentaire.length > 500) {
    return res.status(400).json({ message: 'Le commentaire ne peut pas dépasser 500 caractères.' })
  }

  try {
    const avis = await prisma.avis.create({
      data: {
        clientId: req.user!.id,
        produitId: Number(req.params.id),
        note: noteNum,
        commentaire: commentaire?.trim() || null,
      }
    })
    return res.status(201).json(avis)
  } catch (error) {
    console.error('[ERROR] ajouterAvis:', error)
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const obtenirAvis = async (req: Request, res: Response) => {
  const avis = await prisma.avis.findMany({
    where: { produitId: Number(req.params.id) },
    include: { client: { select: { nom: true, prenom: true, avatar: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return res.json(avis)
}

export const toggleFavori = async (req: AuthRequest, res: Response) => {
  const clientId = req.user!.id
  const produitId = Number(req.params.id)
  const existant = await prisma.favori.findUnique({ where: { clientId_produitId: { clientId, produitId } } })

  if (existant) {
    await prisma.favori.delete({ where: { clientId_produitId: { clientId, produitId } } })
    return res.json({ favori: false })
  }
  await prisma.favori.create({ data: { clientId, produitId } })
  return res.json({ favori: true })
}

export const mesFavoris = async (req: AuthRequest, res: Response) => {
  const favoris = await prisma.favori.findMany({
    where: { clientId: req.user!.id },
    include: { produit: { include: { artisan: true, categorie: true } } }
  })
  return res.json(favoris.map(f => f.produit))
}
