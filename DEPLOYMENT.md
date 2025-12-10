# 🚀 Guide de Déploiement VocaIA

## Architecture

```
Frontend (Expo/React Native) → Backend (Hono/tRPC) → Database (PostgreSQL/Supabase)
     ↓ EAS/Netlify            ↓ Railway              ↓ Supabase
```

---

## 1️⃣ BACKEND (Railway)

### Étapes de déploiement

1. **Créer un nouveau projet sur Railway**
   - Connecter votre repo GitHub `vocaia-backend`
   - Root Directory: `/` (ou `/backend` si vous séparez les repos)
   - Build Command: (laissez vide)
   - Start Command: `node backend/index.ts`

2. **Runtime**
   - Railway détectera automatiquement Node.js
   - Version recommandée : Node 18+

3. **Variables d'environnement Railway**

```bash
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/database

# Vapi.ai
VAPI_API_KEY=votre_cle_vapi
VAPI_WEBHOOK_SECRET=votre_secret_webhook

# Google Cloud Storage
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
GCS_BUCKET_NAME=vocaia-recordings

# Configuration
NODE_ENV=production
PORT=3000
```

4. **Déploiement**
   - Railway déploiera automatiquement à chaque push
   - URL générée : `https://votre-app.up.railway.app`

### Test du backend

```bash
# Health check
curl https://votre-app.up.railway.app/

# tRPC endpoint
curl https://votre-app.up.railway.app/api/trpc/example.hi
```

---

## 2️⃣ FRONTEND (EAS / Expo)

### Variables d'environnement Frontend

Créer `.env.production` :

```bash
EXPO_PUBLIC_API_BASE_URL=https://votre-app.up.railway.app
```

### Déploiement Mobile (EAS)

1. **Installer EAS CLI**
```bash
npm install -g eas-cli
eas login
```

2. **Initialiser EAS**
```bash
eas init --id votre-projet-id
```

3. **Build iOS/Android**
```bash
# Preview
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Production
eas build --platform all --profile production
```

### Déploiement Web (Netlify/Vercel)

1. **Export Web**
```bash
npx expo export --platform web
```

2. **Netlify**
   - Build command: `npx expo export --platform web`
   - Publish directory: `dist`
   - Variables d'environnement : ajouter `EXPO_PUBLIC_API_BASE_URL`

3. **Vercel**
```bash
vercel --prod
```

---

## 3️⃣ BASE DE DONNÉES (Supabase)

### Configuration

1. Créer un projet Supabase
2. Exécuter le schéma : `backend/database/schema.sql`
3. Copier `DATABASE_URL` depuis Supabase → Settings → Database
4. Ajouter sur Railway

### Format PostgreSQL

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 4️⃣ VÉRIFICATION FINALE

### Backend (Railway)
- ✅ `https://votre-app.up.railway.app/` retourne `{"status":"ok"}`
- ✅ Variables d'environnement configurées
- ✅ Logs Railway sans erreur

### Frontend
- ✅ Build sans erreur
- ✅ `EXPO_PUBLIC_API_BASE_URL` configuré
- ✅ Connexion au backend réussie

### Database
- ✅ Connexion PostgreSQL valide
- ✅ Tables créées

---

## 5️⃣ SCRIPTS DISPONIBLES

### Local Development
```bash
# Backend
bun run backend:start

# Frontend
npx expo start
```

### Production
```bash
# Le déploiement est automatique via :
# - Railway (backend)
# - EAS (mobile)
# - Netlify/Vercel (web)
```

---

## 🆘 TROUBLESHOOTING

### "Failed to fetch" sur mobile

**Cause** : Le frontend ne peut pas atteindre le backend

**Solution** :
1. Vérifier que Railway est déployé et accessible
2. Vérifier `EXPO_PUBLIC_API_BASE_URL` dans `.env`
3. Tester avec `curl https://votre-app.up.railway.app/api/trpc`

### "DATABASE_URL_NOT_CONFIGURED"

**Cause** : Variable manquante sur Railway

**Solution** :
1. Aller sur Railway → Variables
2. Ajouter `DATABASE_URL` avec la valeur Supabase

### Webhook Vapi ne fonctionne pas

**Cause** : Signature invalide ou URL incorrecte

**Solution** :
1. Vérifier `VAPI_WEBHOOK_SECRET` sur Railway
2. Configurer l'URL webhook sur Vapi : `https://votre-app.up.railway.app/webhooks/vapi/call-completed`

---

## 📞 SUPPORT

Pour toute question, vérifiez :
1. Logs Railway : `railway logs`
2. Logs EAS : `eas build:list`
3. Console Supabase : vérifier les connexions actives
