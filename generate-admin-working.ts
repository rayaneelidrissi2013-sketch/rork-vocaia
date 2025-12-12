import bcrypt from 'bcryptjs';

async function generateAndTestHash() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   GÉNÉRATION HASH ADMIN POUR VOCAIA                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const password = 'admin123';
  const saltRounds = 10;
  
  console.log('🔐 Génération du hash bcrypt...\n');
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('✅ Hash généré avec succès!\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n');
  
  console.log('🧪 Test de vérification...\n');
  const isValid = await bcrypt.compare(password, hash);
  const isInvalid = await bcrypt.compare('wrongpassword', hash);
  
  if (isValid && !isInvalid) {
    console.log('✅ Le hash fonctionne parfaitement!\n');
    console.log('   ✓ "admin123" → Accepté');
    console.log('   ✓ "wrongpassword" → Rejeté\n');
  } else {
    console.log('❌ ERREUR: Le hash ne fonctionne pas correctement!\n');
    return;
  }
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   CODE SQL À EXÉCUTER DANS SUPABASE                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const sqlCode = `-- ============================================
-- CONFIGURATION ADMIN VOCAIA
-- Email: tawfikelidrissi@gmail.com
-- Password: admin123
-- ============================================

-- Étape 1: Supprimer l'ancien compte (repartir à zéro)
DELETE FROM users WHERE email = 'tawfikelidrissi@gmail.com';

-- Étape 2: Créer le compte admin avec le hash testé et validé
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
    'Administrateur VocaIA',
    '+212600000000',
    'admin',
    'fr',
    'Europe/Paris',
    NOW(),
    NOW(),
    NOW()
);

-- Étape 3: Vérifier que le compte a été créé
SELECT 
    id,
    email,
    name,
    role,
    phone_number,
    LEFT(password_hash, 40) || '...' as hash_preview,
    registration_date
FROM users 
WHERE email = 'tawfikelidrissi@gmail.com';`;

  console.log(sqlCode);
  console.log('\n');
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   INSTRUCTIONS                                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('1. Copiez TOUT le code SQL ci-dessus');
  console.log('2. Allez sur Supabase → SQL Editor');
  console.log('3. Collez et exécutez le code');
  console.log('4. Connectez-vous avec:');
  console.log('   Email: tawfikelidrissi@gmail.com');
  console.log('   Password: admin123\n');
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   HASH SEUL (au cas où)                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(hash);
  console.log('\n');
}

generateAndTestHash().catch(console.error);
