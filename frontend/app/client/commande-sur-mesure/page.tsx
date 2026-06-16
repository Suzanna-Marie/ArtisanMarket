'use client'
import ReauthRequis from '@/components/auth/ReauthRequis'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Upload, X } from 'lucide-react'
import { passerCommandeSurMesure, listerArtisans } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

function WrappedCommandeSurMesure() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const artisanIdParam = searchParams.get('artisanId')

  const [artisans, setArtisans] = useState<{ id: number; nomBoutique: string }[]>([])
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [chargement, setChargement] = useState(false)

  const [form, setForm] = useState({
    artisanId: artisanIdParam || '',
    description: '',
    couleur: '',
    taille: '',
    motif: '',
    quantite: '1',
    budget: '',
    delaiSouhaite: '',
  })

  useEffect(() => {
    listerArtisans({}).then(r => setArtisans(r.data))
  }, [])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.artisanId) { toast('Choisissez un artisan.', 'error'); return }
    if (!form.description) { toast('Décrivez votre commande.', 'error'); return }
    setChargement(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (photo) fd.append('photoReference', photo)
      await passerCommandeSurMesure(fd)
      toast('Commande sur mesure envoyée !', 'success')
      router.push('/client/commandes')
    } catch {
      toast('Erreur lors de l\'envoi.', 'error')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commande sur mesure</h1>
        <p className="text-sm text-muted-foreground mt-1">Décrivez exactement ce que vous souhaitez et l&apos;artisan vous recontactera</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-creme-fonce p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Artisan *</label>
          <select value={form.artisanId} onChange={set('artisanId')} required
            className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm">
            <option value="">Choisir un artisan...</option>
            {artisans.map(a => <option key={a.id} value={a.id}>{a.nomBoutique}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Description de votre commande *</label>
          <textarea value={form.description} onChange={set('description')} required rows={4}
            placeholder="Décrivez précisément ce que vous voulez : type de vêtement, style, occasion, matière préférée..."
            className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Couleur(s) souhaitée(s)</label>
            <input type="text" value={form.couleur} onChange={set('couleur')} placeholder="Ex: bleu et blanc"
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Taille / Mensurations</label>
            <input type="text" value={form.taille} onChange={set('taille')} placeholder="Ex: M, poitrine 90cm..."
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Motif / Style</label>
            <input type="text" value={form.motif} onChange={set('motif')} placeholder="Ex: tissage traditionnel"
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Quantité</label>
            <input type="number" value={form.quantite} onChange={set('quantite')} min="1"
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Budget maximum (FCFA)</label>
            <input type="number" value={form.budget} onChange={set('budget')} placeholder="Optionnel"
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Délai souhaité</label>
            <input type="text" value={form.delaiSouhaite} onChange={set('delaiSouhaite')} placeholder="Ex: avant le 15 juin"
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>
        </div>

        {/* Photo de référence */}
        <div>
          <label className="block text-sm font-semibold mb-2">Photo de référence (optionnel)</label>
          {preview ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden">
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => { setPhoto(null); setPreview(null) }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-creme-fonce rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-or/50 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ajouter une photo de référence</span>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-creme-fonce rounded-xl py-3 text-sm font-medium hover:bg-gray-100 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={chargement}
            className="flex-1 btn-primaire flex items-center justify-center gap-2 disabled:opacity-60">
            {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
            {chargement ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function CommandeSurMesure() {
  return <ReauthRequis message="Pour passer une commande sur mesure, confirmez votre identité."><WrappedCommandeSurMesure /></ReauthRequis>
}
