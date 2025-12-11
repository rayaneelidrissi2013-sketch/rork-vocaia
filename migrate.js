#!/usr/bin/env node

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 VocaIA Database Migration Script');
console.log('====================================\n');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERREUR: DATABASE_URL n\'est pas définie!');
  console.error('Configurez DATABASE_URL dans vos variables d\'environnement Railway.\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    console.log('🔌 Connexion à PostgreSQL...');
    const testResult = await pool.query('SELECT NOW() as time');
    console.log('✅ Connecté! Heure serveur:', testResult.rows[0].time);

    console.log('\n📄 Chargement du schéma SQL...');
    const schemaPath = path.join(__dirname, 'backend', 'database', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Fichier schema.sql introuvable: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    console.log(`✅ Schéma chargé (${schema.length} caractères)`);

    console.log('\n🚀 Exécution de la migration...');
    await pool.query(schema);
    console.log('✅ Migration terminée!\n');

    console.log('📊 Vérification des tables:');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tables.rows.forEach(row => console.log('   ✓', row.table_name));

    console.log('\n📦 Vérification des données:');
    const plans = await pool.query('SELECT COUNT(*) FROM subscription_plans');
    const settings = await pool.query('SELECT COUNT(*) FROM global_settings');
    const users = await pool.query('SELECT COUNT(*) FROM users');
    
    console.log('   - Plans:', plans.rows[0].count);
    console.log('   - Paramètres:', settings.rows[0].count);
    console.log('   - Utilisateurs:', users.rows[0].count);

    console.log('\n🎉 Migration réussie!');
    console.log('⚠️  N\'oubliez pas de changer le mot de passe admin!\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
