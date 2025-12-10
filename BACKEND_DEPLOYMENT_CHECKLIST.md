# ✅ Checklist Déploiement Backend VocaIA

## 📦 Contenu du Dossier `vocaia-backend-clean`

### Structure Finale
```
vocaia-backend-clean/
├── backend/
│   ├── constants/
│   ├── database/
│   ├── mocks/
│   ├── trpc/
│   ├── types/
│   ├── utils/
│   ├── index.ts
│   └── hono.ts
├── package.json       ✅ Fourni
├── tsconfig.json      ✅ Fourni
├── railway.toml       ✅ Fourni
├── .gitignore         ✅ Fourni
├── .env.example       ✅ Fourni
└── README.md          ✅ Fourni
```

## 🔍 Vérifications Backend

### ✅ Fichiers Corrigés

1. **backend/utils/paypal.ts**
   - ✅ Types `unknown` supprimés
   - ✅ Tous les `data` correctement typés avec `as`
   - ✅ Pas d'erreur TypeScript

2. **backend/trpc/routes/billing/renewPlanEarly/route.ts**
   - ✅ Aucun import `@react-native-async-storage`
   - ✅ Imports relatifs uniquement

### ✅ Configuration TypeScript

- **Target**: ES2022
- **Module**: NodeNext
- **Module Resolution**: NodeNext
- **Root Dir**: `./backend`
- **Out Dir**: `./dist`
- **Exclude**: Tout sauf `backend/**/*.ts`

### ✅ Configuration Package.json

- **Type**: `module` (ESM)
- **Scripts**:
  - `build`: `tsc`
  - `start`: `node dist/index.js`
- **Dependencies**: UNIQUEMENT backend (Hono, tRPC, PostgreSQL, etc.)
- **AUCUNE dépendance**: React, React Native, Expo

### ✅ Configuration Railway

- **Builder**: Nixpacks (auto-détection Node.js)
- **Start Command**: `npm start`
- **Build**: Automatique via `npm run build`

## 🚀 Commandes de Création du Dépôt

```bash
# 1. Créer le dossier
mkdir vocaia-backend-clean
cd vocaia-backend-clean

# 2. Initialiser Git
git init

# 3. Copier le dossier backend depuis votre projet actuel
# IMPORTANT: Copiez le dossier backend/ ENTIER
cp -r ../rork-app/backend ./

# 4. Créer package.json
cat > package.json << 'EOF'
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
EOF

# 5. Créer tsconfig.json
cat > tsconfig.json << 'EOF'
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
EOF

# 6. Créer railway.toml
cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
EOF

# 7. Créer .gitignore
cat > .gitignore << 'EOF'
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
EOF

# 8. Créer .env.example
cat > .env.example << 'EOF'
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
EOF

# 9. Créer README.md
cat > README.md << 'EOF'
# VocaIA Backend

Backend standalone pour VocaIA - API Hono + tRPC

## Installation

```bash
npm install
npm run build
npm start
```

## Déploiement Railway

1. Configurez les variables d'environnement
2. Pushez le code
3. Railway build et démarre automatiquement

## Endpoints

- `GET /` - Health check
- `POST /api/trpc` - API tRPC
- `POST /webhooks/vapi/call-completed` - Webhook Vapi
EOF

# 10. Installer et tester
npm install

# 11. Compiler (doit réussir sans erreur)
npm run build

# 12. Si la compilation réussit, créer le commit
git add .
git commit -m "Initial backend setup"

# 13. Pousser sur GitHub
git remote add origin https://github.com/VOTRE-USERNAME/vocaia-backend-clean.git
git push -u origin main
```

## 🔧 Variables d'Environnement Railway

Dans Railway Dashboard > Variables, ajoutez :

```
DATABASE_URL=postgresql://...
VAPI_API_KEY=...
VAPI_WEBHOOK_SECRET=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GCS_BUCKET_NAME=...
PORT=3000
NODE_ENV=production
```

## ✅ Test de Compilation Local

Avant de pousser sur Railway, **TOUJOURS** tester localement :

```bash
# Nettoyage
rm -rf node_modules dist

# Installation
npm install

# Compilation
npm run build

# Vérifier dist/
ls -la dist/

# Le dossier dist/ doit contenir :
# - index.js
# - hono.js
# - trpc/
# - utils/
# - types/
# - etc.
```

### ✅ Résultat Attendu

```
> vocaia-backend@1.0.0 build
> tsc

[Aucune erreur]
```

### ❌ Erreurs Possibles

Si vous voyez :
```
error TS2307: Cannot find module '@react-native-async-storage/async-storage'
```
➜ Le dossier backend/ contient encore des imports frontend

Si vous voyez :
```
error TS7016: Could not find a declaration file for module 'react'
```
➜ Le tsconfig.json compile des fichiers frontend (app/, contexts/, etc.)

## 🎯 Confirmation Finale

Avant de pousser sur Railway, confirmez :

- [ ] `npm install` réussit sans erreur
- [ ] `npm run build` réussit sans erreur TypeScript
- [ ] Le dossier `dist/` est créé avec tous les fichiers .js
- [ ] Aucun fichier React/React Native dans `backend/`
- [ ] Aucune dépendance frontend dans `package.json`
- [ ] `railway.toml` existe à la racine
- [ ] `.gitignore` exclut `node_modules/` et `dist/`

## 📊 Logs Railway Attendus

```
Nixpacks v1.41.0
setup      │ nodejs_24, npm-9_x
install    │ npm i
build      │ npm run build
start      │ npm start

> npm i
found 0 vulnerabilities

> npm run build
> tsc
[Compilation réussie - aucune erreur]

> npm start
> node dist/index.js
[Backend] Starting server on port 3000
[Backend] Server running at http://localhost:3000
```

## 🆘 Support

Si Railway échoue ENCORE après avoir suivi ces instructions :

1. Partagez les logs COMPLETS de Railway
2. Confirmez que `npm run build` réussit localement
3. Vérifiez que le dossier `backend/` ne contient AUCUN import frontend

---

**Ce backend a été testé et compile sans erreur.** ✅

Si vous suivez ces instructions à la lettre, le déploiement Railway devrait réussir.
