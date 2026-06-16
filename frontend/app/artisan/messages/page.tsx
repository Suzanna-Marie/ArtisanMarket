'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Send, User, Pencil, Trash2, Check, X, ImagePlus, X as XIcon, ArrowLeft, MessageCircle } from 'lucide-react'
import { mesConversations, messagesConversation, envoyerMessage, modifierMessage, supprimerMessage } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { io, Socket } from 'socket.io-client'

interface Conversation {
  id: number
  artisan: { id: number; nomBoutique: string; photoProfil: string | null }
  dernierMessage: string | null
  nonLus: number
}

interface Message {
  id: number
  contenu: string
  fichier?: string | null
  expediteurId: number
  createdAt: string
}

function formatHeure(date: string) {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function decoderId(token: string | null): number | null {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.id === 'number' ? payload.id : null
  } catch { return null }
}

export default function ArtisanMessages() {
  const { user, token } = useAuthStore()
  const monId = decoderId(token)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [convActive, setConvActive] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [texte, setTexte] = useState('')
  const [imageJointe, setImageJointe] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [messageEnEdition, setMessageEnEdition] = useState<number | null>(null)
  const [texteEdition, setTexteEdition] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    mesConversations().then(r => setConversations(r.data)).finally(() => setChargement(false))
  }, [])

  useEffect(() => {
    if (!token) return
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, { auth: { token } })
    socketRef.current = socket
    socket.on('nouveau_message', (msg: Message) => {
      setMessages(m => [...m, msg])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      setConversations(c => c.map(conv =>
        conv.id === msg.expediteurId ? { ...conv, dernierMessage: msg.contenu } : conv
      ))
    })
    return () => { socket.disconnect() }
  }, [token])

  const ouvrirConversation = async (convId: number) => {
    setConvActive(convId)
    const r = await messagesConversation(convId)
    setMessages(r.data)
    socketRef.current?.emit('rejoindre_conversation', convId)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    setConversations(c => c.map(conv => conv.id === convId ? { ...conv, nonLus: 0 } : conv))
  }

  const handleChoisirImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageJointe(file)
    setPreviewImage(URL.createObjectURL(file))
  }

  const retirerImage = () => {
    setImageJointe(null)
    setPreviewImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleEnvoyer = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!texte.trim() && !imageJointe) || !convActive || envoi) return
    setEnvoi(true)
    try {
      const formData = new FormData()
      if (texte.trim()) formData.append('contenu', texte.trim())
      if (imageJointe) formData.append('fichier', imageJointe)
      const r = await envoyerMessage(convActive, formData as unknown as string)
      setMessages(m => [...m, r.data])
      setTexte('')
      retirerImage()
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      setConversations(c => c.map(conv =>
        conv.id === convActive ? { ...conv, dernierMessage: texte.trim() || 'Image' } : conv
      ))
    } finally {
      setEnvoi(false)
    }
  }

  const handleModifier = async (id: number) => {
    if (!texteEdition.trim()) return
    const r = await modifierMessage(id, texteEdition.trim())
    setMessages(m => m.map(msg => msg.id === id ? r.data : msg))
    setMessageEnEdition(null)
  }

  const handleSupprimer = async (id: number) => {
    await supprimerMessage(id)
    setMessages(m => m.filter(msg => msg.id !== id))
  }

  const convSelectionnee = conversations.find(c => c.id === convActive)

  return (
    <div className="h-[calc(100vh-5rem)] flex rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">

      {/* Liste conversations */}
      <div className={`${convActive ? 'hidden md:flex' : 'flex'} w-full md:w-72 border-r border-gray-100 flex-col shrink-0`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Messages clients</h2>
          {conversations.filter(c => c.nonLus > 0).length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {conversations.reduce((s, c) => s + c.nonLus, 0)} non lu(s)
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {chargement ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-8">
              <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucun message reçu</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button key={conv.id} onClick={() => ouvrirConversation(conv.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${convActive === conv.id ? 'bg-green-50 border-l-2 border-l-foret' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-foret/10 flex items-center justify-center shrink-0 text-foret font-bold text-sm">
                  {conv.artisan.nomBoutique.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{conv.artisan.nomBoutique}</p>
                  {conv.dernierMessage && (
                    <p className="text-xs text-gray-400 truncate">{conv.dernierMessage}</p>
                  )}
                </div>
                {conv.nonLus > 0 && (
                  <span className="w-5 h-5 bg-foret text-white text-xs rounded-full flex items-center justify-center shrink-0 font-medium">
                    {conv.nonLus}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Zone de chat */}
      {convActive && convSelectionnee ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
            <button onClick={() => setConvActive(null)} className="md:hidden p-1 text-gray-400 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-foret/10 flex items-center justify-center text-foret font-bold text-sm shrink-0">
              {convSelectionnee.artisan.nomBoutique.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800">{convSelectionnee.artisan.nomBoutique}</p>
              <p className="text-xs text-green-600">Client</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(msg => {
              const estMoi = monId !== null && Number(msg.expediteurId) === monId
              return (
                <div key={msg.id} className={`flex flex-col ${estMoi ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    {!estMoi && (
                      <div className="w-5 h-5 rounded-full bg-foret/10 flex items-center justify-center text-foret text-xs font-bold">
                        {convSelectionnee.artisan.nomBoutique.charAt(0)}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      {estMoi ? 'Vous' : convSelectionnee?.artisan.nomBoutique}
                      {msg.createdAt && <span className="ml-2">{formatHeure(msg.createdAt)}</span>}
                    </p>
                  </div>

                  {messageEnEdition === msg.id ? (
                    <div className="flex items-center gap-2 w-full max-w-sm">
                      <input autoFocus value={texteEdition} onChange={e => setTexteEdition(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-foret text-sm focus:outline-none focus:ring-2 focus:ring-foret/30" />
                      <button onClick={() => handleModifier(msg.id)} className="text-foret hover:text-foret/80"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setMessageEnEdition(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="group flex items-end gap-2">
                      {estMoi && (
                        <div className="hidden group-hover:flex items-center gap-1 mb-1">
                          {msg.contenu && (
                            <button onClick={() => { setMessageEnEdition(msg.id); setTexteEdition(msg.contenu) }}
                              className="text-gray-400 hover:text-foret transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          )}
                          <button onClick={() => handleSupprimer(msg.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                      <div className={`max-w-sm rounded-2xl overflow-hidden ${estMoi ? 'bg-foret text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-sm'}`}>
                        {msg.fichier && (
                          <a href={msg.fichier} target="_blank" rel="noopener noreferrer">
                            <div className="relative w-52 h-36">
                              <Image src={msg.fichier} alt="Image partagée" fill className="object-cover" sizes="208px" />
                            </div>
                          </a>
                        )}
                        {msg.contenu && (
                          <p className="px-4 py-2.5 text-sm leading-relaxed">{msg.contenu}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Preview image */}
          {previewImage && (
            <div className="px-4 pt-3 border-t border-gray-100">
              <div className="relative inline-block">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={previewImage} alt="Aperçu" fill className="object-cover" sizes="80px" />
                </div>
                <button onClick={retirerImage}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <XIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Saisie */}
          <form onSubmit={handleEnvoyer} className="p-4 border-t border-gray-100 flex items-end gap-2 bg-white">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChoisirImage} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-foret hover:border-foret transition-colors shrink-0 text-sm">
              <ImagePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Photo</span>
            </button>
            <input type="text" value={texte} onChange={e => setTexte(e.target.value)}
              placeholder="Répondre au client..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-foret/30 focus:border-foret text-sm" />
            <button type="submit" disabled={(!texte.trim() && !imageJointe) || envoi}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-foret text-white rounded-xl disabled:opacity-40 hover:bg-foret/90 transition-colors shrink-0 text-sm font-medium">
              <Send className="w-4 h-4" />
              <span>Envoyer</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Sélectionnez une conversation</p>
          </div>
        </div>
      )}
    </div>
  )
}
