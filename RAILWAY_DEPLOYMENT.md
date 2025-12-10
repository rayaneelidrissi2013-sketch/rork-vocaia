# Déploiement Backend sur Railway

## 📋 Prérequis

- Compte Railway
- Base de données PostgreSQL (Supabase recommandé)
- Code source sur GitHub

## 🚀 Étapes de déploiement

### 1. Créer un nouveau projet sur Railway

1. Connectez-vous à [Railway](https://railway.app)
2. Cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Choisissez votre repository `rork-vocaia`

### 2. Configurer les variables d'environnement

Dans l'onglet "Variables" de votre service Railway, ajoutez :

#### ✅ Variables OBLIGATOIRES

```
DATABASE_URL=postgresql://postgres:Ultratel231U@db.urhxfjbinunhyxmqdzxi.supabase.co:5432/postgres
NODE_ENV=production
PORT=${{ PORT }}
```

> **Note:** `${{ PORT }}` est une variable Railway qui sera automatiquement remplacée par le port assigné

#### 🔧 Variables OPTIONNELLES

Pour les webhooks Vapi :
```
VAPI_WEBHOOK_SECRET=your_secret_here
```

Pour Google Cloud Storage :
```
GCS_PROJECT_ID=your_project_id
GCS_BUCKET_NAME=your_bucket_name
GCS_KEY_FILE_PATH=/path/to/key.json
```

Pour PayPal :
```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_MODE=sandbox
```

### 3. Initialiser la base de données

Avant de démarrer l'application, assurez-vous que votre base de données Supabase contient les tables nécessaires :

```bash
# Connectez-vous à votre projet Rork
cd /path/to/rork-vocaia

# Exécutez les migrations
bun run backend/database/migrate.ts
```

### 4. Créer les utilisateurs de test

```bash
bun run backend/database/create-test-users.ts
```

Cela créera :
- **Admin:** admin@vocaia.com / admin123
- **Utilisateur:** demo@vocaia.com / demo123

### 5. Déployer

Railway déploiera automatiquement à chaque push sur la branche principale.

Le serveur démarre avec la commande définie dans `railway.json` :
```bash
bun run server.ts
```

## 🔍 Vérification du déploiement

Une fois déployé, testez les endpoints :

### Health check
```bash
curl https://vocaia-backend-clean-production.up.railway.app/
```

Réponse attendue :
```json
{"status":"ok","message":"API is running"}
```

### Test de connexion
```bash
curl -X POST https://vocaia-backend-clean-production.up.railway.app/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@vocaia.com","password":"demo123"}'
```

## ❌ Résolution des problèmes

### "Application failed to respond"

1. Vérifiez les logs Railway
2. Assurez-vous que `DATABASE_URL` est correctement configurée
3. Vérifiez que le port est bien `${{ PORT }}`
4. Relancez le déploiement

### Erreurs de connexion à la base de données

1. Testez la connexion depuis votre machine locale :
```bash
psql "postgresql://postgres:Ultratel231U@db.urhxfjbinunhyxmqdzxi.supabase.co:5432/postgres"
```

2. Vérifiez que les tables existent :
```sql
\dt
```

3. Vérifiez que les utilisateurs existent :
```sql
SELECT * FROM users;
```

### Erreurs 404 sur /api/trpc

Vérifiez que :
- Le serveur est bien démarré
- L'URL du backend est correcte dans `env` : `EXPO_PUBLIC_RORK_API_BASE_URL`
- Le endpoint tRPC est bien `/api/trpc/*`

## 📝 Architecture

```
server.ts                          → Point d'entrée (démarre le serveur HTTP)
├── backend/hono.ts               → Configuration Hono + routes
│   ├── /                         → Health check
│   ├── /api/trpc/*               → Endpoints tRPC
│   └── /webhooks/vapi/*          → Webhooks Vapi
├── backend/trpc/app-router.ts    → Router tRPC principal
└── backend/utils/database.ts     → Connexion PostgreSQL
```

## 🌐 URLs importantes

- **Backend Railway:** https://vocaia-backend-clean-production.up.railway.app
- **Base de données Supabase:** db.urhxfjbinunhyxmqdzxi.supabase.co
- **Dashboard Supabase:** https://supabase.com/dashboard

## 🔐 Sécurité

⚠️ **IMPORTANT:** Ne committez JAMAIS les variables d'environnement sensibles dans le code !

- Utilisez Railway Variables pour les secrets
- Ne partagez pas les logs contenant des mots de passe
- Utilisez des mots de passe forts en production
