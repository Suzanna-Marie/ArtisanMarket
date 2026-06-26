import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import authRoutes from './routes/auth.routes'
import produitRoutes from './routes/produit.routes'
import commandeRoutes from './routes/commande.routes'
import artisanRoutes from './routes/artisan.routes'
import adminRoutes from './routes/admin.routes'
import messageRoutes from './routes/message.routes'
import clientRoutes from './routes/client.routes'
import litigeRoutes from './routes/litige.routes'
import contactRoutes from './routes/contact.routes'
import { setupSocket } from './services/socket.service'

dotenv.config()

const prismaPublic = new PrismaClient()

const app = express()
app.set('trust proxy', 1)
const httpServer = createServer(app)

const originesAutorisees = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3001',
]

export const io = new Server(httpServer, {
  cors: {
    origin: originesAutorisees,
    credentials: true,
  },
})

app.use(cors({
  origin: originesAutorisees,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/produits', produitRoutes)
app.use('/api/commandes', commandeRoutes)
app.use('/api/artisans', artisanRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/litiges', litigeRoutes)
app.use('/api/contact', contactRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ArtisanMarket API is running' })
})

app.get('/api/stats', async (_req, res) => {
  try {
    const [totalProduits, totalArtisans, totalClients] = await Promise.all([
      prismaPublic.produit.count({ where: { statut: { in: ['PUBLIE', 'EN_RUPTURE'] } } }),
      prismaPublic.artisan.count({ where: { statut: 'VALIDE' } }),
      prismaPublic.user.count({ where: { role: 'CLIENT' } }),
    ])
    return res.json({ totalProduits, totalArtisans, totalClients })
  } catch {
    return res.status(500).json({ totalProduits: 0, totalArtisans: 0, totalClients: 0 })
  }
})

setupSocket(io)

// Empêcher le serveur de crasher sur erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('Erreur non gérée :', err)
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Serveur ArtisanMarket démarré sur http://localhost:${PORT}`)
})
