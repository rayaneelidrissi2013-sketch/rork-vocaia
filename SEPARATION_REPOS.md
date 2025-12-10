# 🔀 Guide de Séparation des Repositories

## 📌 Contexte

Votre projet actuel est un **monorepo** contenant backend et frontend. Ce guide vous explique comment le séparer en **2 repositories distincts** pour Railway et EAS.

---

## ✅ AVANTAGES DE LA SÉPARATION

### Repos Séparés
- ✅ Déploiements indépendants
- ✅ Historique Git plus clair
- ✅ Permissions d'équipe distinctes
- ✅ CI/CD plus simple

### Monorepo (Actuel)
- ✅ Types partagés plus faciles
- ✅ Un seul repo à maintenir
- ✅ Refactoring plus simple

---

## 🚀 OPTION 1 : Garder le Monorepo (Plus Simple)

Vous pouvez déployer depuis le **même repo** :

### Railway (Backend)
- Root Directory: `/`
- Start Command: `node backend/index.ts`
- Variables: Voir `ENVIRONMENT_VARIABLES.md`

### Netlify (Frontend Web)
- Build Command: `expo export --platform web`
- Publish Directory: `dist`
- Variables: `EXPO_PUBLIC_API_BASE_URL`

### EAS (Frontend Mobile)
- `eas build` depuis la racine
- Variables dans `eas.json`

**✅ Recommandé si** : vous êtes seul ou petite équipe

---

## 🔀 OPTION 2 : Séparer en 2 Repos

### Étape 1 : Créer les nouveaux repos sur GitHub

```bash
# Sur GitHub, créer 2 repos vides :
# - vocaia-backend
# - vocaia-frontend
```

---

### Étape 2 : Extraire le Backend

```bash
# Cloner votre repo actuel
git clone https://github.com/vous/vocaia.git vocaia-backend
cd vocaia-backend

# Supprimer les fichiers frontend
rm -rf app/ assets/ contexts/ lib/ constants/ mocks/
rm -rf app.json eas.json

# Garder uniquement :
# - backend/
# - types/
# - .gitignore (backend)
# - tsconfig.json (backend)

# Créer package.json backend
cat > package.json << 'EOF'
{
  "name": "vocaia-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node backend/index.ts"
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
  }
}
EOF

# Installer et tester
npm install
node backend/index.ts

# Push vers le nouveau repo
git remote set-url origin https://github.com/vous/vocaia-backend.git
git push -u origin main
```

---

### Étape 3 : Extraire le Frontend

```bash
# Cloner votre repo actuel
git clone https://github.com/vous/vocaia.git vocaia-frontend
cd vocaia-frontend

# Supprimer le backend
rm -rf backend/

# Garder uniquement :
# - app/
# - assets/
# - contexts/
# - lib/
# - constants/
# - mocks/
# - types/
# - app.json
# - eas.json
# - package.json (nettoyer les dépendances backend)

# Nettoyer package.json (supprimer les dépendances backend)
# Garder uniquement : expo, react, react-native, @trpc/client, etc.

# Créer .env.production
cat > .env.production << 'EOF'
EXPO_PUBLIC_API_BASE_URL=https://vocaia-backend.up.railway.app
EOF

# Installer et tester
npm install
npx expo start

# Push vers le nouveau repo
git remote set-url origin https://github.com/vous/vocaia-frontend.git
git push -u origin main
```

---

### Étape 4 : Synchroniser les Types

Les `types/` sont dupliqués dans les 2 repos. Pour les garder synchronisés :

#### Option A : Duplication (Simple)
- Copier manuellement `types/index.ts` quand vous le modifiez
- ⚠️ Risque de désynchronisation

#### Option B : Package npm privé (Avancé)
```bash
# Créer un repo vocaia-types
# Publier sur npm privé
# Installer dans backend et frontend
```

#### Option C : Git Submodule (Moyen)
```bash
# Créer un repo vocaia-types
git submodule add https://github.com/vous/vocaia-types.git types
```

**✅ Recommandé** : Option A (duplication) pour commencer

---

## 🔧 CONFIGURATION POST-SÉPARATION

### Railway (Backend)
1. Connecter `vocaia-backend`
2. Root Directory: `/`
3. Start Command: `node backend/index.ts`
4. Ajouter toutes les variables d'environnement

### Netlify (Frontend Web)
1. Connecter `vocaia-frontend`
2. Build Command: `expo export --platform web`
3. Publish Directory: `dist`
4. Variables: `EXPO_PUBLIC_API_BASE_URL`

### EAS (Frontend Mobile)
```bash
cd vocaia-frontend
eas build --platform all
```

---

## ✅ VALIDATION

### Backend
```bash
curl https://vocaia-backend.up.railway.app/
# {"status":"ok","message":"API is running"}
```

### Frontend
1. Build local : `npx expo start`
2. Vérifier console : `[tRPC] API URL: https://vocaia-backend.up.railway.app`
3. Tester inscription

---

## 📊 COMPARAISON

| Critère | Monorepo | Repos Séparés |
|---------|----------|---------------|
| Setup | ⭐⭐⭐ Simple | ⭐⭐ Moyen |
| Déploiement | ⭐⭐ Railway + EAS | ⭐⭐⭐ Indépendant |
| Types partagés | ⭐⭐⭐ Direct | ⭐ Duplication |
| CI/CD | ⭐⭐ Complexe | ⭐⭐⭐ Simple |
| Permissions | ⭐ Tout-en-un | ⭐⭐⭐ Granulaires |

---

## 💡 RECOMMANDATION

### Garder le Monorepo si :
- Équipe < 5 personnes
- Développement solo
- Refactoring fréquent des types

### Séparer si :
- Équipe > 5 personnes
- Besoins de permissions distinctes
- Déploiements backend/frontend indépendants critiques

---

## 🆘 PROBLÈMES COURANTS

### Types désynchronisés
**Solution** : Copier `types/index.ts` manuellement après modification

### Imports cassés après séparation
**Solution** : Vérifier `tsconfig.json` → `paths` → `@/*`

### Frontend ne trouve pas le backend
**Solution** : Vérifier `EXPO_PUBLIC_API_BASE_URL` dans `.env`

---

## ✅ CHECKLIST FINALE

### Backend Séparé
- [ ] Repo `vocaia-backend` créé
- [ ] Backend déployé sur Railway
- [ ] Health check OK
- [ ] Variables d'environnement configurées

### Frontend Séparé
- [ ] Repo `vocaia-frontend` créé
- [ ] `EXPO_PUBLIC_API_BASE_URL` configurée
- [ ] Build EAS configuré
- [ ] Web déployé sur Netlify/Vercel

### Synchronisation
- [ ] Types copiés dans les 2 repos
- [ ] Documentation à jour
- [ ] Équipe informée du changement

---

Votre architecture est maintenant **indépendante** et **scalable** ! 🚀
