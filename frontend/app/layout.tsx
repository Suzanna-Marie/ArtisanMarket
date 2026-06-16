import type { Metadata, Viewport } from 'next'
import { Poppins, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'ArtisanMarket — Artisanat béninois en ligne',
  description: 'Découvrez et commandez le meilleur de l\'artisanat béninois : kanvô, tenues traditionnelles, tricot et accessoires. Soutenez les artisans locaux.',
  keywords: 'artisanat, bénin, kanvô, tisserand, tenues, accessoires, mode africaine',
  openGraph: {
    title: 'ArtisanMarket',
    description: 'Plateforme de l\'artisanat béninois',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
