import { Router } from 'express'
import { authenticate, authorize, verifierStatutArtisan } from '../middleware/auth.middleware'
import { upload, envoyerVersCloudinary } from '../middleware/upload.middleware'
import * as artisanController from '../controllers/artisan.controller'
const router = Router()

// Routes authentifiées (avant /:id pour éviter les conflits)
router.put(
  '/boutique',
  authenticate, authorize('ARTISAN'), verifierStatutArtisan,
  upload.single('photoCouverture'), envoyerVersCloudinary,
  artisanController.modifierBoutique
)
router.get('/commandes/moi', authenticate, authorize('ARTISAN'), verifierStatutArtisan, artisanController.mesCommandes)
router.get('/stats/moi', authenticate, authorize('ARTISAN'), verifierStatutArtisan, artisanController.mesStatistiques)
router.get('/mes-produits', authenticate, authorize('ARTISAN'), verifierStatutArtisan, artisanController.mesProduits)

// Routes publiques avec paramètre (après les routes statiques)
router.get('/', artisanController.listerArtisans)
router.get('/:id', artisanController.obtenirBoutique)
router.get('/:id/produits', artisanController.produitsBoutique)

export default router
