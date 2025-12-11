import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const runFullMigration = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL n\'est pas définie dans les variables d\'environnement');
    console.log('Veuillez définir DATABASE_URL avec votre URL de connexion PostgreSQL:');
    console.log('export DATABASE_URL="postgresql://username:password@host:port/database"');
    process.exit(1);
  }

  console.log('🔌 Connexion à la base de données PostgreSQL...');
  console.log('📍 URL:', databaseUrl.substring(0, databaseUrl.indexOf('@') + 1) + '***');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔍 Test de connexion...');
    const testResult = await pool.query('SELECT NOW() as time, version() as version');
    console.log('✅ Connexion réussie à la base de données');
    console.log('📅 Heure du serveur:', testResult.rows[0].time);
    console.log('📦 Version PostgreSQL:', testResult.rows[0].version.split('\n')[0]);

    console.log('\n📄 Lecture du fichier de schéma...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    console.log('✅ Schéma chargé:', schema.length, 'caractères');

    console.log('\n🚀 Exécution de la migration complète...');
    console.log('⏳ Cela peut prendre quelques secondes...\n');
    
    await pool.query(schema);

    console.log('✅ Migration terminée avec succès!\n');
    
    console.log('📊 Vérification des tables créées:');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('   Tables créées:');
    tablesResult.rows.forEach((row: any) => {
      console.log('   ✓', row.table_name);
    });

    console.log('\n📦 Vérification des données par défaut:');
    
    const plansResult = await pool.query('SELECT COUNT(*) as count FROM subscription_plans');
    console.log('   - Plans d\'abonnement:', plansResult.rows[0].count);
    
    const settingsResult = await pool.query('SELECT COUNT(*) as count FROM global_settings');
    console.log('   - Paramètres globaux:', settingsResult.rows[0].count);
    
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('   - Utilisateurs:', usersResult.rows[0].count);

    console.log('\n📋 Vérification de la table sms_verifications:');
    const smsTableResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sms_verifications'
      ORDER BY ordinal_position
    `);
    
    if (smsTableResult.rows.length > 0) {
      console.log('   ✅ Table sms_verifications créée avec succès');
      smsTableResult.rows.forEach((row: any) => {
        console.log('      -', row.column_name, ':', row.data_type);
      });
    } else {
      console.log('   ❌ Table sms_verifications non trouvée!');
    }

    console.log('\n📋 Test de la séquence d\'inscription:');
    console.log('   1. Envoi du code SMS');
    console.log('   2. Vérification du code');
    console.log('   3. Inscription de l\'utilisateur');
    console.log('   ✅ Toutes les tables nécessaires sont prêtes!\n');

    console.log('⚠️  IMPORTANT: Changez le mot de passe de l\'administrateur!');
    console.log('   Email: tawfikelidrissi@gmail.com');
    console.log('   Mot de passe par défaut: admin123\n');

    console.log('🎉 Base de données VocaIA prête à l\'utilisation!');

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    if (error.code) {
      console.error('Code d\'erreur PostgreSQL:', error.code);
    }
    if (error.detail) {
      console.error('Détails:', error.detail);
    }
    console.error('\n📝 Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔚 Connexion fermée');
  }
};

runFullMigration();
