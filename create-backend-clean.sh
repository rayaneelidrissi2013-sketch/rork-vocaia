#!/bin/bash

# Script de Création du Backend VocaIA Propre
# Ce script crée automatiquement le dépôt vocaia-backend-clean

echo "🚀 Création du Backend VocaIA Propre pour Railway"
echo "================================================="
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -d "backend" ]; then
    echo "❌ Erreur: Le dossier 'backend/' n'existe pas"
    echo "   Exécutez ce script depuis le dossier racine de votre projet Rork"
    exit 1
fi

# Créer le dossier de destination
DEST_DIR="../vocaia-backend-clean"
echo "📁 Création du dossier $DEST_DIR"
mkdir -p "$DEST_DIR"
cd "$DEST_DIR"

# Initialiser git
echo "🔧 Initialisation de Git..."
git init

# Copier le dossier backend
echo "📦 Copie du dossier backend/..."
cp -r ../rork-app/backend ./

# Créer package.json
echo "📄 Création de package.json..."
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

# Créer tsconfig.json
echo "📄 Création de tsconfig.json..."
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

# Créer railway.toml
echo "📄 Création de railway.toml..."
cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
EOF

# Créer .gitignore
echo "📄 Création de .gitignore..."
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

# Créer .env.example
echo "📄 Création de .env.example..."
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

# Créer README.md
echo "📄 Création de README.md..."
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
EOF

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Tester la compilation
echo ""
echo "🔨 Test de compilation TypeScript..."
npm run build

# Vérifier le résultat
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Le backend a été créé et compile sans erreur!"
    echo ""
    echo "📁 Dossier créé: $DEST_DIR"
    echo ""
    echo "🚀 Prochaines étapes:"
    echo "   1. cd $DEST_DIR"
    echo "   2. git add ."
    echo "   3. git commit -m 'Initial backend setup'"
    echo "   4. git remote add origin https://github.com/VOTRE-USERNAME/vocaia-backend-clean.git"
    echo "   5. git push -u origin main"
    echo "   6. Connectez le dépôt à Railway"
    echo ""
    echo "📝 N'oubliez pas de configurer les variables d'environnement dans Railway!"
else
    echo ""
    echo "❌ ERREUR: La compilation TypeScript a échoué"
    echo "   Vérifiez les erreurs ci-dessus"
    exit 1
fi
