import { Pool } from 'pg';

const executeMigration = async () => {
  const DATABASE_URL = 'postgresql://postgres:Ultratel231U@db.urhxfjbinunhyxmqdzxi.supabase.co:5432/postgres';

  console.log('🔌 Connexion à la base de données PostgreSQL...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔍 Test de connexion...');
    const testResult = await pool.query('SELECT NOW() as time, version() as version');
    console.log('✅ Connexion réussie');
    console.log('📅 Heure du serveur:', testResult.rows[0].time);

    console.log('\n🚀 Exécution de la migration complète...');
    
    const schema = `
-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  language VARCHAR(10) DEFAULT 'fr',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  
  vapi_agent_id VARCHAR(255),
  vapi_phone_number VARCHAR(50),
  user_personal_phone VARCHAR(50),
  is_agent_active BOOLEAN DEFAULT FALSE,
  custom_prompt_template TEXT,
  profession VARCHAR(100),
  
  plan_id VARCHAR(50),
  minutes_included INTEGER DEFAULT 0,
  minutes_remaining INTEGER DEFAULT 0,
  minutes_consumed INTEGER DEFAULT 0,
  date_renouvellement TIMESTAMP,
  
  referral_code VARCHAR(50) UNIQUE,
  referred_by_code VARCHAR(50),
  bonus_minutes INTEGER DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  
  registration_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des appels
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vapi_call_id VARCHAR(255),
  
  caller_name VARCHAR(255),
  caller_number VARCHAR(50) NOT NULL,
  
  timestamp TIMESTAMP DEFAULT NOW(),
  duration INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'ongoing')),
  
  summary TEXT,
  transcription TEXT,
  audio_url TEXT,
  gcs_recording_url TEXT,
  
  vapi_cost DECIMAL(10, 4) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des plannings d'activation AI
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, day_of_week)
);

-- Table des clés API
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_name VARCHAR(100) UNIQUE NOT NULL,
  key_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des numéros virtuels
CREATE TABLE IF NOT EXISTS virtual_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(50) UNIQUE NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  webhook_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des paramètres globaux
CREATE TABLE IF NOT EXISTS global_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des plans d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  minutes_included INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB,
  is_recommended BOOLEAN DEFAULT FALSE,
  overage_policy VARCHAR(20) DEFAULT 'charge' CHECK (overage_policy IN ('upgrade', 'charge')),
  overage_rate DECIMAL(10, 2) DEFAULT 0.55,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('subscription', 'overage')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed')),
  paypal_transaction_id VARCHAR(255),
  date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des abonnements utilisateurs
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  paypal_subscription_id VARCHAR(255),
  minutes_used INTEGER DEFAULT 0,
  minutes_remaining INTEGER DEFAULT 0,
  start_date TIMESTAMP DEFAULT NOW(),
  renewal_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table de vérification SMS
CREATE TABLE IF NOT EXISTS sms_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(50) NOT NULL,
  code VARCHAR(10) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_vapi_phone_number ON users(vapi_phone_number);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON calls(timestamp);
CREATE INDEX IF NOT EXISTS idx_calls_vapi_call_id ON calls(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_numbers_assigned_user_id ON virtual_numbers(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_phone ON sms_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_expires ON sms_verifications(expires_at);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_virtual_numbers_updated_at BEFORE UPDATE ON virtual_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_settings_updated_at BEFORE UPDATE ON global_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertion des plans d'abonnement par défaut
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
   '["750+ minutes d\\'appels IA/mois", "Fonctionnement 24h/24 et 7j/7", "Zéro charge salariale", "Solutions sur-mesure", "Agents IA Multilingues", "Account Manager dédié", "Support prioritaire 24/7", "Tarification sur mesure", "Évolutivité instantanée", "Rapports détaillés"]'::jsonb, 
   FALSE, 'upgrade')
ON CONFLICT (id) DO NOTHING;

-- Insertion des paramètres globaux
INSERT INTO global_settings (setting_key, setting_value, description)
VALUES
  ('default_prompt', 'Bonjour, je suis l''assistant virtuel. Je ne suis pas disponible pour le moment. Comment puis-je vous aider ?', 'Prompt par défaut pour les nouveaux utilisateurs'),
  ('default_language', 'fr', 'Langue par défaut'),
  ('default_temperature', '0.5', 'Température par défaut pour l''IA'),
  ('default_max_tokens', '250', 'Nombre maximum de tokens par défaut'),
  ('default_voice_type', 'female', 'Type de voix par défaut'),
  ('overage_rate', '0.55', 'Tarif par minute en dépassement ($)'),
  ('allowed_countries', '["+1"]', 'Liste des codes pays autorisés pour l''inscription (format JSON array)')
ON CONFLICT (setting_key) DO NOTHING;

-- Création de l'utilisateur administrateur par défaut
INSERT INTO users (email, password_hash, name, phone_number, role, registration_date)
VALUES
  ('tawfikelidrissi@gmail.com', '$2b$10$BnMLy3YWxZHCnC3UnKKy.eC0YNaM2EFE4cGVj9cLhiQZ8PmC.nYru', 'Administrateur', '+212600000000', 'admin', NOW())
ON CONFLICT (email) DO NOTHING;
`;

    await pool.query(schema);
    console.log('✅ Migration terminée!\n');
    
    console.log('📊 Vérification des tables:');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('Tables créées:');
    tablesResult.rows.forEach((row: any) => {
      console.log('  ✓', row.table_name);
    });

    console.log('\n📦 Vérification des données:');
    const plansResult = await pool.query('SELECT COUNT(*) as count FROM subscription_plans');
    console.log('  - Plans d\'abonnement:', plansResult.rows[0].count);
    
    const settingsResult = await pool.query('SELECT COUNT(*) as count FROM global_settings');
    console.log('  - Paramètres globaux:', settingsResult.rows[0].count);
    
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = \'admin\'');
    console.log('  - Utilisateurs admin:', usersResult.rows[0].count);

    console.log('\n🎉 Base de données VocaIA prête!');
    console.log('\n⚠️  IMPORTANT:');
    console.log('Email admin: tawfikelidrissi@gmail.com');
    console.log('Mot de passe: admin123');

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.detail) console.error('Détails:', error.detail);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

executeMigration();
