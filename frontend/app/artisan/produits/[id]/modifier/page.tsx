'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Upload, X, Loader2 } from 'lucide-react'
import { detailProduit, modifierProduit, listerCategories } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

export default function ModifierProduit() {
  const { id } = useParams()
  const router = useRouter()
  const [categories, setCategories] = useState<{ id: number; nom: string }[]>([])
  const [photosExistantes, setPhotosExistantes] = useState<string[]>([])
  const [nouvellesPhotos, setNouvellesPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [chargement, setChargement] = useState(false)
  const [chargementInitial, setChargementInitial] = useState(true)
  const [form, setForm] = useState({
    titre: '', description: '', prix: '', quantite: '', categorieId: '',
    delaiLivraison: '', personnalisable: false,
  })

  useEffect(() => {
    Promise.all([
      listerCategories().then(r => setCategories(r.data)),
      detailProduit(Number(id)).then(r => {
        const p = r.data
        setForm({
          titre: p.titre || '',
          description: p.description || '',
          prix: String(p.prix || ''),
          quantite: String(p.quantite || ''),
          categorieId: String(p.categorieId || ''),
          delaiLivraison: p.delaiLivraison || '',
          personnalisable: p.personnalisable || false,
        })
        setPhotosExistantes(p.photos || [])
      }),
    ]).finally(() => setChargementInitial(false))
  }, [id])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleNouvellesPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photosExistantes.length)
    setNouvellesPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const retirerPhotoExistante = (i: number) => setPhotosExistantes(p => p.filter((_, j) => j !== i))
  const retirerNouvellePhoto = (i: number) => {
    setNouvellesPhotos(p => p.filter((_, j) => j !== i))
    setPreviews(p => p.filter((_, j) => j !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChargement(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      fd.append('photosExistantes', JSON.stringify(photosExistantes))
      nouvellesPhotos.forEach(p => fd.append('photos', p))
      await modifierProduit(Number(id), fd)
      toast('Produit mis à jour !', 'success')
      router.push('/artisan/produits')
    } catch {
      toast('Erreur lors de la modification.', 'error')
    } finally {
      setChargement(false)
    }
  }

  if (chargementInitial) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Modifier le produit</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-creme-fonce p-6">
        {/* Photos existantes */}
        {photosExistantes.length > 0 && (
          <div>
            <label className="block text-sm font-semibold mb-2">Photos actuelles</label>
            <div className="flex gap-2 flex-wrap">
              {photosExistantes.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => retirerPhotoExistante(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nouvelles photos */}
        {photosExistantes.length < 5 && (
          <div>
            <label className="block text-sm font-semibold mb-2">Ajouter des photos ({5 - photosExistantes.length} max)</label>
            <label className="border-2 border-dashed border-creme-fonce rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-or/50 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cliquez pour ajouter</span>
              <input type="file" multiple accept="image/*" onChange={handleNouvellesPhotos} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => retirerNouvellePhoto(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1.5">Titre *</label>
          <input type="text" value={form.titre} onChange={set('titre')} required
            className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Description *</label>
          <textarea value={form.description} onChange={set('description')} required rows={4}
            className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Prix (FCFA) *</label>
            <input type="number" value={form.prix} onChange={set('prix')} required min="0"
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Quantité en stock *</label>
            <input type="number" value={form.quantite} onChange={set('quantite')} required min="0"
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Catégorie *</label>
            <select value={form.categorieId} onChange={set('categorieId')} required
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm">
              <option value="">Choisir...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Délai de livraison</label>
            <input type="text" value={form.delaiLivraison} onChange={set('delaiLivraison')} placeholder="Ex: 3-5 jours"
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.personnalisable} onChange={e => setForm(f => ({ ...f, personnalisable: e.target.checked }))}
            className="w-4 h-4 accent-or" />
          <span className="text-sm">Ce produit peut être commandé sur mesure</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-creme-fonce rounded-xl py-3 text-sm font-medium hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={chargement}
            className="flex-1 btn-primaire flex items-center justify-center gap-2 disabled:opacity-60">
            {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
            {chargement ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
