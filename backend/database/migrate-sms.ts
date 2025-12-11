import { Pool } from 'pg';

const runMigration = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL n\'est pas définie dans les variables d\'environnement');
    console.log('Veuillez définir DATABASE_URL avec votre URL de connexion PostgreSQL:');
    console.log('export DATABASE_URL="postgresql://username:password@host:port/database"');
    process.exit(1);
  }

  console.log('🔌 Connexion à la base de données PostgreSQL...');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion réussie à la base de données');

    console.log('🚀 Création de la table sms_verifications...');
    
    await pool.query(`
      -- Table de vérification SMS (temporaire)
      CREATE TABLE IF NOT EXISTS sms_verifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone_number VARCHAR(50) NOT NULL,
        code VARCHAR(10) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_sms_verifications_phone ON sms_verifications(phone_number);
      CREATE INDEX IF NOT EXISTS idx_sms_verifications_expires ON sms_verifications(expires_at);
    `);

    console.log('✅ Migration terminée avec succès!');
    console.log('\n📊 Table sms_verifications créée avec:');
    console.log('   - id (UUID)');
    console.log('   - phone_number (VARCHAR)');
    console.log('   - code (VARCHAR)');
    console.log('   - verified (BOOLEAN)');
    console.log('   - expires_at (TIMESTAMP)');
    console.log('   - created_at (TIMESTAMP)');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔚 Connexion fermée');
  }
};

runMigration();
