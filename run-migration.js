/* eslint-disable no-undef */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL n\'est pas définie');
    process.exit(1);
  }

  console.log('🔌 Connexion à la base de données...');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion réussie');

    console.log('📄 Lecture du schéma...');
    const schemaPath = path.join(__dirname, 'backend', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('🚀 Exécution de la migration...');
    await pool.query(schema);

    console.log('✅ Migration terminée avec succès!');
    
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables créées:');
    tablesResult.rows.forEach(row => {
      console.log('   ✓', row.table_name);
    });

    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('\n👥 Utilisateurs:', usersResult.rows[0].count);
    
    const plansResult = await pool.query('SELECT COUNT(*) as count FROM subscription_plans');
    console.log('📦 Plans d\'abonnement:', plansResult.rows[0].count);

    console.log('\n🎉 Base de données prête!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔚 Connexion fermée');
  }
};

runMigration();
