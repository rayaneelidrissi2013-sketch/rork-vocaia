#!/usr/bin/env bun

/**
 * Guide interactif pour tester et déployer le backend
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 GUIDE DE DÉPLOIEMENT BACKEND VOCAIA                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

📋 CHECKLIST AVANT DÉPLOIEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Fichiers modifiés/créés :
   • server.ts             → Serveur HTTP configuré
   • railway.json          → Configuration Railway
   • .env.example          → Template des variables
   • RAILWAY_DEPLOYMENT.md → Guide complet
   • README_FIXES.md       → Ce qui a été corrigé

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 ÉTAPE 1 : TEST LOCAL (optionnel)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour tester le serveur en local avant de déployer :

1. Configurez la variable DATABASE_URL :
   export DATABASE_URL="postgresql://postgres:Ultratel231U@db.urhxfjbinunhyxmqdzxi.supabase.co:5432/postgres"

2. Démarrez le serveur :
   bun run server.ts

3. Dans un autre terminal, testez :
   bun run test-backend-local.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 ÉTAPE 2 : POUSSER SUR GITHUB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Exécutez ces commandes :

   git add .
   git commit -m "fix: Configure HTTP server for Railway deployment"
   git push origin main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️  ÉTAPE 3 : CONFIGURER RAILWAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Allez sur : https://railway.app
2. Ouvrez votre projet : vocaia-backend-clean-production
3. Cliquez sur l'onglet "Variables"
4. Ajoutez ces 3 variables :

   DATABASE_URL = postgresql://postgres:Ultratel231U@db.urhxfjbinunhyxmqdzxi.supabase.co:5432/postgres
   NODE_ENV     = production
   PORT         = \${{ PORT }}

   ⚠️  ATTENTION : Pour PORT, écrivez exactement \${{ PORT }}
                   (avec les doubles accolades)

5. Sauvegardez

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 ÉTAPE 4 : REDÉPLOYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Railway devrait redémarrer automatiquement.
Sinon, cliquez sur les 3 points (...) → "Redeploy"

Attendez quelques minutes...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ÉTAPE 5 : VÉRIFIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ouvrez dans votre navigateur :

   https://vocaia-backend-clean-production.up.railway.app/

Vous devriez voir :

   {"status":"ok","message":"API is running"}

Si vous voyez ce message → 🎉 LE BACKEND FONCTIONNE !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 ÉTAPE 6 : CRÉER LES UTILISATEURS DE TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sur votre machine locale :

   bun run backend/database/create-test-users.ts

Cela créera dans Supabase :
   • Admin : admin@vocaia.com / admin123
   • User  : demo@vocaia.com / demo123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 ÉTAPE 7 : TESTER L'APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Ouvrez votre app (preview ou mobile via QR)
2. Connectez-vous avec :
   Email    : demo@vocaia.com
   Password : demo123

Si la connexion marche → 🎉 TOUT EST OPÉRATIONNEL !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• README_FIXES.md          → Résumé en français
• RAILWAY_DEPLOYMENT.md    → Guide complet
• FIXES_RAILWAY.md         → Détails techniques
• .env.example             → Variables d'environnement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ PROBLÈMES ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Vérifiez les logs Railway (onglet "Deployments")
2. Vérifiez les variables d'environnement
3. Testez la base de données :
   psql "postgresql://postgres:Ultratel231U@db.urhxfjbinunhyxmqdzxi.supabase.co:5432/postgres"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bonne chance ! 🚀

`);
