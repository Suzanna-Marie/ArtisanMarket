'use client'
import Link from 'next/link'

export default function Logo({
  taille   = 'md',
  variante = 'clair',
}: {
  taille?:   'sm' | 'md' | 'lg'
  variante?: 'clair' | 'sombre'
}) {
  const sombre = variante === 'sombre'

  const artisanColor = sombre ? 'rgba(255,255,255,0.92)' : '#1E4D2B'
  const marketColor  = sombre ? '#E8B84B' : '#8B6400'
  const losangeVert  = sombre ? 'rgba(255,255,255,0.85)' : '#1E4D2B'
  const losangeOr    = sombre ? '#E8B84B' : '#8B6400'
  const taglineColor = sombre ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'

  /* ── Navbar : version compacte sur une ligne ── */
  if (taille === 'sm') {
    return (
      <Link href="/" className="shrink-0 select-none flex flex-col leading-none">
        <span style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: '11px',
          color: artisanColor,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          Artisan
        </span>
        <span style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontWeight: 900,
          fontSize: '20px',
          color: marketColor,
          lineHeight: 1,
          marginTop: '1px',
        }}>
          Market
        </span>
      </Link>
    )
  }

  /* ── Footer / pages : version avec losanges ── */
  const artisanSize = taille === 'lg' ? '13px' : '11px'
  const marketSize  = taille === 'lg' ? '28px' : '22px'
  const losangeW    = taille === 'lg' ? 80 : 64
  const losangeH    = taille === 'lg' ? 22 : 18

  return (
    <Link href="/" className="shrink-0 select-none flex flex-col leading-none">
      {/* ARTISAN — fin, espacé, italic */}
      <span style={{
        fontFamily: "var(--font-playfair), Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: artisanSize,
        color: artisanColor,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
      }}>
        Artisan
      </span>

      {/* Séparateur courbe — SVG léger */}
      <svg width="120" height="8" viewBox="0 0 120 8" fill="none" style={{ marginTop: '2px', marginBottom: '2px' }}>
        <path d="M 2 6 Q 60 1 118 6" stroke={artisanColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>

      {/* MARKET — gras */}
      <span style={{
        fontFamily: "var(--font-playfair), Georgia, serif",
        fontWeight: 900,
        fontSize: marketSize,
        color: marketColor,
        lineHeight: 1,
        paddingLeft: '8px',
      }}>
        Market
      </span>

      {/* Motif losanges ◇◆◇ */}
      <svg width={losangeW} height={losangeH} viewBox="0 0 80 22" fill="none" style={{ marginTop: '5px', marginLeft: '6px' }}>
        {/* Losange gauche */}
        <rect x="14" y="7" width="8" height="8" transform="rotate(45 18 11)" stroke={losangeOr} strokeWidth="1.2" fill="none"/>
        {/* Losange central tressé */}
        <rect x="29" y="4" width="14" height="14" transform="rotate(45 36 11)" fill={losangeVert}/>
        <line x1="27" y1="11" x2="45" y2="11" stroke={losangeOr} strokeWidth="1.1" opacity="0.9"/>
        <line x1="36" y1="2" x2="36" y2="20" stroke={losangeOr} strokeWidth="1.1" opacity="0.9"/>
        <rect x="31" y="7" width="10" height="10" transform="rotate(45 36 12)" fill="none" stroke={losangeOr} strokeWidth="0.7" opacity="0.5"/>
        {/* Losange droit */}
        <rect x="58" y="7" width="8" height="8" transform="rotate(45 62 11)" stroke={losangeOr} strokeWidth="1.2" fill="none"/>
      </svg>

      {/* Tagline */}
      {taille === 'lg' && (
        <span style={{
          fontSize: '8px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: taglineColor,
          marginTop: '4px',
          marginLeft: '2px',
        }}>
          Artisanat béninois
        </span>
      )}
    </Link>
  )
}
