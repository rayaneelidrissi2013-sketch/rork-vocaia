import React, { useState, useEffect } from 'react';
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
import { Bot, Save, LogOut, Globe, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GlobalSettings() {
  const { globalSettings, updateGlobalSettings } = useAdmin();
  const { logout } = useAuth();
  const router = useRouter();
  const [localSettings, setLocalSettings] = useState(globalSettings);
  const [allowedCountries, setAllowedCountries] = useState<string[]>(['+1']);
  const [newCountryCode, setNewCountryCode] = useState<string>('');
  const [isLoadingCountries, setIsLoadingCountries] = useState<boolean>(true);
  
  useEffect(() => {
    loadAllowedCountries();
  }, []);
  
  const loadAllowedCountries = async () => {
    try {
      setIsLoadingCountries(true);
      const stored = await AsyncStorage.getItem('allowed_countries');
      if (stored) {
        const countries = JSON.parse(stored);
        setAllowedCountries(countries);
        console.log('[GlobalSettings] Loaded allowed countries:', countries);
      } else {
        setAllowedCountries(['+1']);
      }
    } catch (error) {
      console.error('[GlobalSettings] Error loading allowed countries:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des pays autorisés');
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateGlobalSettings(localSettings);
      Alert.alert('Succès', 'Les paramètres globaux ont été mis à jour');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour les paramètres');
    }
  };
  
  const handleAddCountry = () => {
    const trimmedCode = newCountryCode.trim();
    
    if (!trimmedCode) {
      Alert.alert('Erreur', 'Veuillez entrer un code pays');
      return;
    }
    
    if (!trimmedCode.startsWith('+')) {
      Alert.alert('Erreur', 'Le code pays doit commencer par +');
      return;
    }
    
    if (allowedCountries.includes(trimmedCode)) {
      Alert.alert('Erreur', 'Ce code pays est déjà dans la liste');
      return;
    }
    
    const updatedCountries = [...allowedCountries, trimmedCode];
    setAllowedCountries(updatedCountries);
    setNewCountryCode('');
    saveAllowedCountries(updatedCountries);
  };
  
  const handleRemoveCountry = (code: string) => {
    Alert.alert(
      'Supprimer le pays',
      `Voulez-vous vraiment supprimer ${code} de la liste des pays autorisés ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updatedCountries = allowedCountries.filter(c => c !== code);
            setAllowedCountries(updatedCountries);
            saveAllowedCountries(updatedCountries);
          },
        },
      ]
    );
  };
  
  const saveAllowedCountries = async (countries: string[]) => {
    try {
      await AsyncStorage.setItem('allowed_countries', JSON.stringify(countries));
      console.log('[GlobalSettings] Saved allowed countries:', countries);
      Alert.alert('Succès', 'La liste des pays autorisés a été mise à jour');
    } catch (error) {
      console.error('[GlobalSettings] Error saving allowed countries:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la liste des pays');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/admin-login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Modèle d&apos;Agent Global</Text>
          <Text style={styles.subtitle}>Configuration par défaut pour tous les agents</Text>
        </View>

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
          <View style={styles.sectionHeader}>
            <Globe size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Pays Autorisés</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.helpText}>
              Contrôlez les pays depuis lesquels les utilisateurs peuvent s&apos;inscrire.
              Ajoutez les codes pays au format international (ex: +1, +33, +212).
            </Text>
            
            {isLoadingCountries ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
              </View>
            ) : (
              <>
                <View style={styles.countryList}>
                  {allowedCountries.map((code) => (
                    <View key={code} style={styles.countryChip}>
                      <Text style={styles.countryCode}>{code}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveCountry(code)}
                        style={styles.removeButton}
                      >
                        <X size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                
                <View style={styles.addCountryRow}>
                  <TextInput
                    style={styles.countryInput}
                    value={newCountryCode}
                    onChangeText={setNewCountryCode}
                    placeholder="+1, +33, +212..."
                    placeholderTextColor="#64748B"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddCountry}
                  >
                    <Text style={styles.addButtonText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Enregistrer les clés API</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 22,
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
    fontSize: 20,
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
  textArea: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 200,
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
    color: '#94A3B8',
    lineHeight: 20,
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  countryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    gap: 8,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCountryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
