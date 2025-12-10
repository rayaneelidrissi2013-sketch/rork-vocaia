# Intégration Webhook Vapi.ai et Configuration Backend

## 📍 URL du Webhook Vapi.ai

**IMPORTANT** : Le backend n'est pas actuellement activé pour ce projet. Pour activer le backend et obtenir l'URL du webhook, veuillez activer l'option "Backend" dans les intégrations.

### Une fois le backend activé :

L'URL du webhook pour Vapi.ai sera :
```
https://[VOTRE_DOMAINE_BACKEND]/webhooks/vapi/call-completed
```

### Configuration dans Vapi.ai :

1. Allez dans votre console Vapi.ai
2. Naviguez vers **Settings** → **Webhooks**
3. Ajoutez l'URL du webhook ci-dessus
4. Copiez votre **Webhook Secret Key** (commence par `whsec_...`)
5. Entrez cette clé dans la console d'administration de l'application (onglet "Clés API")

---

## ☁️ Configuration Google Cloud Storage (GCS)

### Pourquoi GCS ?
Google Cloud Storage est utilisé pour stocker les enregistrements audio des appels de manière sécurisée et économique.

### Étapes de Configuration :

#### 1. Créer un Bucket GCS
```bash
# Via gcloud CLI
gcloud storage buckets create gs://votre-bucket-appels-audio \
  --location=europe-west1 \
  --uniform-bucket-level-access
```

#### 2. Créer un Service Account
```bash
# Créer le service account
gcloud iam service-accounts create vapi-audio-storage \
  --display-name="Vapi Audio Storage Service Account"

# Donner les permissions nécessaires
gcloud storage buckets add-iam-policy-binding gs://votre-bucket-appels-audio \
  --member="serviceAccount:vapi-audio-storage@VOTRE-PROJECT-ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

#### 3. Générer la Clé JSON
```bash
gcloud iam service-accounts keys create service-account-key.json \
  --iam-account=vapi-audio-storage@VOTRE-PROJECT-ID.iam.gserviceaccount.com
```

#### 4. Configurer dans l'Application
1. Ouvrez la console d'administration
2. Allez dans l'onglet **Clés API**
3. Section **Stockage Cloud** :
   - Fournisseur : `Google Cloud Storage`
   - Credentials JSON : Collez le contenu complet du fichier `service-account-key.json`

---

## 🔐 Sécurité et Bonnes Pratiques

### Protection des Clés API
- ✅ Les clés sont stockées localement dans AsyncStorage (démonstration uniquement)
- ⚠️ En production, utilisez un gestionnaire de secrets sécurisé :
  - Google Secret Manager
  - HashiCorp Vault
  - AWS Secrets Manager

### Vérification HMAC
Le webhook doit toujours vérifier la signature HMAC pour s'assurer que les requêtes proviennent bien de Vapi.ai.

**Exemple de code backend (Node.js) :**
```javascript
const crypto = require('crypto');

