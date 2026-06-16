import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { PrismaClient, Role } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { envoyerCodeVerification, envoyerCodeReinitialisation } from '../services/email.service'

const prisma = new PrismaClient()

const genererToken = (id: number, email: string, role: Role): string => {
  const options: SignOptions = { expiresIn: '24h' }
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET!, options)
}

const genererCode = (): string => Math.floor(100000 + Math.random() * 900000).toString()

export const inscription = async (req: Request, res: Response) => {
  const erreurs = validationResult(req)
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg })
  }

  const { email, password, nom, prenom, telephone, role, boutique, localite, specialite } = req.body

  try {
    const existant = await prisma.user.findUnique({ where: { email } })
    if (existant) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
    }

    const hash = await bcrypt.hash(password, 12)
    const code = genererCode()
    const expireAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const filesObj = (req as unknown as { files?: Record<string, Array<{ path: string }>> }).files || {}
    const pieceIdentiteUrl = filesObj['pieceIdentite']?.[0]?.path || null
    const photosOeuvresUrls = (filesObj['photosOeuvres'] || []).map(f => f.path)

    await prisma.user.create({
      data: {
        email,
        password: hash,
        nom,
        prenom,
        telephone,
        role: role as Role,
        emailVerifie: false,
        codeVerif: code,
        codeVerifExpire: expireAt,
        ...(role === 'ARTISAN' && {
          artisan: {
            create: {
              nomBoutique: boutique || `Boutique de ${prenom}`,
              localite: localite || '',
              specialite: specialite || '',
              ...(pieceIdentiteUrl && { pieceIdentite: pieceIdentiteUrl }),
              ...(photosOeuvresUrls.length > 0 && { photosOeuvres: photosOeuvresUrls }),
            }
          }
        })
      },
    })

    try {
      await envoyerCodeVerification(email, prenom, code)
    } catch (emailErr) {
      console.warn(`\n⚠️  Email non envoyé (SMTP non configuré)`)
      console.warn(`📧  Code de vérification pour ${email} : \x1b[33m${code}\x1b[0m\n`)
    }

    return res.status(201).json({
      message: 'Compte créé. Un code de vérification a été envoyé à votre adresse email.',
      email,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const verifierEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ message: 'Email et code requis.' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { artisan: true }
    })

    if (!user) {
      return res.status(404).json({ message: 'Compte introuvable.' })
    }

    if (user.emailVerifie) {
      return res.status(400).json({ message: 'Cet email est déjà vérifié.' })
    }

    if (!user.codeVerif || user.codeVerif !== code) {
      return res.status(400).json({ message: 'Code incorrect. Vérifiez votre email.' })
    }

    if (!user.codeVerifExpire || user.codeVerifExpire < new Date()) {
      return res.status(400).json({ message: 'Code expiré. Demandez un nouveau code.' })
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerifie: true, codeVerif: null, codeVerifExpire: null }
    })

    const { password: _, ...userSansMotDePasse } = { ...user, emailVerifie: true }
    const token = genererToken(user.id, user.email, user.role)

    return res.json({
      message: 'Email vérifié avec succès ! Bienvenue sur ArtisanMarket.',
      token,
      user: userSansMotDePasse,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const renvoyerCode = async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email requis.' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({ message: 'Compte introuvable.' })
    }

    if (user.emailVerifie) {
      return res.status(400).json({ message: 'Cet email est déjà vérifié.' })
    }

    const code = genererCode()
    const expireAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: { codeVerif: code, codeVerifExpire: expireAt }
    })

    try {
      await envoyerCodeVerification(email, user.prenom, code)
    } catch (emailErr) {
      console.warn(`\n⚠️  Email non envoyé (SMTP non configuré)`)
      console.warn(`📧  Nouveau code pour ${email} : \x1b[33m${code}\x1b[0m\n`)
    }

    return res.json({ message: 'Nouveau code envoyé à votre adresse email.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const connexion = async (req: Request, res: Response) => {
  const erreurs = validationResult(req)
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg })
  }

  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { artisan: true }
    })

    if (!user || !user.actif) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
    }

    const valide = await bcrypt.compare(password, user.password)
    if (!valide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
    }

    // Email non vérifié → inviter à vérifier
    if (!user.emailVerifie) {
      return res.status(403).json({
        message: 'Votre email n\'est pas encore vérifié.',
        needsVerification: true,
        email: user.email,
      })
    }

    const token = genererToken(user.id, user.email, user.role)
    const { password: _, ...userSansMotDePasse } = user

    return res.json({ token, user: userSansMotDePasse })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const moi = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { artisan: true, adresses: true },
    })
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
    const { password: _, ...userSansMotDePasse } = user
    return res.json(userSansMotDePasse)
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const modifierProfil = async (req: AuthRequest, res: Response) => {
  const erreurs = validationResult(req)
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg })
  }

  const { nom, prenom, telephone, avatar, motDePasse } = req.body
  try {
    // Vérification du mot de passe si fourni
    if (motDePasse) {
      const userActuel = await prisma.user.findUnique({ where: { id: req.user!.id } })
      if (!userActuel) return res.status(404).json({ message: 'Utilisateur introuvable.' })
      const valide = await bcrypt.compare(motDePasse, userActuel.password)
      if (!valide) return res.status(401).json({ message: 'Mot de passe incorrect.' })
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { nom, prenom, telephone, avatar },
    })
    const { password: _, ...userSansMotDePasse } = user
    return res.json({ message: 'Profil mis à jour.', user: userSansMotDePasse })
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const demanderReinitialisationMdp = async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email requis.' })

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    // Réponse générique pour ne pas révéler si l'email existe
    if (!user || !user.actif) {
      return res.json({ message: 'Si cet email est associé à un compte, vous recevrez un code.' })
    }

    const code = genererCode()
    const expireAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: { codeVerif: code, codeVerifExpire: expireAt }
    })

    try {
      await envoyerCodeReinitialisation(email, user.prenom, code)
    } catch {
      console.warn(`\n⚠️  Email non envoyé (SMTP non configuré)`)
      console.warn(`🔑  Code réinitialisation pour ${email} : \x1b[33m${code}\x1b[0m\n`)
    }

    return res.json({ message: 'Si cet email est associé à un compte, vous recevrez un code.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const reinitialiserMdp = async (req: Request, res: Response) => {
  const { email, code, nouveauMotDePasse } = req.body

  if (!email || !code || !nouveauMotDePasse) {
    return res.status(400).json({ message: 'Email, code et nouveau mot de passe requis.' })
  }
  if (nouveauMotDePasse.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: 'Compte introuvable.' })
    if (!user.codeVerif || user.codeVerif !== code) {
      return res.status(400).json({ message: 'Code incorrect.' })
    }
    if (!user.codeVerifExpire || user.codeVerifExpire < new Date()) {
      return res.status(400).json({ message: 'Code expiré. Recommencez la procédure.' })
    }

    const hash = await bcrypt.hash(nouveauMotDePasse, 12)
    await prisma.user.update({
      where: { email },
      data: { password: hash, codeVerif: null, codeVerifExpire: null }
    })

    return res.json({ message: 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const changerMotDePasse = async (req: AuthRequest, res: Response) => {
  const erreurs = validationResult(req)
  if (!erreurs.isEmpty()) {
    return res.status(400).json({ message: erreurs.array()[0].msg })
  }

  const { ancienMotDePasse, nouveauMotDePasse } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    const valide = await bcrypt.compare(ancienMotDePasse, user!.password)
    if (!valide) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect.' })
    }

    const hash = await bcrypt.hash(nouveauMotDePasse, 12)
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hash }
    })

    return res.json({ message: 'Mot de passe modifié avec succès.' })
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}
