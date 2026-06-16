'use client'
import { useEffect, useState } from 'react'
import { Banknote, CheckCircle, Package, User } from 'lucide-react'
import { getCommandesFondsALiberer, libererFonds } from '@/lib/api'

interface Artisan { user: { nom: string; prenom: string } }
interface Article { produit: { titre: string; artisan: Artisan } }
interface Client { nom: string; prenom: string; email: string; telephone?: string }
interface Commande {
  id: number
  total: number
  createdAt: string
  updatedAt: string
  client: Client
  artisan: Artisan | null
  articles: Article[]
  fondsLiberes: boolean
}

export default function CommandesAdmin() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [chargement, setChargement] = useState(true)
  const [liberation, setLiberation] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const charger = () => {
    setChargement(true)
    getCommandesFondsALiberer()
      .then(r => setCommandes(r.data))
      .finally(() => setChargement(false))
  }

  useEffect(() => { charger() }, [])

  const handleLiberer = async (id: number) => {
    setLiberation(id)
    setMessage('')
    try {
      await libererFonds(id)
      setMessage(`Fonds de la commande #${id} libérés avec succès. L'artisan a été notifié.`)
      charger()
    } catch {
      setMessage('Erreur lors de la libération des fonds.')
    } finally {
      setLiberation(null)
    }
  }

  const getArtisanNom = (cmd: Commande) => {
    if (cmd.artisan) return `${cmd.artisan.user.prenom} ${cmd.artisan.user.nom}`
    if (cmd.articles[0]?.produit?.artisan)
      return `${cmd.articles[0].produit.artisan.user.prenom} ${cmd.articles[0].produit.artisan.user.nom}`
    return '—'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Fonds à débloquer</h1>
        <p className="text-sm text-slate-500 mt-1">
          Commandes livrées et payées dont le client n'a pas encore confirmé la réception. Vous pouvez libérer les fonds manuellement si nécessaire.
        </p>
      </div>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
          message.includes('Erreur') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <CheckCircle className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      {chargement ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-24 animate-pulse" />
          ))}
        </div>
      ) : commandes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-16">
          <Banknote className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">Aucun fond en attente</p>
          <p className="text-sm text-slate-400 mt-1">Tous les fonds ont été libérés.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {commandes.map(cmd => (
            <div key={cmd.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">Commande #{cmd.id}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                      Réception confirmée
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">Client :</span>
                      <span>{cmd.client.prenom} {cmd.client.nom}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Package className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">Artisan :</span>
                      <span>{getArtisanNom(cmd)}</span>
                    </div>
                    {cmd.client.telephone && (
                      <div className="text-slate-500 text-xs">
                        Tél. client : {cmd.client.telephone}
                      </div>
                    )}
                    <div className="text-slate-500 text-xs">
                      Confirmé le : {new Date(cmd.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <p className="text-xl font-bold text-green-700">
                    {Number(cmd.total).toLocaleString('fr-FR')} FCFA
                  </p>
                  <button
                    onClick={() => handleLiberer(cmd.id)}
                    disabled={liberation === cmd.id}
                    className="flex items-center gap-2 bg-foret text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-foret/90 transition-colors disabled:opacity-60"
                  >
                    <Banknote className="w-4 h-4" />
                    {liberation === cmd.id ? 'Libération...' : 'Libérer les fonds'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
