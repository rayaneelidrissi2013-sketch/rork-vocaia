import 'dotenv/config';

const BACKEND_URL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://vocaia-production.up.railway.app';

async function executeMigration() {
  console.log('🚀 Exécution de la migration de la base de données...');
  console.log('📍 Backend URL:', BACKEND_URL);
  
  try {
    const response = await fetch(`${BACKEND_URL}/trpc/admin.runMigration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    console.log('📡 Statut de la réponse:', response.status);
    
    const result = await response.json();
    console.log('📦 Résultat:', JSON.stringify(result, null, 2));
    
    if (result.result?.data?.success) {
      console.log('✅ Migration terminée avec succès!');
      console.log('📊 Tables créées:', result.result.data.tables);
      console.log('🔍 Vérification:', result.result.data.verification);
    } else {
      console.error('❌ Erreur lors de la migration:', result.result?.data?.message);
    }
  } catch (error: any) {
    console.error('💥 Erreur fatale:', error.message);
    console.error(error.stack);
  }
}

executeMigration();
