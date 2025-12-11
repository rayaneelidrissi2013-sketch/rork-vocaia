import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const runMigration = async () => {
  const databaseUrl = 'postgresql://postgres:Ultratel231U@db.urhxfjbinunhyxmqdzxi.supabase.co:5432/postgres';

  console.log('🔌 Connexion à la base de données PostgreSQL...');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔍 Test de connexion...');
    const testResult = await pool.query('SELECT NOW() as time, version() as version');
    console.log('✅ Connexion réussie à la base de données');
    console.log('📅 Heure du serveur:', testResult.rows[0].time);

    console.log('\n📄 Lecture du fichier de schéma...');
    const schemaPath = path.join(__dirname, 'backend', 'database', 'schema.sql');
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

    console.log('\n🎉 Base de données VocaIA prête à l\'utilisation!');

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

runMigration();
