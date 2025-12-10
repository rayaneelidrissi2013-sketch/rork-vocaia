# 📦 VOCAIA BACKEND - Liste des fichiers

Ce fichier liste EXACTEMENT ce qui doit aller dans le repo `vocaia-backend`

## 📁 Structure du repo backend

```
vocaia-backend/
├── backend/
│   ├── database/
│   │   ├── migrate.ts
│   │   ├── migrate-pricing.ts
│   │   └── schema.sql
│   ├── trpc/
│   │   ├── app-router.ts
│   │   ├── create-context.ts
│   │   └── routes/
│   │       ├── admin/
│   │       ├── agent/
│   │       ├── auth/
│   │       ├── billing/
│   │       ├── calls/
│   │       ├── example/
│   │       ├── referral/
│   │       └── user/
│   ├── utils/
│   │   ├── database.ts
│   │   ├── gcs.ts
│   │   ├── paypal.ts
│   │   └── security.ts
│   ├── hono.ts
│   └── index.ts
├── types/
│   └── index.ts
├── package.json (BACKEND UNIQUEMENT)
├── tsconfig.json
├── .gitignore
├── railway.toml
└── README.md
```

## ✅ Fichiers à COPIER depuis le projet actuel

### Dossier `backend/` (complet)
- `backend/database/migrate.ts`
- `backend/database/migrate-pricing.ts`
- `backend/database/schema.sql`
- `backend/hono.ts`
- `backend/index.ts`
- `backend/trpc/app-router.ts`
- `backend/trpc/create-context.ts`
- Tous les fichiers dans `backend/trpc/routes/` et sous-dossiers

### Dossier `backend/utils/`
- `backend/utils/database.ts`
- `backend/utils/gcs.ts`
- `backend/utils/paypal.ts`
- `backend/utils/security.ts`

### Dossier `types/`
- `types/index.ts`

### Fichiers racine
- `railway.toml`
- `.gitignore` (à adapter pour backend)

## 📝 Fichiers à CRÉER pour le backend

### `package.json` (backend uniquement)
Voir BACKEND_PACKAGE.json dans le projet actuel (à adapter)

### `tsconfig.json`
Voir BACKEND_TSCONFIG.json dans le projet actuel

### `README.md`
Documentation de déploiement Railway

### `.env.example`
```
DATABASE_URL=
VAPI_API_KEY=
VAPI_WEBHOOK_SECRET=
GCS_SERVICE_ACCOUNT_KEY=
GCS_BUCKET_NAME=
NODE_ENV=production
PORT=3000
```

## ❌ À NE PAS inclure dans le backend

- Tout le dossier `app/`
- Tout le dossier `contexts/`
- Dossiers `assets/`, `constants/`, `mocks/`
- `app.json`, `eas.json`
- Dépendances React Native / Expo
- Fichiers de frontend
