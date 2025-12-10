# Guide de Test - VocaIA

## ✅ Configuration Complétée

### Variables d'environnement configurées :
- ✅ Backend `.env` créé avec toutes les variables
- ✅ Frontend `env.local` configuré avec l'URL du backend

## 🧪 Tests à Effectuer

### 1. Test du Backend

Dans le terminal, exécutez :

```bash
# Installer les dépendances
npm install

# Lancer le backend en mode développement
npm run dev
```

Le backend devrait démarrer sur `http://localhost:3000`

**Vérifications :**
- ✅ Le serveur démarre sans erreurs
- ✅ Message de confirmation dans la console
- ✅ Connexion à la base de données réussie

### 2. Test du Frontend

Dans un nouveau terminal, exécutez :

```bash
# Lancer l'application Expo
npx expo start
```

**Vérifications :**
- ✅ Metro bundler démarre
- ✅ QR code s'affiche
- ✅ Vous pouvez scanner le QR code avec Expo Go

### 3. Test de l'Intégration Backend-Frontend

1. Ouvrez l'application sur votre téléphone via Expo Go
2. Essayez les fonctionnalités principales :
   - ✅ Inscription/Connexion
   - ✅ Chargement des données utilisateur
   - ✅ Gestion des appels
   - ✅ Affichage des statistiques

### 4. Test de la Base de Données

Le backend devrait se connecter automatiquement à votre base Supabase :
- Database: `db.ujkoajawxsdtzglxelsl.supabase.co`
- Les tables devraient être accessibles

### 5. Test Google Cloud Storage

Vérifiez que les enregistrements audio peuvent être :
- ✅ Uploadés vers le bucket `vocaia-recordings-audio`
- ✅ Téléchargés depuis le bucket

## 🐛 Résolution des Problèmes

### Le backend ne démarre pas
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Vérifiez que le fichier `.env` est bien dans le dossier `backend/`

### Erreur de connexion à la base de données
- Vérifiez que l'URL de la base de données est correcte
- Testez la connexion directement dans Supabase

### L'application ne se connecte pas au backend
- Vérifiez que `EXPO_PUBLIC_API_BASE_URL` dans `env.local` pointe vers le bon serveur
- Si vous testez en local, utilisez : `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000`

### Erreur Google Cloud Storage
- Vérifiez que la clé de service account est valide
- Vérifiez que le bucket `vocaia-recordings-audio` existe

## 📝 Commandes Utiles

```bash
# Backend
npm run dev          # Démarre le backend en mode développement
npm run build        # Compile le TypeScript
npm start           # Démarre le backend en production

# Frontend
npx expo start      # Démarre le serveur de développement
npx expo start -c   # Démarre avec cache clear
```

## 🚀 Prochaines Étapes

1. Tester toutes les fonctionnalités principales
2. Vérifier les logs dans la console pour détecter les erreurs
3. Tester sur différents appareils (iOS et Android)
4. Déployer le backend sur Railway si tout fonctionne
