# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ArtisanMarket — e-commerce platform for Beninese artisanal crafts (kanvô, tenues, accessories). Three separate apps share one backend API.

## Structure

```
artisan market/
├── backend/          # Express.js API — port 5000
├── frontend/         # Next.js 14 client site — port 3000
└── admin/            # Next.js 14 admin dashboard — port 3001
```

## Commands

### Backend
```bash
cd backend
npm run dev           # ts-node + nodemon (auto-restart)
npm run db:migrate    # Prisma migration
npm run db:studio     # Prisma Studio GUI
```

### Frontend / Admin
```bash
cd frontend && npm run dev   # port 3000
cd admin && npm run dev      # port 3001
```

## Architecture

### Backend (`backend/src/`)
- `server.ts` — Express + Socket.io setup, CORS allows ports 3000 and 3001
- `routes/` — one file per domain (auth, produit, artisan, commande, admin, message)
- `controllers/` — business logic, one file per route module
- `middleware/auth.middleware.ts` — JWT decode (`authenticate`), role check (`authorize`), artisan status check (`verifierStatutArtisan`)
- `services/` — email (nodemailer), socket (Socket.io rooms), kkiapay (payment)
- `prisma/schema.prisma` — PostgreSQL on Neon serverless

### Database key enums
- `Role`: CLIENT | ARTISAN | ADMIN
- `StatutArtisan`: EN_ATTENTE | VALIDE | SUSPENDU | REJETE
- `StatutProduit`: BROUILLON | PUBLIE | RETIRE | EN_RUPTURE
- `StatutCommande`: RECUE | EN_PREPARATION | PRETE | EN_LIVRAISON | LIVREE | ANNULEE

### Frontend (`frontend/`)
- App Router with route groups: `(public)/`, `(auth)/`, `client/`, `artisan/`, `admin/` (removed — use separate admin app)
- `lib/api.ts` — all axios calls to backend
- `lib/store.ts` — Zustand: `useAuthStore` (JWT + user) and `usePanierStore` (cart)
- Auth token stored in `localStorage` as `token` and `user`
- Tailwind custom tokens: `or` (#8B6914), `foret` (#2D5016), `creme` (#FAF7F0), `or-clair` (#E8B84B)

### Admin (`admin/`)
- Separate Next.js project, same backend API
- Token stored as `admin_token` / `admin_user` in localStorage (separate from main site)
- No Zustand — reads localStorage directly in layout

### Auth flow
1. Inscription → creates user with `emailVerifie: false`, sends 6-digit OTP (logged to console if SMTP not configured)
2. Verify OTP at `/verification-email` → sets `emailVerifie: true`, returns JWT
3. Connexion checks `user.actif` and `user.emailVerifie` before issuing token
4. Artisan layout calls `moi()` on mount to get fresh `artisan.statut` — shows blocked screen if not VALIDE

### Artisan blocking (two-layer)
- Backend: `verifierStatutArtisan` middleware on all artisan-specific routes
- Frontend: `artisan/layout.tsx` fetches fresh status from `GET /auth/moi` before rendering
- Admin bloquer/débloquer also syncs `artisan.statut` (SUSPENDU/VALIDE)

### Image upload flow
Multer (memory storage) → `envoyerVersCloudinary` middleware → sets `req.body.photoUrl` or `req.body.photos`

### Payment (KKiaPay)
Frontend opens KKiaPay widget → gets `transactionId` → calls `POST /commandes/:id/paiement/verifier` → backend verifies with KKiaPay SDK

## Environment variables

### Backend `.env`
```
DATABASE_URL          # Neon PostgreSQL (remove channel_binding=require if connection issues)
JWT_SECRET
CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET
KKIAPAY_PRIVATE_KEY / PUBLIC_KEY
SMTP_HOST/PORT/USER/PASS/FROM_EMAIL   # Gmail app password required
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Admin `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Known issues / gotchas
- Neon free tier sleeps after inactivity — first request after sleep may fail; `unhandledRejection` handler prevents server crash
- SMTP not configured → OTP code printed to backend console in yellow
- `import * as nodemailer from 'nodemailer'` required (not default import) due to type declaration style
- Express route ordering matters: static routes (`/boutique`, `/commandes/moi`) must come before `/:id` in artisan routes
- Admin account: `admin@artisanmarket.bj` / `Admin2026!`
