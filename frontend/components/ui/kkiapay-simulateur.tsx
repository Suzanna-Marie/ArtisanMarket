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
  {
    id: 'MTN' as Reseau,
    label: 'MTN',
    sublabel: 'Mobile Money',
    bg: 'bg-yellow-400',
    bgSelect: 'bg-yellow-400',
    border: 'border-yellow-400',
    text: 'text-yellow-900',
    logo: (
      <svg viewBox="0 0 60 20" className="w-12 h-5">
        <text x="0" y="16" fontFamily="Arial" fontWeight="900" fontSize="18" fill="#1a1a1a">MTN</text>
      </svg>
    ),
  },
  {
    id: 'MOOV' as Reseau,
    label: 'Moov',
    sublabel: 'Africa Money',
    bg: 'bg-blue-600',
    bgSelect: 'bg-blue-600',
    border: 'border-blue-600',
    text: 'text-white',
    logo: (
      <svg viewBox="0 0 60 20" className="w-12 h-5">
        <text x="0" y="16" fontFamily="Arial" fontWeight="900" fontSize="18" fill="white">Moov</text>
      </svg>
    ),
  },
  {
    id: 'CELTIIS' as Reseau,
    label: 'Celtiis',
    sublabel: 'Mobile',
    bg: 'bg-red-600',
    bgSelect: 'bg-red-600',
    border: 'border-red-600',
    text: 'text-white',
    logo: (
      <svg viewBox="0 0 70 20" className="w-14 h-5">
        <text x="0" y="16" fontFamily="Arial" fontWeight="900" fontSize="16" fill="white">Celtiis</text>
      </svg>
    ),
  },
]

type Etape = 'choix' | 'chargement' | 'succes'

export default function KKiapaySimulateur({ montant, onConfirmer, onFermer }: Props) {
  const [reseau, setReseau] = useState<Reseau | null>(null)
  const [telephone, setTelephone] = useState('')
  const [etape, setEtape] = useState<Etape>('choix')
  const [erreur, setErreur] = useState('')

  const reseauChoisi = RESEAUX.find(r => r.id === reseau)

  const handleConfirmer = async () => {
    if (!reseau) { setErreur('Veuillez choisir un réseau.'); return }
    if (!/^01[0-9]{8}$/.test(telephone)) {
      setErreur('Numéro invalide. Exemple : 0196000000 (10 chiffres, commence par 01).')
      return
    }
    setErreur('')
    setEtape('chargement')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#2D5016] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">Paiement Mobile Money</p>
            <p className="text-white/70 text-xs">Sécurisé · Instantané · Bénin</p>
          </div>
          {etape !== 'chargement' && (
            <button onClick={onFermer} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">

          {/* Montant */}
          <div className="bg-gradient-to-r from-foret/5 to-or/5 border border-foret/20 rounded-xl p-4 text-center mb-5">
            <p className="text-xs text-gray-500 mb-1">Montant à payer</p>
            <p className="text-3xl font-bold text-foret">{montant.toLocaleString('fr-FR')}</p>
            <p className="text-sm text-gray-500 font-medium">FCFA</p>
          </div>

          {etape === 'choix' && (
            <>
              {/* Choix réseau */}
              <p className="text-sm font-semibold text-gray-700 mb-3">Choisissez votre réseau</p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {RESEAUX.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setReseau(r.id); setErreur('') }}
                    className={`relative rounded-2xl py-4 px-2 flex flex-col items-center gap-1.5 transition-all border-2 ${
                      reseau === r.id
                        ? `${r.bgSelect} ${r.border} scale-105 shadow-lg`
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reseau === r.id ? 'bg-white/20' : r.bg}`}>
                      <span className={`text-xs font-black ${reseau === r.id ? r.text : 'text-white'}`}>
                        {r.id === 'MTN' ? 'MTN' : r.id === 'MOOV' ? 'M' : 'C'}
                      </span>
                    </div>
                    <span className={`text-xs font-bold leading-tight text-center ${reseau === r.id ? r.text : 'text-gray-700'}`}>
                      {r.label}
                    </span>
                    <span className={`text-[10px] leading-tight text-center ${reseau === r.id ? `${r.text} opacity-80` : 'text-gray-400'}`}>
                      {r.sublabel}
                    </span>
                    {reseau === r.id && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Numéro de téléphone */}
              <p className="text-sm font-semibold text-gray-700 mb-2">Numéro de téléphone</p>
              <div className={`flex items-center border-2 rounded-xl overflow-hidden mb-1 transition-colors ${reseauChoisi ? reseauChoisi.border : 'border-gray-200'} focus-within:shadow-sm`}>
                <div className={`px-3 py-3 border-r-2 ${reseauChoisi ? `${reseauChoisi.bg} border-white/30` : 'bg-gray-50 border-gray-200'}`}>
                  <Smartphone className={`w-4 h-4 ${reseauChoisi ? reseauChoisi.text : 'text-gray-400'}`} />
                </div>
                <input
                  type="tel"
                  placeholder="ex: 0196000000"
                  value={telephone}
                  onChange={e => { setTelephone(e.target.value.replace(/\D/g, '')); setErreur('') }}
                  maxLength={10}
                  className="flex-1 px-3 py-3 text-sm outline-none bg-white"
                />
                <span className="px-3 text-xs text-gray-400 font-medium">+229</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">10 chiffres commençant par 01 — ex: 0196000000</p>

              {erreur && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
                  <p className="text-xs text-red-500">{erreur}</p>
                </div>
              )}

              <button
                onClick={handleConfirmer}
                disabled={!reseau || !/^01[0-9]{8}$/.test(telephone)}
                className="w-full bg-[#2D5016] text-white rounded-xl py-3.5 font-bold text-sm hover:bg-[#2D5016]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Confirmer le paiement
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">🔒 Paiement sécurisé par KKiaPay</p>
            </>
          )}

          {etape === 'chargement' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-foret/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-[#2D5016] animate-spin" />
              </div>
              <p className="font-bold text-gray-800 mb-1">Traitement en cours...</p>
              <p className="text-sm text-gray-500">Un code USSD a été envoyé sur votre téléphone.</p>
              <p className="text-xs text-gray-400 mt-1">Entrez votre PIN pour confirmer.</p>
            </div>
          )}

          {etape === 'succes' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <p className="font-bold text-gray-800 text-lg mb-1">Paiement confirmé !</p>
              <p className="text-sm text-gray-500 mb-6">Votre commande est en cours de préparation.</p>
              <button
                onClick={onFermer}
                className="w-full bg-[#2D5016] text-white rounded-xl py-3 font-bold text-sm hover:bg-[#2D5016]/90 transition-colors"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
