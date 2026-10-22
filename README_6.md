# Workflow — Creative Marketplace

React + TypeScript + Vite + Tailwind. Hindi / English UI.

## Run
```
npm install
npm run dev
```

## Features
- **Login / Register** (client or creator), logout
- **Language select** (हिंदी / English) in the navbar
- **Database switch** (navbar database icon): Local (browser) or Firebase (Auth + Firestore, realtime)
- Seller dashboard: own profile, services, portfolio, hire requests

## Local mode (default)
No setup. Demo creator login: `demo@workflow.app` / `demo1234`.

## Firebase mode
1. Firebase Console → create project → add Web app → copy config.
2. Authentication → enable Email/Password (and Google, optional).
3. Firestore Database → create; publish `firestore.rules`.
4. Paste the config in the app (database icon → Firebase), or fill `.env` (see `.env.example`).
