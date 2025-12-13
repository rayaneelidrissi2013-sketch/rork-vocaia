-- Ajouter la colonne country_code si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'country_code'
  ) THEN
    ALTER TABLE users ADD COLUMN country_code VARCHAR(10);
    RAISE NOTICE 'Colonne country_code ajoutée avec succès';
  ELSE
    RAISE NOTICE 'La colonne country_code existe déjà';
  END IF;
END $$;

-- Mise à jour des utilisateurs existants sans country_code
UPDATE users 
SET country_code = 
  CASE 
    WHEN phone_number LIKE '+33%' THEN '+33'
    WHEN phone_number LIKE '+1%' THEN '+1'
    WHEN phone_number LIKE '+212%' THEN '+212'
    WHEN phone_number LIKE '+32%' THEN '+32'
    WHEN phone_number LIKE '+41%' THEN '+41'
    WHEN phone_number LIKE '+44%' THEN '+44'
    ELSE '+33'
  END
WHERE country_code IS NULL OR country_code = '';

RAISE NOTICE 'Mise à jour des country_code terminée';
