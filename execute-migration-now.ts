const https = require('https');
const http = require('http');

const executeMigration = async () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://vocaia-backend-clean-production.up.railway.app';
  const migrationUrl = `${baseUrl}/api/trpc/admin.runMigration`;

  console.log('🚀 Exécution de la migration SQL...');
  console.log('🔗 URL:', migrationUrl);
  console.log('');

  try {
    const url = new URL(migrationUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const postData = JSON.stringify({});
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = protocol.request(options, (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📡 Statut HTTP:', res.statusCode, res.statusMessage);
        console.log('');

        try {
          const responseData = JSON.parse(data);
          console.log('📦 Réponse du serveur:');
          console.log(JSON.stringify(responseData, null, 2));
          console.log('');

          if (responseData.result?.data?.success) {
            console.log('✅ Migration réussie!');
            console.log('');
            console.log('📊 Tables créées:');
            responseData.result.data.tables?.forEach((table: string) => {
              console.log(`   - ${table}`);
            });
            console.log('');
            console.log('🔍 Vérification:');
            const verification = responseData.result.data.verification;
            console.log(`   - Plans d'abonnement: ${verification.subscriptionPlans}`);
            console.log(`   - Paramètres globaux: ${verification.globalSettings}`);
            console.log(`   - Administrateurs: ${verification.adminUsers}`);
            console.log('');
            console.log('🎉 La base de données est prête!');
          } else {
            console.log('❌ Erreur lors de la migration:');
            console.log(responseData.result?.data?.message || 'Erreur inconnue');
            if (responseData.result?.data?.error) {
              console.log('Détails:', responseData.result.data.error);
            }
          }
        } catch (parseError: any) {
          console.error('❌ Erreur de parsing JSON:', parseError.message);
          console.log('Données brutes:', data);
        }
      });
    });

    req.on('error', (error: any) => {
      console.error('❌ Erreur lors de l\'appel à l\'API:', error.message);
      console.error('');
      console.error('Détails:', error);
    });

    req.write(postData);
    req.end();
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    console.error('');
    console.error('Détails:', error);
  }
};

executeMigration();
