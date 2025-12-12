import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n===========================================');
  console.log('HASH BCRYPT POUR LE MOT DE PASSE: admin123');
  console.log('===========================================\n');
  console.log('Hash généré:');
  console.log(hash);
  console.log('\n');
  
  // Vérifier que le hash fonctionne
  const isValid = await bcrypt.compare('admin123', hash);
  console.log('Vérification:', isValid ? '✅ Hash valide' : '❌ Hash invalide');
  console.log('\n');
  
  console.log('SQL à exécuter dans Supabase:');
  console.log('===========================================\n');
  console.log(`-- Supprimer l'ancien compte
DELETE FROM users WHERE email = 'tawfikelidrissi@gmail.com';

-- Créer le compte admin avec le hash correct
INSERT INTO users (
    email,
    password_hash,
    name,
    phone_number,
    role,
    language,
    timezone,
    registration_date,
    created_at,
    updated_at
) VALUES (
    'tawfikelidrissi@gmail.com',
    '${hash}',
    'Administrateur',
    '+212600000000',
    'admin',
    'fr',
    'Europe/Paris',
    NOW(),
    NOW(),
    NOW()
);

-- Vérification
SELECT 
    id,
    email,
    name,
    role,
    LEFT(password_hash, 30) || '...' as hash_preview
FROM users 
WHERE email = 'tawfikelidrissi@gmail.com';`);
  console.log('\n===========================================\n');
}

generateHash();
