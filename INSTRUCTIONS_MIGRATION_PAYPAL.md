# Instructions pour corriger l'erreur PayPal

## Problème identifié

L'erreur PayPal se produit car la contrainte de la table `user_subscriptions` n'accepte pas le status `'pending'`. 

**Erreur:** 
```
new row for relation "user_subscriptions" violates check constraint "user_subscriptions_status_check"
```

## Solution

La contrainte de la base de données doit être mise à jour pour accepter le status `'pending'`.

### Option 1: Exécuter la migration via SQL (Recommandé)

1. Connectez-vous à votre base de données PostgreSQL (Supabase, Railway, etc.)

2. Exécutez le SQL suivant :

```sql
-- Supprimer l'ancienne contrainte
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;

-- Ajouter la nouvelle contrainte avec 'pending'
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_status_check 
CHECK (status IN ('active', 'pending', 'expired', 'cancelled', 'suspended'));
```

3. Vérifiez que la migration a réussi :

```sql
-- Vérifier la contrainte
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_subscriptions'::regclass 
AND conname = 'user_subscriptions_status_check';
```

### Option 2: Exécuter via Node.js (si vous avez accès au terminal)

Si vous avez accès à un terminal avec Node.js :

```bash
# Installer les dépendances si nécessaire
npm install pg

# Exécuter le script de migration
npx ts-node backend/database/fix-paypal-status-constraint.ts
```

## Vérification

Après avoir exécuté la migration, testez le paiement PayPal :

1. Connectez-vous à l'application
2. Allez dans "Choisir un pack"
3. Sélectionnez un pack payant (Découverte, Standard, ou Pro)
4. Cliquez sur "S'abonner avec PayPal"
5. Le paiement devrait maintenant fonctionner sans erreur

## Fichiers modifiés

- `backend/database/schema.sql` - Schéma mis à jour
- `backend/database/fix-paypal-pending-status.sql` - Script SQL de migration
- `backend/database/fix-paypal-status-constraint.ts` - Script Node.js de migration

## Support

Si vous rencontrez des problèmes, vérifiez :
- Que vous avez configuré vos identifiants PayPal dans les paramètres admin
- Que votre base de données est accessible
- Que la contrainte a bien été mise à jour
