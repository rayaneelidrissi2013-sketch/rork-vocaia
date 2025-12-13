-- Migration pour ajouter le status 'pending' à la table user_subscriptions

-- Supprimer l'ancienne contrainte
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;

-- Ajouter la nouvelle contrainte avec 'pending'
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_status_check 
CHECK (status IN ('active', 'pending', 'expired', 'cancelled', 'suspended'));

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Contrainte user_subscriptions_status_check mise à jour avec succès';
END $$;
