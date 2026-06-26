'use client'
import { Suspense } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, CheckCircle2, RefreshCw } from 'lucide-react'
import { verifierEmail, renvoyerCode } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

function VerificationEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [succes, setSucces] = useState(false)
  const [compteur, setCompteur] = useState(60)
  const [renvoi, setRenvoi] = useState(false)
  const [messageRenvoi, setMessageRenvoi] = useState('')

  const inputs = useRef<(HTMLInputElement | null)[]>([])

  // Décompte pour le renvoi
  useEffect(() => {
    if (compteur <= 0) return
    const t = setTimeout(() => setCompteur(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [compteur])

  // Rediriger si pas d'email
  useEffect(() => {
    if (!email) router.push('/inscription')
  }, [email])

  const handleChange = (index: number, val: string) => {
    // Accepte seulement les chiffres
    if (!/^\d?$/.test(val)) return

    const nouveau = [...digits]
    nouveau[index] = val
    setDigits(nouveau)
    setErreur('')

    // Avancer automatiquement
    if (val && index < 5) {
      inputs.current[index + 1]?.focus()
    }

    // Vérification automatique quand tous les champs sont remplis
    if (val && nouveau.every(d => d !== '')) {
      soumettre(nouveau.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const texte = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (texte.length === 6) {
      setDigits(texte.split(''))
      inputs.current[5]?.focus()
      soumettre(texte)
    }
  }

  const soumettre = async (code: string) => {
    setChargement(true)
    setErreur('')
    try {
      const res = await verifierEmail({ email, code })
      setAuth(res.data.user, res.data.token)
      setSucces(true)
      setTimeout(() => {
        const role = res.data.user.role
        if (role === 'ADMIN') router.push('/admin')
        else if (role === 'ARTISAN') router.push('/artisan')
        else router.push('/client')
      }, 1500)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErreur(message || 'Code incorrect. Veuillez réessayer.')
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputs.current[0]?.focus(), 50)
    } finally {
      setChargement(false)
    }
  }

  const handleRenvoyer = async () => {
    if (compteur > 0) return
    setRenvoi(true)
    setMessageRenvoi('')
    try {
      await renvoyerCode(email)
      setMessageRenvoi('Nouveau code envoyé ! Vérifiez votre boîte mail.')
      setCompteur(60)
      setDigits(['', '', '', '', '', ''])
      setErreur('')
      setTimeout(() => inputs.current[0]?.focus(), 50)
    } catch {
      setMessageRenvoi('Impossible de renvoyer le code. Réessayez.')
    } finally {
      setRenvoi(false)
    }
  }

  const emailMasque = email.replace(/(.{2}).+(@.+)/, '$1****$2')

  if (succes) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Email vérifié !</h2>
          <p className="text-gray-500 text-sm">Vous êtes connecté. Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-creme flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-3xl font-bold text-or">Artisan</span>
            <span className="text-3xl font-bold text-foret">Market</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-creme-fonce p-8">
          {/* Icône email */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-or/10 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-or" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">Vérifiez votre email</h1>
          <p className="text-sm text-center text-muted-foreground mb-8">
            Nous avons envoyé un code à 6 chiffres à<br />
            <span className="font-semibold text-gray-700">{emailMasque}</span>
          </p>

          {/* Erreur */}
          {erreur && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 border border-red-200 text-center">
              {erreur}
            </div>
          )}

          {/* Message renvoi */}
          {messageRenvoi && (
            <div className={`text-sm px-4 py-3 rounded-xl mb-6 border text-center ${messageRenvoi.includes('envoyé') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {messageRenvoi}
            </div>
          )}

          {/* Inputs OTP */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={chargement}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2
                  ${d ? 'border-or bg-or/5 text-or' : 'border-creme-fonce bg-creme text-gray-800'}
                  ${erreur ? 'border-red-300' : ''}
                  focus:outline-none focus:border-or focus:ring-2 focus:ring-or/20
                  transition-all disabled:opacity-50`}
              />
            ))}
          </div>

          {/* Bouton manuel si autosubmit ne déclenche pas */}
          <button
            onClick={() => digits.every(d => d) && soumettre(digits.join(''))}
            disabled={!digits.every(d => d) || chargement}
            className="w-full btn-primaire flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {chargement ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
            ) : (
              'Vérifier le code'
            )}
          </button>

          {/* Renvoyer le code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Vous n'avez pas reçu le code ?</p>
            <button
              onClick={handleRenvoyer}
              disabled={compteur > 0 || renvoi}
              className="flex items-center gap-2 mx-auto text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed text-or hover:text-or/80 transition-colors"
            >
              {renvoi ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {compteur > 0 ? `Renvoyer dans ${compteur}s` : 'Renvoyer le code'}
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Mauvais email ?{' '}
            <Link href="/inscription" className="text-or hover:underline">Recommencer l'inscription</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerificationEmail() {
  return <Suspense><VerificationEmailContent /></Suspense>
}
