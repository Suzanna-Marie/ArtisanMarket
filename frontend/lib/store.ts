import { create } from 'zustand'

interface User {
  id: number
  email: string
  nom: string
  prenom: string
  telephone?: string
  role: 'CLIENT' | 'ARTISAN' | 'ADMIN'
  avatar?: string
  actif: boolean
  artisan?: { id: number; nomBoutique: string; statut: string }
}

interface ArticlePanier {
  produitId: number
  titre: string
  prix: number
  photo: string
  quantite: number
  artisanNom: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

interface PanierStore {
  articles: ArticlePanier[]
  ajouterArticle: (article: ArticlePanier) => void
  retirerArticle: (produitId: number) => void
  modifierQuantite: (produitId: number, quantite: number) => void
  viderPanier: () => void
  total: () => number
  nbArticles: () => number
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!get().token,
}))

export const usePanierStore = create<PanierStore>((set, get) => ({
  articles: [],

  ajouterArticle: (article) => {
    set((state) => {
      const existant = state.articles.find(a => a.produitId === article.produitId)
      if (existant) {
        return {
          articles: state.articles.map(a =>
            a.produitId === article.produitId
              ? { ...a, quantite: a.quantite + article.quantite }
              : a
          )
        }
      }
      return { articles: [...state.articles, article] }
    })
  },

  retirerArticle: (produitId) =>
    set((state) => ({ articles: state.articles.filter(a => a.produitId !== produitId) })),

  modifierQuantite: (produitId, quantite) =>
    set((state) => ({
      articles: state.articles.map(a => a.produitId === produitId ? { ...a, quantite } : a)
    })),

  viderPanier: () => set({ articles: [] }),

  total: () => get().articles.reduce((sum, a) => sum + a.prix * a.quantite, 0),

  nbArticles: () => get().articles.reduce((sum, a) => sum + a.quantite, 0),
}))
