# 🎯 COMMANDES À EXÉCUTER MAINTENANT

## Option 1 : Depuis Railway (Le plus simple)

### 1. Connectez-vous à Railway
```
https://railway.app
```

### 2. Ouvrez votre projet et le service backend

### 3. Cliquez sur l'onglet "Terminal" ou "Shell"

### 4. Exécutez cette commande :
```bash
node migrate.js
```

### 5. Attendez de voir :
```
✅ Migration terminée!
🎉 Migration réussie!
```

### 6. Redémarrez le service
- Cliquez sur "⋯" (trois points) en haut à droite
- Cliquez sur "Restart"
- Attendez 30-60 secondes

### 7. Testez l'inscription !

---

## Option 2 : Depuis votre machine locale

### 1. Assurez-vous que DATABASE_URL est dans votre fichier .env ou env.local

### 2. Test de connexion (optionnel mais recommandé) :
```bash
bun run backend/database/test-connection.ts
```

Vous devriez voir :
```
✅ Connexion réussie!
```

### 3. Migration complète :
```bash
bun run backend/database/run-full-migration.ts
```

Vous devriez voir :
```
✅ Migration terminée avec succès!

📊 Vérification des tables créées:
   Tables créées:
   ✓ api_keys
   ✓ calls
   ✓ global_settings
   ✓ payments
   ✓ schedules
   ✓ sms_verifications
   ✓ subscription_plans
   ✓ user_subscriptions
   ✓ users
   ✓ virtual_numbers
```

### 4. Allez sur Railway et redémarrez le backend

### 5. Testez l'inscription !

---

## ✅ Vérification : Tout a fonctionné ?

### Vérifiez dans Supabase :

1. Allez sur https://supabase.com
2. Ouvrez votre projet
3. Cliquez sur "Table Editor" dans le menu
4. Vous devriez voir ces tables :
   - api_keys
   - calls
   - global_settings
   - payments
   - schedules
   - **sms_verifications** ← IMPORTANT !
   - subscription_plans
   - user_subscriptions
   - users
   - virtual_numbers

### Vérifiez les données par défaut :

**Table `subscription_plans` :**
```sql
SELECT id, name, minutes_included, price FROM subscription_plans;
```

Devrait retourner 5 plans :
- gratuit (5 min, 0.00€)
- decouverte (100 min, 35.00€)
- standard (300 min, 90.00€)
- pro (1200 min, 300.00€)
- entreprise (99999 min, 0.00€)

**Table `users` :**
```sql
SELECT email, role FROM users WHERE role = 'admin';
```

Devrait retourner :
- tawfikelidrissi@gmail.com | admin

---

## 🧪 Test de l'Inscription Complète

### Étape 1 : Envoi du code SMS

Dans votre application, sur la page d'inscription :

1. Entrez un numéro de téléphone (ex: **+1 234 567 8900**)
2. Sélectionnez le pays (ex: **États-Unis +1**)
3. Cliquez sur **"Envoyer le code"**

**Résultat attendu :**
```
Code de vérification envoyé par SMS (utilisez 1234 pour le test)
```

**Dans les logs Railway, vous devriez voir :**
```
[SMS Verification] Sending code to phone number: +1 234 567 8900
[SMS Verification] Demo code stored in database: 1234
```

---

### Étape 2 : Vérification du code

1. Entrez le code : **1234**
2. Cliquez sur **"Vérifier"**

**Résultat attendu :**
```
✅ Numéro de téléphone vérifié avec succès
```

**Dans les logs Railway, vous devriez voir :**
```
[SMS Verification] ✅ Phone number verified successfully: +1 234 567 8900
```

---

### Étape 3 : Inscription finale

1. Entrez votre **email** (ex: test@example.com)
2. Entrez votre **nom** (ex: John Doe)
3. Entrez votre **mot de passe** (min. 6 caractères)
4. Cliquez sur **"S'inscrire"**

**Résultat attendu :**
```
✅ Inscription réussie !
```

**Dans les logs Railway, vous devriez voir :**
```
[REGISTER] Starting registration for phone: +1 234 567 8900
[REGISTER] Phone number verified successfully
[REGISTER] User does not exist, proceeding with registration
[REGISTER] Assigning virtual number: +16072953560
[REGISTER] Creating user in database...
[REGISTER] ✅ User created successfully!
[REGISTER] User ID: [UUID]
```

---

### Étape 4 : Vérification dans Supabase

1. Allez dans Supabase → Table Editor
2. Ouvrez la table **`users`**
3. Cliquez sur **"Refresh"**
4. Vous devriez voir votre nouvel utilisateur :
   - email: test@example.com
   - name: John Doe
   - phone_number: +1 234 567 8900
   - vapi_phone_number: +16072953560
   - plan_id: gratuit
   - minutes_remaining: 5
   - role: user

**✅ SUCCÈS ! L'inscription fonctionne !**

---

## ❌ Si ça ne fonctionne pas

### Erreur : "No procedure found on path 'trpc/auth.register'"

**Solution :**
1. Vérifiez que le backend Railway est bien redémarré
2. Vérifiez les logs Railway : cherchez `[Router] tRPC router initialized`
3. Attendez 1-2 minutes et réessayez

---

### Erreur : "Vous devez vérifier votre numéro de téléphone avant de vous inscrire"

**Solution :**
1. Vérifiez que vous avez bien appelé `verifyCode` avant `register`
2. Vérifiez que le code était "1234"
3. Vérifiez que la table `sms_verifications` existe dans Supabase

---

### Erreur : "Un utilisateur avec ce numéro de téléphone existe déjà"

**Solution :**
1. Le numéro est déjà utilisé
2. Essayez avec un autre numéro
3. Ou supprimez l'utilisateur existant dans Supabase

---

### L'utilisateur ne s'affiche pas dans Supabase

**Solution :**
1. Cliquez sur "Refresh" dans Supabase
2. Vérifiez les logs Railway pour voir s'il y a une erreur SQL
3. Cherchez `[REGISTER]` et `[DB]` dans les logs
4. Vérifiez que DATABASE_URL est bien configurée

---

## 🎉 C'est tout !

Une fois la migration exécutée et le backend redémarré, tout devrait fonctionner !

**Recap ultra-rapide :**
```bash
# 1. Migration (choisir une option)
node migrate.js                                        # Railway
bun run backend/database/run-full-migration.ts        # Local

# 2. Redémarrer Railway

# 3. Tester l'inscription
# sendVerificationCode → verifyCode("1234") → register

# 4. Vérifier dans Supabase
```

**Des questions ?** Vérifiez `README_FIXES.md` pour plus de détails !