function verifyVapiSignature(payload, signature, webhookSecret) {
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/webhooks/vapi/call-completed', (req, res) => {
  const signature = req.headers['x-vapi-signature'];
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
  
  if (!verifyVapiSignature(req.body, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Traiter l'événement webhook...
});
```

---

## 📊 Structure des Données du Webhook

### Événement `call.completed`

Vapi.ai envoie cette structure JSON au webhook :

```json
{
  "event": "call.completed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "call": {
    "id": "call_abc123xyz",
    "status": "completed",
    "phoneNumber": "+33612345678",
    "customer": {
      "number": "+33698765432"
    },
    "recordingUrl": "https://storage.googleapis.com/...",
    "transcript": [
      {
        "role": "assistant",
        "text": "Bonjour, je suis l'assistant de M. Dupont..."
      },
      {
        "role": "user",
        "text": "Bonjour, je voudrais prendre rendez-vous..."
      }
    ],
    "aiSummary": "L'appelant souhaite prendre rendez-vous pour la semaine prochaine.",
    "duration": 145
  }
}
```

### Traitement dans le Backend

```javascript
app.post('/webhooks/vapi/call-completed', async (req, res) => {
  try {
    const { call } = req.body;
    
    // 1. Identifier l'utilisateur via le numéro Vapi
    const user = await db.users.findOne({ 
      vapi_phone_number: call.phoneNumber 
    });
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    // 2. Télécharger l'audio depuis Vapi vers GCS
    const audioUrl = await uploadToGCS(call.recordingUrl, user.id, call.id);
    
    // 3. Sauvegarder dans la base de données
    await db.calls.insert({
      user_id: user.id,
      vapi_call_id: call.id,
      caller_number: call.customer.number,
      recording_url: audioUrl,
      ai_summary: call.aiSummary,
      full_transcript: JSON.stringify(call.transcript),
      duration: call.duration,
      created_at: new Date()
    });
    
    // 4. Envoyer une notification push à l'utilisateur
    await sendPushNotification(user.id, {
      title: 'Nouvel appel reçu',
      body: call.aiSummary,
      data: { callId: call.id }
    });
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal error');
  }
});
```

---

## 🔄 Activation/Désactivation de l'Agent

### Endpoint: POST /api/settings/agent/activate

```javascript
app.post('/api/settings/agent/activate', async (req, res) => {
  const userId = req.user.id; // Depuis l'authentification
  const user = await db.users.findById(userId);
  
  // 1. Construire le prompt final
  const systemPrompt = globalSettings.defaultPrompt
    .replace('[USER_NAME]', user.name)
    .replace('[PROFESSION]', user.profession)
    .replace('[LANGUAGE]', user.language);
  
  // 2. Mettre à jour l'agent Vapi
  await axios.patch(
    `https://api.vapi.ai/agents/${user.vapi_agent_id}`,
    {
      model: {
        systemPrompt: systemPrompt
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_SECRET_KEY}`
      }
    }
  );
  
  // 3. Configurer le renvoi d'appel (CPaaS - Twilio exemple)
  await twilioClient.incomingPhoneNumbers(user.twilio_number_sid)
    .update({
      voiceUrl: `https://api.vapi.ai/call/web/${user.vapi_agent_id}`
    });
  
  // 4. Mettre à jour la base de données
  await db.users.update(userId, { is_agent_active: true });
  
  res.json({ success: true });
});
```

### Endpoint: POST /api/settings/agent/deactivate

```javascript
app.post('/api/settings/agent/deactivate', async (req, res) => {
  const userId = req.user.id;
  const user = await db.users.findById(userId);
  
  // 1. Retirer le renvoi d'appel
  await twilioClient.incomingPhoneNumbers(user.twilio_number_sid)
    .update({
      voiceUrl: '' // Retirer l'URL de renvoi
    });
  
  // 2. Mettre à jour la base de données
  await db.users.update(userId, { is_agent_active: false });
  
  res.json({ success: true });
});
```

---

## 📱 Attribution des Numéros par Pays

Pour identifier automatiquement le pays de l'utilisateur et lui attribuer le bon numéro virtuel :

```javascript
const libphonenumber = require('libphonenumber-js');

async function assignVirtualNumberByCountry(userPhoneNumber) {
  // 1. Parser le numéro de l'utilisateur
  const phoneNumber = libphonenumber.parsePhoneNumber(userPhoneNumber);
  const countryCode = phoneNumber.country; // Ex: 'FR', 'US', 'CA'
  
  // 2. Trouver un numéro virtuel disponible pour ce pays
  const virtualNumber = await db.virtualNumbers.findOne({
    country: countryCode,
    assignedUserId: null // Non attribué
  });
  
  if (!virtualNumber) {
    throw new Error(`Aucun numéro disponible pour le pays ${countryCode}`);
  }
  
  // 3. Attribuer le numéro à l'utilisateur
  await db.virtualNumbers.update(virtualNumber.id, {
    assignedUserId: user.id
  });
  
  await db.users.update(user.id, {
    vapi_phone_number: virtualNumber.phoneNumber
  });
  
  return virtualNumber;
}
```

---

## 🚀 Déploiement

### Prérequis Backend
- Node.js 18+ ou Python 3.9+
- Base de données (PostgreSQL recommandé)
- Service de déploiement (Heroku, Railway, Render, Google Cloud Run, etc.)

### Variables d'Environnement à Configurer

```env
# Vapi.ai
VAPI_SECRET_KEY=sk_live_xxxxxxxxxx
VAPI_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# CPaaS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxx

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=votre-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Base de données
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Notifications Push (Expo)
EXPO_ACCESS_TOKEN=xxxxxxxxxx
```

---

## ✅ Checklist de Configuration

- [ ] Backend activé dans les intégrations Rork
- [ ] URL du webhook configurée dans Vapi.ai
- [ ] Webhook Secret Key ajoutée dans la console admin
- [ ] Bucket GCS créé
- [ ] Service Account GCS créé avec permissions appropriées
- [ ] Credentials JSON GCS ajoutées dans la console admin
- [ ] CPaaS (Twilio/Vonage) configuré
- [ ] Numéros virtuels ajoutés dans la console admin
- [ ] Tests du webhook effectués
- [ ] Notifications push configurées

---

## 📞 Support

Pour toute question concernant l'intégration :
- Documentation Vapi.ai : https://docs.vapi.ai
- Documentation GCS : https://cloud.google.com/storage/docs
- Support Rork : contact@rork.app
