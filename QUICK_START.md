# 🚀 DÉPLOIEMENT VOCAIA - ACTIONS IMMÉDIATES

## ✅ ÉTAT ACTUEL

Votre projet est **prêt à déployer** :
- ✅ Backend fonctionnel (Hono + tRPC)
- ✅ Frontend fonctionnel (Expo)
- ✅ Aucune dépendance Rork en production
- ✅ Documentation complète créée

---

## 📋 3 ÉTAPES POUR DÉPLOYER

### 1️⃣ CONFIGURER SUPABASE (5 min)

```bash
1. Créer un projet sur supabase.com
2. SQL Editor → Exécuter backend/database/schema.sql
3. Settings → Database → Copier "Connection string"
```

---

### 2️⃣ DÉPLOYER BACKEND SUR RAILWAY (10 min)

```bash
1. Aller sur railway.app
2. New Project → Deploy from GitHub repo
3. Settings → Start Command: node backend/index.ts
4. Variables → Ajouter (voir ci-dessous)
5. Deploy
```

**Variables minimales obligatoires** :
```
DATABASE_URL=postgresql://...        (depuis Supabase)
VAPI_API_KEY=xxx                     (depuis vapi.ai)
VAPI_WEBHOOK_SECRET=xxx              (depuis vapi.ai)
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
GCS_BUCKET_NAME=vocaia-recordings
NODE_ENV=production
```

**Test** : `curl https://votre-backend.up.railway.app/`
→ Réponse : `{"status":"ok"}`

---

### 3️⃣ DÉPLOYER FRONTEND (15 min)

#### Web (Netlify)
```bash
1. Connecter repo sur netlify.com
2. Build: expo export --platform web
3. Publish directory: dist
4. Variables: EXPO_PUBLIC_API_BASE_URL=https://votre-backend.up.railway.app
```

#### Mobile (EAS)
```bash
npm install -g eas-cli
eas login
eas init
eas build --platform all
```

---

## 📚 DOCUMENTATION DISPONIBLE

Tous les fichiers créés pour vous :

| Fichier | Usage |
|---------|-------|
| `README_DEPLOY.md` | 👈 **START HERE** - Vue d'ensemble |
| `ENVIRONMENT_VARIABLES.md` | Liste complète des variables |
| `RAILWAY_BACKEND.md` | Guide Railway détaillé |
| `FRONTEND_DEPLOYMENT.md` | Guide EAS + Netlify |
| `SEPARATION_REPOS.md` | Séparer backend/frontend (optionnel) |
| `eas.example.json` | Configuration EAS |

---

## 🆘 AIDE RAPIDE

### "Failed to fetch"
→ Vérifier `EXPO_PUBLIC_API_BASE_URL` dans votre config frontend

### "DATABASE_URL_NOT_CONFIGURED"
→ Ajouter `DATABASE_URL` dans les variables Railway

### Backend ne démarre pas sur Railway
→ Vérifier Start Command: `node backend/index.ts`

---

## ✅ VALIDATION RAPIDE

```bash
# Backend OK ?
curl https://votre-backend.up.railway.app/
# → {"status":"ok","message":"API is running"}

# Frontend OK ?
# Ouvrir l'app → console doit afficher :
# [tRPC] API URL: https://votre-backend.up.railway.app
```

---

## 📞 BESOIN D'AIDE ?

1. **Lire `README_DEPLOY.md`** → Explications détaillées
2. **Lire `ENVIRONMENT_VARIABLES.md`** → Toutes les clés nécessaires
3. **Vérifier les logs Railway** → Identifier les erreurs

---

Votre projet est **production-ready**. Suivez les 3 étapes ci-dessus et vous êtes en ligne ! 🎉
