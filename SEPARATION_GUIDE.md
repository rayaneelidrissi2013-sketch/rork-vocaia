# 📦 Guide de Séparation Backend / Frontend

Ce guide explique comment séparer le projet VocaIA en deux repositories distincts et les déployer.

## 🎯 Objectif

1. **vocaia-backend** : API indépendante (Hono + tRPC) déployée sur Railway
2. **vocaia-frontend** : Application Expo (iOS/Android/Web) déployée sur EAS/Netlify

## 📋 Étapes de Séparation

### 1️⃣ Préparer le Repository Backend

Dans votre projet actuel :

```bash
# Créer un nouveau dossier pour le backend
mkdir vocaia-backend
cd vocaia-backend

# Copier les fichiers backend
cp -r ../backend ./
cp -r ../types ./
cp ../BACKEND_README.md ./README.md
cp ../BACKEND_PACKAGE.json ./package.json
cp ../BACKEND_TSCONFIG.json ./tsconfig.json

# Initialiser git
git init
git add .
git commit -m "Initial backend setup"

# Pousser vers GitHub
git remote add origin https://github.com/rayaneelidrissi2013-sketch/vocaia-backend.git
git push -u origin main
```

### 2️⃣ Préparer le Repository Frontend

Dans votre projet actuel :

```bash
# Créer un nouveau dossier pour le frontend
mkdir vocaia-frontend
cd vocaia-frontend

# Copier les fichiers frontend
cp -r ../app ./
cp -r ../contexts ./
cp -r ../lib ./
cp -r ../utils ./
cp -r ../constants ./
cp -r ../mocks ./
cp -r ../types ./
cp -r ../assets ./
cp ../app.json ./
cp ../tsconfig.json ./
cp ../metro.config.js ./
cp ../eslint.config.js ./
cp ../FRONTEND_README.md ./README.md
cp ../FRONTEND_PACKAGE.json ./package.json

# Créer .env.local
echo "EXPO_PUBLIC_API_BASE_URL=http://localhost:3000" > .env.local

# Initialiser git
git init
git add .
git commit -m "Initial frontend setup"

# Pousser vers GitHub
git remote add origin https://github.com/rayaneelidrissi2013-sketch/vocaia-frontend.git
git push -u origin main
```

## 🚀 Déploiement

### Backend sur Railway

1. **Créer un nouveau projet Railway**
   - Allez sur https://railway.app
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez `vocaia-backend`

2. **Configuration**
   - **Root Directory** : `/` (racine)
   - **Build Command** : laisser vide (détection auto)
   - **Start Command** : `npm start`

3. **Variables d'environnement**
   Dans Railway Dashboard → Variables :
   ```
   DATABASE_URL=postgresql://...
   VAPI_API_KEY=...
   VAPI_WEBHOOK_SECRET=...
   GCS_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   GCS_BUCKET_NAME=...
   NODE_ENV=production
   PORT=3000
   ```

4. **Déployer**
   - Railway déploie automatiquement
   - Notez l'URL publique : `https://vocaia-backend-xxx.up.railway.app`

### Frontend sur EAS (Mobile)

1. **Installer EAS CLI**
   ```bash
   cd vocaia-frontend
   npm install -g eas-cli
   ```

2. **Login**
   ```bash
   eas login
   ```

3. **Configurer**
   ```bash
   eas build:configure
   ```

4. **Créer eas.json**
   ```json
   {
     "cli": {
       "version": ">= 0.52.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal",
         "env": {
           "EXPO_PUBLIC_API_BASE_URL": "https://vocaia-backend-xxx.up.railway.app"
         }
       },
       "preview": {
         "distribution": "internal",
         "env": {
           "EXPO_PUBLIC_API_BASE_URL": "https://vocaia-backend-xxx.up.railway.app"
         }
       },
       "production": {
         "env": {
           "EXPO_PUBLIC_API_BASE_URL": "https://vocaia-backend-xxx.up.railway.app"
         }
       }
     },
     "submit": {
       "production": {}
     }
   }
   ```

5. **Build**
   ```bash
   # iOS
   eas build --platform ios --profile production

   # Android
   eas build --platform android --profile production
   ```

### Frontend sur Netlify (Web)

1. **Créer netlify.toml**
   ```toml
   [build]
     command = "npx expo export --platform web"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Déployer sur Netlify**
   - Connectez votre repo `vocaia-frontend`
   - Configurez la variable : `EXPO_PUBLIC_API_BASE_URL`
   - Déployez

## ✅ Checklist Finale

### Backend
- [ ] Repository créé et code poussé
- [ ] Déployé sur Railway
- [ ] Variables d'environnement configurées
- [ ] API accessible et répond au health check
- [ ] URL notée pour le frontend

### Frontend
- [ ] Repository créé et code poussé
- [ ] `EXPO_PUBLIC_API_BASE_URL` configuré
- [ ] Build iOS/Android via EAS réussi
- [ ] Web déployé sur Netlify
- [ ] Application se connecte au backend

## 🔗 Liens Utiles

- **Railway** : https://railway.app
- **EAS Build** : https://expo.dev/eas
- **Netlify** : https://netlify.com
- **Expo Docs** : https://docs.expo.dev

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Railway
2. Vérifiez les logs Expo : `npx expo start`
3. Testez l'API backend avec curl :
   ```bash
   curl https://vocaia-backend-xxx.up.railway.app
   ```
