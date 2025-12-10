import { publicProcedure } from '../../../create-context.js';
import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = (): Pool => {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL_NOT_CONFIGURED');
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  return pool;
};

const DEFAULT_CGU = `Conditions Générales d'Utilisation

1. Acceptation des conditions
En utilisant notre service d'agent vocal IA, vous acceptez les présentes conditions générales d'utilisation.

2. Description du service
Notre service permet de gérer automatiquement vos appels téléphoniques via un assistant IA intelligent.

3. Données personnelles
Vos données sont traitées conformément au RGPD. Les enregistrements d'appels sont stockés de manière sécurisée.

4. Utilisation du service
Vous vous engagez à utiliser le service de manière responsable et conformément à la loi.

5. Facturation
Les tarifs sont indiqués clairement sur notre page de pricing. La facturation s'effectue mensuellement.

6. Résiliation
Vous pouvez résilier votre abonnement à tout moment depuis votre espace personnel.

7. Responsabilité
Nous mettons tout en œuvre pour assurer la disponibilité du service, mais ne pouvons garantir un fonctionnement ininterrompu.

8. Modifications
Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des modifications.

9. Contact
Pour toute question, contactez-nous à support@agentvoixia.com`;

export const getCGUProcedure = publicProcedure
  .query(async () => {
    console.log('[tRPC getCGU] Getting CGU');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn('[tRPC getCGU] DATABASE_URL not configured, returning default CGU');
      return {
        success: true,
        cgu: DEFAULT_CGU,
        updatedAt: new Date().toISOString(),
      };
    }
    
    try {
      const db = getPool();
      const result = await db.query(
        `SELECT content, updated_at FROM terms_of_service ORDER BY updated_at DESC LIMIT 1`
      );
      
      if (result.rows.length === 0) {
        console.log('[tRPC getCGU] No CGU found in database, returning default');
        return {
          success: true,
          cgu: DEFAULT_CGU,
          updatedAt: new Date().toISOString(),
        };
      }
      
      console.log('[tRPC getCGU] CGU found in database');
      return {
        success: true,
        cgu: result.rows[0].content,
        updatedAt: result.rows[0].updated_at,
      };
    } catch (error: any) {
      console.error('[tRPC getCGU] Error getting CGU:', error);
      return {
        success: true,
        cgu: DEFAULT_CGU,
        updatedAt: new Date().toISOString(),
      };
    }
  });
