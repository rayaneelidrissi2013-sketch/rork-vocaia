# 🚂 Guide de Déploiement Backend sur Railway

## ⚠️ IMPORTANT : Séparation des Repositories

Pour déployer sur Railway, vous avez **2 OPTIONS** :

### OPTION 1 : Monorepo (Configuration Actuelle)
Garder un seul repo avec backend + frontend

### OPTION 2 : Repos Séparés (Recommandé)
Créer 2 repos distincts :
- `vocaia-backend` (Railway)
- `vocaia-frontend` (EAS/Netlify)

---

## 📂 OPTION 2 : Créer un Backend Séparé

### Étape 1 : Créer le nouveau repo `vocaia-backend`

Sur GitHub, créez un nouveau repository **vide**.

### Étape 2 : Fichiers à copier

Copiez UNIQUEMENT ces dossiers/fichiers :

```
vocaia-backend/
├── backend/              # ✅ Tout le dossier
├── types/                # ✅ Types partagés
├── .gitignore            # ✅ Créer (voir ci-dessous)
├── package.json          # ✅ Créer (voir ci-dessous)
├── tsconfig.json         # ✅ Adapter (voir ci-dessous)
└── README.md             # ✅ Documentation
```

### Étape 3 : Fichier `.gitignore`

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

### Étape 4 : Fichier `package.json` (Backend uniquement)

```json
{
  "name": "vocaia-backend",
  "version": "1.0.0",
  "description": "VocaIA Backend API",
  "type": "module",
  "scripts": {
    "start": "node backend/index.ts",
    "dev": "node --watch backend/index.ts"
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
    "typescript": "~5.9.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Étape 5 : Fichier `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "module": "ESNext",
    "target": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["backend", "types"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🚀 Déploiement sur Railway

### Configuration Railway

1. **Créer un nouveau projet Railway**
2. **Connecter GitHub** → sélectionner `vocaia-backend`
3. **Configuration** :
   - Root Directory: `/`
   - Build Command: (vide)
   - Start Command: `node backend/index.ts`
   - Runtime: Node.js 18+

### Variables d'environnement

```bash
DATABASE_URL=postgresql://...
VAPI_API_KEY=xxx
VAPI_WEBHOOK_SECRET=xxx
GCS_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
GCS_BUCKET_NAME=vocaia-recordings
NODE_ENV=production
PORT=3000
```

### Test de connexion

```bash
# Health check
curl https://votre-backend.up.railway.app/

# Réponse attendue :
{"status":"ok","message":"API is running"}
```

---

## 🔄 Synchronisation entre Repos

### Types partagés

Si vous modifiez les types (`types/index.ts`), vous devez :
1. Mettre à jour dans `vocaia-backend`
2. Mettre à jour dans `vocaia-frontend`

**Alternative** : Publier les types comme package npm privé.

---

## ✅ Validation Finale

- [ ] Backend démarre localement : `node backend/index.ts`
- [ ] Aucune erreur TypeScript
- [ ] Railway déployé avec succès
- [ ] Health check accessible
- [ ] Variables d'environnement configurées
- [ ] Webhook Vapi configuré

---

## 🆘 Erreurs Courantes

### "Cannot find module '@/...'"

**Cause** : Imports relatifs incorrects

**Solution** : Vérifier `tsconfig.json` → `paths` → `@/*`

### "pg: Connection timeout"

**Cause** : `DATABASE_URL` invalide

**Solution** : 
1. Vérifier le format PostgreSQL (pas MySQL)
2. Tester avec `psql DATABASE_URL`

### "Module not found: hono"

**Cause** : Dépendances non installées

**Solution** :
```bash
cd vocaia-backend
npm install
```
