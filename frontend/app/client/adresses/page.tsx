'use client'
import { useEffect, useState } from 'react'
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, X } from 'lucide-react'
import { mesAdresses, ajouterAdresse, modifierAdresse, supprimerAdresse } from '@/lib/api'
import { toast } from '@/components/ui/toaster'

interface Adresse {
  id: number
  libelle: string
  ville: string
  quartier: string
  details: string | null
  principale: boolean
}

const FORM_VIDE = { libelle: '', ville: '', quartier: '', details: '', principale: false }

export default function PageAdresses() {
  const [adresses, setAdresses] = useState<Adresse[]>([])
  const [chargement, setChargement] = useState(true)
  const [form, setForm] = useState(FORM_VIDE)
  const [editId, setEditId] = useState<number | null>(null)
  const [afficherForm, setAfficherForm] = useState(false)
  const [envoi, setEnvoi] = useState(false)

  const charger = () => mesAdresses().then(r => setAdresses(r.data)).finally(() => setChargement(false))
  useEffect(() => { charger() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.libelle || !form.ville || !form.quartier) {
      toast('Libellé, ville et quartier sont requis.', 'error'); return
    }
    setEnvoi(true)
    try {
      if (editId) {
        await modifierAdresse(editId, form)
        toast('Adresse modifiée.', 'success')
      } else {
        await ajouterAdresse(form)
        toast('Adresse ajoutée.', 'success')
      }
      setForm(FORM_VIDE); setEditId(null); setAfficherForm(false)
      charger()
    } catch {
      toast('Erreur.', 'error')
    } finally {
      setEnvoi(false)
    }
  }

  const commencerEdit = (a: Adresse) => {
    setForm({ libelle: a.libelle, ville: a.ville, quartier: a.quartier, details: a.details || '', principale: a.principale })
    setEditId(a.id)
    setAfficherForm(true)
  }

  const supprimer = async (id: number) => {
    if (!confirm('Supprimer cette adresse ?')) return
    await supprimerAdresse(id)
    toast('Adresse supprimée.', 'info')
    charger()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes adresses</h1>
        <button onClick={() => { setAfficherForm(true); setEditId(null); setForm(FORM_VIDE) }}
          className="flex items-center gap-1.5 btn-primaire !py-2 !px-4 text-sm">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Formulaire */}
      {afficherForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-creme-fonce p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm">{editId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</p>
            <button type="button" onClick={() => setAfficherForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <input type="text" placeholder="Libellé (ex: Maison, Bureau...)" value={form.libelle}
            onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-creme-fonce bg-creme text-sm focus:outline-none focus:ring-2 focus:ring-or/40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Ville *" value={form.ville}
              onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-creme-fonce bg-creme text-sm focus:outline-none focus:ring-2 focus:ring-or/40" />
            <input type="text" placeholder="Quartier *" value={form.quartier}
              onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-creme-fonce bg-creme text-sm focus:outline-none focus:ring-2 focus:ring-or/40" />
          </div>
          <input type="text" placeholder="Détails (optionnel)" value={form.details}
            onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-creme-fonce bg-creme text-sm focus:outline-none focus:ring-2 focus:ring-or/40" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.principale} onChange={e => setForm(f => ({ ...f, principale: e.target.checked }))} />
            Définir comme adresse principale
          </label>
          <button type="submit" disabled={envoi} className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
            {envoi && <Loader2 className="w-4 h-4 animate-spin" />}
            {editId ? 'Enregistrer les modifications' : 'Ajouter l\'adresse'}
          </button>
        </form>
      )}

      {/* Liste */}
      {chargement ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : adresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-creme-fonce p-10 text-center">
          <MapPin className="w-10 h-10 text-creme-fonce mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Aucune adresse enregistrée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adresses.map(a => (
            <div key={a.id} className={`bg-white rounded-2xl border p-4 flex items-start gap-3 ${a.principale ? 'border-or/40' : 'border-creme-fonce'}`}>
              <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${a.principale ? 'text-or' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{a.libelle}</p>
                  {a.principale && <span className="flex items-center gap-1 text-xs bg-or/10 text-or px-2 py-0.5 rounded-full"><Star className="w-3 h-3" /> Principale</span>}
                </div>
                <p className="text-sm text-muted-foreground">{a.quartier}, {a.ville}</p>
                {a.details && <p className="text-xs text-gray-400 mt-0.5">{a.details}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => commencerEdit(a)} className="p-1.5 text-foret hover:bg-foret/10 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => supprimer(a.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
