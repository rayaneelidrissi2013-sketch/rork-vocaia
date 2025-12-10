# 📁 Liste complète des fichiers Backend à copier

## Structure du dépôt vocaia-backend-clean

```
vocaia-backend-clean/
├── .gitignore                    ← BACKEND_GITIGNORE
├── .env.example                  ← BACKEND_ENV_EXAMPLE
├── package.json                  ← BACKEND_PACKAGE_CLEAN.json
├── tsconfig.json                 ← BACKEND_TSCONFIG_CLEAN.json
├── railway.toml                  ← BACKEND_RAILWAY_CLEAN.toml
├── README.md                     ← BACKEND_README_CLEAN.md
└── backend/                      ← Copiez TOUT le dossier backend/
    ├── index.ts
    ├── hono.ts
    ├── constants/
    │   └── subscriptionPlans.ts
    ├── database/
    │   ├── migrate.ts
    │   ├── migrate-pricing.ts
    │   └── schema.sql
    ├── mocks/
    │   └── data.ts
    ├── trpc/
    │   ├── app-router.ts
    │   ├── create-context.ts
    │   └── routes/
    │       ├── example/
    │       │   └── hi/
    │       │       └── route.ts
    │       ├── admin/
    │       │   ├── createPricingPlan/
    │       │   │   └── route.ts
    │       │   ├── createUser/
    │       │   │   └── route.ts
    │       │   ├── deletePricingPlan/
    │       │   │   └── route.ts
    │       │   ├── deleteUser/
    │       │   │   └── route.ts
    │       │   ├── getAllowedCountries/
    │       │   │   └── route.ts
    │       │   ├── getAllUsers/
    │       │   │   └── route.ts
    │       │   ├── getCGU/
    │       │   │   └── route.ts
    │       │   ├── getDashboardStats/
    │       │   │   └── route.ts
    │       │   ├── getPricingPlans/
    │       │   │   └── route.ts
    │       │   ├── getUserDetails/
    │       │   │   └── route.ts
    │       │   ├── updateAllowedCountries/
    │       │   │   └── route.ts
    │       │   ├── updateCGU/
    │       │   │   └── route.ts
    │       │   ├── updatePricingPlan/
    │       │   │   └── route.ts
    │       │   ├── updateUser/
    │       │   │   └── route.ts
    │       │   └── updateUserPassword/
    │       │       └── route.ts
    │       ├── agent/
    │       │   ├── canReactivateAgent/
    │       │   │   └── route.ts
    │       │   └── toggleAgent/
    │       │       └── route.ts
    │       ├── auth/
    │       │   ├── register/
    │       │   │   └── index.ts
    │       │   ├── sendVerificationCode/
    │       │   │   └── route.ts
    │       │   └── verifyCode/
    │       │       └── route.ts
    │       ├── billing/
    │       │   ├── createSubscription/
    │       │   │   └── route.ts
    │       │   ├── getPlans/
    │       │   │   └── route.ts
    │       │   ├── getUserSubscription/
    │       │   │   └── route.ts
    │       │   ├── renewPlanEarly/
    │       │   │   └── route.ts
    │       │   └── renewSubscriptions/
    │       │       └── route.ts
    │       ├── calls/
    │       │   ├── getCallDetails/
    │       │   │   └── route.ts
    │       │   └── getUserCalls/
    │       │       └── route.ts
    │       ├── referral/
    │       │   ├── applyReferralCode/
    │       │   │   └── route.ts
    │       │   └── getReferralStats/
    │       │       └── route.ts
    │       └── user/
    │           └── assignVirtualNumber/
    │               └── route.ts
    ├── types/
    │   └── index.ts
    └── utils/
        ├── database.ts
        ├── gcs.ts
        ├── paypal.ts
        └── security.ts
```

## 🔧 Commandes de copie manuelle

Si vous ne voulez pas utiliser le script automatique :

```bash
# Depuis votre projet actuel
cd /chemin/vers/projet-actuel

# Créer le dossier de destination (si pas encore fait)
DEST="/chemin/vers/vocaia-backend-clean"

# Copier les fichiers racine
cp BACKEND_PACKAGE_CLEAN.json "$DEST/package.json"
cp BACKEND_TSCONFIG_CLEAN.json "$DEST/tsconfig.json"
cp BACKEND_RAILWAY_CLEAN.toml "$DEST/railway.toml"
cp BACKEND_GITIGNORE "$DEST/.gitignore"
cp BACKEND_ENV_EXAMPLE "$DEST/.env.example"
cp BACKEND_README_CLEAN.md "$DEST/README.md"

# Copier tout le dossier backend
cp -r backend "$DEST/"

# Vérifier
ls -la "$DEST"
```

## ✅ Vérification

Après copie, vérifiez que vous avez bien :

```bash
cd /chemin/vers/vocaia-backend-clean

# Devrait lister :
ls -la
# .gitignore
# .env.example
# package.json
# tsconfig.json
# railway.toml
# README.md
# backend/

# Vérifier le contenu de backend/
ls -la backend/
# index.ts
# hono.ts
# constants/
# database/
# mocks/
# trpc/
# types/
# utils/
```

## 📦 Nombre total de fichiers

- **Fichiers racine** : 6 fichiers
- **Fichiers backend** : ~40+ fichiers TypeScript
- **Total** : ~46+ fichiers

## 🚀 Après la copie

1. **Testez localement** (optionnel mais recommandé)
   ```bash
   cd /chemin/vers/vocaia-backend-clean
   npm install
   npm run build
   # Devrait compiler sans erreur ✅
   ```

2. **Poussez vers GitHub**
   ```bash
   git add .
   git commit -m "Initial backend setup - clean version"
   git push origin main
   ```

3. **Déployez sur Railway** (voir GUIDE_FINAL_DEPLOY_BACKEND.md)

---

**✅ Cette liste est exhaustive. Tous les fichiers nécessaires sont listés ci-dessus.**
