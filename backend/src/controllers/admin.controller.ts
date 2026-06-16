import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { envoyerEmailValidationArtisan, envoyerEmailRejetArtisan, envoyerEmailSuspensionArtisan } from '../services/email.service'

const prisma = new PrismaClient()

const sansMdp = <T extends { password: string }>(user: T) => {
  const { password: _, ...rest } = user
  return rest
}

export const tableauDeBord = async (_req: AuthRequest, res: Response) => {
  const [totalUsers, totalArtisans, totalProduits, totalCommandes, statsCommissions] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.artisan.count({ where: { statut: 'VALIDE' } }),
    prisma.produit.count({ where: { statut: 'PUBLIE' } }),
    prisma.commande.count(),
    prisma.commande.aggregate({
      where: { paiementStatut: 'paye' },
      _sum: { commission: true, total: true },
      _count: { id: true },
    }),
  ])

  return res.json({
    totalUsers,
    totalArtisans,
    totalProduits,
    totalCommandes,
    totalCommissionsCFA: Number(statsCommissions._sum.commission ?? 0),
    totalVentesCFA: Number(statsCommissions._sum.total ?? 0),
    totalCommandesPaye: statsCommissions._count.id,
  })
}

export const listerUtilisateurs = async (req: AuthRequest, res: Response) => {
  const { recherche, role } = req.query
  const where: Record<string, unknown> = {}
  if (role) where.role = String(role)
  if (recherche) {
    where.OR = [
      { nom: { contains: String(recherche), mode: 'insensitive' } },
      { prenom: { contains: String(recherche), mode: 'insensitive' } },
      { email: { contains: String(recherche), mode: 'insensitive' } },
    ]
  }
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { commandes: true } } }
  })
  return res.json(users.map(sansMdp))
}

export const changerStatutUtilisateur = async (req: AuthRequest, res: Response) => {
  const { actif } = req.body
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { actif },
  })
  return res.json(sansMdp(user))
}

async function supprimerUtilisateurParId(id: number, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { artisan: { include: { produits: true } } }
  })
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
  if (user.role === 'ADMIN') return res.status(403).json({ message: 'Impossible de supprimer un admin.' })

  await prisma.$transaction(async (tx) => {
    if (user.artisan) {
      const produitIds = user.artisan.produits.map((p: { id: number }) => p.id)
      if (produitIds.length > 0) {
        await tx.avis.deleteMany({ where: { produitId: { in: produitIds } } })
        await tx.favori.deleteMany({ where: { produitId: { in: produitIds } } })
        const lignes = await tx.articleCommande.findMany({
          where: { produitId: { in: produitIds } },
          select: { commandeId: true }
        })
        const cmdIds = [...new Set(lignes.map((l: { commandeId: number }) => l.commandeId))]
        await tx.articleCommande.deleteMany({ where: { produitId: { in: produitIds } } })
        for (const cmdId of cmdIds) {
          const reste = await tx.articleCommande.count({ where: { commandeId: cmdId } })
          if (reste === 0) await tx.commande.delete({ where: { id: cmdId } })
        }
      }
      await tx.commande.deleteMany({ where: { artisanId: user.artisan.id } })
    }

    await tx.articleCommande.deleteMany({ where: { commande: { clientId: id } } })
    await tx.commande.deleteMany({ where: { clientId: id } })
    await tx.favori.deleteMany({ where: { clientId: id } })
    await tx.avis.deleteMany({ where: { clientId: id } })
    await tx.message.deleteMany({ where: { expediteurId: id } })
    await tx.notification.deleteMany({ where: { userId: id } })
    await tx.adresse.deleteMany({ where: { userId: id } })
    await tx.user.delete({ where: { id } })
  })

  return res.json({ message: 'Utilisateur supprimé.' })
}

export const supprimerUtilisateur = async (req: AuthRequest, res: Response) => {
  try {
    return await supprimerUtilisateurParId(Number(req.params.id), res)
  } catch (error) {
    console.error('Erreur suppression:', error)
    return res.status(500).json({ message: 'Erreur lors de la suppression.' })
  }
}

