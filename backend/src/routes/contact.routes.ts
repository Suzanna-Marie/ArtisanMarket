import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { envoyerEmailContact_confirmation } from '../services/email.service'

const router = Router()
const prisma = new PrismaClient()

// Soumettre un message de contact
router.post('/', async (req: Request, res: Response) => {
  const { nom, email, sujet, message } = req.body
  if (!nom || !email || !message) {
    return res.status(400).json({ message: 'Nom, email et message sont requis.' })
  }
  try {
    const msg = await prisma.messageContact.create({
      data: { nom, email, sujet: sujet || null, message }
    })
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
    await Promise.all(admins.map(admin =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'CONTACT',
          titre: `Message de ${nom}`,
          message: `${sujet ? `[${sujet}] ` : ''}${message.slice(0, 150)}${message.length > 150 ? '...' : ''}`,
          lien: `/dashboard/messages-contact`,
        }
      })
    ))
    try { await envoyerEmailContact_confirmation(nom, email) } catch {}
    return res.json({ message: 'Message envoyé avec succès.', id: msg.id })
  } catch (err) {
    console.error('Erreur contact:', err)
    return res.status(500).json({ message: 'Erreur lors de l\'envoi. Réessayez.' })
  }
})

// Lister tous les messages (admin)
router.get('/', authenticate, authorize('ADMIN'), async (_req: Request, res: Response) => {
  const messages = await prisma.messageContact.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return res.json(messages)
})

// Marquer comme lu (admin)
router.put('/:id/lu', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  const msg = await prisma.messageContact.update({
    where: { id: Number(req.params.id) },
    data: { lu: true }
  })
  return res.json(msg)
})

// Répondre (admin) — envoie un email à l'expéditeur
router.post('/:id/repondre', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  const { reponse } = req.body
  if (!reponse) return res.status(400).json({ message: 'La réponse est requise.' })
  try {
    const msg = await prisma.messageContact.findUnique({ where: { id: Number(req.params.id) } })
    if (!msg) return res.status(404).json({ message: 'Message introuvable.' })

    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || `"ArtisanMarket" <${process.env.SMTP_USER}>`,
      to: msg.email,
      subject: `Re: ${msg.sujet || 'Votre message'} — ArtisanMarket`,
      text: reponse,
    })
    await prisma.messageContact.update({
      where: { id: msg.id },
      data: { lu: true, repondu: true }
    })
    return res.json({ message: 'Réponse envoyée.' })
  } catch (err) {
    console.error('Erreur réponse contact:', err)
    return res.status(500).json({ message: 'Erreur lors de l\'envoi de la réponse.' })
  }
})

export default router
