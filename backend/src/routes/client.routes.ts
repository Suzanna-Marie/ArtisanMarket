import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { AuthRequest } from '../middleware/auth.middleware'
import { Response } from 'express'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate)

/* ── Notifications ─────────────────────────────────────────── */

router.get('/notifications', async (req: AuthRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return res.json(notifications)
})

router.put('/notifications/:id/lire', async (req: AuthRequest, res: Response) => {
  await prisma.notification.updateMany({
    where: { id: Number(req.params.id), userId: req.user!.id },
    data: { lu: true },
  })
  return res.json({ message: 'Notification lue.' })
})

router.put('/notifications/lire-tout', async (req: AuthRequest, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, lu: false },
    data: { lu: true },
  })
  return res.json({ message: 'Toutes les notifications lues.' })
})

/* ── Adresses ──────────────────────────────────────────────── */

router.get('/adresses', async (req: AuthRequest, res: Response) => {
  const adresses = await prisma.adresse.findMany({
    where: { userId: req.user!.id },
    orderBy: { principale: 'desc' },
  })
  return res.json(adresses)
})

router.post('/adresses', async (req: AuthRequest, res: Response) => {
  const { libelle, ville, quartier, details, principale } = req.body
  if (!libelle || !ville || !quartier) {
    return res.status(400).json({ message: 'Libellé, ville et quartier sont requis.' })
  }
  try {
    if (principale) {
      await prisma.adresse.updateMany({ where: { userId: req.user!.id }, data: { principale: false } })
    }
    const adresse = await prisma.adresse.create({
      data: { userId: req.user!.id, libelle, ville, quartier, details, principale: Boolean(principale) }
    })
    return res.status(201).json(adresse)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
})

router.put('/adresses/:id', async (req: AuthRequest, res: Response) => {
  const { libelle, ville, quartier, details, principale } = req.body
  try {
    if (principale) {
      await prisma.adresse.updateMany({ where: { userId: req.user!.id }, data: { principale: false } })
    }
    const adresse = await prisma.adresse.update({
      where: { id: Number(req.params.id) },
      data: { libelle, ville, quartier, details, principale: Boolean(principale) }
    })
    return res.json(adresse)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
})

router.delete('/adresses/:id', async (req: AuthRequest, res: Response) => {
  await prisma.adresse.deleteMany({ where: { id: Number(req.params.id), userId: req.user!.id } })
  return res.json({ message: 'Adresse supprimée.' })
})

/* ── Avis du client ────────────────────────────────────────── */

router.get('/avis', authorize('CLIENT'), async (req: AuthRequest, res: Response) => {
  const avis = await prisma.avis.findMany({
    where: { clientId: req.user!.id },
    include: { produit: { select: { id: true, titre: true, photos: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(avis)
})

/* ── Statistiques client ───────────────────────────────────── */

router.get('/stats', authorize('CLIENT'), async (req: AuthRequest, res: Response) => {
  const [totalCommandes, commandesPayees, totalFavoris, totalAvis] = await Promise.all([
    prisma.commande.count({ where: { clientId: req.user!.id } }),
    prisma.commande.aggregate({
      where: { clientId: req.user!.id, paiementStatut: 'paye' },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.favori.count({ where: { clientId: req.user!.id } }),
    prisma.avis.count({ where: { clientId: req.user!.id } }),
  ])

  return res.json({
    totalCommandes,
    totalDepense: Number(commandesPayees._sum.total || 0),
    commandesPayees: commandesPayees._count.id,
    totalFavoris,
    totalAvis,
  })
})

/* ── Supprimer son compte ──────────────────────────────────── */

router.delete('/compte', async (req: AuthRequest, res: Response) => {
  const { motDePasse } = req.body
  if (!motDePasse) return res.status(400).json({ message: 'Le mot de passe est requis.' })
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
    const valide = await bcrypt.compare(motDePasse, user.password)
    if (!valide) return res.status(401).json({ message: 'Mot de passe incorrect.' })

    await prisma.articleCommande.deleteMany({ where: { commande: { clientId: req.user!.id } } })
    await prisma.commande.deleteMany({ where: { clientId: req.user!.id } })
    await prisma.favori.deleteMany({ where: { clientId: req.user!.id } })
    await prisma.avis.deleteMany({ where: { clientId: req.user!.id } })
    await prisma.message.deleteMany({ where: { expediteurId: req.user!.id } })
    await prisma.notification.deleteMany({ where: { userId: req.user!.id } })
    await prisma.adresse.deleteMany({ where: { userId: req.user!.id } })
    await prisma.user.delete({ where: { id: req.user!.id } })

    return res.json({ message: 'Compte supprimé.' })
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
})

export default router