export const bloquerUtilisateur = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const user = await prisma.user.update({
    where: { id },
    data: { actif: false },
  })
  // Si c'est un artisan, suspendre aussi sa boutique
  if (user.role === 'ARTISAN') {
    await prisma.artisan.updateMany({ where: { userId: id }, data: { statut: 'SUSPENDU' } })
  }
  return res.json(sansMdp(user))
}

export const debloquerUtilisateur = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)
  const user = await prisma.user.update({
    where: { id },
    data: { actif: true },
  })
  // Si c'est un artisan suspendu, réactiver sa boutique
  if (user.role === 'ARTISAN') {
    await prisma.artisan.updateMany({
      where: { userId: id, statut: 'SUSPENDU' },
      data: { statut: 'VALIDE' }
    })
  }
  return res.json(sansMdp(user))
}

export const tousLesArtisans = async (req: AuthRequest, res: Response) => {
  const { recherche, statut } = req.query
  const where: Record<string, unknown> = {}
  if (statut) where.statut = String(statut)
  if (recherche) {
    where.OR = [
      { nomBoutique: { contains: String(recherche), mode: 'insensitive' } },
      { specialite: { contains: String(recherche), mode: 'insensitive' } },
      { localite: { contains: String(recherche), mode: 'insensitive' } },
    ]
  }
  const artisans = await prisma.artisan.findMany({
    where,
    include: {
      user: { select: { nom: true, prenom: true, email: true } },
      _count: { select: { produits: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return res.json(artisans)
}

export const tousLesProduits = async (req: AuthRequest, res: Response) => {
  const { recherche, statut } = req.query
  const where: Record<string, unknown> = {}
  if (statut) where.statut = String(statut)
  if (recherche) where.titre = { contains: String(recherche), mode: 'insensitive' }

  const produits = await prisma.produit.findMany({
    where,
    include: {
      artisan: { select: { nomBoutique: true } },
      categorie: { select: { nom: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return res.json({ produits })
}

export const supprimerProduit = async (req: AuthRequest, res: Response) => {
  await prisma.produit.delete({ where: { id: Number(req.params.id) } })
  return res.json({ message: 'Produit supprimé.' })
}

export const supprimerArtisan = async (req: AuthRequest, res: Response) => {
  try {
    const artisan = await prisma.artisan.findUnique({ where: { id: Number(req.params.id) } })
    if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' })
    return supprimerUtilisateurParId(artisan.userId, res)
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la suppression.' })
  }
}

export const artisansEnAttente = async (_req: AuthRequest, res: Response) => {
  const artisans = await prisma.artisan.findMany({
    where: { statut: 'EN_ATTENTE' },
    include: { user: true }
  })
  return res.json(artisans.map(a => ({ ...a, user: sansMdp(a.user) })))
}

export const validerArtisan = async (req: AuthRequest, res: Response) => {
  const artisan = await prisma.artisan.update({
    where: { id: Number(req.params.id) },
    data: { statut: 'VALIDE' },
    include: { user: { select: { email: true, prenom: true } } }
  })
  await prisma.notification.create({
    data: {
      userId: artisan.userId,
      type: 'VALIDATION',
      titre: 'Votre boutique a été validée !',
      message: 'Félicitations ! Vous pouvez maintenant publier vos produits sur ArtisanMarket.',
    }
  })
  try {
    await envoyerEmailValidationArtisan(artisan.user.email, artisan.user.prenom, artisan.nomBoutique)
  } catch {}
  return res.json(artisan)
}

export const rejeterArtisan = async (req: AuthRequest, res: Response) => {
  const { motif } = req.body
  const artisan = await prisma.artisan.update({
    where: { id: Number(req.params.id) },
    data: { statut: 'REJETE' },
    include: { user: { select: { email: true, prenom: true } } }
  })
  await prisma.notification.create({
    data: {
      userId: artisan.userId,
      type: 'REJET',
      titre: "Demande d'inscription rejetée",
      message: motif || "Votre demande n'a pas été approuvée. Contactez le support pour plus d'informations.",
    }
  })
  try {
    await envoyerEmailRejetArtisan(artisan.user.email, artisan.user.prenom, artisan.nomBoutique, motif)
  } catch {}
  return res.json(artisan)
}

export const suspendreArtisan = async (req: AuthRequest, res: Response) => {
  const artisan = await prisma.artisan.update({
    where: { id: Number(req.params.id) },
    data: { statut: 'SUSPENDU' },
    include: { user: { select: { email: true, prenom: true } } }
  })
  await prisma.notification.create({
    data: {
      userId: artisan.userId,
      type: 'SUSPENSION',
      titre: 'Votre boutique a été suspendue',
      message: 'Votre accès artisan a été temporairement suspendu. Contactez le support pour plus d\'informations.',
    }
  })
  try {
    await envoyerEmailSuspensionArtisan(artisan.user.email, artisan.user.prenom, artisan.nomBoutique)
  } catch {}
  return res.json(artisan)
}

export const produitsAModerer = async (_req: AuthRequest, res: Response) => {
  const produits = await prisma.produit.findMany({
    where: { statut: 'BROUILLON' },
    include: { artisan: { include: { user: true } }, categorie: true }
  })
  return res.json(produits.map(p => ({
    ...p,
    artisan: { ...p.artisan, user: sansMdp(p.artisan.user) }
  })))
}

export const changerStatutProduit = async (req: AuthRequest, res: Response) => {
  const produit = await prisma.produit.update({
    where: { id: Number(req.params.id) },
    data: { statut: req.body.statut }
  })
  return res.json(produit)
}

export const tousLesAvis = async (_req: AuthRequest, res: Response) => {
  const avis = await prisma.avis.findMany({
    include: {
      client: { select: { nom: true, prenom: true } },
      produit: { select: { titre: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return res.json(avis)
}

export const supprimerAvis = async (req: AuthRequest, res: Response) => {
  await prisma.avis.delete({ where: { id: Number(req.params.id) } })
  return res.json({ message: 'Avis supprimé.' })
}

export const listerCategories = async (_req: AuthRequest, res: Response) => {
  const categories = await prisma.categorie.findMany()
  return res.json(categories)
}

export const creerCategorie = async (req: AuthRequest, res: Response) => {
  const { nom, slug, icone } = req.body
  const categorie = await prisma.categorie.create({ data: { nom, slug, icone } })
  return res.status(201).json(categorie)
}

export const modifierCategorie = async (req: AuthRequest, res: Response) => {
  const categorie = await prisma.categorie.update({
    where: { id: Number(req.params.id) },
    data: req.body
  })
  return res.json(categorie)
}

export const supprimerCategorie = async (req: AuthRequest, res: Response) => {
  await prisma.categorie.delete({ where: { id: Number(req.params.id) } })
  return res.json({ message: 'Catégorie supprimée.' })
}

export const commandesFondsALiberer = async (_req: AuthRequest, res: Response) => {
  const commandes = await prisma.commande.findMany({
    where: { statut: 'LIVREE', fondsLiberes: false, paiementStatut: 'paye' },
    include: {
      client: { select: { nom: true, prenom: true, email: true, telephone: true } },
      artisan: { include: { user: { select: { nom: true, prenom: true } } } },
      articles: { include: { produit: { include: { artisan: { include: { user: { select: { nom: true, prenom: true } } } } } } } },
    },
    orderBy: { updatedAt: 'desc' }
  })
  return res.json(commandes)
}

export const libererFonds = async (req: AuthRequest, res: Response) => {
  const commandeId = Number(req.params.id)
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: commandeId },
      include: {
        artisan: { include: { user: { select: { id: true } } } },
        articles: { include: { produit: { include: { artisan: { include: { user: { select: { id: true } } } } } } } },
      }
    })
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' })
    if (!commande.receptionConfirmee) return res.status(400).json({ message: 'La réception n\'a pas encore été confirmée par le client.' })
    if (commande.fondsLiberes) return res.json({ message: 'Fonds déjà libérés.' })

    await prisma.commande.update({ where: { id: commandeId }, data: { fondsLiberes: true } })

    const artisanUserId = commande.artisan?.user?.id
      || commande.articles[0]?.produit?.artisan?.user?.id
    if (artisanUserId) {
      await prisma.notification.create({
        data: {
          userId: artisanUserId,
          type: 'PAIEMENT',
          titre: 'Fonds débloqués !',
          message: `Les fonds de la commande #${commandeId} ont été libérés par l'administration. Montant : ${Number(commande.total).toLocaleString('fr-FR')} FCFA.`,
          lien: `/artisan/commandes`,
        }
      })
    }

    return res.json({ succes: true })
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

