import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import { verifierTransaction } from '../services/kkiapay.service'

const prisma = new PrismaClient()

export const passerCommande = async (req: AuthRequest, res: Response) => {
  const { articles, adresseId, surMesure, detailsMesure } = req.body

  try {
    let total = 0
    const articlesVerifies = []

    for (const article of articles) {
      const produit = await prisma.produit.findUnique({ where: { id: article.produitId } })
      if (!produit) {
        return res.status(400).json({ message: `Produit introuvable (id: ${article.produitId}).` })
      }
      if (produit.quantite < article.quantite) {
        return res.status(400).json({ message: `Stock insuffisant pour "${produit.titre}" (disponible : ${produit.quantite}).` })
      }
      total += Number(produit.prix) * article.quantite
      articlesVerifies.push({ produitId: produit.id, quantite: article.quantite, prixUnitaire: produit.prix })
    }

    const commande = await prisma.commande.create({
      data: {
        clientId: req.user!.id,
        adresseId,
        total,
        surMesure: Boolean(surMesure),
        detailsMesure,
        articles: { create: articlesVerifies },
      },
      include: { articles: { include: { produit: true } } }
    })

    return res.status(201).json(commande)
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const mesCommandes = async (req: AuthRequest, res: Response) => {
  try {
    const commandes = await prisma.commande.findMany({
      where: { clientId: req.user!.id },
      include: { articles: { include: { produit: { include: { artisan: true } } } } },
      orderBy: { createdAt: 'desc' }
    })
    return res.json(commandes)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur. Réessayez dans quelques secondes.' })
  }
}

export const obtenirCommande = async (req: AuthRequest, res: Response) => {
  const commande = await prisma.commande.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      articles: { include: { produit: { include: { artisan: true } } } },
      client: { select: { nom: true, prenom: true, email: true } },
      adresse: true,
    }
  })
  if (!commande) return res.status(404).json({ message: 'Commande introuvable.' })

  const { role, id: userId } = req.user!
  const estProprietaire = commande.clientId === userId
  const estArtisanConcerne = role === 'ARTISAN' && commande.articles.some(
    a => a.produit.artisan.userId === userId
  )
  if (!estProprietaire && !estArtisanConcerne && role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès refusé.' })
  }

  return res.json(commande)
}

