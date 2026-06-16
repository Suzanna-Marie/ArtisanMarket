'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  valeur: number
  suffixe?: string
  duree?: number
}

export default function AnimatedCounter({ valeur, suffixe = '', duree = 2000 }: Props) {
  const [compte, setCompte] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = Date.now()
          const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duree, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCompte(Math.round(eased * valeur))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [valeur, duree])

  return <span ref={ref}>{compte}{suffixe}</span>
}
