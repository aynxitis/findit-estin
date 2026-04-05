# FINDit

> A campus lost & found platform for ESTIN students.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-orange?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)

---

## About

FINDit replaces the endless campus-wide lost item emails with a dedicated platform where ESTIN students can post lost or found items, browse reports, and claim belongings — all in one place.

**Key features:**
- Google OAuth login restricted to `@estin.dz` accounts
- Post and browse lost & found item reports with photos
- Claim found items with automatic notifications to the poster
- Real-time notification system
- Admin dashboard for content moderation

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore, Authentication, and Storage enabled
- Google OAuth configured in Firebase (restricted to `@estin.dz`)

### Installation

```bash
git clone https://github.com/aynxitis/findit-estin.git
cd findit-estin
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and fill in your values:

```env
# Firebase Client SDK (public — safe to expose to the browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (server-side only — never expose these)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nyour_private_key\n-----END RSA PRIVATE KEY-----\n"

# Comma-separated list of admin emails
ADMIN_EMAILS=admin1@estin.dz,admin2@estin.dz
```

> **Where to find these:**
> - Client SDK config → Firebase Console → Project Settings → Your apps
> - Admin SDK credentials → Firebase Console → Project Settings → Service Accounts → Generate new private key

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Branch Structure

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to Vercel |
| `staging` | Pre-production — Vercel preview deployments |

Feature branches should be created off `staging` and merged back into `staging` before going to `main`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