export const passerCommandeSurMesure = async (req: AuthRequest, res: Response) => {
  const { artisanId, description, couleur, taille, motif, quantite, budget, delaiSouhaite } = req.body
  const file = req.file as Express.Multer.File & { path: string }

  try {
    const artisan = await prisma.artisan.findUnique({ where: { id: Number(artisanId) } })
    if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' })

    const commande = await prisma.commande.create({
      data: {
        clientId: req.user!.id,
        artisanId: artisan.id,
        total: budget ? Number(budget) : 0,
        surMesure: true,
        devisStatut: 'EN_ATTENTE',
        detailsMesure: {
          description, couleur, taille, motif,
          quantite: Number(quantite) || 1,
          delaiSouhaite,
          photoReference: file?.path || null,
        },
      }
    })

    await prisma.notification.create({
      data: {
        userId: artisan.userId,
        type: 'COMMANDE',
        titre: 'Nouvelle demande sur mesure',
        message: `Un client a envoyé une demande de commande sur mesure.`,
        lien: `/artisan/commandes`,
      }
    })

    return res.status(201).json(commande)
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const proposerDevis = async (req: AuthRequest, res: Response) => {
  const { prix, message } = req.body
  const commandeId = Number(req.params.id)

  const prixNum = Number(prix)
  if (!prixNum || prixNum < 100 || prixNum > 50000000) {
    return res.status(400).json({ message: 'Prix invalide (entre 100 et 50 000 000 FCFA).' })
  }

  try {
    const commandeExist = await prisma.commande.findUnique({ where: { id: commandeId }, include: { artisan: true } })
    if (!commandeExist) return res.status(404).json({ message: 'Commande introuvable.' })
    if (commandeExist.artisan?.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Accès refusé.' })
    }

    const commande = await prisma.commande.update({
      where: { id: commandeId },
      data: {
        devisPrix: Number(prix),
        devisMessage: message || null,
        devisStatut: 'ENVOYE',
        total: Number(prix),
      },
      include: { client: { select: { id: true, prenom: true, email: true } } }
    })

    await prisma.notification.create({
      data: {
        userId: commande.clientId,
        type: 'DEVIS',
        titre: 'Devis reçu pour votre commande sur mesure',
        message: `Un artisan a proposé un devis de ${Number(prix).toLocaleString('fr-FR')} FCFA pour votre commande.`,
        lien: `/client/commandes/${commandeId}`,
      }
    })

    return res.json(commande)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const repondreDevis = async (req: AuthRequest, res: Response) => {
  const { accepte } = req.body
  const commandeId = Number(req.params.id)

  try {
    const commandeExist = await prisma.commande.findUnique({ where: { id: commandeId } })
    if (!commandeExist) return res.status(404).json({ message: 'Commande introuvable.' })
    if (commandeExist.clientId !== req.user!.id) {
      return res.status(403).json({ message: 'Accès refusé.' })
    }

    const commande = await prisma.commande.update({
      where: { id: commandeId },
      data: { devisStatut: accepte ? 'ACCEPTE' : 'REFUSE' },
      include: { artisan: { include: { user: { select: { id: true, prenom: true } } } } }
    })

    if (commande.artisanId) {
      await prisma.notification.create({
        data: {
          userId: commande.artisan!.userId,
          type: 'DEVIS',
          titre: accepte ? 'Devis accepté !' : 'Devis refusé',
          message: accepte
            ? `Le client a accepté votre devis pour la commande #${commandeId}. Il va procéder au paiement.`
            : `Le client a refusé votre devis pour la commande #${commandeId}.`,
          lien: `/artisan/commandes`,
        }
      })
    }

    return res.json(commande)
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const STATUTS_VALIDES = ['RECUE', 'EN_PREPARATION', 'PRETE', 'EN_LIVRAISON', 'LIVREE', 'ANNULEE']

export const mettreAJourStatut = async (req: AuthRequest, res: Response) => {
  const { statut } = req.body

  if (!STATUTS_VALIDES.includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide.' })
  }

  try {
    const commandeExist = await prisma.commande.findUnique({
      where: { id: Number(req.params.id) },
      include: { articles: { include: { produit: { include: { artisan: true } } } } }
    })
    if (!commandeExist) return res.status(404).json({ message: 'Commande introuvable.' })

    if (req.user!.role === 'ARTISAN') {
      const estConcerne = commandeExist.articles.some(a => a.produit.artisan.userId === req.user!.id)
        || commandeExist.artisanId !== null
      if (!estConcerne) return res.status(403).json({ message: 'Accès refusé.' })
    }

    const commande = await prisma.commande.update({
      where: { id: Number(req.params.id) },
      data: { statut }
    })

    await prisma.notification.create({
      data: {
        userId: commande.clientId,
        type: 'COMMANDE_STATUT',
        titre: 'Mise à jour de votre commande',
        message: `Votre commande #${commande.id} est maintenant : ${statut.toLowerCase().replace('_', ' ')}`,
        lien: `/client/commandes/${commande.id}`,
      }
    })

    return res.json(commande)
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const TAUX_COMMISSION = 0.10 // 10% prélevé sur chaque commande payée

async function decrementerStock(commandeId: number) {
  const articles = await prisma.articleCommande.findMany({
    where: { commandeId },
    include: { produit: true },
  })

  for (const article of articles) {
    const nouvelleQuantite = Math.max(0, article.produit.quantite - article.quantite)
    await prisma.produit.update({
      where: { id: article.produitId },
      data: {
        quantite: nouvelleQuantite,
        statut: nouvelleQuantite === 0 ? 'EN_RUPTURE' : undefined,
      },
    })
  }
}

export const verifierPaiement = async (req: AuthRequest, res: Response) => {
  const { transactionId } = req.body
  try {
    const commandeActuelle = await prisma.commande.findUnique({
      where: { id: Number(req.params.id) },
    })
    if (!commandeActuelle) return res.status(404).json({ message: 'Commande introuvable.' })
    if (commandeActuelle.clientId !== req.user!.id) {
      return res.status(403).json({ message: 'Accès refusé.' })
    }
    if (commandeActuelle.paiementStatut === 'paye') {
      return res.json({ succes: true, message: 'Déjà payé.' })
    }

    const transaction = await verifierTransaction(transactionId)
    if (transaction.status === 'SUCCESS') {
      const commission = Number(commandeActuelle.total) * TAUX_COMMISSION
      const commande = await prisma.commande.update({
        where: { id: Number(req.params.id) },
        data: { paiementId: transactionId, paiementStatut: 'paye', statut: 'EN_PREPARATION', commission },
      })
      await decrementerStock(commande.id)
      return res.json({ succes: true, commande })
    }
    return res.status(400).json({ succes: false, message: 'Paiement non confirmé.' })
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la vérification du paiement.' })
  }
}

export const confirmerReception = async (req: AuthRequest, res: Response) => {
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
    if (commande.clientId !== req.user!.id) return res.status(403).json({ message: 'Accès refusé.' })
    if (commande.statut !== 'LIVREE') return res.status(400).json({ message: 'La commande n\'est pas encore livrée.' })
    if (commande.receptionConfirmee) return res.json({ message: 'Réception déjà confirmée.' })

    // Libère les fonds immédiatement vers l'artisan
    await prisma.commande.update({
      where: { id: commandeId },
      data: { receptionConfirmee: true, fondsLiberes: true }
    })

    const artisanUserId = commande.artisan?.user?.id
      || commande.articles[0]?.produit?.artisan?.user?.id
    if (artisanUserId) {
      await prisma.notification.create({
        data: {
          userId: artisanUserId,
          type: 'PAIEMENT',
          titre: 'Fonds débloqués !',
          message: `Le client a confirmé la réception de la commande #${commandeId}. Les fonds vous sont maintenant disponibles.`,
          lien: `/artisan/commandes`,
        }
      })
    }

    return res.json({ succes: true })
  } catch {
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}

export const simulerPaiement = async (req: AuthRequest, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Simulation non disponible en production.' })
  }
  try {
    const commandeActuelle = await prisma.commande.findUnique({
      where: { id: Number(req.params.id) },
    })
    if (!commandeActuelle) return res.status(404).json({ message: 'Commande introuvable.' })
    if (commandeActuelle.clientId !== req.user!.id) {
      return res.status(403).json({ message: 'Accès refusé.' })
    }
    if (commandeActuelle.paiementStatut === 'paye') {
      return res.json({ succes: true, message: 'Déjà payé.' })
    }

    const commission = Number(commandeActuelle.total) * TAUX_COMMISSION
    const commande = await prisma.commande.update({
      where: { id: Number(req.params.id) },
      data: { paiementId: `SIM-${Date.now()}`, paiementStatut: 'paye', statut: 'EN_PREPARATION', commission },
    })
    await decrementerStock(commande.id)
    return res.json({ succes: true, commande })
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la simulation.' })
  }
}
