# 🚀 GUIDE FINAL : Déploiement Backend VocaIA sur Railway

## ✅ État actuel
- Backend corrigé et compile sans erreur ✅
- Tous les imports ESM avec `.js` ✅
- Pas de dépendances frontend ✅
- Types TypeScript corrects ✅

---

## 📦 ÉTAPE 1 : Copier les fichiers vers vocaia-backend-clean

### Option A : Script automatique (recommandé)

```bash
# Dans votre terminal, depuis le projet actuel
chmod +x COPY_TO_CLEAN_BACKEND.sh
./COPY_TO_CLEAN_BACKEND.sh /chemin/vers/vocaia-backend-clean
```

### Option B : Copie manuelle

```bash
cd /chemin/vers/vocaia-backend-clean

# Copiez ces fichiers depuis le projet actuel :
cp /chemin/actuel/BACKEND_PACKAGE_CLEAN.json ./package.json
cp /chemin/actuel/BACKEND_TSCONFIG_CLEAN.json ./tsconfig.json
cp /chemin/actuel/BACKEND_RAILWAY_CLEAN.toml ./railway.toml
cp /chemin/actuel/BACKEND_GITIGNORE ./.gitignore
cp /chemin/actuel/BACKEND_ENV_EXAMPLE ./.env.example
cp /chemin/actuel/BACKEND_README_CLEAN.md ./README.md

# Copiez tout le dossier backend
cp -r /chemin/actuel/backend ./
```

---

## 📤 ÉTAPE 2 : Push vers GitHub

```bash
cd /chemin/vers/vocaia-backend-clean

# Vérifiez les fichiers copiés
ls -la

# Devrait afficher :
# - package.json
# - tsconfig.json
# - railway.toml
# - .gitignore
# - .env.example
# - README.md
# - backend/ (dossier)

# Ajoutez et commit
git add .
git commit -m "Initial backend setup - clean version"
git push origin main
```

---

## ☁️ ÉTAPE 3 : Configuration Railway

### 3.1 Créer le projet Railway

1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Choisissez **`vocaia-backend-clean`**

### 3.2 Configurer les variables d'environnement

Dans Railway → Settings → Variables, ajoutez :

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
VAPI_API_KEY=votre_clé_vapi
VAPI_WEBHOOK_SECRET=votre_secret_webhook
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_CLIENT_SECRET=votre_client_secret_paypal
PAYPAL_MODE=sandbox
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
GCS_BUCKET_NAME=nom_de_votre_bucket
PORT=3000
NODE_ENV=production
```

### 3.3 Vérifier la configuration de build

Railway détecte automatiquement `railway.toml` :

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
watchPatterns = ["backend/**"]
```

**Commandes Railway** (automatiques) :
- **Install**: `npm install`
- **Build**: `npm run build` (compile TypeScript → dist/)
- **Start**: `npm start` (exécute node dist/index.js)

### 3.4 Déployer

1. Railway détecte le push et démarre automatiquement le build
2. Surveillez les logs de build
3. Le backend devrait compiler **SANS ERREUR**
4. Une fois déployé, vous aurez une URL : `https://votre-backend.railway.app`

---

## ✅ ÉTAPE 4 : Vérification

### 4.1 Tester le health check

```bash
curl https://votre-backend.railway.app/
# Réponse attendue : {"status":"ok","message":"API is running"}
```

### 4.2 Tester tRPC

```bash
curl https://votre-backend.railway.app/api/trpc
# Devrait retourner une réponse tRPC (pas d'erreur 404)
```

### 4.3 Vérifier les logs Railway

Dans Railway → Logs, vous devriez voir :
```
[Backend] Starting server on port 3000
[Backend] Server running at http://localhost:3000
[DB] Pool PostgreSQL initialisé
```

---

## 🔧 ÉTAPE 5 : Configurer le Webhook Vapi.ai

1. Allez sur le dashboard Vapi.ai
2. Dans Settings → Webhooks, ajoutez :
   ```
   URL: https://votre-backend.railway.app/webhooks/vapi/call-completed
   Secret: <votre VAPI_WEBHOOK_SECRET>
   ```

---

## 🎯 Commandes Railway finales

| Action | Commande Railway |
|--------|-----------------|
| **Build** | `npm run build` |
| **Start** | `npm start` |
| **Dev** (local) | `npm run dev` |

---

## 📋 Checklist finale

- [ ] Fichiers copiés vers `vocaia-backend-clean`
- [ ] Push vers GitHub réussi
- [ ] Projet Railway créé et connecté au repo
- [ ] Variables d'environnement configurées
- [ ] Build Railway réussi **sans erreur**
- [ ] Health check OK (`/`)
- [ ] Endpoint tRPC OK (`/api/trpc`)
- [ ] Webhook Vapi.ai configuré
- [ ] Logs Railway propres

---

## 🐛 Dépannage

### Build échoue avec erreurs TypeScript frontend
→ Vérifiez que vous avez bien copié **uniquement le dossier backend/** et les fichiers racine corrects

### Erreur `Cannot find module '@react-native-async-storage/async-storage'`
→ Cette dépendance ne doit PAS être dans le backend. Vérifiez qu'elle n'est pas dans `package.json`

### Erreur `data is of type unknown`
→ J'ai déjà corrigé ce problème dans `backend/utils/paypal.ts`

### Build réussit mais serveur ne démarre pas
→ Vérifiez `DATABASE_URL` dans les variables d'environnement Railway

---

## 📞 URL finale

Une fois déployé, votre backend sera accessible à :
```
https://vocaia-backend-clean.up.railway.app
```

Utilisez cette URL dans votre frontend (variable `BACKEND_URL` ou similaire).

---

**✅ Vous avez maintenant un backend propre, séparé du frontend, prêt pour la production !**
