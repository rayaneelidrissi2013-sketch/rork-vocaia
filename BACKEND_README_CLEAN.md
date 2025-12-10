# VocaIA Backend

Backend Node.js pour VocaIA - Hono + tRPC + PostgreSQL

## 🚀 Déploiement Railway

### Prérequis
- Compte Railway
- Base de données PostgreSQL configurée
- Variables d'environnement configurées

### Configuration Railway

1. **Connectez votre dépôt GitHub**
   ```
   Nouveau projet → Deploy from GitHub → vocaia-backend-clean
   ```

2. **Variables d'environnement** (Settings → Variables)
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/database
   VAPI_API_KEY=your_vapi_api_key
   VAPI_WEBHOOK_SECRET=your_vapi_webhook_secret
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox
   GCS_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   GCS_BUCKET_NAME=your_bucket_name
   PORT=3000
   NODE_ENV=production
   ```

3. **Commandes de déploiement**
   - **Build Command**: `npm run build` (automatique via railway.toml)
   - **Start Command**: `npm start` (défini dans railway.toml)

4. **railway.toml est déjà configuré** ✅
   ```toml
   [build]
   builder = "nixpacks"

   [deploy]
   startCommand = "npm start"
   watchPatterns = ["backend/**"]
   ```

### Développement local

1. **Installation**
   ```bash
   npm install
   ```

2. **Configuration**
   ```bash
   cp .env.example .env
   # Remplissez vos variables d'environnement
   ```

3. **Lancer en dev**
   ```bash
   npm run dev
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **Production**
   ```bash
   npm start
   ```

## 📁 Structure

```
backend/
├── constants/         # Constantes globales
├── database/          # Scripts de migration SQL
├── mocks/             # Données de test
├── trpc/              # Configuration tRPC et routes
│   ├── routes/
│   │   ├── admin/     # Routes administration
│   │   ├── agent/     # Gestion agents Vapi
│   │   ├── auth/      # Authentification
│   │   ├── billing/   # Facturation PayPal
│   │   ├── calls/     # Historique appels
│   │   ├── example/   # Exemple
│   │   ├── referral/  # Parrainage
│   │   └── user/      # Gestion utilisateurs
│   ├── app-router.ts  # Router principal
│   └── create-context.ts
├── types/             # Types TypeScript
├── utils/             # Utilitaires (DB, PayPal, GCS, etc.)
├── hono.ts            # Application Hono (HTTP + webhooks)
└── index.ts           # Point d'entrée

dist/                  # Fichiers compilés (générés par tsc)
```

## 🔧 Technologies

- **Runtime**: Node.js 18+
- **Framework**: Hono (HTTP server)
- **API**: tRPC (type-safe API)
- **Database**: PostgreSQL (pg)
- **Storage**: Google Cloud Storage
- **Payment**: PayPal
- **Voice AI**: Vapi.ai

## 📡 Endpoints

### HTTP
- `GET /` - Health check
- `POST /webhooks/vapi/call-completed` - Webhook Vapi.ai

### tRPC
- `POST /api/trpc` - Toutes les procédures tRPC

### Routes tRPC disponibles
- `example.hi` - Test
- `auth.sendVerificationCode` - Envoi code SMS
- `auth.verifyCode` - Vérification code SMS
- `auth.register` - Inscription utilisateur
- `billing.getPlans` - Liste des plans
- `billing.createSubscription` - Créer abonnement PayPal
- `billing.getUserSubscription` - Abonnement utilisateur
- `billing.renewPlanEarly` - Renouvellement anticipé
- `calls.getUserCalls` - Historique appels
- `calls.getCallDetails` - Détails d'un appel
- `agent.toggleAgent` - Activer/désactiver agent
- `agent.canReactivateAgent` - Vérifier possibilité réactivation
- `admin.*` - Routes administration (tableau de bord, gestion utilisateurs, etc.)

## ✅ Compilation TypeScript

Le projet utilise **ESM** (ES Modules) avec **NodeNext** :
- Tous les imports relatifs incluent `.js`
- `type: "module"` dans package.json
- `moduleResolution: "NodeNext"` dans tsconfig.json

### Vérifier la compilation
```bash
npm run build
# Devrait compiler sans erreur
```

## 🔒 Sécurité

- Signature HMAC pour webhooks Vapi.ai
- Variables d'environnement pour secrets
- SSL pour PostgreSQL en production
- Validation des données avec Zod

## 📝 Logs

Le backend log toutes les opérations importantes :
- `[Backend]` - Serveur HTTP
- `[DB]` - Opérations base de données
- `[Webhook]` - Webhooks Vapi.ai
- `[GCS]` - Google Cloud Storage

## 🐛 Dépannage

### Erreur de compilation TypeScript
```bash
# Vérifiez que tous les imports ont .js
# Exemple: import { db } from './utils/database.js'
```

### Erreur de connexion PostgreSQL
```bash
# Vérifiez DATABASE_URL
# Format: postgresql://user:password@host:port/database
```

### Webhook Vapi.ai non reçu
```bash
# Vérifiez VAPI_WEBHOOK_SECRET
# URL webhook: https://your-backend.railway.app/webhooks/vapi/call-completed
```

## 📞 Support

Pour toute question, contactez l'équipe de développement VocaIA.

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-12-09
