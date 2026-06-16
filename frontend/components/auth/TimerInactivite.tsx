'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

const TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes

export default function TimerInactivite() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    let timer: ReturnType<typeof setTimeout>

    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        logout()
        router.push('/connexion?expire=1')
      }, TIMEOUT_MS)
    }

    const evenements = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    evenements.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      clearTimeout(timer)
      evenements.forEach(e => window.removeEventListener(e, reset))
    }
  }, [user])

  return null
}
