'use client'
import { useEffect, useState } from 'react'
import { Bell, BellOff, Check } from 'lucide-react'
import { mesNotifications, marquerNotifLue, marquerToutesLues } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import Link from 'next/link'

interface Notif {
  id: number
  type: string
  titre: string
  message: string
  lu: boolean
  lien: string | null
  createdAt: string
}

const TYPE_STYLE: Record<string, string> = {
  COMMANDE:       'bg-blue-100 text-blue-600',
  COMMANDE_STATUT:'bg-purple-100 text-purple-600',
  DEVIS:          'bg-amber-100 text-amber-600',
  SUSPENSION:     'bg-red-100 text-red-600',
}

export default function PageNotifications() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [chargement, setChargement] = useState(true)

  const charger = () =>
    mesNotifications().then(r => setNotifs(r.data)).finally(() => setChargement(false))

  useEffect(() => { charger() }, [])

  const lire = async (id: number) => {
    await marquerNotifLue(id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))
  }

  const lireTout = async () => {
    await marquerToutesLues()
    setNotifs(prev => prev.map(n => ({ ...n, lu: true })))
    toast('Toutes les notifications sont marquées comme lues.', 'success')
  }

  const nonLues = notifs.filter(n => !n.lu).length

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {nonLues > 0 && <p className="text-sm text-muted-foreground">{nonLues} non lue{nonLues > 1 ? 's' : ''}</p>}
        </div>
        {nonLues > 0 && (
          <button onClick={lireTout}
            className="flex items-center gap-1.5 text-sm text-foret hover:underline">
            <Check className="w-4 h-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      {chargement ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : notifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-creme-fonce p-12 text-center">
          <BellOff className="w-10 h-10 text-creme-fonce mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Aucune notification pour le moment</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id}
              className={`bg-white rounded-2xl border p-4 flex gap-3 transition-colors ${n.lu ? 'border-creme-fonce' : 'border-or/30 bg-or/5'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_STYLE[n.type] || 'bg-gray-100 text-gray-500'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{n.titre}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {!n.lu && (
                  <button onClick={() => lire(n.id)} className="text-xs text-foret hover:underline">Lue</button>
                )}
                {n.lien && (
                  <Link href={n.lien} className="text-xs text-or hover:underline">Voir →</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
