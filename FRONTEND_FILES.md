# 📱 VOCAIA FRONTEND - Liste des fichiers

Ce fichier liste EXACTEMENT ce qui doit aller dans le repo `vocaia-frontend`

## 📁 Structure du repo frontend

```
vocaia-frontend/
├── app/
│   ├── (admin)/
│   ├── (tabs)/
│   ├── call/
│   ├── user-details/
│   ├── _layout.tsx
│   ├── admin-login.tsx
│   ├── enterprise-contact.tsx
│   ├── login.tsx
│   ├── pricing.tsx
│   ├── referral.tsx
│   └── +not-found.tsx
├── assets/
│   └── images/
├── contexts/
│   ├── AdminContext.tsx
│   ├── AuthContext.tsx
│   ├── CallsContext.tsx
│   ├── LanguageContext.tsx
│   └── SettingsContext.tsx
├── lib/
│   └── trpc.ts
├── utils/
│   ├── formatters.ts
│   ├── notifications.ts
│   └── phoneUtils.ts
├── constants/
│   ├── colors.ts
│   ├── countryCodes.ts
│   └── subscriptionPlans.ts
├── mocks/
│   └── data.ts
├── package.json (FRONTEND UNIQUEMENT)
├── app.json
├── eas.json
├── tsconfig.json
├── metro.config.js
├── eslint.config.js
└── README.md
```

## ✅ Fichiers à COPIER depuis le projet actuel

### Dossier `app/` (COMPLET)
- Tout le dossier `app/` avec tous les sous-dossiers

### Dossier `assets/`
- `assets/images/favicon.png`
- `assets/images/icon.png`
- `assets/images/splash-icon.png`
- `assets/images/adaptive-icon.png`

### Dossier `contexts/`
- `contexts/AdminContext.tsx`
- `contexts/AuthContext.tsx`
- `contexts/CallsContext.tsx`
- `contexts/LanguageContext.tsx`
- `contexts/SettingsContext.tsx`

### Dossier `lib/`
- `lib/trpc.ts`

### Dossier `utils/`
- `utils/formatters.ts`
- `utils/notifications.ts`
- `utils/phoneUtils.ts`

### Dossier `constants/`
- `constants/colors.ts`
- `constants/countryCodes.ts`
- `constants/subscriptionPlans.ts`

### Dossier `mocks/`
- `mocks/data.ts`

### Fichiers racine
- `app.json`
- `eas.json` (ou `eas.example.json` à renommer)
- `tsconfig.json`
- `metro.config.js`
- `eslint.config.js`
- `.gitignore`

## 📝 Fichiers à CRÉER pour le frontend

### `package.json` (frontend uniquement)
Voir FRONTEND_PACKAGE.json dans le projet actuel

### `.env.example`
```
EXPO_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app
```

### `README.md`
Documentation EAS Build et déploiement

## ❌ À NE PAS inclure dans le frontend

- Dossier `backend/` (complet)
- `railway.toml`
- Variables d'environnement sensibles du backend
- Logique serveur / base de données
