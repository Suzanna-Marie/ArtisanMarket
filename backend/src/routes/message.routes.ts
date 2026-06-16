import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { upload, envoyerVersCloudinary } from '../middleware/upload.middleware'
import * as messageController from '../controllers/message.controller'

const router = Router()

router.use(authenticate)

router.get('/conversations', messageController.mesConversations)
router.get('/conversations/:userId', messageController.obtenirMessages)
router.post('/conversations/:userId', upload.single('fichier'), envoyerVersCloudinary, messageController.envoyerMessage)
router.put('/conversations/:userId/lu', messageController.marquerCommeLu)
router.put('/:id', messageController.modifierMessage)
router.delete('/:id', messageController.supprimerMessage)

export default router
