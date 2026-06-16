'use client'
import { useState } from 'react'
import { Mail, Phone, Send, MessageCircle } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import axios from 'axios'

export default function PageContact() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [envoi, setEnvoi] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom || !form.email || !form.message) {
      toast('Veuillez remplir tous les champs obligatoires.', 'error')
      return
    }
    setEnvoi(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/contact`, form)
      toast('Message envoyé ! Notre équipe vous répondra dans les 24h.', 'success')
      setForm({ nom: '', email: '', sujet: '', message: '' })
    } catch {
      toast('Erreur lors de l\'envoi. Réessayez dans quelques instants.', 'error')
    } finally {
      setEnvoi(false)
    }
  }

  const infos = [
    {
      icone: <Mail className="w-5 h-5 text-or" />,
      titre: 'Email',
      lignes: ['artisanmarket6@gmail.com'],
    },
    {
      icone: <Phone className="w-5 h-5 text-or" />,
      titre: 'Téléphone / WhatsApp',
      lignes: ['+229 01 45 65 35 64'],
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* En-tête */}
      <section className="bg-foret py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-or-clair text-xs font-semibold uppercase tracking-widest mb-3">Support</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Contactez-nous</h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Une question, un problème ou une suggestion ? Notre équipe est là pour vous aider.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Infos de contact */}
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Nos coordonnées</h2>
            {infos.map((info, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
                <div className="w-10 h-10 bg-or/10 rounded-xl flex items-center justify-center shrink-0">
                  {info.icone}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 mb-1">{info.titre}</p>
                  {info.lignes.map((l, j) => (
                    <p key={j} className="text-sm text-gray-500">{l}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a href="https://wa.me/2290145653564?text=Bonjour%20ArtisanMarket%2C%20j%27ai%20une%20question." target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-foret text-white rounded-2xl p-4 hover:bg-foret-clair transition-colors">
              <MessageCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Écrire sur WhatsApp</p>
                <p className="text-xs text-white/80">Réponse rapide garantie</p>
              </div>
            </a>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Envoyer un message</h2>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet *</label>
                    <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                      placeholder="Votre nom"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-or/40 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sujet</label>
                  <select value={form.sujet} onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-or/40 text-sm">
                    <option value="">Choisir un sujet...</option>
                    <option>Problème avec une commande</option>
                    <option>Question sur un produit</option>
                    <option>Devenir artisan sur la plateforme</option>
                    <option>Signaler un problème technique</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5} placeholder="Décrivez votre demande..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-or/40 text-sm resize-none" />
                </div>
                <button type="submit" disabled={envoi}
                  className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-60">
                  <Send className="w-4 h-4" />
                  {envoi ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
