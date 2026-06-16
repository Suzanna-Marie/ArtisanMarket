import Link from 'next/link'
import Logo from '@/components/layout/Logo'
import { MapPin, Mail, Phone } from 'lucide-react'

const colonneExplorer = [
  { href: '/produits',                       label: 'Tous les produits' },
  { href: '/produits?categorie=kanvo',       label: 'Pagnes tissés (Kanvô)' },
  { href: '/produits?categorie=tricot',      label: 'Tenues tricotées' },
  { href: '/produits?categorie=accessoires', label: 'Accessoires' },
  { href: '/artisans',                       label: 'Nos artisans' },
]

const colonneInfos = [
  { href: '/a-propos',                  label: 'À propos de nous' },
  { href: '/contact',                   label: 'Nous contacter' },
  { href: '/mentions-legales',          label: 'Mentions légales' },
  { href: '/cgv',                       label: 'CGV' },
  { href: '/inscription?role=ARTISAN',  label: 'Devenir artisan' },
]

function IconeFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

function IconeInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

function IconeWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#1C3010] text-white relative overflow-hidden">

      {/* Ligne décorative dorée en haut */}
      <div className="h-px bg-gradient-to-r from-transparent via-or-clair/60 to-transparent" />

      {/* Cercles décoratifs d'arrière-plan */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] rounded-full -translate-y-48 translate-x-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.02] rounded-full translate-y-32 -translate-x-32 pointer-events-none" />

      {/* Corps principal */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Col 1 — Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4">
              <Logo taille="sm" variante="sombre" />
            </div>
            <div className="w-8 h-0.5 bg-or-clair/50 rounded-full mb-4" />
            <p className="text-xs text-white/55 leading-relaxed mb-5">
              Plateforme béninoise valorisant les artisans locaux.<br />
              Kanvô, tenues tricotées, accessoires — 100% fait main.
            </p>
            <div className="flex items-center gap-2">
              {[
                { href: 'https://facebook.com', label: 'Facebook', icone: <IconeFacebook /> },
                { href: 'https://instagram.com', label: 'Instagram', icone: <IconeInstagram /> },
                { href: 'https://wa.me/22901000000', label: 'WhatsApp', icone: <IconeWhatsApp /> },
              ].map(({ href, label, icone }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 bg-white/10 hover:bg-or-clair/20 border border-white/10 hover:border-or-clair/40 rounded-xl flex items-center justify-center transition-all duration-200 hover:text-or-clair hover:scale-110">
                  {icone}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Explorer */}
          <div>
            <h4 className="font-semibold mb-4 text-or-clair text-xs uppercase tracking-widest">Explorer</h4>
            <ul className="space-y-2">
              {colonneExplorer.map(lien => (
                <li key={lien.href}>
                  <Link href={lien.href}
                    className="text-xs text-white/50 hover:text-white hover:translate-x-1 transition-all duration-150 inline-block">
                    {lien.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Informations */}
          <div>
            <h4 className="font-semibold mb-4 text-or-clair text-xs uppercase tracking-widest">Infos</h4>
            <ul className="space-y-2">
              {colonneInfos.map(lien => (
                <li key={lien.href}>
                  <Link href={lien.href}
                    className="text-xs text-white/50 hover:text-white hover:translate-x-1 transition-all duration-150 inline-block">
                    {lien.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-or-clair text-xs uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3 mb-5">
<li className="flex items-center gap-2.5 text-xs text-white/50 group">
                <Mail className="w-3.5 h-3.5 shrink-0 text-or-clair/70 group-hover:text-or-clair transition-colors" />
                <a href="mailto:contact@artisanmarket.bj" className="hover:text-white transition-colors">
                  contact@artisanmarket.bj
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-white/50 group">
                <Phone className="w-3.5 h-3.5 shrink-0 text-or-clair/70 group-hover:text-or-clair transition-colors" />
                <span className="flex flex-col gap-0.5">
                  <a href="tel:+22901 45 65 35 64" className="hover:text-white transition-colors">+229 01 45 65 35 64</a>
                  <a href="tel:+22901 91 68 05 24" className="hover:text-white transition-colors">+229 01 91 68 05 24</a>
                </span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-1.5">
              {['MTN MoMo', 'Moov Money', 'Celtiis'].map(p => (
                <span key={p}
                  className="text-[10px] bg-white/8 border border-white/15 hover:border-or-clair/40 text-white/60 hover:text-white/80 px-2.5 py-1 rounded-lg font-medium transition-all duration-200 cursor-default">
                  {p}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Barre de fond */}
      <div className="relative border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/30">
            © 2026 ArtisanMarket
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link href="/mentions-legales" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Mentions légales</Link>
            <span className="text-white/15">·</span>
            <Link href="/cgv" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">CGV</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}
