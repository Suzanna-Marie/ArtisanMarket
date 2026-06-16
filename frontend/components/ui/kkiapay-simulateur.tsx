'use client'
import { useState } from 'react'
import { X, Smartphone, CheckCircle, Loader2 } from 'lucide-react'

type Reseau = 'MTN' | 'MOOV' | 'CELTIIS'

interface Props {
  montant: number
  onConfirmer: (telephone: string, reseau: Reseau) => Promise<void>
  onFermer: () => void
}

const RESEAUX = [
  { id: 'MTN' as Reseau, label: 'MTN MoMo', couleur: 'bg-yellow-400', texte: 'text-yellow-900', prefixe: '96' },
  { id: 'MOOV' as Reseau, label: 'Moov Money', couleur: 'bg-blue-500', texte: 'text-white', prefixe: '99' },
  { id: 'CELTIIS' as Reseau, label: 'Celtiis', couleur: 'bg-red-500', texte: 'text-white', prefixe: '98' },
]

type Etape = 'choix' | 'chargement' | 'succes'

export default function KKiapaySimulateur({ montant, onConfirmer, onFermer }: Props) {
  const [reseau, setReseau] = useState<Reseau | null>(null)
  const [telephone, setTelephone] = useState('')
  const [etape, setEtape] = useState<Etape>('choix')
  const [erreur, setErreur] = useState('')

  const handleConfirmer = async () => {
    if (!reseau) { setErreur('Veuillez choisir un réseau.'); return }
    if (!/^01[0-9]{8}$/.test(telephone)) {
      setErreur('Numéro invalide. Exemple : 0196000000 (10 chiffres, commence par 01).')
      return
    }

    setErreur('')
    setEtape('chargement')

    // Simuler le délai d'un vrai paiement mobile money (3 secondes)
    await new Promise(r => setTimeout(r, 3000))

    try {
      await onConfirmer(telephone, reseau)
      setEtape('succes')
    } catch (err: unknown) {
      setEtape('choix')
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErreur(msg || 'Paiement échoué. Réessayez.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#2D5016] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">Paiement Mobile Money</p>
            <p className="text-white/70 text-xs">Sécurisé · Instantané</p>
          </div>
          {etape === 'choix' && (
            <button onClick={onFermer} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">

          {/* Montant */}
          <div className="bg-gray-50 rounded-xl p-4 text-center mb-5">
            <p className="text-xs text-gray-500 mb-1">Montant à payer</p>
            <p className="text-2xl font-bold text-foret">{montant.toLocaleString('fr-FR')} FCFA</p>
          </div>

          {etape === 'choix' && (
            <>
              {/* Choix réseau */}
              <p className="text-sm font-medium text-gray-700 mb-3">Choisissez votre réseau</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {RESEAUX.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setReseau(r.id); setErreur('') }}
                    className={`rounded-xl py-3 text-xs font-bold transition-all border-2 ${
                      reseau === r.id
                        ? `${r.couleur} ${r.texte} border-transparent scale-105 shadow-md`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Numéro de téléphone */}
              <p className="text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</p>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden mb-1 focus-within:border-foret">
                <div className="bg-gray-50 px-3 py-3 border-r border-gray-200">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  placeholder="ex: 0196000000"
                  value={telephone}
                  onChange={e => { setTelephone(e.target.value.replace(/\D/g, '')); setErreur('') }}
                  maxLength={10}
                  className="flex-1 px-3 py-3 text-sm outline-none bg-white"
                />
                <span className="px-3 text-xs text-gray-400">+229</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">10 chiffres commençant par 01 — ex: 0196000000</p>

              {erreur && <p className="text-xs text-red-500 mb-3">{erreur}</p>}

              <button
                onClick={handleConfirmer}
                disabled={!reseau || !/^01[0-9]{8}$/.test(telephone)}
                className="w-full bg-[#2D5016] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#2D5016]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirmer le paiement
              </button>
            </>
          )}

          {etape === 'chargement' && (
            <div className="text-center py-4">
              <Loader2 className="w-10 h-10 text-[#2D5016] animate-spin mx-auto mb-3" />
              <p className="font-semibold text-gray-800 mb-1">Traitement en cours...</p>
              <p className="text-sm text-gray-500">Un code USSD a été envoyé sur votre téléphone.</p>
              <p className="text-xs text-gray-400 mt-1">Entrez votre PIN pour confirmer.</p>
            </div>
          )}

          {etape === 'succes' && (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-gray-800 mb-1">Paiement confirmé !</p>
              <p className="text-sm text-gray-500">Votre commande est en cours de préparation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
