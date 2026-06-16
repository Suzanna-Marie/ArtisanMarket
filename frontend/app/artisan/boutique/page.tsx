'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Loader2, Camera, X } from 'lucide-react'
import { profilArtisan, modifierBoutique } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/components/ui/toaster'

export default function MaBoutique() {
  const { user } = useAuthStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const [chargement, setChargement] = useState(false)
  const [photoCourante, setPhotoCourante] = useState<string | null>(null)
  const [nouvellePhoto, setNouvellePhoto] = useState<File | null>(null)
  const [apercu, setApercu] = useState<string | null>(null)

  const [form, setForm] = useState({
    nomBoutique: '',
    description: '',
    specialite: '',
    localite: '',
    mobileMoneyNum: '',
  })

  useEffect(() => {
    if (!user?.artisan?.id) return
    profilArtisan(user.artisan.id).then(r => {
      const a = r.data
      setForm({
        nomBoutique: a.nomBoutique || '',
        description: a.description || '',
        specialite: a.specialite || '',
        localite: a.localite || '',
        mobileMoneyNum: a.mobileMoneyNum || '',
      })
      if (a.photoCouverture) setPhotoCourante(a.photoCouverture)
    })
  }, [user])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNouvellePhoto(file)
    setApercu(URL.createObjectURL(file))
  }

  const supprimerPhoto = () => {
    setNouvellePhoto(null)
    setApercu(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.artisan?.id) return
    setChargement(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (nouvellePhoto) data.append('photoCouverture', nouvellePhoto)

      const res = await modifierBoutique(user.artisan.id, data)
      if (res.data.photoCouverture) {
        setPhotoCourante(res.data.photoCouverture)
        setNouvellePhoto(null)
        setApercu(null)
      }
      toast('Boutique mise à jour !', 'success')
    } catch {
      toast('Erreur lors de la mise à jour.', 'error')
    } finally {
      setChargement(false)
    }
  }

  const specialites = ['Kanvô', 'Tenue traditionnelle', 'Tenue tricotée', 'Accessoire', 'Broderie', 'Maroquinerie', 'Autre']
  const imageAffichee = apercu || photoCourante

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Ma boutique</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Photo de couverture */}
        <div className="bg-white rounded-2xl border border-creme-fonce overflow-hidden">
          <div className="relative h-44 bg-creme-fonce">
            {imageAffichee ? (
              <>
                <Image src={imageAffichee} alt="Photo de couverture" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
                <div className="absolute inset-0 bg-black/20" />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Camera className="w-8 h-8" />
                <p className="text-xs">Aucune photo de couverture</p>
              </div>
            )}

            {/* Boutons action */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              {apercu && (
                <button type="button" onClick={supprimerPhoto}
                  className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-foret text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow-md">
                <Camera className="w-3.5 h-3.5" />
                {photoCourante ? 'Changer' : 'Ajouter une photo'}
              </button>
            </div>
          </div>

          <div className="p-4">
            <p className="text-xs text-muted-foreground">
              Cette photo apparaît en bannière sur votre page boutique. Recommandé : 1200×400px.
            </p>
          </div>

          <input ref={inputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </div>

        {/* Infos boutique */}
        <div className="bg-white rounded-2xl border border-creme-fonce p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nom de la boutique *</label>
            <input type="text" value={form.nomBoutique} onChange={set('nomBoutique')} required
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4}
              placeholder="Présentez votre boutique, votre savoir-faire, votre histoire..."
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Spécialité *</label>
              <select value={form.specialite} onChange={set('specialite')} required
                className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm">
                <option value="">Choisir...</option>
                {specialites.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Localité *</label>
              <input type="text" value={form.localite} onChange={set('localite')} required
                placeholder="Ex: Cotonou, Parakou..."
                className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Numéro Mobile Money</label>
            <input type="tel" value={form.mobileMoneyNum} onChange={set('mobileMoneyNum')}
              placeholder="Ex: +229 97000000 (MTN/Moov)"
              className="w-full px-4 py-3 rounded-xl border border-creme-fonce bg-creme focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
            <p className="text-xs text-muted-foreground mt-1">Pour recevoir vos paiements via Mobile Money</p>
          </div>

          <button type="submit" disabled={chargement}
            className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60">
            {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
            {chargement ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>

      </form>
    </div>
  )
}
