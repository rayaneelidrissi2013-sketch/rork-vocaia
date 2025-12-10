# Guide d'intégration - Vérification SMS via Vapi.ai

## ⚠️ État actuel
L'infrastructure de base est créée avec une implémentation MOCK.

### 🟢 CE QUI EST DÉJÀ IMPLÉMENTÉ
- Routes tRPC backend: `auth.sendVerificationCode` et `auth.verifyCode`
- Structure de base pour l'envoi et la vérification de codes
- Code de test: **123456** accepte toujours la vérification

### 🔴 CE QUI MANQUE POUR UNE VÉRITABLE INTÉGRATION VAPI.AI
- Configuration de la clé API Vapi.ai dans les variables d'environnement
- Appel réel à l'API Vapi.ai pour envoyer le SMS
- Stockage temporaire des codes (Redis ou base de données)
- Interface utilisateur dans app/login.tsx pour la saisie du code

## Étapes restantes pour finaliser l'intégration:

## Étapes d'implémentation

### 1. Configuration Vapi.ai
- Obtenir une clé API Vapi.ai
- Configurer un assistant vocal pour la vérification SMS
- Configurer les paramètres d'appel sortant

### 2. Backend - Créer une route tRPC
Créer `backend/trpc/routes/auth/sendVerificationSMS/route.ts`:
```typescript
import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export const sendVerificationSMSProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    countryCode: z.string(),
  }))
  .mutation(async ({ input }) => {
    // 1. Générer un code de vérification à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Appeler l'API Vapi.ai pour envoyer le SMS
    // ou initier un appel vocal avec le code
    
    // 3. Stocker le code temporairement (Redis/Database)
    
    return { success: true };
  });
```

### 3. Frontend - Modifier app/login.tsx
Ajouter un écran de vérification SMS après l'inscription:
```typescript
const [verificationStep, setVerificationStep] = useState<'register' | 'verify'>('register');
const [verificationCode, setVerificationCode] = useState('');

// Après l'inscription réussie
if (!isLogin) {
  await register(email, password, name, phoneNumber);
  setVerificationStep('verify');
  // Appeler la mutation pour envoyer le code
}

// Interface de vérification
if (verificationStep === 'verify') {
  return (
    <View>
      <Text>Entrez le code reçu par SMS</Text>
      <TextInput
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
        maxLength={6}
      />
      <Button onPress={handleVerifyCode}>Vérifier</Button>
    </View>
  );
}
```

### 4. Validation backend
Créer `backend/trpc/routes/auth/verifyPhoneNumber/route.ts`:
```typescript
export const verifyPhoneNumberProcedure = publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    code: z.string(),
  }))
  .mutation(async ({ input }) => {
    // 1. Récupérer le code stocké
    // 2. Vérifier que le code correspond
    // 3. Marquer le numéro comme vérifié dans la base de données
    
    return { verified: true };
  });
```

## Note importante
Pour compléter cette implémentation:
1. Créer un compte Vapi.ai et obtenir une clé API
2. Ajouter VAPI_API_KEY dans les variables d'environnement
3. Implémenter un système de stockage temporaire des codes (Redis ou table temporaire)
4. Ajouter une colonne `phone_verified` dans la table users
5. Modifier l'interface app/login.tsx pour ajouter l'étape de vérification

## Pour tester avec le système MOCK actuel
- Appelez `trpc.auth.sendVerificationCode.mutate()` avec le numéro
- Utilisez le code **123456** dans `trpc.auth.verifyCode.mutate()` pour réussir la vérification
