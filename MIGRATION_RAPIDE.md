# 🚀 Migration SQL - Instructions Rapides

## ✅ Migration Prête!

J'ai préparé tout ce dont vous avez besoin pour exécuter la migration SQL.

## 📋 Ce qui a été fait:

1. ✅ **Schéma SQL mis à jour** (`backend/database/schema.sql`)
   - Table `sms_verifications` créée
   - Hash du mot de passe admin corrigé
   - Toutes les tables nécessaires sont définies

2. ✅ **Script de migration créé** (`migrate.js`)
   - Connexion à votre base Supabase
   - Exécution automatique du schéma
   - Vérification des tables créées

## 🎯 Comment exécuter la migration:

### Option 1: Avec Node.js
```bash
node migrate.js
```

### Option 2: Avec Bun
```bash
bun run migrate.js
```

## 📊 Ce que la migration va créer:

### Tables principales:
- ✅ `users` - Utilisateurs de l'application
- ✅ `calls` - Historique des appels
- ✅ `schedules` - Planning d'activation IA
- ✅ `virtual_numbers` - Numéros virtuels
- ✅ `subscription_plans` - Plans d'abonnement
- ✅ `user_subscriptions` - Abonnements des utilisateurs
- ✅ `payments` - Paiements
- ✅ `sms_verifications` - Vérifications SMS (nouveau!)
- ✅ `global_settings` - Paramètres globaux
- ✅ `api_keys` - Clés API

### Données par défaut:
- ✅ 5 plans d'abonnement (gratuit, découverte, standard, pro, entreprise)
- ✅ Paramètres globaux (prompt par défaut, langues, etc.)
- ✅ Compte administrateur:
  - Email: `tawfikelidrissi@gmail.com`
  - Mot de passe: `admin123` ⚠️ À changer!

## 🔐 Compte Administrateur

**Email:** `tawfikelidrissi@gmail.com`  
**Mot de passe:** `admin123`

⚠️ **IMPORTANT:** Changez le mot de passe immédiatement après la migration!

## 📝 Séquence d'inscription (avec SMS):

1. **Envoi du code SMS** → `sendVerificationCode`
   - L'utilisateur entre son numéro
   - Code 1234 (démo) est accepté
   - Code stocké dans `sms_verifications`

2. **Vérification du code** → `verifyCode`
   - L'utilisateur entre le code reçu
   - Code vérifié dans `sms_verifications`
   - Marque `verified = true`

3. **Inscription** → `register`
   - Vérifie que le numéro a été validé
   - Crée l'utilisateur dans la table `users`
   - Assigne le numéro virtuel `+16072953560`

## ✅ Après la migration:

1. **Redémarrez votre backend Railway**
2. **Testez l'inscription** avec le code `1234`
3. **Vérifiez dans Supabase** que l'utilisateur est créé

## 🐛 En cas d'erreur:

- Vérifiez que `DATABASE_URL` est bien configuré dans Railway
- Vérifiez que votre base Supabase est accessible
- Regardez les logs du script pour plus de détails

## 🎉 C'est tout!

Une fois la migration exécutée, votre base de données sera prête à recevoir des inscriptions!
