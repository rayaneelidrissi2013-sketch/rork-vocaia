import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const createTestUsers = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL n\'est pas définie');
    process.exit(1);
  }

  console.log('🔌 Connexion à la base de données...');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔐 Génération des mots de passe hashés...');
    
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const demoPasswordHash = await bcrypt.hash('demo123', 10);

    console.log('👤 Création de l\'administrateur...');
    const adminResult = await pool.query(`
      INSERT INTO users (
        email, 
        password_hash, 
        name, 
        phone_number, 
        role,
        registration_date
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
      RETURNING id, email, name, role
    `, [
      'admin@vocaia.com',
      adminPasswordHash,
      'Administrateur VocaIA',
      '+33600000000',
      'admin'
    ]);
    
    console.log('✅ Admin créé:', adminResult.rows[0]);

    console.log('👤 Création de l\'utilisateur démo...');
    const demoResult = await pool.query(`
      INSERT INTO users (
        email, 
        password_hash, 
        name, 
        phone_number, 
        role,
        registration_date
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
      RETURNING id, email, name, role
    `, [
      'demo@vocaia.com',
      demoPasswordHash,
      'Utilisateur Démo',
      '+33600000001',
      'user'
    ]);
    
    const demoUserId = demoResult.rows[0].id;
    console.log('✅ Utilisateur démo créé:', demoResult.rows[0]);

    console.log('📦 Création de l\'abonnement pour l\'utilisateur démo...');
    
    const planResult = await pool.query(`
      SELECT id, minutes_included FROM subscription_plans WHERE id = 'standard' LIMIT 1
    `);

    if (planResult.rows.length === 0) {
      console.error('❌ Le plan "standard" n\'existe pas. Exécutez d\'abord la migration principale.');
      process.exit(1);
    }

    const plan = planResult.rows[0];
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    await pool.query(`
      INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        minutes_used,
        minutes_remaining,
        start_date,
        renewal_date,
        status,
        payment_method
      )
      VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
      ON CONFLICT (user_id)
      DO UPDATE SET
        plan_id = EXCLUDED.plan_id,
        minutes_remaining = EXCLUDED.minutes_remaining,
        renewal_date = EXCLUDED.renewal_date,
        status = EXCLUDED.status,
        updated_at = NOW()
    `, [
      demoUserId,
      'standard',
      50,
      250,
      renewalDate,
      'active',
      'demo'
    ]);

    console.log('✅ Abonnement créé pour l\'utilisateur démo (Plan Standard)');

    console.log('\n✅ Tous les utilisateurs de test ont été créés avec succès!');
    console.log('\n📋 Identifiants de connexion:');
    console.log('\n👮 ADMIN:');
    console.log('   Email: admin@vocaia.com');
    console.log('   Mot de passe: admin123');
    console.log('\n👤 UTILISATEUR DÉMO:');
    console.log('   Email: demo@vocaia.com');
    console.log('   Mot de passe: demo123');
    console.log('   Abonnement: Pack Standard (250 minutes restantes)');

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔚 Connexion fermée');
  }
};

createTestUsers();
