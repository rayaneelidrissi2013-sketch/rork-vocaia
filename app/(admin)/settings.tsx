import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { 
  Key, 
  Cloud, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  LogOut, 
  Bot,
  DollarSign,
  Edit2,
  FileText,
  Plus,
  Trash2,
  Globe,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';



interface PlanEditState {
  name: string;
  minutesIncluded: number;
  price: number;
  features: string[];
  isRecommended: boolean;
}

interface NewPlanState {
  id: string;
  name: string;
  minutesIncluded: number;
  price: number;
  features: string;
  isRecommended: boolean;
}

export default function AdminSettings() {
  const { apiKeys, updateAPIKeys, globalSettings, updateGlobalSettings, isLoading } = useAdmin();
  const { logout } = useAuth();
  const router = useRouter();
  
  const [localKeys, setLocalKeys] = useState(apiKeys);
  const [localSettings, setLocalSettings] = useState(globalSettings);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [activeSection, setActiveSection] = useState<'keys' | 'agent' | 'pricing' | 'cgu' | 'countries' | 'paypal' | 'smtp'>('keys');
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [planEdits, setPlanEdits] = useState<{ [key: string]: Partial<PlanEditState> }>({});
  const [isCreatingPlan, setIsCreatingPlan] = useState<boolean>(false);
  const [newPlan, setNewPlan] = useState<NewPlanState>({
    id: '',
    name: '',
    minutesIncluded: 0,
    price: 0,
    features: '',
    isRecommended: false,
  });


  const pricingPlansQuery = trpc.admin.getPricingPlans.useQuery(undefined, {
    retry: 1,
  });
  const cguQuery = trpc.admin.getCGU.useQuery();
  const updateCGUMutation = trpc.admin.updateCGU.useMutation({
    onSuccess: () => {
      cguQuery.refetch();
      Alert.alert('Succès', 'Les CGU ont été mises à jour');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const allowedCountriesQuery = trpc.admin.getAllowedCountries.useQuery();
  const paypalSettingsQuery = trpc.admin.getPayPalSettings.useQuery();
  const updatePayPalSettingsMutation = trpc.admin.updatePayPalSettings.useMutation({
    onSuccess: () => {
      paypalSettingsQuery.refetch();
      Alert.alert('Succès', 'Les paramètres PayPal ont été mis à jour');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });
  const updateAllowedCountriesMutation = trpc.admin.updateAllowedCountries.useMutation({
    onSuccess: () => {
      allowedCountriesQuery.refetch();
      Alert.alert('Succès', 'Les pays autorisés ont été mis à jour');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const [localAllowedCountries, setLocalAllowedCountries] = React.useState<string[]>([]);
  const [newCountryCode, setNewCountryCode] = React.useState<string>('');
  
  const [localCGU, setLocalCGU] = useState<string>('');
  const [localPayPalSettings, setLocalPayPalSettings] = useState<{
    clientId: string;
    clientSecret: string;
    mode: 'sandbox' | 'live';
  }>({ clientId: '', clientSecret: '', mode: 'sandbox' });
  
  React.useEffect(() => {
    if (cguQuery.data?.cgu) {
      setLocalCGU(cguQuery.data.cgu);
    }
  }, [cguQuery.data]);

  React.useEffect(() => {
    if (allowedCountriesQuery.data?.allowedCountries) {
      setLocalAllowedCountries(allowedCountriesQuery.data.allowedCountries);
    }
  }, [allowedCountriesQuery.data]);

  React.useEffect(() => {
    if (paypalSettingsQuery.data) {
      setLocalPayPalSettings({
        clientId: paypalSettingsQuery.data.clientId,
        clientSecret: paypalSettingsQuery.data.clientSecret,
        mode: paypalSettingsQuery.data.mode as 'sandbox' | 'live',
      });
    }
  }, [paypalSettingsQuery.data]);
  const updatePlanMutation = trpc.admin.updatePricingPlan.useMutation({
    onSuccess: () => {
      pricingPlansQuery.refetch();
      setEditingPlan(null);
      setPlanEdits({});
      Alert.alert('Succès', 'Le plan a été mis à jour');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const createPlanMutation = trpc.admin.createPricingPlan.useMutation({
    onSuccess: () => {
      pricingPlansQuery.refetch();
      setIsCreatingPlan(false);
      setNewPlan({
        id: '',
        name: '',
        minutesIncluded: 0,
        price: 0,
        features: '',
        isRecommended: false,
      });
      Alert.alert('Succès', 'Le pack a été créé avec succès');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const deletePlanMutation = trpc.admin.deletePricingPlan.useMutation({
    onSuccess: () => {
      pricingPlansQuery.refetch();
      Alert.alert('Succès', 'Le pack a été supprimé');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });



  const handleUpdateKeys = async () => {
    try {
      await updateAPIKeys(localKeys);
      Alert.alert('Succès', 'Les clés API ont été mises à jour');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour les clés API');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await updateGlobalSettings(localSettings);
      Alert.alert('Succès', 'Les paramètres globaux ont été mis à jour');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour les paramètres');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: async () => {
            await logout();
            router.replace('/admin-login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEditPlan = (planId: string) => {
    const allPlans = pricingPlansQuery.data?.plans || SUBSCRIPTION_PLANS.map((p: any) => ({
      id: p.id,
      name: p.name,
      minutesIncluded: p.minutesIncluded,
      price: p.price,
      features: p.features,
      isRecommended: p.isRecommended || false,
    }));
    
    const plan = allPlans.find((p: any) => p.id === planId);
    if (plan) {
      console.log('[handleEditPlan] Editing plan:', planId, plan);
      setEditingPlan(planId);
      setPlanEdits({
        [planId]: {
          name: plan.name,
          minutesIncluded: plan.minutesIncluded,
          price: plan.price,
          features: plan.features || [],
          isRecommended: plan.isRecommended || false,
        },
      });
    } else {
      console.error('[handleEditPlan] Plan not found:', planId);
    }
  };

  const handleSavePlan = (planId: string) => {
    const edits = planEdits[planId];
    console.log('[handleSavePlan] Plan ID:', planId);
    console.log('[handleSavePlan] All planEdits:', planEdits);
    console.log('[handleSavePlan] Current edits for this plan:', edits);
    
    if (!edits) {
      console.error('[handleSavePlan] No edits found for plan:', planId);
      Alert.alert('Erreur', 'Aucune modification à enregistrer');
      return;
    }

    console.log('[handleSavePlan] Saving plan with mutation:', {
      id: planId,
      name: edits.name,
      minutesIncluded: edits.minutesIncluded,
      price: edits.price,
      features: edits.features,
      isRecommended: edits.isRecommended,
    });
    
    updatePlanMutation.mutate({
      id: planId,
      name: edits.name,
      minutesIncluded: edits.minutesIncluded,
      price: edits.price,
      features: edits.features,
      isRecommended: edits.isRecommended,
    });
  };



  const handleCancelEdit = () => {
    setEditingPlan(null);
    setPlanEdits({});
  };

  const handleCreatePlan = () => {
    if (!newPlan.id || !newPlan.name || newPlan.price <= 0 || newPlan.minutesIncluded <= 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const featuresArray = newPlan.features
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    if (featuresArray.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un avantage');
      return;
    }

    createPlanMutation.mutate({
      id: newPlan.id,
      name: newPlan.name,
      minutesIncluded: newPlan.minutesIncluded,
      price: newPlan.price,
      features: featuresArray,
      isRecommended: newPlan.isRecommended,
    });
  };

  const handleDeletePlan = (planId: string, planName: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le pack "${planName}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deletePlanMutation.mutate({ id: planId }),
        },
      ]
    );
  };







  const SecretInput = ({ 
    label, 
    value, 
    onChangeText, 
    fieldKey,
    placeholder 
  }: { 
    label: string; 
    value: string; 
    onChangeText: (text: string) => void;
    fieldKey: string;
    placeholder?: string;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.secretInputContainer}>
        <TextInput
          style={styles.secretInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          secureTextEntry={!showSecrets[fieldKey]}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => toggleSecretVisibility(fieldKey)}
        >
          {showSecrets[fieldKey] ? (
            <EyeOff size={20} color="#64748B" />
          ) : (
            <Eye size={20} color="#64748B" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.subtitle}>Configuration système et tarification</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'keys' && styles.tabActive]}
          onPress={() => setActiveSection('keys')}
        >
          <Key size={20} color={activeSection === 'keys' ? '#8B5CF6' : '#64748B'} />
          <Text style={[styles.tabText, activeSection === 'keys' && styles.tabTextActive]}>
            Clés API
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'agent' && styles.tabActive]}
          onPress={() => setActiveSection('agent')}
        >
          <Bot size={20} color={activeSection === 'agent' ? '#8B5CF6' : '#64748B'} />
          <Text style={[styles.tabText, activeSection === 'agent' && styles.tabTextActive]}>
            Agent IA
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'pricing' && styles.tabActive]}
          onPress={() => setActiveSection('pricing')}
        >
          <DollarSign size={18} color={activeSection === 'pricing' ? '#8B5CF6' : '#64748B'} />
          <Text style={[styles.tabText, activeSection === 'pricing' && styles.tabTextActive]}>
            Packs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'cgu' && styles.tabActive]}
          onPress={() => setActiveSection('cgu')}
        >
          <FileText size={18} color={activeSection === 'cgu' ? '#8B5CF6' : '#64748B'} />
          <Text style={[styles.tabText, activeSection === 'cgu' && styles.tabTextActive]}>
            CGU
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'countries' && styles.tabActive]}
          onPress={() => setActiveSection('countries')}
        >
          <Globe size={18} color={activeSection === 'countries' ? '#8B5CF6' : '#64748B'} />
          <Text style={[styles.tabText, activeSection === 'countries' && styles.tabTextActive]}>
            Pays
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'paypal' && styles.tabActive]}
          onPress={() => setActiveSection('paypal')}
        >
          <DollarSign size={18} color={activeSection === 'paypal' ? '#8B5CF6' : '#64748B'} />
          <Text style={[styles.tabText, activeSection === 'paypal' && styles.tabTextActive]}>
            PayPal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'smtp' && styles.tabActive]}
          onPress={() => setActiveSection('smtp')}
        >
          <FileText size={18} color={activeSection === 'smtp' ? '#8B5CF6' : '#64748B'} />
          <Text style={[styles.tabText, activeSection === 'smtp' && styles.tabTextActive]}>
            SMTP
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeSection === 'keys' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Key size={24} color="#EF4444" />
                <Text style={styles.sectionTitle}>Clés Vapi.ai</Text>
              </View>
              <View style={styles.card}>
                <SecretInput
                  label="Clé Secrète Vapi.ai"
                  value={localKeys.vapiSecretKey}
                  onChangeText={(text) => setLocalKeys({ ...localKeys, vapiSecretKey: text })}
                  fieldKey="vapiSecretKey"
                  placeholder="sk_live_xxxxxxxxxxxxxxxx"
                />
                <SecretInput
                  label="Webhook Secret Key"
                  value={localKeys.vapiWebhookSecret}
                  onChangeText={(text) => setLocalKeys({ ...localKeys, vapiWebhookSecret: text })}
                  fieldKey="vapiWebhookSecret"
                  placeholder="whsec_xxxxxxxxxxxxxxxx"
                />
                <Text style={styles.helpText}>
                  Ces clés permettent la communication avec Vapi.ai et la vérification HMAC des webhooks
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Lock size={24} color="#F59E0B" />
                <Text style={styles.sectionTitle}>CPaaS (Téléphonie)</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Fournisseur</Text>
                  <TextInput
                    style={styles.input}
                    value={localKeys.cpaasProvider}
                    onChangeText={(text) => setLocalKeys({ ...localKeys, cpaasProvider: text })}
                    placeholder="Twilio, Vonage, etc."
                    placeholderTextColor="#64748B"
                  />
                </View>
                <SecretInput
                  label="Account SID"
                  value={localKeys.cpaasAccountSid}
                  onChangeText={(text) => setLocalKeys({ ...localKeys, cpaasAccountSid: text })}
                  fieldKey="cpaasAccountSid"
                  placeholder="ACxxxxxxxxxxxxxxxx"
                />
                <SecretInput
                  label="Auth Token"
                  value={localKeys.cpaasAuthToken}
                  onChangeText={(text) => setLocalKeys({ ...localKeys, cpaasAuthToken: text })}
                  fieldKey="cpaasAuthToken"
                  placeholder="xxxxxxxxxxxxxxxx"
                />
                <Text style={styles.helpText}>
                  Utilisé pour gérer les renvois d&apos;appels et les numéros virtuels
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Cloud size={24} color="#10B981" />
                <Text style={styles.sectionTitle}>Stockage Cloud</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Fournisseur</Text>
                  <TextInput
                    style={styles.input}
                    value={localKeys.cloudStorageProvider}
                    onChangeText={(text) => setLocalKeys({ ...localKeys, cloudStorageProvider: text })}
                    placeholder="Google Cloud Storage"
                    placeholderTextColor="#64748B"
                  />
                </View>
                <SecretInput
                  label="Credentials JSON (Service Account Key)"
                  value={localKeys.cloudStorageKey}
                  onChangeText={(text) => setLocalKeys({ ...localKeys, cloudStorageKey: text })}
                  fieldKey="cloudStorageKey"
                  placeholder="Service account JSON key"
                />
                <Text style={styles.helpText}>
                  Pour le stockage des enregistrements audio des appels
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateKeys}>
                <Save size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Enregistrer les clés API</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeSection === 'agent' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Bot size={24} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>Prompt par Défaut</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.helpText}>
                  Ce prompt sert de base à tous les utilisateurs. Utilisez les variables suivantes :
                  {'\n'}• [USER_NAME] - Nom de l&apos;utilisateur
                  {'\n'}• [PROFESSION] - Profession de l&apos;utilisateur
                  {'\n'}• [LANGUAGE] - Langue de l&apos;utilisateur
                </Text>
                <TextInput
                  style={styles.textArea}
                  value={localSettings.defaultPrompt}
                  onChangeText={(text) => setLocalSettings({ ...localSettings, defaultPrompt: text })}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  placeholder="Entrez le prompt par défaut..."
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Paramètres IA</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Langue par défaut</Text>
                  <TextInput
                    style={styles.input}
                    value={localSettings.defaultLanguage}
                    onChangeText={(text) => setLocalSettings({ ...localSettings, defaultLanguage: text })}
                    placeholder="fr"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Type de voix</Text>
                  <TextInput
                    style={styles.input}
                    value={localSettings.defaultVoiceType}
                    onChangeText={(text) => setLocalSettings({ ...localSettings, defaultVoiceType: text })}
                    placeholder="fr-FR-Neural"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Température</Text>
                    <TextInput
                      style={styles.input}
                      value={localSettings.defaultTemperature.toString()}
                      onChangeText={(text) => {
                        const val = parseFloat(text) || 0;
                        setLocalSettings({ ...localSettings, defaultTemperature: val });
                      }}
                      placeholder="0.5"
                      placeholderTextColor="#64748B"
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.helpTextSmall}>Entre 0 et 1</Text>
                  </View>

                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Max Tokens</Text>
                    <TextInput
                      style={styles.input}
                      value={localSettings.defaultMaxTokens.toString()}
                      onChangeText={(text) => {
                        const val = parseInt(text) || 0;
                        setLocalSettings({ ...localSettings, defaultMaxTokens: val });
                      }}
                      placeholder="250"
                      placeholderTextColor="#64748B"
                      keyboardType="number-pad"
                    />
                    <Text style={styles.helpTextSmall}>Limite de réponse</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateSettings}>
                <Save size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Enregistrer les paramètres</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeSection === 'pricing' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <DollarSign size={24} color="#10B981" />
                <Text style={styles.sectionTitle}>Gestion des Packs d&apos;Abonnement</Text>
              </View>
              <Text style={styles.pricingDescription}>
                Créez, modifiez ou supprimez des packs d&apos;abonnement. Chaque pack peut avoir un nom, un prix, des minutes et des avantages personnalisés.
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setIsCreatingPlan(true)}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.createButtonText}>Ajouter un nouveau pack</Text>
              </TouchableOpacity>

              {isCreatingPlan && (
                <View style={styles.createPlanCard}>
                  <Text style={styles.createPlanTitle}>Nouveau Pack d&apos;Abonnement</Text>
                  
                  <View style={styles.pricingInputGroup}>
                    <Text style={styles.pricingInputLabel}>ID du pack *</Text>
                    <TextInput
                      style={styles.pricingInput}
                      value={newPlan.id}
                      onChangeText={(text) => setNewPlan({ ...newPlan, id: text.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="ex: pack-decouverte"
                      placeholderTextColor="#64748B"
                    />
                  </View>

                  <View style={styles.pricingInputGroup}>
                    <Text style={styles.pricingInputLabel}>Nom du pack *</Text>
                    <TextInput
                      style={styles.pricingInput}
                      value={newPlan.name}
                      onChangeText={(text) => setNewPlan({ ...newPlan, name: text })}
                      placeholder="ex: Pack Découverte"
                      placeholderTextColor="#64748B"
                    />
                  </View>

                  <View style={styles.pricingInputGroup}>
                    <Text style={styles.pricingInputLabel}>Minutes incluses *</Text>
                    <TextInput
                      style={styles.pricingInput}
                      value={newPlan.minutesIncluded > 0 ? newPlan.minutesIncluded.toString() : ''}
                      onChangeText={(text) => setNewPlan({ ...newPlan, minutesIncluded: parseInt(text) || 0 })}
                      placeholder="ex: 100"
                      placeholderTextColor="#64748B"
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.pricingInputGroup}>
                    <Text style={styles.pricingInputLabel}>Prix (€) *</Text>
                    <TextInput
                      style={styles.pricingInput}
                      value={newPlan.price > 0 ? newPlan.price.toString() : ''}
                      onChangeText={(text) => setNewPlan({ ...newPlan, price: parseFloat(text) || 0 })}
                      placeholder="ex: 35"
                      placeholderTextColor="#64748B"
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={styles.pricingInputGroup}>
                    <Text style={styles.pricingInputLabel}>Avantages du pack (un par ligne) *</Text>
                    <TextInput
                      style={[styles.pricingInput, { minHeight: 150 }]}
                      value={newPlan.features}
                      onChangeText={(text) => setNewPlan({ ...newPlan, features: text })}
                      placeholder={"100 minutes incluses\n1 utilisateur\nPrompt personnalisé\nTranscription complète\nHistorique des appels\nSupport email"}
                      placeholderTextColor="#64748B"
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                    />
                  </View>

                  <View style={styles.pricingActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setIsCreatingPlan(false);
                        setNewPlan({
                          id: '',
                          name: '',
                          minutesIncluded: 0,
                          price: 0,
                          features: '',
                          isRecommended: false,
                        });
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.savePlanButton}
                      onPress={handleCreatePlan}
                      disabled={createPlanMutation.isPending}
                    >
                      {createPlanMutation.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.savePlanButtonText}>Créer le Pack</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {pricingPlansQuery.isLoading && (
                <View style={styles.loadingPricing}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text style={styles.loadingText}>Chargement des packs...</Text>
                </View>
              )}

              {!pricingPlansQuery.isLoading && (pricingPlansQuery.data?.plans || SUBSCRIPTION_PLANS.map((p: any) => ({
                id: p.id,
                name: p.name,
                minutesIncluded: p.minutesIncluded,
                price: p.price,
                features: p.features,
                isRecommended: p.isRecommended || false,
              }))).filter((plan: any) => plan.id !== 'enterprise').map((plan: any) => {
                const isEditing = editingPlan === plan.id;
                const edits = planEdits[plan.id] || {};

                return (
                  <View key={plan.id} style={styles.pricingCard}>
                    <View style={styles.pricingHeader}>
                      <Text style={styles.pricingPlanName}>{plan.name}</Text>
                      {!isEditing && (
                        <View style={styles.pricingHeaderActions}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => {
                              console.log('[EditButton] Plan ID:', plan.id);
                              console.log('[EditButton] Current editingPlan:', editingPlan);
                              console.log('[EditButton] Plan data:', plan);
                              handleEditPlan(plan.id);
                              console.log('[EditButton] After handleEditPlan, editingPlan should be:', plan.id);
                            }}
                            activeOpacity={0.7}
                          >
                            <Edit2 size={18} color="#fff" />
                            <Text style={styles.editButtonText}>Modifier</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeletePlan(plan.id, plan.name)}
                            activeOpacity={0.7}
                          >
                            <Trash2 size={18} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {isEditing ? (
                      <>
                        <View style={styles.pricingInputGroup}>
                          <Text style={styles.pricingInputLabel}>Nom du pack</Text>
                          <TextInput
                            style={styles.pricingInput}
                            value={edits.name !== undefined ? edits.name : plan.name}
                            onChangeText={(text) => {
                              const currentEdits = planEdits[plan.id] || {};
                              setPlanEdits({
                                ...planEdits,
                                [plan.id]: { 
                                  ...currentEdits, 
                                  name: text,
                                  price: currentEdits.price !== undefined ? currentEdits.price : plan.price,
                                  minutesIncluded: currentEdits.minutesIncluded !== undefined ? currentEdits.minutesIncluded : plan.minutesIncluded,
                                  features: currentEdits.features || plan.features,
                                  isRecommended: currentEdits.isRecommended !== undefined ? currentEdits.isRecommended : plan.isRecommended,
                                },
                              });
                            }}
                            placeholderTextColor="#64748B"
                          />
                        </View>

                        <View style={styles.pricingInputGroup}>
                          <Text style={styles.pricingInputLabel}>Minutes incluses</Text>
                          <TextInput
                            style={styles.pricingInput}
                            value={edits.minutesIncluded !== undefined ? edits.minutesIncluded.toString() : plan.minutesIncluded.toString()}
                            onChangeText={(text) => {
                              const val = parseInt(text) || 0;
                              const currentEdits = planEdits[plan.id] || {};
                              console.log('[Minutes onChange] Setting minutes for plan:', plan.id, 'to:', val);
                              setPlanEdits({
                                ...planEdits,
                                [plan.id]: { 
                                  ...currentEdits, 
                                  minutesIncluded: val,
                                  name: currentEdits.name || plan.name,
                                  price: currentEdits.price !== undefined ? currentEdits.price : plan.price,
                                  features: currentEdits.features || plan.features,
                                  isRecommended: currentEdits.isRecommended !== undefined ? currentEdits.isRecommended : plan.isRecommended,
                                },
                              });
                            }}
                            keyboardType="number-pad"
                            placeholderTextColor="#64748B"
                          />
                        </View>

                        <View style={styles.pricingInputGroup}>
                          <Text style={styles.pricingInputLabel}>Prix (€)</Text>
                          <TextInput
                            style={styles.pricingInput}
                            value={edits.price !== undefined ? edits.price.toString() : plan.price.toString()}
                            onChangeText={(text) => {
                              const val = parseFloat(text) || 0;
                              const currentEdits = planEdits[plan.id] || {};
                              console.log('[Price onChange] Setting price for plan:', plan.id, 'to:', val);
                              setPlanEdits({
                                ...planEdits,
                                [plan.id]: { 
                                  ...currentEdits, 
                                  price: val,
                                  name: currentEdits.name || plan.name,
                                  minutesIncluded: currentEdits.minutesIncluded !== undefined ? currentEdits.minutesIncluded : plan.minutesIncluded,
                                  features: currentEdits.features || plan.features,
                                  isRecommended: currentEdits.isRecommended !== undefined ? currentEdits.isRecommended : plan.isRecommended,
                                },
                              });
                            }}
                            keyboardType="decimal-pad"
                            placeholderTextColor="#64748B"
                          />
                        </View>

                        <View style={styles.pricingInputGroup}>
                          <Text style={styles.pricingInputLabel}>Avantages (un par ligne)</Text>
                          <TextInput
                            style={[styles.pricingInput, { minHeight: 100 }]}
                            value={edits.features !== undefined ? edits.features.join('\n') : plan.features.join('\n')}
                            onChangeText={(text) => {
                              const currentEdits = planEdits[plan.id] || {};
                              const featuresArray = text.split('\n').map(f => f.trim()).filter(f => f.length > 0);
                              setPlanEdits({
                                ...planEdits,
                                [plan.id]: { 
                                  ...currentEdits, 
                                  features: featuresArray,
                                  name: currentEdits.name || plan.name,
                                  price: currentEdits.price !== undefined ? currentEdits.price : plan.price,
                                  minutesIncluded: currentEdits.minutesIncluded !== undefined ? currentEdits.minutesIncluded : plan.minutesIncluded,
                                  isRecommended: currentEdits.isRecommended !== undefined ? currentEdits.isRecommended : plan.isRecommended,
                                },
                              });
                            }}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            placeholderTextColor="#64748B"
                          />
                        </View>

                        <View style={styles.pricingActions}>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelEdit}
                          >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.savePlanButton}
                            onPress={() => handleSavePlan(plan.id)}
                            disabled={updatePlanMutation.isPending}
                          >
                            {updatePlanMutation.isPending ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Text style={styles.savePlanButtonText}>Enregistrer</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.pricingDetail}>
                          <Text style={styles.pricingDetailLabel}>Minutes</Text>
                          <Text style={styles.pricingDetailValue}>{plan.minutesIncluded}</Text>
                        </View>
                        <View style={styles.pricingDetail}>
                          <Text style={styles.pricingDetailLabel}>Prix</Text>
                          <Text style={styles.pricingDetailValue}>€{plan.price}</Text>
                        </View>
                      </>
                    )}
                  </View>
                );
              })}

              {!pricingPlansQuery.isLoading && !pricingPlansQuery.data?.plans && SUBSCRIPTION_PLANS.length === 0 && (
                <View style={styles.emptyPricing}>
                  <Text style={styles.emptyPricingText}>Aucun pack disponible</Text>
                </View>
              )}
            </View>
          </>
        )}

        {activeSection === 'cgu' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={24} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Conditions Générales d&apos;Utilisation</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.helpText}>
                  Modifiez le texte des CGU affiché lors de l&apos;inscription des utilisateurs.
                </Text>
                <TextInput
                  style={[styles.textArea, { minHeight: 300 }]}
                  value={localCGU}
                  onChangeText={setLocalCGU}
                  multiline
                  numberOfLines={15}
                  textAlignVertical="top"
                  placeholder="Entrez les Conditions Générales d'Utilisation..."
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={() => updateCGUMutation.mutate({ content: localCGU })}
                disabled={updateCGUMutation.isPending}
              >
                {updateCGUMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Save size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Enregistrer les CGU</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeSection === 'paypal' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <DollarSign size={24} color="#10B981" />
                <Text style={styles.sectionTitle}>Configuration PayPal</Text>
              </View>
              <Text style={styles.pricingDescription}>
                Configurez vos identifiants PayPal pour activer les paiements dans votre application.
              </Text>

              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mode PayPal</Text>
                  <View style={styles.modeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        localPayPalSettings.mode === 'sandbox' && styles.modeButtonActive,
                      ]}
                      onPress={() => setLocalPayPalSettings({ ...localPayPalSettings, mode: 'sandbox' })}
                    >
                      <Text
                        style={[
                          styles.modeButtonText,
                          localPayPalSettings.mode === 'sandbox' && styles.modeButtonTextActive,
                        ]}
                      >
                        Sandbox (Test)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        localPayPalSettings.mode === 'live' && styles.modeButtonActive,
                      ]}
                      onPress={() => setLocalPayPalSettings({ ...localPayPalSettings, mode: 'live' })}
                    >
                      <Text
                        style={[
                          styles.modeButtonText,
                          localPayPalSettings.mode === 'live' && styles.modeButtonTextActive,
                        ]}
                      >
                        Live (Production)
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helpText}>
                    Utilisez le mode Sandbox pour tester les paiements, et Live pour la production.
                  </Text>
                </View>

                <SecretInput
                  label="Client ID PayPal"
                  value={localPayPalSettings.clientId}
                  onChangeText={(text) => setLocalPayPalSettings({ ...localPayPalSettings, clientId: text })}
                  fieldKey="paypalClientId"
                  placeholder="AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />

                <SecretInput
                  label="Client Secret PayPal"
                  value={localPayPalSettings.clientSecret}
                  onChangeText={(text) => setLocalPayPalSettings({ ...localPayPalSettings, clientSecret: text })}
                  fieldKey="paypalClientSecret"
                  placeholder="EXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />

                <Text style={styles.helpText}>
                  Obtenez vos identifiants PayPal depuis le{' '}
                  <Text style={styles.linkText}>Dashboard PayPal Developer</Text>.
                  {localPayPalSettings.mode === 'sandbox' ? 
                    ' Utilisez les identifiants Sandbox pour les tests.' : 
                    ' Utilisez les identifiants Live pour la production.'}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (!localPayPalSettings.clientId || !localPayPalSettings.clientSecret) {
                    Alert.alert('Erreur', 'Veuillez remplir tous les champs');
                    return;
                  }
                  updatePayPalSettingsMutation.mutate(localPayPalSettings);
                }}
                disabled={updatePayPalSettingsMutation.isPending}
              >
                {updatePayPalSettingsMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Save size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Enregistrer PayPal</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeSection === 'smtp' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={24} color="#10B981" />
                <Text style={styles.sectionTitle}>Configuration SMTP pour Emails</Text>
              </View>
              <Text style={styles.pricingDescription}>
                Configurez vos identifiants SMTP pour l&apos;envoi d&apos;emails (réinitialisation de mot de passe, notifications, etc.).
                Vous pouvez utiliser Twilio SendGrid, Gmail, ou tout autre service SMTP.
              </Text>

              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hôte SMTP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="smtp.sendgrid.net"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Port SMTP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="587"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                  />
                </View>

                <SecretInput
                  label="Nom d&apos;utilisateur SMTP"
                  value=""
                  onChangeText={(text) => {}}
                  fieldKey="smtpUsername"
                  placeholder="apikey (pour SendGrid)"
                />

                <SecretInput
                  label="Mot de passe SMTP / API Key"
                  value=""
                  onChangeText={(text) => {}}
                  fieldKey="smtpPassword"
                  placeholder="SG.xxxxxxxxxxxxxxxx"
                />

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email expéditeur</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="noreply@votre-domaine.com"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nom de l&apos;expéditeur</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VocaIA"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <Text style={styles.helpText}>
                  <Text style={styles.linkText}>Twilio SendGrid</Text>: Utilisez &apos;smtp.sendgrid.net&apos; (port 587), username: &apos;apikey&apos;, password: votre API Key SendGrid.
                  {"\n"}
                  <Text style={styles.linkText}>Gmail</Text>: Utilisez &apos;smtp.gmail.com&apos; (port 587) avec un mot de passe d&apos;application.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  Alert.alert('Info', 'La configuration SMTP sera bientôt disponible. Contactez le support pour l\'activer.');
                }}
              >
                <Save size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Enregistrer SMTP</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeSection === 'countries' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Globe size={24} color="#10B981" />
                <Text style={styles.sectionTitle}>Gestion des Pays Autorisés</Text>
              </View>
              <Text style={styles.pricingDescription}>
                Contrôlez les pays autorisés pour l&apos;inscription. Seuls les utilisateurs avec un indicatif de ces pays pourront s&apos;inscrire.
              </Text>

              <View style={styles.card}>
                <Text style={styles.inputLabel}>Ajouter un code pays</Text>
                <View style={styles.addCountryContainer}>
                  <TextInput
                    style={styles.countryInput}
                    value={newCountryCode}
                    onChangeText={setNewCountryCode}
                    placeholder="Ex: +1, +33, +212"
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.addCountryButton}
                    onPress={() => {
                      const trimmed = newCountryCode.trim();
                      if (!trimmed) {
                        Alert.alert('Erreur', 'Veuillez entrer un code pays');
                        return;
                      }
                      if (localAllowedCountries.includes(trimmed)) {
                        Alert.alert('Erreur', 'Ce code pays est déjà dans la liste');
                        return;
                      }
                      setLocalAllowedCountries([...localAllowedCountries, trimmed]);
                      setNewCountryCode('');
                    }}
                  >
                    <Plus size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helpText}>
                  Le code doit commencer par + suivi du code pays (ex: +1 pour USA/Canada, +33 pour France)
                </Text>
              </View>

              {localAllowedCountries.length > 0 ? (
                <View style={styles.countriesList}>
                  <Text style={styles.countriesListTitle}>Pays autorisés actuellement :</Text>
                  {localAllowedCountries.map((code, index) => (
                    <View key={index} style={styles.countryItem}>
                      <Text style={styles.countryCode}>{code}</Text>
                      <TouchableOpacity
                        style={styles.removeCountryButton}
                        onPress={() => {
                          setLocalAllowedCountries(localAllowedCountries.filter(c => c !== code));
                        }}
                      >
                        <Trash2 size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCountries}>
                  <Text style={styles.emptyCountriesText}>Aucun pays autorisé. Ajoutez au moins un code pays.</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (localAllowedCountries.length === 0) {
                    Alert.alert('Erreur', 'Vous devez autoriser au moins un pays');
                    return;
                  }
                  updateAllowedCountriesMutation.mutate({ allowedCountries: localAllowedCountries });
                }}
                disabled={updateAllowedCountriesMutation.isPending}
              >
                {updateAllowedCountriesMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Save size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Enregistrer les pays autorisés</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningBox}>
          <Lock size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            Ces clés sont stockées localement pour la démonstration. En production, utilisez un gestionnaire de secrets sécurisé (Vault, AWS Secrets Manager, etc.)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabActive: {
    backgroundColor: '#1E293B',
    borderColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secretInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secretInput: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    color: '#fff',
  },
  eyeButton: {
    padding: 16,
  },
  textArea: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 150,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  helpText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 18,
  },
  helpTextSmall: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#78350F',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#FCD34D',
    lineHeight: 18,
  },
  pricingDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 20,
  },
  pricingCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pricingPlanName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  pricingDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pricingDetailLabel: {
    fontSize: 15,
    color: '#94A3B8',
  },
  pricingDetailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  pricingInputGroup: {
    marginBottom: 12,
  },
  pricingInputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  pricingInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pricingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  savePlanButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  savePlanButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  loadingPricing: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyPricing: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPricingText: {
    fontSize: 16,
    color: '#64748B',
  },
  pricingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
    marginBottom: 20,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  createPlanCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 20,
  },
  createPlanTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10B981',
    marginBottom: 16,
  },
  pricingHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  addCountryContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  countryInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  addCountryButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countriesList: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  countriesListTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#E2E8F0',
    marginBottom: 12,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  countryCode: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  removeCountryButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 10,
  },
  emptyCountries: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyCountriesText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  linkText: {
    color: '#8B5CF6',
    fontWeight: '600' as const,
  },
});
