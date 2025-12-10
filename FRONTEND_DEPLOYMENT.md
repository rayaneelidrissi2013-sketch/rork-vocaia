# 📱 Guide de Déploiement Frontend

## 📂 Créer le Repo Frontend Séparé

### Fichiers à copier dans `vocaia-frontend`

```
vocaia-frontend/
├── app/                  # ✅ Routes Expo
├── assets/               # ✅ Images
├── contexts/             # ✅ State management
├── lib/                  # ✅ tRPC client
├── utils/                # ✅ Helpers
├── constants/            # ✅ Constants
├── types/                # ✅ Types partagés
├── .gitignore
├── app.json
├── eas.json              # ✅ À créer
├── package.json          # ✅ Frontend uniquement
├── tsconfig.json
└── README.md
```

---

## 📦 `package.json` Frontend

```json
{
  "name": "vocaia-frontend",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:web": "expo export --platform web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@nkzw/create-context-hook": "^1.1.0",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@tanstack/react-query": "^5.83.0",
    "@trpc/client": "^11.7.2",
    "@trpc/react-query": "^11.7.2",
    "expo": "~54.0.25",
    "expo-av": "~16.0.7",
    "expo-constants": "~18.0.10",
    "expo-haptics": "~15.0.7",
    "expo-image": "~3.0.10",
    "expo-linking": "~8.0.9",
    "expo-router": "~6.0.15",
    "expo-status-bar": "~3.0.8",
    "lucide-react-native": "^0.475.0",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "superjson": "^2.2.6",
    "zod": "^4.1.13"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.1.10",
    "eslint": "^9.31.0",
    "eslint-config-expo": "~10.0.0",
    "typescript": "~5.9.2"
  },
  "private": true
}
```

---

## 🌍 Variables d'Environnement

### `.env.development`
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### `.env.production`
```bash
EXPO_PUBLIC_API_BASE_URL=https://votre-backend.up.railway.app
```

---

## 📱 Déploiement Mobile (EAS)

### 1. Créer `eas.json`

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "http://localhost:3000"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://votre-backend.up.railway.app"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://votre-backend.up.railway.app"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 2. Initialiser EAS

```bash
npm install -g eas-cli
eas login
eas init
```

### 3. Build Preview

```bash
# iOS
eas build --platform ios --profile preview

# Android
eas build --platform android --profile preview
```

### 4. Build Production

```bash
eas build --platform all --profile production
```

### 5. Submit aux Stores

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

---

## 🌐 Déploiement Web

### Option 1 : Netlify

1. **Connecter GitHub** → `vocaia-frontend`
2. **Configuration Build** :
   ```
   Build command: expo export --platform web
   Publish directory: dist
   ```
3. **Variables d'environnement** :
   ```
   EXPO_PUBLIC_API_BASE_URL=https://votre-backend.up.railway.app
   ```

### Option 2 : Vercel

```bash
npm install -g vercel
vercel --prod
```

Configuration :
- Framework Preset: Other
- Build Command: `expo export --platform web`
- Output Directory: `dist`
- Environment Variables: `EXPO_PUBLIC_API_BASE_URL`

---

## 🔧 Modifier la Configuration tRPC

Dans `lib/trpc.ts`, s'assurer que l'URL est correcte :

```typescript
const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";
  console.log('[tRPC] API URL:', url);
  return url;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
```

---

## ✅ Validation

### Mobile (Dev)
```bash
expo start
# Scanner QR code sur Expo Go
```

### Web (Local)
```bash
expo start --web
```

### Production
- iOS : TestFlight
- Android : Internal Testing
- Web : URL Netlify/Vercel

---

## 🆘 Erreurs Courantes

### "Failed to fetch"

**Cause** : Backend inaccessible ou URL incorrecte

**Solution** :
1. Vérifier que Railway est déployé
2. Tester avec `curl https://backend.up.railway.app/`
3. Vérifier `EXPO_PUBLIC_API_BASE_URL` dans `.env`

### "Network request failed"

**Cause** : CORS ou certificat SSL

**Solution** :
1. Vérifier que le backend a `cors()` activé (déjà fait dans `hono.ts`)
2. Vérifier que Railway utilise HTTPS

### Build EAS échoue

**Cause** : Dépendances manquantes ou `app.json` invalide

**Solution** :
```bash
eas build:configure
eas build --platform android --profile preview --clear-cache
```
