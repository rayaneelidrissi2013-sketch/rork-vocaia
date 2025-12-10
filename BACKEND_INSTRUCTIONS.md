# 📦 Instructions Backend VocaIA - Déploiement Railway

## ✅ STRUCTURE DU REPO BACKEND

Votre repo `vocaia-backend` doit contenir **UNIQUEMENT** ces fichiers :

```
vocaia-backend/
├── backend/                   (COPIER depuis projet principal)
│   ├── constants/
│   ├── database/
│   ├── mocks/
│   ├── trpc/
│   │   ├── routes/
│   │   ├── app-router.ts
│   │   └── create-context.ts
│   ├── types/
│   ├── utils/
│   ├── hono.ts
│   └── index.ts
├── package.json              (COPIER BACKEND_PACKAGE.json)
├── tsconfig.json             (COPIER BACKEND_TSCONFIG.json)
├── railway.toml              (COPIER depuis projet principal)
├── .gitignore                (COPIER BACKEND_.gitignore)
├── .env.example              (CRÉER - voir ci-dessous)
└── README.md                 (OPTIONNEL)
```

## 🚫 FICHIERS À NE **JAMAIS** COPIER

**NE PAS COPIER** ces dossiers/fichiers dans vocaia-backend :
- ❌ `app/` (frontend)
- ❌ `assets/` (images)
- ❌ `contexts/` (frontend)
- ❌ `constants/` (frontend, sauf si utilisé par backend)
- ❌ `lib/` (frontend)
- ❌ `mocks/` (frontend)
- ❌ `types/` (frontend, sauf `backend/types/`)
- ❌ `utils/` (frontend, sauf `backend/utils/`)
- ❌ `package.json` (du projet principal)
- ❌ `tsconfig.json` (du projet principal)
- ❌ Tous les fichiers `.md` SAUF README

---

## 📋 ÉTAPES DÉTAILLÉES

### 1️⃣ Créer le fichier `.env.example`

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# API Keys
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_SECRET=your_webhook_secret

# Google Cloud Storage
GCS_BUCKET_NAME=your_bucket_name
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Server
PORT=3000
NODE_ENV=production
```

### 2️⃣ Vérifier railway.toml

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run build && npm start"
```

### 3️⃣ Configuration Railway

Dans le dashboard Railway :
1. **Variables d'environnement** : Ajouter toutes les variables de `.env.example`
2. **Start Command** : `npm start`
3. **Build Command** : `npm run build`
4. **Node Version** : 18+

---

## ✅ COMMANDES DE BUILD ET START

```bash
# Install dependencies
npm install

# Build TypeScript → dist/
npm run build

# Start production server
npm start
```

---

## 🔍 VÉRIFICATION AVANT DÉPLOIEMENT

Avant de pousser sur Railway, vérifiez :

```bash
# 1. Build doit passer sans erreur
npm run build

# 2. Vérifier que dist/ contient les fichiers .js
ls -la dist/

# 3. Tester localement
npm start
```

Si `npm run build` affiche des erreurs sur `app/`, `contexts/`, etc. :
→ **Vous avez copié des fichiers frontend par erreur !**

---

## 📦 RÉSUMÉ

| Commande Railway | Valeur |
|-----------------|--------|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Root Directory** | `/` |
| **Node Version** | 18+ |

---

## 🚀 DÉPLOIEMENT FINAL

1. Copier uniquement les fichiers listés ci-dessus
2. Renommer `BACKEND_PACKAGE.json` → `package.json`
3. Renommer `BACKEND_TSCONFIG.json` → `tsconfig.json`
4. Renommer `BACKEND_.gitignore` → `.gitignore`
5. Pousser sur GitHub
6. Connecter Railway au repo
7. Configurer les variables d'environnement
8. Déployer

---

## ⚠️ SI LE BUILD ÉCHOUE

Si vous voyez dans les logs Railway :
```
app/(admin)/_layout.tsx: error TS...
```

→ **Vous avez copié le dossier `app/` par erreur !**

**Solution** :
1. Supprimez TOUS les fichiers frontend du repo backend
2. Gardez UNIQUEMENT le dossier `backend/`
3. Recommitez et redéployez

---

## 📞 SUPPORT

Si le build passe en local (`npm run build`) mais échoue sur Railway :
1. Vérifier les logs Railway
2. Vérifier que toutes les variables d'environnement sont configurées
3. Vérifier que `railway.toml` est présent à la racine
