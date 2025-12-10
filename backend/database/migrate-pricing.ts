import { Pool } from 'pg';

const runMigration = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('[Migration] DATABASE_URL not configured');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('[Migration] Starting pricing plans migration...');

    await pool.query(`
      INSERT INTO subscription_plans (id, name, minutes_included, price, features, is_recommended, overage_policy)
      VALUES
        ('gratuit', 'Pack Gratuit', 5, 0.00, 
         '["Assistant vocal IA 24H/7J", "Retranscription de tous vos appels"]'::jsonb, 
         FALSE, 'upgrade'),
        ('decouverte', 'Pack Découverte', 100, 35.00, 
         '["Assistant vocal IA 24H/7J", "Retranscription de tous vos appels"]'::jsonb, 
         FALSE, 'upgrade'),
        ('standard', 'Pack Standard', 300, 90.00, 
         '["Assistant vocal IA 24H/7J", "Retranscription de tous vos appels"]'::jsonb, 
         TRUE, 'upgrade'),
        ('pro', 'Pack Pro', 1200, 300.00, 
         '["Assistant vocal IA 24H/7J", "Retranscription de tous vos appels"]'::jsonb, 
         FALSE, 'upgrade'),
        ('entreprise', 'Pack Entreprise', 99999, 0.00, 
         '["750+ minutes d''appels IA/mois", "Fonctionnement 24h/24 et 7j/7", "Zéro charge salariale", "Solutions sur-mesure", "Agents IA Multilingues", "Account Manager dédié", "Support prioritaire 24/7", "Tarification sur mesure", "Évolutivité instantanée", "Rapports détaillés"]'::jsonb, 
         FALSE, 'upgrade')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        minutes_included = EXCLUDED.minutes_included,
        price = EXCLUDED.price,
        features = EXCLUDED.features,
        is_recommended = EXCLUDED.is_recommended,
        overage_policy = EXCLUDED.overage_policy,
        updated_at = NOW()
    `);

    console.log('[Migration] Pricing plans migrated successfully');
    
    const result = await pool.query('SELECT id, name, price, minutes_included FROM subscription_plans ORDER BY price ASC');
    console.log('[Migration] Current plans:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.name}: €${row.price} (${row.minutes_included} minutes)`);
    });

  } catch (error) {
    console.error('[Migration] Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

runMigration()
  .then(() => {
    console.log('[Migration] Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Migration] Migration failed:', error);
    process.exit(1);
  });
