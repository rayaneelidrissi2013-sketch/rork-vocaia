# Guide de Migration de la Base de Données VocaIA

## 🎯 Objectif
Ce guide vous permet d'exécuter la migration complète de la base de données PostgreSQL pour VocaIA.

## ⚠️ Prérequis
- DATABASE_URL configurée dans Railway
- Connexion Internet stable
- Bun ou Node.js installé

## 📋 Étapes de Migration

### 1. Test de la Connexion à la Base de Données

Avant d'exécuter la migration, testez votre connexion :

```bash
bun run backend/database/test-connection.ts
```

**Résultat attendu :**
```
✅ Connexion réussie!
📅 Heure: [timestamp]
📦 Version: PostgreSQL [version]
```

### 2. Exécution de la Migration Complète

Une fois la connexion testée avec succès, exécutez la migration :

```bash
bun run backend/database/run-full-migration.ts
```

**Ce script va :**
- ✅ Créer l'extension UUID
- ✅ Créer toutes les tables nécessaires :
  - `users` - Utilisateurs de l'application
  - `calls` - Historique des appels
  - `schedules` - Plannings d'activation AI
  - `api_keys` - Clés API administrateur
  - `virtual_numbers` - Numéros virtuels
  - `global_settings` - Paramètres globaux
  - `subscription_plans` - Plans d'abonnement
  - `payments` - Paiements
  - `user_subscriptions` - Abonnements utilisateurs
  - `sms_verifications` - Vérification SMS ⚠️ **IMPORTANT**
- ✅ Créer tous les index nécessaires
- ✅ Créer les triggers pour `updated_at`
- ✅ Insérer les données par défaut :
  - 5 plans d'abonnement (Gratuit, Découverte, Standard, Pro, Entreprise)
  - Paramètres globaux
  - Compte administrateur par défaut
- ✅ Vérifier que tout est correctement créé

**Résultat attendu :**
```
✅ Migration terminée avec succès!

📊 Vérification des tables créées:
   Tables créées:
   ✓ api_keys
   ✓ calls
   ✓ global_settings
   ✓ payments
   ✓ schedules
   ✓ sms_verifications
   ✓ subscription_plans
   ✓ user_subscriptions
   ✓ users
   ✓ virtual_numbers

📦 Vérification des données par défaut:
   - Plans d'abonnement: 5
   - Paramètres globaux: 7
   - Utilisateurs: 1

📋 Vérification de la table sms_verifications:
   ✅ Table sms_verifications créée avec succès
      - id : uuid
      - phone_number : character varying
      - code : character varying
      - verified : boolean
      - expires_at : timestamp without time zone
      - created_at : timestamp without time zone

🎉 Base de données VocaIA prête à l'utilisation!
```

## 🔍 Vérification Post-Migration

### Vérifier la Table sms_verifications

Cette table est **cruciale** pour le processus d'inscription. Elle doit contenir :
- `id` - UUID unique
- `phone_number` - Numéro de téléphone à vérifier
- `code` - Code de vérification SMS (actuellement "1234" en mode demo)
- `verified` - État de vérification (false par défaut)
- `expires_at` - Date d'expiration du code (10 minutes)
- `created_at` - Date de création

### Vérifier les Plans d'Abonnement

Connectez-vous à votre base de données et vérifiez :

```sql
SELECT id, name, minutes_included, price FROM subscription_plans;
```

**Résultat attendu :**
| id | name | minutes_included | price |
|----|------|------------------|-------|
| gratuit | Pack Gratuit | 5 | 0.00 |
| decouverte | Pack Découverte | 100 | 35.00 |
| standard | Pack Standard | 300 | 90.00 |
| pro | Pack Pro | 1200 | 300.00 |
| entreprise | Pack Entreprise | 99999 | 0.00 |

## 🔐 Sécurité Post-Migration

### ⚠️ IMPORTANT : Changer le Mot de Passe Administrateur

Le compte administrateur par défaut est créé avec :
- **Email:** `tawfikelidrissi@gmail.com`
- **Mot de passe:** `admin123`

**VOUS DEVEZ CHANGER CE MOT DE PASSE IMMÉDIATEMENT EN PRODUCTION !**

Pour changer le mot de passe, utilisez la route admin appropriée ou exécutez :

```sql
UPDATE users 
SET password_hash = '[votre_nouveau_hash_bcrypt]' 
WHERE email = 'tawfikelidrissi@gmail.com';
```

