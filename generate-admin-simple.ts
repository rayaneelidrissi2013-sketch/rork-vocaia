import bcrypt from 'bcryptjs';

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('\n================================');
  console.log('ADMIN CONFIGURATION');
  console.log('================================');
  console.log('\nEmail: tawfikelidrissi@gmail.com');
  console.log('Password: admin123');
  console.log('\nGenerated Hash:');
  console.log(hash);
  console.log('\n================================');
  console.log('SQL TO EXECUTE IN SUPABASE:');
  console.log('================================\n');
  
  const sql = `-- Configuration Admin
-- Email: tawfikelidrissi@gmail.com
-- Password: admin123

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
)
VALUES (
  'tawfikelidrissi@gmail.com',
  '${hash}',
  'Admin',
  '+212600000000',
  'admin',
  'fr',
  'Europe/Paris',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '${hash}',
  role = 'admin',
  updated_at = NOW();

-- Vérification
SELECT 
  id,
  email,
  name,
  role,
  LEFT(password_hash, 20) || '...' as password_preview,
  created_at
FROM users 
WHERE email = 'tawfikelidrissi@gmail.com';`;

  console.log(sql);
  console.log('\n================================\n');
  
  process.exit(0);
});
