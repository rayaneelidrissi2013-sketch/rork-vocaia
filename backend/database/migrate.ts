import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

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

    console.log('📄 Lecture du fichier de schéma...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('🚀 Exécution de la migration...');
    await pool.query(schema);

    console.log('✅ Migration terminée avec succès!');
    console.log('\n📊 Base de données VocaIA initialisée avec:');
    console.log('   - Table users');
    console.log('   - Table calls');
    console.log('   - Table schedules');
    console.log('   - Table api_keys');
    console.log('   - Table virtual_numbers');
    console.log('   - Table global_settings');
    console.log('   - Table subscription_plans');
    console.log('   - Table payments');
    console.log('   - Table user_subscriptions');
    console.log('\n📦 Données par défaut insérées:');
    console.log('   - 4 plans d\'abonnement (Découverte, Starter, Pro, Premium)');
    console.log('   - Paramètres globaux par défaut');
    console.log('   - Compte administrateur: tawfikelidrissi@gmail.com');
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe de l\'administrateur!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔚 Connexion fermée');
  }
};

runMigration();
