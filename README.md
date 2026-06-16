# ArtisanMarket

Plateforme de digitalisation et de valorisation de l'artisanat béninois.

**Mémoire de Licence Professionnelle 2025–2026**
ABOUTA Gloria & DOGNON Marie-Suzanne — IUT Parakou, Université de Parakou, Bénin

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend | Express.js + TypeScript |
| ORM | Prisma |
| Base de données | MySQL |
| Paiement | KKiaPay (MTN/Moov/Celtiis) |
| Images | Cloudinary |
| Temps réel | Socket.io |
| Déploiement | Vercel (frontend) + Railway (backend + MySQL) |

## Démarrage rapide

### 1. Cloner et installer

```bash
# Backend
cd backend
cp .env.example .env
# Remplir les variables dans .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev

# Frontend (dans un autre terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 2. Variables d'environnement requises

**Backend** (`.env`) :
- `DATABASE_URL` — URL MySQL
- `JWT_SECRET` — clé secrète JWT (longue et aléatoire)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `KKIAPAY_PRIVATE_KEY`, `KKIAPAY_PUBLIC_KEY`

**Frontend** (`.env.local`) :
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- `NEXT_PUBLIC_SOCKET_URL=http://localhost:5000`
- `NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY`

### 3. Compte admin par défaut (après seed)

- Email : `admin@artisanmarket.bj`
- Mot de passe : `admin123`

## Structure

```
artisanmarket/
├── backend/     # API Express (port 5000)
└── frontend/    # Next.js (port 3000)
```
