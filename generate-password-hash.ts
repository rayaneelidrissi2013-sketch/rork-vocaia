import bcrypt from 'bcryptjs';

const password = 'admin123';

async function generateHash() {
  console.log('Generating bcrypt hash for password:', password);
  const hash = await bcrypt.hash(password, 10);
  console.log('\nGenerated hash:');
  console.log(hash);
  console.log('\n=== SQL UPDATE COMMAND ===');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'tawfikelidrissi@gmail.com';`);
  console.log('\n=== VERIFICATION ===');
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash verification:', isValid ? '✓ Valid' : '✗ Invalid');
}

generateHash().catch(console.error);
