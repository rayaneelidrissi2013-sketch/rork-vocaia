import bcrypt from 'bcryptjs';

const generateHash = async () => {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash pour le mot de passe "admin123":');
  console.log(hash);
};

generateHash();
