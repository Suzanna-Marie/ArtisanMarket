import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const loginAdmin = (data: { email: string; password: string }) =>
  api.post('/auth/connexion', data)

// Dashboard
export const getStats = () => api.get('/admin/tableau-de-bord')

// Artisans
export const getArtisans = (params?: Record<string, unknown>) =>
  api.get('/admin/artisans', { params })
export const getArtisansEnAttente = () => api.get('/admin/artisans/en-attente')
export const validerArtisan = (id: number) => api.put(`/admin/artisans/${id}/valider`)
export const rejeterArtisan = (id: number, motif: string) =>
  api.put(`/admin/artisans/${id}/rejeter`, { motif })
export const suspendreArtisan    = (id: number) => api.put(`/admin/artisans/${id}/suspendre`)
export const supprimerArtisan    = (id: number) => api.delete(`/admin/artisans/${id}`)

// Produits
export const getProduits = (params?: Record<string, unknown>) =>
  api.get('/admin/produits', { params })
export const changerStatutProduit = (id: number, statut: string) =>
  api.put(`/admin/produits/${id}/statut`, { statut })
export const supprimerProduit = (id: number) => api.delete(`/admin/produits/${id}`)

// Utilisateurs
export const getUtilisateurs = (params?: Record<string, unknown>) =>
  api.get('/admin/utilisateurs', { params })
export const bloquerUtilisateur = (id: number) => api.put(`/admin/utilisateurs/${id}/bloquer`)
export const debloquerUtilisateur = (id: number) => api.put(`/admin/utilisateurs/${id}/debloquer`)
export const supprimerUtilisateur = (id: number) => api.delete(`/admin/utilisateurs/${id}`)

// Litiges
export const getLitiges     = () => api.get('/litiges')
export const resoudreLitige = (id: number, resolution: string, statut: 'RESOLU' | 'REJETE') =>
  api.put(`/litiges/${id}/resoudre`, { resolution, statut })

// Commandes
export const getCommandesFondsALiberer = () => api.get('/admin/commandes/fonds-a-liberer')
export const libererFonds = (id: number) => api.put(`/admin/commandes/${id}/liberer-fonds`)

export default api
