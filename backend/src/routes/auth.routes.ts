import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import { upload, envoyerVersCloudinary } from '../middleware/upload.middleware'

const router = Router()

// Regex réutilisables
const REGEX_NOM      = /^[a-zA-ZÀ-ÿ\s\-']+$/
const REGEX_TEL_BENIN = /^(\+229)?01[0-9]{8}$/
// Au moins 8 caractères, 1 majuscule, 1 chiffre
const REGEX_MDP = /^(?=.*[A-Z])(?=.*\d).{8,}$/

// Rate limiters
const limiteConnexion = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const limiteInscription = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  message: { message: 'Trop de tentatives d\'inscription depuis cette adresse IP.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const limiteMdpOublie = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: { message: 'Trop de demandes de réinitialisation. Réessayez dans 1 heure.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/inscription',
  limiteInscription,
  upload.fields([
    { name: 'pieceIdentite', maxCount: 1 },
    { name: 'photosOeuvres', maxCount: 5 },
  ]),
  envoyerVersCloudinary,

  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prénom est requis.')
    .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères.')
    .matches(REGEX_NOM).withMessage('Le prénom ne doit contenir que des lettres (pas de chiffres ni de symboles).'),

  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis.')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères.')
    .matches(REGEX_NOM).withMessage('Le nom ne doit contenir que des lettres (pas de chiffres ni de symboles).'),

  body('email')
    .trim()
    .notEmpty().withMessage("L'adresse email est requise.")
    .isEmail().withMessage('Adresse email invalide.')
    .matches(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/).withMessage('Email invalide. Exemple : nom@domaine.com'),

  body('telephone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(REGEX_TEL_BENIN).withMessage('Numéro invalide. Format attendu : 0140202000 ou +2290140202000 (indicatif +229 uniquement)'),

  body('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .isLength({ max: 100 }).withMessage('Le mot de passe est trop long.')
    .matches(REGEX_MDP).withMessage('Le mot de passe doit contenir au moins 1 majuscule et 1 chiffre.'),

  body('role')
    .isIn(['CLIENT', 'ARTISAN']).withMessage('Rôle invalide.'),

  body('boutique')
    .if(body('role').equals('ARTISAN'))
    .trim()
    .notEmpty().withMessage('Le nom de la boutique est requis.')
    .isLength({ min: 2, max: 80 }).withMessage('Le nom de la boutique doit contenir entre 2 et 80 caractères.'),

  body('localite')
    .if(body('role').equals('ARTISAN'))
    .trim()
    .notEmpty().withMessage('La localité est requise.')
    .isLength({ min: 2, max: 80 }).withMessage('La localité est trop courte ou trop longue.'),

  body('specialite')
    .if(body('role').equals('ARTISAN'))
    .trim()
    .notEmpty().withMessage('La spécialité est requise.'),

  authController.inscription
)

router.post('/connexion',
  limiteConnexion,
  body('email')
    .trim()
    .notEmpty().withMessage("L'adresse email est requise.")
    .isEmail().withMessage('Adresse email invalide.')
    .matches(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/).withMessage('Email invalide. Exemple : nom@domaine.com'),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis.'),

  authController.connexion
)

router.post('/verifier-email',
  body('email').isEmail().withMessage('Email invalide.'),
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Code invalide.'),
  authController.verifierEmail
)

router.post('/renvoyer-code',
  body('email').isEmail().withMessage('Email invalide.'),
  authController.renvoyerCode
)

router.post('/mot-de-passe-oublie',
  limiteMdpOublie,
  body('email').trim().isEmail().withMessage('Email invalide.'),
  authController.demanderReinitialisationMdp
)

router.post('/reinitialiser-mot-de-passe',
  body('email').trim().isEmail().withMessage('Email invalide.'),
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Code invalide.'),
  body('nouveauMotDePasse')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(REGEX_MDP).withMessage('Le mot de passe doit contenir au moins 1 majuscule et 1 chiffre.'),
  authController.reinitialiserMdp
)

router.get('/moi', authenticate, authController.moi)

router.put('/profil', authenticate,
  body('prenom')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Prénom invalide.')
    .matches(REGEX_NOM).withMessage('Le prénom ne doit contenir que des lettres.'),

  body('nom')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Nom invalide.')
    .matches(REGEX_NOM).withMessage('Le nom ne doit contenir que des lettres.'),

  body('telephone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(REGEX_TEL_BENIN).withMessage('Numéro invalide. Format attendu : 0140202000 ou +2290140202000 (indicatif +229 uniquement)'),

  authController.modifierProfil
)

router.put('/mot-de-passe', authenticate,
  body('ancienMotDePasse')
    .notEmpty().withMessage("L'ancien mot de passe est requis."),
  body('nouveauMotDePasse')
    .isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères.')
    .isLength({ max: 100 }).withMessage('Le mot de passe est trop long.')
    .matches(REGEX_MDP).withMessage('Le mot de passe doit contenir au moins 1 majuscule et 1 chiffre.'),
  authController.changerMotDePasse
)

export default router
