import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { notifierUtilisateur } from '../services/socket.service'

const prisma = new PrismaClient()

export const mesConversations = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id

  const messages = await prisma.message.findMany({
    where: { OR: [{ expediteurId: userId }, { destinataireId: userId }] },
    orderBy: { createdAt: 'desc' },
  })

  // Grouper par interlocuteur
  const partenaireIds = new Set<number>()
  const derniersMessages = new Map<number, typeof messages[0]>()
  const nonLusParPartenaire = new Map<number, number>()

  for (const msg of messages) {
    const autreId = msg.expediteurId === userId ? msg.destinataireId : msg.expediteurId
    if (!partenaireIds.has(autreId)) {
      partenaireIds.add(autreId)
      derniersMessages.set(autreId, msg)
    }
    if (msg.destinataireId === userId && !msg.lu) {
      nonLusParPartenaire.set(autreId, (nonLusParPartenaire.get(autreId) || 0) + 1)
    }
  }

  const conversations = await Promise.all(
    Array.from(partenaireIds).map(async (autreId) => {
      const autreUser = await prisma.user.findUnique({
        where: { id: autreId },
        select: { id: true, nom: true, prenom: true, artisan: { select: { id: true, nomBoutique: true, photoCouverture: true } } }
      })
      const dernierMsg = derniersMessages.get(autreId)
      return {
        id: autreId,
        artisan: autreUser?.artisan
          ? { id: autreUser.artisan.id, nomBoutique: autreUser.artisan.nomBoutique, photoProfil: autreUser.artisan.photoCouverture }
          : { id: autreId, nomBoutique: `${autreUser?.prenom} ${autreUser?.nom}`, photoProfil: null },
        dernierMessage: dernierMsg?.contenu || null,
        nonLus: nonLusParPartenaire.get(autreId) || 0,
      }
    })
  )

  return res.json(conversations)
}

export const obtenirMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id
  const autreId = Number(req.params.userId)

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { expediteurId: userId, destinataireId: autreId },
        { expediteurId: autreId, destinataireId: userId },
      ]
    },
    orderBy: { createdAt: 'asc' }
  })

  await prisma.message.updateMany({
    where: { expediteurId: autreId, destinataireId: userId, lu: false },
    data: { lu: true }
  })

  return res.json(messages)
}

export const envoyerMessage = async (req: AuthRequest, res: Response) => {
  const { contenu } = req.body
  const fichierUrl = req.file ? (req.file as Express.Multer.File & { path: string }).path : null
  const destinataireId = Number(req.params.userId)

  if (!contenu?.trim() && !fichierUrl) {
    return res.status(400).json({ message: 'Message vide.' })
  }

  const message = await prisma.message.create({
    data: {
      expediteurId: req.user!.id,
      destinataireId,
      contenu: contenu?.trim() || '',
      fichier: fichierUrl,
    }
  })

  // Notification temps réel au destinataire
  notifierUtilisateur(destinataireId, 'nouveau_message', message)

  return res.status(201).json(message)
}

export const marquerCommeLu = async (req: AuthRequest, res: Response) => {
  await prisma.message.updateMany({
    where: { expediteurId: Number(req.params.userId), destinataireId: req.user!.id },
    data: { lu: true }
  })
  return res.json({ message: 'Messages marqués comme lus.' })
}

export const modifierMessage = async (req: AuthRequest, res: Response) => {
  const { contenu } = req.body
  const id = Number(req.params.id)

  const message = await prisma.message.findUnique({ where: { id } })
  if (!message) return res.status(404).json({ message: 'Message introuvable.' })
  if (message.expediteurId !== req.user!.id) return res.status(403).json({ message: 'Non autorisé.' })
  if (!contenu?.trim()) return res.status(400).json({ message: 'Contenu requis.' })

  const modifie = await prisma.message.update({
    where: { id },
    data: { contenu: contenu.trim() }
  })
  return res.json(modifie)
}

export const supprimerMessage = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id)

  const message = await prisma.message.findUnique({ where: { id } })
  if (!message) return res.status(404).json({ message: 'Message introuvable.' })
  if (message.expediteurId !== req.user!.id) return res.status(403).json({ message: 'Non autorisé.' })

  await prisma.message.delete({ where: { id } })
  return res.json({ message: 'Message supprimé.' })
}
