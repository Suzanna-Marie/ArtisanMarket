import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

const MOTIFS = ['Produit non conforme', 'Produit non reçu', 'Qualité insuffisante', 'Commande sur mesure incorrecte', 'Autre']

/* ── CLIENT : ouvrir un litige ── */
export const ouvrirLitige = async (req: AuthRequest, res: Response) => {
  const { commandeId, motif, description } = req.body
  const file = req.file as Express.Multer.File & { path?: string }

  if (!commandeId || !motif || !description) {
    return res.status(400).json({ message: 'Commande, motif et description sont requis.' })
  }
  if (!MOTIFS.includes(motif)) {
    return res.status(400).json({ message: 'Motif invalide.' })
  }

  try {
    const commande = await prisma.commande.findUnique({
      where: { id: Number(commandeId) },
      include: { artisan: true },
    })
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' })
    if (commande.clientId !== req.user!.id) return res.status(403).json({ message: 'Accès refusé.' })

    const existant = await prisma.litige.findFirst({
      where: { commandeId: Number(commandeId), clientId: req.user!.id, statut: { in: ['OUVERT', 'EN_COURS'] } }
    })
    if (existant) return res.status(409).json({ message: 'Un litige est déjà ouvert pour cette commande.' })

    // Récupérer l'artisanId depuis la commande ou le premier article
    let artisanId = commande.artisanId
    if (!artisanId) {
      const commandeAvecArticles = await prisma.commande.findUnique({
        where: { id: Number(commandeId) },
        include: { articles: { include: { produit: true } } }
      })
      artisanId = commandeAvecArticles?.articles?.[0]?.produit?.artisanId ?? null
    }
    if (!artisanId) return res.status(400).json({ message: 'Impossible de déterminer l\'artisan concerné.' })

    const litige = await prisma.litige.create({
      data: {
        commandeId: Number(commandeId),
        clientId: req.user!.id,
        artisanId,
        motif,
        description,
        preuvePhoto: file?.path || null,
      }
    })

    // Notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: req.user!.id,
          type: 'LITIGE',
          titre: 'Litige ouvert',
          message: `Votre litige pour la commande #${commandeId} a bien été enregistré. Notre équipe va l'examiner.`,
          lien: `/client/litiges`,
        },
        ...(commande.artisanId ? [{
          userId: (await prisma.artisan.findUnique({ where: { id: commande.artisanId } }))!.userId,
          type: 'LITIGE',
          titre: 'Nouveau litige sur une de vos commandes',
          message: `Un client a ouvert un litige pour la commande #${commandeId}. Motif : ${motif}.`,
          lien: `/artisan/litiges`,
        }] : []),
      ]
    })

    return res.status(201).json(litige)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

/* ── CLIENT : mes litiges ── */
export const mesLitiges = async (req: AuthRequest, res: Response) => {
  const litiges = await prisma.litige.findMany({
    where: { clientId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(litiges)
}

/* ── ARTISAN : litiges sur ses commandes ── */
export const litigesArtisan = async (req: AuthRequest, res: Response) => {
  const artisan = await prisma.artisan.findUnique({ where: { userId: req.user!.id } })
  if (!artisan) return res.status(404).json({ message: 'Compte artisan introuvable.' })

  const litiges = await prisma.litige.findMany({
    where: { artisanId: artisan.id },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(litiges)
}

/* ── ARTISAN : répondre à un litige ── */
export const repondreAuLitige = async (req: AuthRequest, res: Response) => {
  const { reponseArtisan } = req.body
  if (!reponseArtisan?.trim()) return res.status(400).json({ message: 'La réponse est requise.' })

  try {
    const litige = await prisma.litige.findUnique({ where: { id: Number(req.params.id) } })
    if (!litige) return res.status(404).json({ message: 'Litige introuvable.' })

    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user!.id } })
    if (!artisan || litige.artisanId !== artisan.id) return res.status(403).json({ message: 'Accès refusé.' })

    const updated = await prisma.litige.update({
      where: { id: litige.id },
      data: { reponseArtisan, statut: 'EN_COURS' },
    })

    await prisma.notification.create({
      data: {
        userId: litige.clientId,
        type: 'LITIGE',
        titre: 'L\'artisan a répondu à votre litige',
        message: `L'artisan a apporté une réponse à votre litige pour la commande #${litige.commandeId}.`,
        lien: `/client/litiges`,
      }
    })

    return res.json(updated)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

/* ── ADMIN : tous les litiges ── */
export const tousLesLitiges = async (_req: AuthRequest, res: Response) => {
  const litiges = await prisma.litige.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return res.json(litiges)
}

/* ── ADMIN : résoudre un litige ── */
export const resoudreLitige = async (req: AuthRequest, res: Response) => {
  const { resolution, statut } = req.body
  if (!resolution?.trim()) return res.status(400).json({ message: 'La résolution est requise.' })
  if (!['RESOLU', 'REJETE'].includes(statut)) return res.status(400).json({ message: 'Statut invalide.' })

  try {
    const litige = await prisma.litige.findUnique({ where: { id: Number(req.params.id) } })
    if (!litige) return res.status(404).json({ message: 'Litige introuvable.' })

    const updated = await prisma.litige.update({
      where: { id: litige.id },
      data: { resolution, statut },
    })

    const msg = statut === 'RESOLU'
      ? 'Votre litige a été résolu par notre équipe.'
      : 'Votre litige a été clôturé sans résolution favorable.'

    await prisma.notification.createMany({
      data: [
        { userId: litige.clientId, type: 'LITIGE', titre: `Litige ${statut === 'RESOLU' ? 'résolu' : 'clôturé'}`, message: msg, lien: `/client/litiges` },
        ...(litige.artisanId ? [{
          userId: (await prisma.artisan.findUnique({ where: { id: litige.artisanId } }))!.userId,
          type: 'LITIGE',
          titre: `Litige ${statut === 'RESOLU' ? 'résolu' : 'clôturé'}`,
          message: `Le litige pour la commande #${litige.commandeId} a été ${statut === 'RESOLU' ? 'résolu' : 'clôturé'} par l'administration.`,
          lien: `/artisan/litiges`,
        }] : []),
      ]
    })

    return res.json(updated)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}
