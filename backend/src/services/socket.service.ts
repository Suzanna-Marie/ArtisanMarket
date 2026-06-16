import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

const utilisateursConnectes = new Map<number, string>()
let _io: Server | null = null

export const getIo = () => _io

export const setupSocket = (io: Server) => {
  _io = io

  io.on('connection', (socket: Socket) => {
    let userId: number | null = null

    const token = socket.handshake.auth.token as string
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
        userId = decoded.id
      } catch {}
    }

    if (userId) {
      utilisateursConnectes.set(userId, socket.id)
      socket.join(`user_${userId}`)
    }

    socket.on('rejoindre_conversation', (partenaireId: number) => {
      socket.join(`conversation_${partenaireId}`)
    })

    socket.on('disconnect', () => {
      if (userId) utilisateursConnectes.delete(userId)
    })
  })
}

export const notifierUtilisateur = (userId: number, evenement: string, data: unknown) => {
  _io?.to(`user_${userId}`).emit(evenement, data)
}
