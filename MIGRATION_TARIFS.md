# Migration des Packs Tarifaires

Ce fichier décrit les changements apportés au système de tarification et comment migrer les données.

## Changements Effectués

### 1. Interface Utilisateur
- ✅ Suppression du texte "Minutes prépayées non reportables..." de `/pricing.tsx`
- ✅ Suppression du texte de test de connexion admin de `/admin-login.tsx`

### 2. Navigation Admin
La console d'administration a été restructurée avec 5 onglets au lieu de plusieurs pages :

1. **Dashboard** - Statistiques globales (utilisateurs, minutes, revenus)
2. **Numéros Virtuels** - Gestion des numéros
3. **Gestion des Utilisateurs** - Liste et détails des utilisateurs
4. **Historique des Appels** - Tous les appels filtrés par clients
5. **Paramètres** - Regroupe :
   - Clés API (Vapi.ai, CPaaS, Cloud Storage)
   - Configuration de l'Agent IA
   - **Éditeur de Prix Dynamique** ⭐

### 3. Système de Tarification Dynamique

#### Base de Données
La table `subscription_plans` contient maintenant les packs suivants :

| ID | Nom | Minutes | Prix (€) | Recommandé |
|----|-----|---------|----------|------------|
| gratuit | Pack Gratuit | 5 | 0.00 | Non |
| decouverte | Pack Découverte | 100 | 35.00 | Non |
| standard | Pack Standard | 300 | 90.00 | Oui |
| pro | Pack Pro | 1200 | 300.00 | Non |
| entreprise | Pack Entreprise | - | Sur devis | Non |

#### Backend
- ✅ Routes tRPC créées :
  - `admin.getPricingPlans` - Récupérer tous les packs
  - `admin.updatePricingPlan` - Modifier un pack (prix, minutes)
- ✅ Route `billing.getPlans` modifiée pour lire depuis la DB

#### Frontend
- ✅ Page `/pricing.tsx` modifiée pour charger les packs dynamiquement via tRPC
- ✅ Nouvelle interface admin dans **Paramètres > Tarifs** pour éditer les packs

## Migration de la Base de Données

### Si vous utilisez le schema.sql
Le fichier `backend/database/schema.sql` a été mis à jour avec les nouveaux packs.

Si vous créez une nouvelle base de données, exécutez simplement :
\`\`\`sql
psql $DATABASE_URL < backend/database/schema.sql
\`\`\`

### Si vous avez une base de données existante
Utilisez le script de migration :

\`\`\`bash
# Assurez-vous que DATABASE_URL est définie
export DATABASE_URL="postgresql://user:password@host:port/database"

# Exécuter la migration
bun run backend/database/migrate-pricing.ts
\`\`\`

Ce script :
- Insère les nouveaux packs
- Met à jour les packs existants avec les nouvelles valeurs
- Affiche la liste des packs après migration

### Vérification Manuelle
Vous pouvez vérifier que les packs ont été migrés correctement :

\`\`\`sql
SELECT id, name, price, minutes_included 
FROM subscription_plans 
ORDER BY price ASC;
\`\`\`

## Utilisation de l'Éditeur de Prix

1. Connectez-vous à la console d'administration
2. Allez dans l'onglet **Paramètres**
3. Cliquez sur l'onglet **Tarifs**
4. Pour chaque pack :
   - Cliquez sur l'icône de modification
   - Modifiez le prix et/ou les minutes
   - Cliquez sur **Enregistrer**
5. Les changements sont appliqués immédiatement

**Important** : 
- Le pack Entreprise ne peut pas être modifié (tarif sur devis)
- Les modifications affectent immédiatement la page `/pricing`
- Les nouveaux abonnements utiliseront les nouveaux tarifs
- Les abonnements existants conservent leurs tarifs jusqu'au renouvellement

## Impact sur le Code Existant

### Fichiers Modifiés
- `app/pricing.tsx` - Lecture dynamique des packs
- `app/(admin)/_layout.tsx` - Nouvelle navigation
- `app/(admin)/dashboard.tsx` - Simplifié (stats uniquement)
- `app/(admin)/settings.tsx` - Nouvelle page (créée)
- `backend/database/schema.sql` - Nouveaux packs par défaut
- `backend/trpc/routes/billing/getPlans/route.ts` - Lecture depuis DB

### Fichiers Créés
- `app/(admin)/settings.tsx` - Page de paramètres consolidée
- `backend/trpc/routes/admin/getPricingPlans/route.ts` - Route GET packs
- `backend/trpc/routes/admin/updatePricingPlan/route.ts` - Route UPDATE pack
- `backend/database/migrate-pricing.ts` - Script de migration

### Fichiers Dépréciés (peuvent être supprimés)
- `app/(admin)/global-settings.tsx` - Intégré dans settings.tsx
- `constants/subscriptionPlans.ts` - Données maintenant en DB

## Tests Recommandés

1. **Page Pricing** :
   - Vérifier que les packs s'affichent correctement
   - Vérifier le chargement (spinner)
   - Tester avec une DB vide (message d'erreur)

2. **Console Admin - Paramètres** :
   - Modifier un prix → sauvegarder → vérifier sur `/pricing`
   - Modifier les minutes → sauvegarder → vérifier
   - Annuler une modification

3. **Navigation Admin** :
   - Vérifier que les 5 onglets sont visibles
   - Vérifier que tous les liens fonctionnent
   - Tester la déconnexion

## Support

Si vous rencontrez des problèmes après la migration :

1. Vérifiez que `DATABASE_URL` est correctement définie
2. Vérifiez les logs du serveur backend
3. Vérifiez que la table `subscription_plans` existe et contient des données
4. Redémarrez le serveur après la migration

---

**Date de migration** : ${new Date().toISOString().split('T')[0]}
