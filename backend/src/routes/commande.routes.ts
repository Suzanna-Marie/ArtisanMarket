import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { upload, envoyerVersCloudinary } from '../middleware/upload.middleware'
import * as commandeController from '../controllers/commande.controller'


const router = Router()

router.post('/', authenticate, authorize('CLIENT'), commandeController.passerCommande)
router.post('/sur-mesure', authenticate, authorize('CLIENT'),
  upload.single('photoReference'), envoyerVersCloudinary,
  commandeController.passerCommandeSurMesure
)
router.get('/moi', authenticate, commandeController.mesCommandes)
router.get('/:id', authenticate, commandeController.obtenirCommande)
router.put('/:id/statut', authenticate, authorize('ARTISAN', 'ADMIN'), commandeController.mettreAJourStatut)
router.post('/:id/devis', authenticate, authorize('ARTISAN'), commandeController.proposerDevis)
router.post('/:id/devis/repondre', authenticate, authorize('CLIENT'), commandeController.repondreDevis)
router.post('/:id/paiement/verifier', authenticate, commandeController.verifierPaiement)
router.post('/:id/paiement/simuler', authenticate, commandeController.simulerPaiement)
router.post('/:id/confirmer-reception', authenticate, authorize('CLIENT'), commandeController.confirmerReception)

export default router
