import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  console.log('========================================');
  console.log('🚀 Démarrage de la migration SQL');
  console.log('========================================\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERREUR: DATABASE_URL n\'est pas définie');
    console.error('   Veuillez configurer la variable DATABASE_URL dans votre fichier .env\n');
    process.exit(1);
  }

  console.log('✓ DATABASE_URL configurée');
  console.log('✓ Connexion à la base de données...\n');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Connexion établie avec succès\n');

    console.log('📖 Lecture du fichier schema.sql...');
    const schemaPath = path.join(process.cwd(), 'backend', 'database', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Le fichier schema.sql n'existe pas: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    console.log(`✓ Schema chargé (${schema.length} caractères)\n`);

    console.log('⚙️  Exécution de la migration...');
    await pool.query(schema);
    console.log('✓ Migration exécutée avec succès\n');

    console.log('🔍 Vérification des tables créées...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`✓ ${tables.length} tables créées:`);
    tables.forEach(table => console.log(`  • ${table}`));
    console.log('');

    console.log('🔍 Vérification des données...');
    const [plansResult, settingsResult, usersResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM subscription_plans'),
      pool.query('SELECT COUNT(*) as count FROM global_settings'),
      pool.query('SELECT COUNT(*) as count FROM users WHERE role = \'admin\''),
    ]);

    console.log(`✓ Plans d'abonnement: ${plansResult.rows[0].count}`);
    console.log(`✓ Paramètres globaux: ${settingsResult.rows[0].count}`);
    console.log(`✓ Administrateurs: ${usersResult.rows[0].count}`);
    console.log('');

    console.log('========================================');
    console.log('✅ MIGRATION TERMINÉE AVEC SUCCÈS');
    console.log('========================================\n');

  } catch (error: any) {
    console.error('\n========================================');
    console.error('❌ ERREUR LORS DE LA MIGRATION');
    console.error('========================================');
    console.error('Message:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.detail) console.error('Détail:', error.detail);
    console.error('');
    process.exit(1);
  } finally {
    await pool.end();
    console.log('✓ Connexion fermée\n');
  }
}

runMigration();
