const https = require('https');

const executeMigration = () => {
  const baseUrl = 'https://vocaia-backend-clean-production.up.railway.app';
  const migrationUrl = `${baseUrl}/api/trpc/admin.runMigration`;

  console.log('🚀 Exécution de la migration SQL...');
  console.log('🔗 URL:', migrationUrl);
  console.log('');

  const url = new URL(migrationUrl);
  const postData = JSON.stringify({});
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
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

        if (responseData.result && responseData.result.data && responseData.result.data.success) {
          console.log('✅ Migration réussie!');
          console.log('');
          console.log('📊 Tables créées:');
          if (responseData.result.data.tables) {
            responseData.result.data.tables.forEach((table) => {
              console.log(`   - ${table}`);
            });
          }
          console.log('');
          console.log('🔍 Vérification:');
          const verification = responseData.result.data.verification;
          if (verification) {
            console.log(`   - Plans d'abonnement: ${verification.subscriptionPlans}`);
            console.log(`   - Paramètres globaux: ${verification.globalSettings}`);
            console.log(`   - Administrateurs: ${verification.adminUsers}`);
          }
          console.log('');
          console.log('🎉 La base de données est prête!');
          console.log('');
          console.log('ℹ️  Vous pouvez maintenant utiliser votre application.');
          console.log('ℹ️  Compte admin: tawfikelidrissi@gmail.com');
          console.log('ℹ️  Mot de passe: admin123 (à changer immédiatement!)');
        } else {
          console.log('❌ Erreur lors de la migration:');
          console.log(responseData.result && responseData.result.data ? responseData.result.data.message : 'Erreur inconnue');
          if (responseData.result && responseData.result.data && responseData.result.data.error) {
            console.log('Détails:', JSON.stringify(responseData.result.data.error, null, 2));
          }
        }
      } catch (parseError) {
        console.error('❌ Erreur de parsing JSON:', parseError.message);
        console.log('Données brutes reçues:');
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur lors de l\'appel à l\'API:', error.message);
    console.error('');
    console.error('Détails:', error);
  });

  req.write(postData);
  req.end();
};

console.log('');
console.log('='.repeat(60));
console.log('    EXÉCUTION DE LA MIGRATION SQL VOCAIA');
console.log('='.repeat(60));
console.log('');

executeMigration();
