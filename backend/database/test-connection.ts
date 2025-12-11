import { Pool } from 'pg';

const testConnection = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL n\'est pas définie');
    process.exit(1);
  }

  console.log('🔌 Test de connexion à PostgreSQL...');
  const maskedUrl = databaseUrl.substring(0, databaseUrl.indexOf('@') + 1) + '***';
  console.log('📍 URL:', maskedUrl);
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    console.log('✅ Connexion réussie!');
    console.log('📅 Heure:', result.rows[0].time);
    console.log('📦 Version:', result.rows[0].version.split('\n')[0]);

    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables dans la base de données:');
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  Aucune table trouvée - migration nécessaire!');
    } else {
      tablesResult.rows.forEach((row: any) => {
        console.log('   ✓', row.table_name);
      });
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔚 Connexion fermée');
  }
};

testConnection();
