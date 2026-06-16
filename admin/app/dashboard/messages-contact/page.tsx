'use client'
import { useEffect, useState } from 'react'
import { Mail, MailOpen, Send, Loader2, RefreshCw } from 'lucide-react'

interface MessageContact {
  id: number
  nom: string
  email: string
  sujet: string | null
  message: string
  lu: boolean
  repondu: boolean
  createdAt: string
}

const API = process.env.NEXT_PUBLIC_API_URL

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
}

export default function MessagesContact() {
  const [messages, setMessages] = useState<MessageContact[]>([])
  const [chargement, setChargement] = useState(true)
  const [selectionne, setSelectionne] = useState<MessageContact | null>(null)
  const [reponse, setReponse] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [succes, setSucces] = useState(false)

  const charger = async () => {
    setChargement(true)
    try {
      const r = await fetch(`${API}/contact`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await r.json()
      setMessages(data)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  const ouvrirMessage = async (msg: MessageContact) => {
    setSelectionne(msg)
    setReponse('')
    setSucces(false)
    if (!msg.lu) {
      await fetch(`${API}/contact/${msg.id}/lu`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, lu: true } : m))
    }
  }

  const handleRepondre = async () => {
    if (!reponse.trim() || !selectionne) return
    setEnvoi(true)
    try {
      const r = await fetch(`${API}/contact/${selectionne.id}/repondre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ reponse })
      })
      if (r.ok) {
        setSucces(true)
        setMessages(prev => prev.map(m => m.id === selectionne.id ? { ...m, repondu: true, lu: true } : m))
        setSelectionne(prev => prev ? { ...prev, repondu: true } : null)
      }
    } finally {
      setEnvoi(false)
    }
  }

  const nonLus = messages.filter(m => !m.lu).length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages de contact</h1>
          {nonLus > 0 && (
            <p className="text-sm text-slate-400 mt-1">{nonLus} non lu{nonLus > 1 ? 's' : ''}</p>
          )}
        </div>
        <button onClick={charger} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Liste des messages */}
        <div className="lg:col-span-2 space-y-2">
          {chargement ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-700 rounded-xl animate-pulse" />)
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun message reçu</p>
            </div>
          ) : messages.map(msg => (
            <button key={msg.id} onClick={() => ouvrirMessage(msg)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectionne?.id === msg.id
                  ? 'bg-slate-600 border-or-clair/50'
                  : msg.lu
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-650'
              }`}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {msg.lu
                    ? <MailOpen className="w-4 h-4 text-slate-500" />
                    : <Mail className="w-4 h-4 text-or-clair" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold truncate ${msg.lu ? 'text-slate-300' : 'text-white'}`}>
                      {msg.nom}
                    </p>
                    {msg.repondu && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full shrink-0">
                        Répondu
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{msg.sujet || 'Sans sujet'}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{msg.message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Détail + réponse */}
        <div className="lg:col-span-3">
          {selectionne ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-5">
              {/* En-tête */}
              <div className="border-b border-slate-700 pb-4">
                <h2 className="text-lg font-bold text-white mb-1">{selectionne.sujet || 'Sans sujet'}</h2>
                <p className="text-sm text-slate-400">
                  De : <span className="text-or-clair font-medium">{selectionne.nom}</span>
                  {' · '}
                  <a href={`mailto:${selectionne.email}`} className="text-or-clair hover:underline">
                    {selectionne.email}
                  </a>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(selectionne.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Message */}
              <div className="bg-slate-750 rounded-lg p-4">
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{selectionne.message}</p>
              </div>

              {/* Zone de réponse */}
              {succes ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <p className="text-green-400 font-semibold text-sm">Réponse envoyée à {selectionne.email}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Répondre à {selectionne.nom}
                  </label>
                  <textarea
                    value={reponse}
                    onChange={e => setReponse(e.target.value)}
                    rows={5}
                    placeholder="Écrivez votre réponse..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-or-clair/40 resize-none"
                  />
                  <button
                    onClick={handleRepondre}
                    disabled={envoi || !reponse.trim()}
                    className="flex items-center gap-2 bg-foret text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-foret/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {envoi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {envoi ? 'Envoi...' : 'Envoyer la réponse par email'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 h-64 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sélectionnez un message</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
