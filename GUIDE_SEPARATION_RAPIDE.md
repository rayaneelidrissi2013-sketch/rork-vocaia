# 🚀 Guide de séparation RAPIDE des repos

## 📋 Vue d'ensemble

Vous avez créé deux repos:
- `vocaia-backend`: https://github.com/rayaneelidrissi2013-sketch/vocaia-backend
- `vocaia-frontend`: https://github.com/rayaneelidrissi2013-sketch/vocaia-frontend

## ⚡ Méthode 1: Copie manuelle (RECOMMANDÉE)

### Étape 1: Télécharger depuis Rork

Dans l'interface Rork:
1. Cherchez une option "Download ZIP" ou "Export Project"
2. Si vous ne voyez que "Create Repository", contactez le support Rork pour obtenir un ZIP

### Étape 2: Organiser les fichiers

Une fois le ZIP téléchargé:

#### Pour `vocaia-backend/`:
```bash
# Créer la structure
mkdir -p vocaia-backend/backend
mkdir -p vocaia-backend/types

# Copier les fichiers backend
cp -r backend/ vocaia-backend/
cp -r types/ vocaia-backend/
cp railway.toml vocaia-backend/
cp BACKEND_PACKAGE.json vocaia-backend/package.json
cp BACKEND_TSCONFIG.json vocaia-backend/tsconfig.json

# Créer .env.example
cat > vocaia-backend/.env.example << EOF
DATABASE_URL=
VAPI_API_KEY=
VAPI_WEBHOOK_SECRET=
GCS_SERVICE_ACCOUNT_KEY=
GCS_BUCKET_NAME=
NODE_ENV=production
PORT=3000
EOF

# Git init
cd vocaia-backend
git init
git remote add origin https://github.com/rayaneelidrissi2013-sketch/vocaia-backend.git
git add .
git commit -m "Initial backend setup"
git push -u origin main
```

#### Pour `vocaia-frontend/`:
```bash
# Créer la structure
mkdir -p vocaia-frontend

# Copier les fichiers frontend
cp -r app/ vocaia-frontend/
cp -r assets/ vocaia-frontend/
cp -r contexts/ vocaia-frontend/
cp -r lib/ vocaia-frontend/
cp -r utils/ vocaia-frontend/
cp -r constants/ vocaia-frontend/
cp -r mocks/ vocaia-frontend/
cp app.json vocaia-frontend/
cp eas.json vocaia-frontend/
cp tsconfig.json vocaia-frontend/
cp metro.config.js vocaia-frontend/
cp eslint.config.js vocaia-frontend/
cp FRONTEND_PACKAGE.json vocaia-frontend/package.json

# Créer .env.example
cat > vocaia-frontend/.env.example << EOF
EXPO_PUBLIC_API_BASE_URL=https://your-backend.up.railway.app
EOF

# Git init
cd vocaia-frontend
git init
git remote add origin https://github.com/rayaneelidrissi2013-sketch/vocaia-frontend.git
git add .
git commit -m "Initial frontend setup"
git push -u origin main
```

## 📦 Méthode 2: Si vous ne pouvez pas télécharger le ZIP

### Option A: Utiliser l'interface Rork "Create Repository"

1. Cliquez sur "Create Repository"
2. Créez un repo temporaire (ex: `vocaia-full`)
3. Clonez ce repo en local
4. Utilisez la méthode 1 ci-dessus pour séparer les fichiers
5. Supprimez le repo temporaire une fois terminé

### Option B: Copier/coller manuel

Si aucune des méthodes ci-dessus ne fonctionne:
1. Contactez le support Rork pour obtenir un export
2. OU copiez les fichiers un par un depuis l'interface Rork (long mais faisable)

## ✅ Vérification post-séparation

### Backend (`vocaia-backend/`)
```bash
cd vocaia-backend
npm install
npm start  # Doit démarrer sans erreur
```

### Frontend (`vocaia-frontend/`)
```bash
cd vocaia-frontend
npm install
npx expo start  # Doit démarrer sans erreur
```

## 🆘 Besoin d'aide ?

Consultez:
- `BACKEND_FILES.md` - Liste complète des fichiers backend
- `FRONTEND_FILES.md` - Liste complète des fichiers frontend
- `DEPLOYMENT.md` - Guide de déploiement complet
