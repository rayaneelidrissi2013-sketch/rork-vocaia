# 📥 GUIDE DE TÉLÉCHARGEMENT RAPIDE

## ⚡ Option 1 : Téléchargement via Rork (RECOMMANDÉ)

### Pour récupérer les deux codes séparément :

1. **Dans l'interface Rork**, utilisez le bouton de téléchargement de projet
2. **Vous obtiendrez un ZIP** contenant tous les fichiers du projet actuel
3. **Suivez ensuite les étapes ci-dessous** pour séparer backend et frontend

---

## 📦 Structure des Fichiers à Copier

### 🔵 BACKEND (vocaia-backend)

**Fichiers à copier dans le repository backend :**

```
vocaia-backend/
├── backend/                    # COPIER TOUT LE DOSSIER
│   ├── index.ts
│   ├── hono.ts
│   ├── trpc/
│   ├── utils/
│   └── database/
├── types/                      # COPIER TOUT LE DOSSIER
├── package.json                # UTILISER → BACKEND_PACKAGE.json
├── tsconfig.json               # UTILISER → BACKEND_TSCONFIG.json
├── .gitignore
└── README.md                   # Créer manuellement (voir ci-dessous)
```

**❌ NE PAS COPIER :**
- `app/`
- `contexts/`
- `assets/`
- `constants/`
- `mocks/`
- `lib/`
- `utils/` (celui à la racine, seulement backend/utils/)
- Tout fichier Expo/React Native

---

### 🟢 FRONTEND (vocaia-frontend)

**Fichiers à copier dans le repository frontend :**

```
vocaia-frontend/
├── app/                        # COPIER TOUT LE DOSSIER
├── contexts/                   # COPIER TOUT LE DOSSIER
├── lib/                        # COPIER TOUT LE DOSSIER
├── utils/                      # COPIER TOUT LE DOSSIER (racine)
├── constants/                  # COPIER TOUT LE DOSSIER
├── mocks/                      # COPIER TOUT LE DOSSIER
├── types/                      # COPIER TOUT LE DOSSIER
├── assets/                     # COPIER TOUT LE DOSSIER
├── app.json                    # COPIER
├── tsconfig.json               # COPIER
├── metro.config.js             # COPIER
├── eslint.config.js            # COPIER
├── package.json                # UTILISER → FRONTEND_PACKAGE.json
├── .env.local                  # CRÉER (voir ci-dessous)
├── .gitignore
└── README.md                   # Créer manuellement (voir ci-dessous)
```

**❌ NE PAS COPIER :**
- `backend/`
- Aucun fichier serveur

---

## 🔧 Fichiers à Créer Manuellement

### Backend : .gitignore

```gitignore
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
```

### Backend : README.md

```markdown
# VocaIA Backend

API Backend pour VocaIA - Hono + tRPC

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

Créez un fichier \`.env\` :

\`\`\`env
DATABASE_URL=postgresql://...
VAPI_API_KEY=...
VAPI_WEBHOOK_SECRET=...
GCS_SERVICE_ACCOUNT_KEY=...
GCS_BUCKET_NAME=...
NODE_ENV=production
PORT=3000
\`\`\`

## Démarrage

\`\`\`bash
npm start
\`\`\`

## Déploiement Railway

1. Créer nouveau projet Railway
2. Connecter ce repository
3. Configurer les variables d'environnement
4. Déployer

Root Directory: \`/\`
Start Command: \`npm start\`
```

### Frontend : .env.local

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Frontend : .gitignore

```gitignore
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env.local
.DS_Store
```

### Frontend : README.md

```markdown
# VocaIA Frontend

Application mobile VocaIA - React Native + Expo

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

Créez un fichier \`.env.local\` :

\`\`\`env
EXPO_PUBLIC_API_BASE_URL=https://votre-backend.up.railway.app
\`\`\`

## Démarrage

\`\`\`bash
npx expo start --tunnel
\`\`\`

## Build Production

\`\`\`bash
# Mobile
eas build --platform all

# Web
npx expo export --platform web
\`\`\`
```

---

## 📤 Upload vers GitHub

### Backend

```bash
cd vocaia-backend
git init
git add .
git commit -m "Initial backend setup"
git remote add origin https://github.com/rayaneelidrissi2013-sketch/vocaia-backend.git
git branch -M main
git push -u origin main
```

### Frontend

```bash
cd vocaia-frontend
git init
git add .
git commit -m "Initial frontend setup"
git remote add origin https://github.com/rayaneelidrissi2013-sketch/vocaia-frontend.git
git branch -M main
git push -u origin main
```

---

## ✅ Vérification

### Backend
```bash
cd vocaia-backend
npm install
npm start
# Doit afficher: Server running at http://localhost:3000
```

### Frontend
```bash
cd vocaia-frontend
npm install
npx expo start
# Doit se connecter et afficher le QR code
```

---

## 📝 Ordre Recommandé

1. ✅ Télécharger le ZIP depuis Rork
2. ✅ Extraire les fichiers
3. ✅ Créer le dossier `vocaia-backend` et copier les fichiers backend
4. ✅ Créer le dossier `vocaia-frontend` et copier les fichiers frontend
5. ✅ Renommer `BACKEND_PACKAGE.json` → `package.json` dans backend
6. ✅ Renommer `FRONTEND_PACKAGE.json` → `package.json` dans frontend
7. ✅ Créer les fichiers manquants (.gitignore, .env.local, README.md)
8. ✅ Tester localement chaque partie
9. ✅ Push vers GitHub
10. ✅ Déployer backend sur Railway
11. ✅ Configurer frontend avec l'URL Railway
12. ✅ Déployer frontend

---

## 🆘 Besoin d'Aide ?

Si vous avez des questions sur :
- La copie des fichiers
- La configuration
- Le déploiement

Consultez le fichier `SEPARATION_GUIDE.md` pour des instructions détaillées.
