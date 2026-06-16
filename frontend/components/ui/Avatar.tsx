import Image from 'next/image'

interface AvatarProps {
  prenom: string
  nom: string
  photo?: string | null
  taille?: number
  className?: string
}

export default function Avatar({ prenom, nom, photo, taille = 48, className = '' }: AvatarProps) {
  const initiales = `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase()

  if (photo) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width: taille, height: taille }}
      >
        <Image
          src={photo}
          alt={`${prenom} ${nom}`}
          width={taille}
          height={taille}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }

  const fontSize = Math.max(10, Math.round(taille * 0.35))

  return (
    <div
      className={`rounded-full bg-foret flex items-center justify-center shrink-0 ${className}`}
      style={{ width: taille, height: taille }}
    >
      <span className="text-white font-bold leading-none" style={{ fontSize }}>
        {initiales}
      </span>
    </div>
  )
}
