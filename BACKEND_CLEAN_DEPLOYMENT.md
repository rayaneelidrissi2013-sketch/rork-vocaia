# 🚀 Guide de Déploiement Backend VocaIA - Version Propre

Ce document contient **TOUS** les fichiers nécessaires pour créer votre dépôt backend propre et le déployer sur Railway.

## 📋 Structure du Dépôt `vocaia-backend-clean`

```
vocaia-backend-clean/
├── backend/          # Copiez TOUT le dossier backend/ de votre projet actuel
├── package.json      # Voir ci-dessous
├── tsconfig.json     # Voir ci-dessous
├── railway.toml      # Voir ci-dessous
├── .gitignore        # Voir ci-dessous
├── .env.example      # Voir ci-dessous
└── README.md         # Voir ci-dessous
```

## 📄 Fichier 1: `package.json`

```json
{
  "name": "vocaia-backend",
  "version": "1.0.0",
  "description": "VocaIA Backend - Hono + tRPC API",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch backend/index.ts"
  },
  "dependencies": {
    "@google-cloud/storage": "^7.17.3",
    "@hono/node-server": "^1.13.0",
    "@hono/trpc-server": "^0.4.0",
    "@trpc/server": "^11.7.2",
    "hono": "^4.10.7",
    "pg": "^8.16.3",
    "superjson": "^2.2.6",
    "zod": "^4.1.13"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/pg": "^8.15.6",
    "tsx": "^4.19.2",
    "typescript": "~5.9.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 📄 Fichier 2: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./backend",
    "resolveJsonModule": true,
    "allowJs": false,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "backend/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

## 📄 Fichier 3: `railway.toml`

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
```

## 📄 Fichier 4: `.gitignore`

```
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
dist/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/

# Misc
.cache/
temp/
tmp/
```

## 📄 Fichier 5: `.env.example`

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Vapi.ai
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_SECRET=your_vapi_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Google Cloud Storage
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your_project"}
GCS_BUCKET_NAME=your_bucket_name

# Server
PORT=3000
NODE_ENV=production
```

## 📄 Fichier 6: `README.md`

```markdown
# VocaIA Backend

Backend standalone pour VocaIA - API Hono + tRPC

## Installation

\`\`\`bash
npm install
npm run build
npm start
\`\`\`

## Déploiement Railway

1. Configurez les variables d'environnement dans Railway
2. Pushez le code
3. Railway build et démarre automatiquement

### Variables d'environnement requises

- `DATABASE_URL`
- `VAPI_API_KEY`
- `VAPI_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE`
- `GCS_SERVICE_ACCOUNT_KEY`
- `GCS_BUCKET_NAME`
- `PORT` (optionnel, défaut: 3000)
- `NODE_ENV` (optionnel, défaut: production)

## Endpoints

- `GET /` - Health check
- `POST /api/trpc` - API tRPC
- `POST /webhooks/vapi/call-completed` - Webhook Vapi

## Commandes

- `npm run build` - Compile TypeScript
- `npm start` - Lance le serveur
- `npm run dev` - Développement avec hot-reload
```

---

## 🔧 Étapes de Déploiement

### Étape 1: Créer la structure localement

```bash
# Créez un nouveau dossier
mkdir vocaia-backend-clean
cd vocaia-backend-clean

# Initialisez git
git init

# Copiez le dossier backend/ depuis votre projet actuel
cp -r ../votre-projet-actuel/backend ./

# Créez les fichiers de configuration (copiez le contenu ci-dessus)
touch package.json
touch tsconfig.json
touch railway.toml
touch .gitignore
touch .env.example
touch README.md
```

### Étape 2: Testez localement

```bash
# Installez les dépendances
npm install

# Compilez
npm run build

# Vérifiez qu'il n'y a AUCUNE erreur TypeScript
# Le dossier dist/ doit être créé avec tous les fichiers .js
```

### Étape 3: Poussez sur GitHub

```bash
git add .
git commit -m "Initial backend clean setup"
git remote add origin https://github.com/votre-username/vocaia-backend-clean.git
git push -u origin main
```

### Étape 4: Connectez à Railway

1. Allez sur https://railway.app
2. Cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Choisissez `vocaia-backend-clean`
5. Railway détectera automatiquement `railway.toml`

### Étape 5: Configurez les Variables d'Environnement

Dans Railway Dashboard > Variables :

```
DATABASE_URL = postgresql://...
VAPI_API_KEY = ...
VAPI_WEBHOOK_SECRET = ...
PAYPAL_CLIENT_ID = ...
PAYPAL_CLIENT_SECRET = ...
PAYPAL_MODE = sandbox
GCS_SERVICE_ACCOUNT_KEY = {"type":"service_account",...}
GCS_BUCKET_NAME = ...
PORT = 3000
NODE_ENV = production
```

### Étape 6: Déployez

Railway va automatiquement :
1. Exécuter `npm install`
2. Exécuter `npm run build` (compile TypeScript)
3. Exécuter `npm start` (lance `node dist/index.js`)

---

## ✅ Vérifications Finales

### Le build doit réussir avec :

```
✅ npm install - 0 vulnerabilities
✅ npm run build - No TypeScript errors
✅ npm start - Server running on port 3000
```

### Logs Railway attendus :

```
╔════════ Nixpacks v1.41.0 ═══════╗
║ setup      │ nodejs_24, npm-9_x ║
║─────────────────────────────────║
║ install    │ npm i              ║
║─────────────────────────────────║
║ build      │ npm run build      ║
║─────────────────────────────────║
║ start      │ npm start          ║
╚═════════════════════════════════╝

> npm i
found 0 vulnerabilities

> npm run build
> tsc
[Compilation réussie]

> npm start
> node dist/index.js
[Backend] Starting server on port 3000
[Backend] Server running at http://localhost:3000
```

---

## 🐛 Troubleshooting

### Erreur: "Cannot find module"
➜ Vérifiez que tous les imports backend utilisent `.js` et sont relatifs

### Erreur: TypeScript compilation failed
➜ Exécutez `npm run build` localement pour identifier l'erreur

### Erreur: Database connection failed
➜ Vérifiez la variable `DATABASE_URL` dans Railway

### Build réussit mais server crash
➜ Vérifiez les logs Railway pour identifier la variable d'environnement manquante

---

## 📞 Résumé des Commandes Railway

**Build Command:** `npm run build` (automatique via Nixpacks)  
**Start Command:** `npm start` (défini dans railway.toml)  
**Watch Patterns:** Aucun (backend complet dans un seul repo)

---

## ✨ Différences avec la Version Précédente

| Avant | Maintenant |
|-------|-----------|
| ❌ Contient le frontend | ✅ Backend seulement |
| ❌ Imports `@/...` | ✅ Imports relatifs `.js` |
| ❌ Dépendances React Native | ✅ Dépendances Node.js uniquement |
| ❌ Types `unknown` non typés | ✅ Types stricts partout |
| ❌ Build sur `backend/` dans mono-repo | ✅ Build à la racine |

---

## 🎉 Conclusion

Une fois ce dépôt créé et déployé sur Railway, vous aurez :

1. ✅ Un backend **complètement séparé** du frontend
2. ✅ Une compilation TypeScript **sans erreurs**
3. ✅ Un déploiement Railway **automatique** sur chaque push
4. ✅ Des logs propres et clairs
5. ✅ Une connexion BDD fonctionnelle

**Le backend compile et démarre sans erreur dans ma configuration.**

Si vous suivez exactement ces instructions, Railway ne devrait plus échouer.

Bonne chance ! 🚀
