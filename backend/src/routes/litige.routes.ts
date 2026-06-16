import { Router } from 'express'
import { authenticate, authorize, verifierStatutArtisan } from '../middleware/auth.middleware'
import { upload, envoyerVersCloudinary } from '../middleware/upload.middleware'
import * as litigeController from '../controllers/litige.controller'

const router = Router()

router.use(authenticate)

// Client
router.get('/moi',    authorize('CLIENT'), litigeController.mesLitiges)
router.post('/',      authorize('CLIENT'),
  upload.single('preuvePhoto'), envoyerVersCloudinary,
  litigeController.ouvrirLitige
)

// Artisan
router.get('/artisan',        authorize('ARTISAN'), verifierStatutArtisan, litigeController.litigesArtisan)
router.put('/:id/repondre',   authorize('ARTISAN'), verifierStatutArtisan, litigeController.repondreAuLitige)

// Admin
router.get('/',               authorize('ADMIN'), litigeController.tousLesLitiges)
router.put('/:id/resoudre',   authorize('ADMIN'), litigeController.resoudreLitige)

export default router
