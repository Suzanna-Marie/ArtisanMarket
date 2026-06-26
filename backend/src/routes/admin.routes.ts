import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.middleware'
import * as adminController from '../controllers/admin.controller'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/tableau-de-bord', adminController.tableauDeBord)

// Utilisateurs
router.get('/utilisateurs', adminController.listerUtilisateurs)
router.put('/utilisateurs/:id/statut', adminController.changerStatutUtilisateur)
router.delete('/utilisateurs/:id', adminController.supprimerUtilisateur)
router.put('/utilisateurs/:id/bloquer', adminController.bloquerUtilisateur)
router.put('/utilisateurs/:id/debloquer', adminController.debloquerUtilisateur)

// Artisans
router.get('/artisans', adminController.tousLesArtisans)
router.get('/artisans/en-attente', adminController.artisansEnAttente)
router.put('/artisans/:id/valider', adminController.validerArtisan)
router.put('/artisans/:id/rejeter', adminController.rejeterArtisan)
router.put('/artisans/:id/suspendre', adminController.suspendreArtisan)
router.delete('/artisans/:id', adminController.supprimerArtisan)

// Produits
router.get('/produits', adminController.tousLesProduits)
router.get('/produits/moderation', adminController.produitsAModerer)
router.put('/produits/:id/statut', adminController.changerStatutProduit)
router.delete('/produits/:id', adminController.supprimerProduit)

// Commandes
router.get('/commandes/fonds-a-liberer', adminController.commandesFondsALiberer)
router.put('/commandes/:id/liberer-fonds', adminController.libererFonds)

// Notifications
router.get('/notifications', adminController.notificationsAdmin)

// Avis
router.get('/avis', adminController.tousLesAvis)
router.delete('/avis/:id', adminController.supprimerAvis)

// Catégories
router.get('/categories', adminController.listerCategories)
router.post('/categories', adminController.creerCategorie)
router.put('/categories/:id', adminController.modifierCategorie)
router.delete('/categories/:id', adminController.supprimerCategorie)

export default router
