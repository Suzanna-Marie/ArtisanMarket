import axios from 'axios'
import { useAuthStore } from './store'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      useAuthStore.getState().logout()
      window.location.href = '/connexion'
    }
    return Promise.reject(error)
  }
)

// Auth
export const inscription = (data: unknown) => api.post('/auth/inscription', data, {
  headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
})
export const connexion = (data: unknown) => api.post('/auth/connexion', data)
export const moi = () => api.get('/auth/moi')
export const modifierProfil = (data: unknown) => api.put('/auth/profil', data)
export const changerMotDePasse = (data: unknown) => api.put('/auth/mot-de-passe', data)
export const verifierEmail = (data: { email: string; code: string }) => api.post('/auth/verifier-email', data)
export const renvoyerCode = (email: string) => api.post('/auth/renvoyer-code', { email })
export const demanderReinitialisationMdp = (email: string) => api.post('/auth/mot-de-passe-oublie', { email })
export const reinitialiserMdp = (data: { email: string; code: string; nouveauMotDePasse: string }) => api.post('/auth/reinitialiser-mot-de-passe', data)

// Stats publiques
export const statsPubliques = () => api.get('/stats')

// Produits
export const listerProduits = (params?: Record<string, unknown>) => api.get('/produits', { params })
export const obtenirProduit = (id: number) => api.get(`/produits/${id}`)
export const listerCategories = () => api.get('/produits/categories')
export const creerProduit = (data: FormData) => api.post('/produits', data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const modifierProduit = (id: number, data: FormData) => api.put(`/produits/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const supprimerProduit = (id: number) => api.delete(`/produits/${id}`)
export const ajouterAvis = (id: number, data: unknown) => api.post(`/produits/${id}/avis`, data)
export const toggleFavori = (id: number) => api.post(`/produits/${id}/favori`)
export const mesFavoris = () => api.get('/produits/favoris/moi')
export const retirerFavori = (id: number) => api.delete(`/produits/${id}/favori`)
export const detailProduit = (id: number) => api.get(`/produits/${id}`)

// Artisans
export const listerArtisans = (params?: Record<string, unknown>) => api.get('/artisans', { params })
export const obtenirBoutique = (id: number) => api.get(`/artisans/${id}`)
export const profilArtisan = (id: number) => api.get(`/artisans/${id}`)
export const produitsBoutique = (id: number) => api.get(`/artisans/${id}/produits`)
export const modifierBoutique = (_id: number, data: FormData | Record<string, unknown>) =>
  api.put('/artisans/boutique', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {})
export const mesCommandesArtisan = () => api.get('/artisans/commandes/moi')
export const mesStatistiques = () => api.get('/artisans/stats/moi')
export const statsArtisan = () => api.get('/artisans/stats/moi')
export const mesProduits = () => api.get('/artisans/mes-produits')

// Commandes
export const passerCommande = (data: unknown) => api.post('/commandes', data)
export const passerCommandeSurMesure = (data: FormData) => api.post('/commandes/sur-mesure', data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const mesCommandes = () => api.get('/commandes/moi')
export const obtenirCommande = (id: number) => api.get(`/commandes/${id}`)
export const mettreAJourStatut = (id: number, statut: string) => api.put(`/commandes/${id}/statut`, { statut })
export const proposerDevis = (id: number, prix: number, message?: string) => api.post(`/commandes/${id}/devis`, { prix, message })
export const repondreDevis = (id: number, accepte: boolean) => api.post(`/commandes/${id}/devis/repondre`, { accepte })
export const verifierPaiement = (id: number, transactionId: string) => api.post(`/commandes/${id}/paiement/verifier`, { transactionId })
export const simulerPaiement = (id: number) => api.post(`/commandes/${id}/paiement/simuler`)
export const confirmerReception = (id: number) => api.post(`/commandes/${id}/confirmer-reception`)

// Messages
export const mesConversations = () => api.get('/messages/conversations')
export const obtenirMessages = (convId: number) => api.get(`/messages/conversations/${convId}`)
export const messagesConversation = (convId: number) => api.get(`/messages/conversations/${convId}`)
export const envoyerMessage = (convId: number, data: string | FormData) => {
  if (typeof data === 'string') return api.post(`/messages/conversations/${convId}`, { contenu: data })
  return api.post(`/messages/conversations/${convId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const modifierMessage = (id: number, contenu: string) => api.put(`/messages/${id}`, { contenu })
export const supprimerMessage = (id: number) => api.delete(`/messages/${id}`)

// Client — nouvelles fonctionnalités
export const mesNotifications = () => api.get('/client/notifications')
export const marquerNotifLue = (id: number) => api.put(`/client/notifications/${id}/lire`)
export const marquerToutesLues = () => api.put('/client/notifications/lire-tout')
export const mesAdresses = () => api.get('/client/adresses')
export const ajouterAdresse = (data: unknown) => api.post('/client/adresses', data)
export const modifierAdresse = (id: number, data: unknown) => api.put(`/client/adresses/${id}`, data)
export const supprimerAdresse = (id: number) => api.delete(`/client/adresses/${id}`)
export const mesAvisClient = () => api.get('/client/avis')
export const mesStatsClient = () => api.get('/client/stats')
export const supprimerMonCompte = (motDePasse: string) => api.delete('/client/compte', { data: { motDePasse } })

// Litiges
export const ouvrirLitige = (data: FormData | Record<string, unknown>) =>
  data instanceof FormData
    ? api.post('/litiges', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/litiges', data)
export const mesLitiges         = () => api.get('/litiges/moi')
export const litigesArtisan     = () => api.get('/litiges/artisan')
export const repondreAuLitige   = (id: number, reponseArtisan: string) => api.put(`/litiges/${id}/repondre`, { reponseArtisan })
export const tousLesLitiges     = () => api.get('/litiges')
export const resoudreLitige     = (id: number, resolution: string, statut: 'RESOLU' | 'REJETE') => api.put(`/litiges/${id}/resoudre`, { resolution, statut })

// Admin
export const tableauDeBord = () => api.get('/admin/tableau-de-bord')
export const artisansEnAttente = () => api.get('/admin/artisans/en-attente')
export const tousLesArtisans = (params?: Record<string, unknown>) => api.get('/admin/artisans', { params })
export const validerArtisan = (id: number) => api.put(`/admin/artisans/${id}/valider`)
export const rejeterArtisan = (id: number, motif: string) => api.put(`/admin/artisans/${id}/rejeter`, { motif })
export const suspendreArtisan    = (id: number) => api.put(`/admin/artisans/${id}/suspendre`)
export const supprimerArtisan    = (id: number) => api.delete(`/admin/artisans/${id}`)
export const supprimerUtilisateur = (id: number) => api.delete(`/admin/utilisateurs/${id}`)
export const tousLesProduits = (params?: Record<string, unknown>) => api.get('/admin/produits', { params })
export const modifierStatutProduitAdmin = (id: number, statut: string) => api.put(`/admin/produits/${id}/statut`, { statut })
export const supprimerProduitAdmin = (id: number) => api.delete(`/admin/produits/${id}`)
export const tousLesUtilisateurs = (params?: Record<string, unknown>) => api.get('/admin/utilisateurs', { params })
export const bloquerUtilisateur = (id: number) => api.put(`/admin/utilisateurs/${id}/bloquer`)
export const debloquerUtilisateur = (id: number) => api.put(`/admin/utilisateurs/${id}/debloquer`)

export default api
