'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function RechercheBar() {
  const [recherche, setRecherche] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (recherche.trim()) {
      router.push(`/produits?recherche=${encodeURIComponent(recherche)}`)
    } else {
      router.push('/produits')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-or/20 focus-within:border-or/50 transition-colors">
        <Search className="w-5 h-5 text-gray-400 ml-5 shrink-0" />
        <input
          type="text"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          placeholder="Rechercher un produit, un artisan, une catégorie..."
          className="flex-1 px-4 py-4 text-sm text-gray-700 focus:outline-none bg-transparent placeholder:text-gray-400"
        />
        <button
          type="submit"
          className="bg-or text-white font-semibold px-6 py-4 hover:bg-or/90 transition-colors text-sm shrink-0"
        >
          Rechercher
        </button>
      </div>
    </form>
  )
}
