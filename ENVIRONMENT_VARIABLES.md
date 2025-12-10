# 🔐 Variables d'Environnement - VocaIA

## 📋 LISTE COMPLÈTE DES VARIABLES

### 🚂 BACKEND (Railway)

#### **Obligatoires**

```bash
# Base de données PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@[HOST].supabase.com:6543/postgres

# Vapi.ai (Service d'appels vocaux)
VAPI_API_KEY=votre_cle_api_vapi
VAPI_WEBHOOK_SECRET=votre_secret_webhook_vapi

# Google Cloud Storage (Enregistrements audio)
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
GCS_BUCKET_NAME=vocaia-recordings

# Configuration environnement
NODE_ENV=production
PORT=3000
```

#### **Optionnelles**

```bash
# PayPal (si vous utilisez PayPal)
PAYPAL_CLIENT_ID=votre_client_id
PAYPAL_CLIENT_SECRET=votre_secret

# Twilio (si vous utilisez Twilio)
TWILIO_ACCOUNT_SID=votre_sid
TWILIO_AUTH_TOKEN=votre_token
```

---

### 📱 FRONTEND (EAS / Netlify / Vercel)

#### **Obligatoires**

```bash
# URL du backend Railway
EXPO_PUBLIC_API_BASE_URL=https://votre-backend.up.railway.app
```

#### **Optionnelles**

Aucune autre variable n'est nécessaire côté frontend. Toute la logique backend (API keys, secrets, etc.) doit rester sur Railway.

---

## 📝 DÉTAILS DES VARIABLES

### `DATABASE_URL`

**Description** : URL de connexion PostgreSQL vers Supabase

**Format** :
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Où trouver** :
1. Aller sur Supabase Dashboard
2. Settings → Database
3. Copier "Connection string" (mode Session ou Transaction)

**⚠️ Important** : 
- Utiliser le format PostgreSQL (pas MySQL)
- Activer SSL en production

---

### `VAPI_API_KEY`

**Description** : Clé API pour créer et gérer les agents Vapi.ai

**Où trouver** :
1. Aller sur [Vapi.ai Dashboard](https://vapi.ai)
2. Settings → API Keys
3. Créer une nouvelle clé

**Usage** : Création d'agents vocaux, configuration téléphonique

---

### `VAPI_WEBHOOK_SECRET`

**Description** : Secret pour vérifier l'authenticité des webhooks Vapi

**Où trouver** :
1. Aller sur Vapi.ai Dashboard
2. Settings → Webhooks
3. Copier le secret

**⚠️ Important** :
- Configurer l'URL webhook sur Vapi : `https://votre-backend.up.railway.app/webhooks/vapi/call-completed`

---

### `GCS_SERVICE_ACCOUNT_KEY`

**Description** : Clé JSON du compte de service Google Cloud Storage

**Format** :
```json
{
  "type": "service_account",
  "project_id": "votre-projet",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

**Où créer** :
1. Google Cloud Console
2. IAM & Admin → Service Accounts
3. Créer un compte de service
4. Ajouter le rôle "Storage Object Admin"
5. Générer une clé JSON

**⚠️ Important** : Sur Railway, copier le JSON **sur une seule ligne** ou encoder en base64

---

### `GCS_BUCKET_NAME`

**Description** : Nom du bucket Google Cloud Storage pour les enregistrements

**Format** : `vocaia-recordings` (ou votre nom personnalisé)

**Où créer** :
1. Google Cloud Console
2. Cloud Storage → Buckets
3. Créer un nouveau bucket
4. Région : même que votre backend (ex: `europe-west1`)

---

### `EXPO_PUBLIC_API_BASE_URL`

**Description** : URL du backend Railway (sans `/api/trpc`)

**Format** :
```
https://votre-backend.up.railway.app
```

**⚠️ Important** :
- **PAS** de slash final
- **PAS** de `/api/trpc` (ajouté automatiquement par tRPC)
- Doit être accessible publiquement

---

## 🔄 WORKFLOW DE CONFIGURATION

### Étape 1 : Supabase
1. Créer un projet
2. Exécuter `backend/database/schema.sql`
3. Copier `DATABASE_URL`
4. Ajouter sur Railway

### Étape 2 : Vapi.ai
1. Créer un compte
2. Copier `VAPI_API_KEY`
3. Copier `VAPI_WEBHOOK_SECRET`
4. Configurer webhook URL : `https://backend.up.railway.app/webhooks/vapi/call-completed`
5. Ajouter sur Railway

### Étape 3 : Google Cloud Storage
1. Créer un projet GCP
2. Créer un bucket
3. Créer un compte de service avec "Storage Object Admin"
4. Télécharger la clé JSON
5. Ajouter `GCS_SERVICE_ACCOUNT_KEY` et `GCS_BUCKET_NAME` sur Railway

### Étape 4 : Railway
1. Ajouter toutes les variables ci-dessus
2. Déployer
3. Copier l'URL générée

### Étape 5 : Frontend
1. Créer `.env.production`
2. Ajouter `EXPO_PUBLIC_API_BASE_URL=https://backend.up.railway.app`
3. Build EAS ou déployer sur Netlify/Vercel

---

## ✅ VALIDATION

### Test Backend

```bash
# Health check
curl https://votre-backend.up.railway.app/
# Réponse : {"status":"ok","message":"API is running"}

# Test tRPC
curl https://votre-backend.up.railway.app/api/trpc/example.hi
```

### Test Frontend

1. Ouvrir l'app mobile ou web
2. Vérifier les logs : `[tRPC] API URL: https://...`
3. Essayer une inscription
4. Si erreur "Failed to fetch" → vérifier `EXPO_PUBLIC_API_BASE_URL`

---

## 🆘 ERREURS COMMUNES

### "DATABASE_URL_NOT_CONFIGURED"

**Solution** : Ajouter `DATABASE_URL` sur Railway

### "Invalid signature" (webhook)

**Solution** : Vérifier `VAPI_WEBHOOK_SECRET` et l'URL webhook sur Vapi

### "GCS upload failed"

**Solution** : 
1. Vérifier `GCS_SERVICE_ACCOUNT_KEY` (JSON valide)
2. Vérifier `GCS_BUCKET_NAME`
3. Vérifier les permissions du compte de service

### "Failed to fetch"

**Solution** :
1. Vérifier que Railway est déployé
2. Tester avec `curl https://backend.up.railway.app/`
3. Vérifier `EXPO_PUBLIC_API_BASE_URL` sur le frontend (sans slash final)

---

## 🔒 SÉCURITÉ

### ❌ NE JAMAIS exposer côté frontend :
- `DATABASE_URL`
- `VAPI_API_KEY`
- `VAPI_WEBHOOK_SECRET`
- `GCS_SERVICE_ACCOUNT_KEY`
- Toute autre clé secrète

### ✅ Uniquement côté frontend :
- `EXPO_PUBLIC_API_BASE_URL` (URL publique du backend)

### 🛡️ Bonnes pratiques :
- Toutes les clés secrètes sur Railway (backend)
- Frontend communique uniquement via tRPC
- Activer HTTPS (automatique sur Railway)
- Vérifier les signatures webhook
