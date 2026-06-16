import { Router } from 'express'
import { authenticate, authorize, verifierStatutArtisan } from '../middleware/auth.middleware'
import { upload, envoyerVersCloudinary } from '../middleware/upload.middleware'
import * as produitController from '../controllers/produit.controller'

const router = Router()

router.get('/', produitController.listerProduits)
router.get('/categories', produitController.listerCategories)
router.get('/:id', produitController.obtenirProduit)

router.post('/',
  authenticate, authorize('ARTISAN'), verifierStatutArtisan,
  upload.array('photos', 5), envoyerVersCloudinary,
  produitController.creerProduit
)

router.put('/:id',
  authenticate, authorize('ARTISAN'), verifierStatutArtisan,
  upload.array('photos', 5), envoyerVersCloudinary,
  produitController.modifierProduit
)

router.delete('/:id', authenticate, authorize('ARTISAN', 'ADMIN'), produitController.supprimerProduit)

router.post('/:id/avis', authenticate, authorize('CLIENT'), produitController.ajouterAvis)
router.get('/:id/avis', produitController.obtenirAvis)

router.post('/:id/favori', authenticate, produitController.toggleFavori)
router.get('/favoris/moi', authenticate, produitController.mesFavoris)

export default router
