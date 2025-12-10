# 📦 Backend VocaIA - Configuration Finale et Déploiement Railway

## ✅ Ce qui a été corrigé

### 1. **Erreurs TypeScript**
- ✅ Toutes les interfaces dans `backend/utils/paypal.ts` sont maintenant correctement typées
- ✅ Plus d'erreur `'data' is of type 'unknown'`
- ✅ Aucune dépendance frontend (comme `@react-native-async-storage/async-storage`) dans le backend

### 2. **Structure Node.js ESM**
- ✅ Tous les imports utilisent l'extension `.js` (requis pour Node ESM)
- ✅ `type: "module"` configuré dans `package.json`
- ✅ `moduleResolution: "NodeNext"` dans `tsconfig.json`

## 📁 Fichiers fournis pour le nouveau repo

Voici les fichiers à copier dans votre nouveau repo `vocaia-backend-clean` :

### Fichiers de configuration racine

1. **`package.json`** → Utilisez `BACKEND_PACKAGE_CLEAN.json`
2. **`tsconfig.json`** → Utilisez `BACKEND_TSCONFIG_CLEAN.json`
3. **`railway.toml`** → Utilisez `BACKEND_RAILWAY_CLEAN.toml`
4. **`.gitignore`** → Utilisez `BACKEND_GITIGNORE`
5. **`.env.example`** → Utilisez `BACKEND_ENV_EXAMPLE`

### Dossier backend/

Copiez **TOUT** le contenu du dossier `backend/` de votre projet actuel :

```
backend/
├── constants/
├── database/
├── mocks/
├── trpc/
│   ├── routes/
│   ├── app-router.ts
│   └── create-context.ts
├── types/
├── utils/
├── hono.ts
└── index.ts
```

## 🚀 Instructions de déploiement Railway

### Étape 1 : Préparer le repo

```bash
# Dans votre nouveau repo vocaia-backend-clean
git clone https://github.com/votre-username/vocaia-backend-clean.git
cd vocaia-backend-clean

# Copiez les fichiers (voir structure ci-dessus)

# Renommez les fichiers de configuration
mv BACKEND_PACKAGE_CLEAN.json package.json
mv BACKEND_TSCONFIG_CLEAN.json tsconfig.json
mv BACKEND_RAILWAY_CLEAN.toml railway.toml
mv BACKEND_GITIGNORE .gitignore
mv BACKEND_ENV_EXAMPLE .env.example
```

### Étape 2 : Vérifier la structure finale

Votre repo doit ressembler à ceci :

```
vocaia-backend-clean/
├── backend/          # Dossier complet du backend
├── package.json      # Configuration npm
├── tsconfig.json     # Configuration TypeScript
├── railway.toml      # Configuration Railway
├── .gitignore        # Fichiers à ignorer
└── .env.example      # Exemple de variables d'environnement
```

### Étape 3 : Tester localement (optionnel)

```bash
npm install
npm run build

# Si tout compile sans erreur, vous êtes prêt !
```

### Étape 4 : Push sur GitHub

```bash
git add .
git commit -m "Initial commit - Backend propre et corrigé"
git push origin main
```

### Étape 5 : Déployer sur Railway

1. Allez sur [Railway.app](https://railway.app)
2. Créez un nouveau projet
3. Cliquez sur **"Deploy from GitHub repo"**
4. Sélectionnez votre repo `vocaia-backend-clean`
5. Railway détectera automatiquement le `railway.toml`

### Étape 6 : Configurer les variables d'environnement

Dans Railway, allez dans **Variables** et ajoutez :

```env
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

### Étape 7 : Déploiement automatique

Railway va :
1. ✅ Installer les dépendances : `npm install`
2. ✅ Compiler TypeScript : `npm run build`
3. ✅ Démarrer le serveur : `npm start` (= `node dist/index.js`)

## 🔍 Vérification du déploiement

Une fois déployé, testez votre API :

```bash
# Remplacez YOUR_RAILWAY_URL par l'URL fournie par Railway
curl https://YOUR_RAILWAY_URL.railway.app/

# Réponse attendue :
# {"status":"ok","message":"API is running"}
```

## ⚠️ Points importants

1. **DATABASE_URL** : Assurez-vous qu'elle est correcte et que le certificat SSL est valide
2. **GCS_SERVICE_ACCOUNT_KEY** : Doit être un JSON valide sur une seule ligne
3. **Port** : Railway définit automatiquement `PORT`, mais vous pouvez le configurer
4. **Node version** : Railway utilisera Node.js 18+ (défini dans `engines` du package.json)

## 🐛 Résolution des problèmes

### Erreur : "Cannot find module"
→ Vérifiez que tous les imports ont l'extension `.js`

### Erreur de compilation TypeScript
→ Lancez `npm run build` localement pour identifier l'erreur

### Erreur de connexion BDD
→ Vérifiez que `DATABASE_URL` est correcte et que l'IP de Railway est autorisée

### Webhook Vapi.ai ne fonctionne pas
→ Configurez l'URL du webhook dans Vapi.ai : `https://YOUR_RAILWAY_URL.railway.app/webhooks/vapi/call-completed`

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Railway (onglet **Deployments** → **Logs**)
2. Vérifiez que toutes les variables d'environnement sont définies
3. Assurez-vous que la structure du repo est correcte

---

## ✨ Résumé des commandes

```bash
# Cloner le nouveau repo
git clone https://github.com/votre-username/vocaia-backend-clean.git
cd vocaia-backend-clean

# Copier les fichiers backend + fichiers de config

# Renommer les fichiers
mv BACKEND_PACKAGE_CLEAN.json package.json
mv BACKEND_TSCONFIG_CLEAN.json tsconfig.json
mv BACKEND_RAILWAY_CLEAN.toml railway.toml
mv BACKEND_GITIGNORE .gitignore
mv BACKEND_ENV_EXAMPLE .env.example

# Tester localement (optionnel)
npm install
npm run build

# Pusher sur GitHub
git add .
git commit -m "Initial commit - Backend propre"
git push origin main

# Déployer sur Railway (via l'interface web)
```

---

**✅ Votre backend est maintenant prêt pour le déploiement sur Railway !**
