import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    role: Role
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest['user']
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré.' })
  }
}

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé. Permissions insuffisantes.' })
    }
    next()
  }
}

export const verifierStatutArtisan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user!.id } })
    if (!artisan) {
      return res.status(403).json({ message: 'Profil artisan introuvable.' })
    }
    if (artisan.statut === 'EN_ATTENTE') {
      return res.status(403).json({ message: 'Votre compte est en attente de validation par l\'administration.', statut: 'EN_ATTENTE' })
    }
    if (artisan.statut === 'SUSPENDU') {
      return res.status(403).json({ message: 'Votre compte a été suspendu. Contactez l\'administration.', statut: 'SUSPENDU' })
    }
    if (artisan.statut === 'REJETE') {
      return res.status(403).json({ message: 'Votre demande d\'inscription a été rejetée.', statut: 'REJETE' })
    }
    next()
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}
