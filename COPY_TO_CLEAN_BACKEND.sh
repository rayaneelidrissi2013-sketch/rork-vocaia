#!/bin/bash

# Script pour copier le backend corrigé vers vocaia-backend-clean
# Usage: ./COPY_TO_CLEAN_BACKEND.sh /chemin/vers/vocaia-backend-clean

if [ -z "$1" ]; then
  echo "❌ Erreur: Veuillez fournir le chemin vers vocaia-backend-clean"
  echo "Usage: ./COPY_TO_CLEAN_BACKEND.sh /chemin/vers/vocaia-backend-clean"
  exit 1
fi

DEST_DIR="$1"

if [ ! -d "$DEST_DIR" ]; then
  echo "❌ Erreur: Le répertoire $DEST_DIR n'existe pas"
  exit 1
fi

echo "📦 Copie des fichiers vers $DEST_DIR..."

# Copie des fichiers racine
echo "✅ Copie de package.json..."
cp BACKEND_PACKAGE_CLEAN.json "$DEST_DIR/package.json"

echo "✅ Copie de tsconfig.json..."
cp BACKEND_TSCONFIG_CLEAN.json "$DEST_DIR/tsconfig.json"

echo "✅ Copie de railway.toml..."
cp BACKEND_RAILWAY_CLEAN.toml "$DEST_DIR/railway.toml"

echo "✅ Copie de .gitignore..."
cp BACKEND_GITIGNORE "$DEST_DIR/.gitignore"

echo "✅ Copie de .env.example..."
cp BACKEND_ENV_EXAMPLE "$DEST_DIR/.env.example"

# Copie du dossier backend entier
echo "✅ Copie du dossier backend/..."
cp -r backend "$DEST_DIR/"

echo ""
echo "✅ ✅ ✅ Copie terminée avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. cd $DEST_DIR"
echo "2. git add ."
echo "3. git commit -m 'Initial backend setup - clean version'"
echo "4. git push origin main"
echo ""
echo "5. Sur Railway:"
echo "   - Connectez votre dépôt vocaia-backend-clean"
echo "   - Start Command: npm start"
echo "   - Build Command: npm run build"
echo ""