## 🔄 Processus d'Inscription Utilisateur

Après la migration, le processus d'inscription fonctionne comme suit :

### 1. Envoi du Code SMS
```typescript
await trpc.auth.sendVerificationCode.mutate({
  phoneNumber: '+1234567890',
  countryCode: '+1'
});
```

**Ce qui se passe :**
- Vérifie que le numéro n'existe pas déjà
- Génère le code "1234" (mode demo)
- Stocke dans `sms_verifications` avec expiration 10 minutes
- ⚠️ **TODO:** Intégrer Twilio pour envoyer des SMS réels

### 2. Vérification du Code
```typescript
const result = await trpc.auth.verifyCode.mutate({
  phoneNumber: '+1234567890',
  code: '1234'
});
```

**Ce qui se passe :**
- Vérifie que le code existe et n'a pas expiré
- Vérifie que le code n'a pas déjà été utilisé
- Marque le code comme `verified = true`
- Retourne `{ verified: true }`

### 3. Inscription Finale
```typescript
await trpc.auth.register.mutate({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe',
  phoneNumber: '+1234567890',
  language: 'fr',
  timezone: 'Europe/Paris'
});
```

**Ce qui se passe :**
- Vérifie que le numéro a été vérifié dans `sms_verifications`
- Crée l'utilisateur avec le plan "gratuit" (5 minutes)
- Assigne le numéro virtuel `+16072953560`
- Génère un code de parrainage unique

## 🚨 Résolution des Problèmes

### Erreur : "DATABASE_URL not configured"
- Vérifiez que DATABASE_URL est définie dans Railway
- Format : `postgresql://user:password@host:port/database`

### Erreur : "relation already exists"
- Les tables existent déjà
- Pas de problème, le script utilise `CREATE TABLE IF NOT EXISTS`
- La migration peut être exécutée plusieurs fois en toute sécurité

### Erreur : "Vous devez vérifier votre numéro de téléphone avant de vous inscrire"
- L'utilisateur n'a pas vérifié son numéro
- Il doit d'abord appeler `sendVerificationCode`, puis `verifyCode`

### Erreur : "Un utilisateur avec ce numéro de téléphone existe déjà"
- Le numéro est déjà enregistré
- Utilisez la fonctionnalité de connexion au lieu de l'inscription

### Erreur : "Code incorrect"
- En mode demo, le code est toujours "1234"
- Vérifiez que vous utilisez le bon code

### Erreur : "Le code a expiré"
- Le code de vérification a une validité de 10 minutes
- Demandez un nouveau code via `sendVerificationCode`

## 📝 Notes Importantes

1. **Numéro Virtuel :** Pour l'instant, tous les utilisateurs reçoivent le même numéro virtuel américain `+16072953560`. À l'avenir, le système devra assigner des numéros basés sur le pays de l'utilisateur.

2. **Vérification SMS :** Actuellement en mode demo avec le code "1234". Pour la production, intégrez un service SMS comme Twilio.

3. **Sécurité :** Les mots de passe sont hashés avec bcrypt (10 rounds).

4. **Plans d'Abonnement :** Le plan "gratuit" offre 5 minutes gratuites à chaque nouvel utilisateur.

## ✅ Checklist de Validation

- [ ] `bun run backend/database/test-connection.ts` réussit
- [ ] `bun run backend/database/run-full-migration.ts` réussit
- [ ] 10 tables créées (incluant `sms_verifications`)
- [ ] 5 plans d'abonnement insérés
- [ ] 7 paramètres globaux insérés
- [ ] 1 compte administrateur créé
- [ ] Mot de passe administrateur changé en production
- [ ] Test d'inscription complet : sendVerificationCode → verifyCode → register
- [ ] Vérification dans Supabase : utilisateur créé dans la table `users`
- [ ] Backend Railway redémarré pour charger les nouvelles routes

## 🎉 Prochaines Étapes

Une fois la migration terminée avec succès :

1. ✅ Testez l'inscription complète
2. ✅ Testez la connexion
3. ✅ Vérifiez que les données apparaissent dans Supabase
4. 🔜 Intégrez Twilio pour les SMS réels
5. 🔜 Implémentez l'attribution de numéros virtuels par pays
6. 🔜 Configurez les webhooks Vapi.ai

---

**Support :** Si vous rencontrez des problèmes, vérifiez d'abord les logs Railway et les messages d'erreur détaillés dans la console.
