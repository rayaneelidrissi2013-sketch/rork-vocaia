import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Clock, MessageSquare, Save } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleAIAgentActivationNotification, scheduleAIAgentDeactivationNotification } from '@/utils/notifications';



export default function SettingsScreen() {
  const { settings, updateSettings, toggleAIAgent } = useSettings();
  const { user } = useAuth();
  const [localSubscription, setLocalSubscription] = useState<any>(null);
  const [prompt, setPrompt] = useState<string>(settings.prompt);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [activationDate, setActivationDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  React.useEffect(() => {
    const loadSubscription = async () => {
      try {
        const stored = await AsyncStorage.getItem('user_subscription_mock');
        if (stored) {
          const parsed = JSON.parse(stored);
          setLocalSubscription(parsed);
          console.log('[Settings] Loaded subscription:', parsed);
        }
      } catch (error) {
        console.error('[Settings] Error loading subscription:', error);
      }
    };
    loadSubscription();
  }, []);

  const handlePromptChange = (text: string) => {
    setPrompt(text);
    setHasChanges(true);
  };

  const handleSavePrompt = async () => {
    try {
      await updateSettings({ prompt });
      setHasChanges(false);
      Alert.alert('Succès', 'Le prompt a été mis à jour');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder le prompt');
    }
  };

  const handleSaveActivationDate = async () => {
    if (!activationDate) {
      Alert.alert('Erreur', 'Veuillez saisir une date d\'activation');
      return;
    }

    if (!startTime || !endTime) {
      Alert.alert('Erreur', 'Veuillez saisir l\'heure de début et l\'heure de fin');
      return;
    }

    try {
      if (!user?.vapiPhoneNumber || !user?.countryCode) {
        Alert.alert('Erreur', 'Informations utilisateur manquantes');
        return;
      }

      const activationNotificationId = await scheduleAIAgentActivationNotification(
        activationDate,
        startTime,
        endTime,
        user.vapiPhoneNumber,
        user.countryCode
      );

      const deactivationNotificationId = await scheduleAIAgentDeactivationNotification(
        activationDate,
        endTime,
        user.countryCode
      );
      
      console.log('[Settings] Activation and deactivation scheduled:', { 
        date: activationDate, 
        startTime, 
        endTime,
        activationNotificationId,
        deactivationNotificationId
      });
      
      Alert.alert(
        'Succès',
        `L'agent IA sera activé le ${activationDate} de ${startTime} à ${endTime}.\n\nVous recevrez deux notifications :\n1. Pour activer le transfert d'appel à ${startTime}\n2. Pour désactiver le transfert d'appel à ${endTime}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setActivationDate('');
              setStartTime('');
              setEndTime('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('[Settings] Error scheduling activation:', error);
      Alert.alert('Erreur', 'Impossible de programmer l\'activation');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Paramètres</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bot size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Agent IA</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Activer l&apos;agent IA</Text>
                <Text style={styles.settingDescription}>
                  L&apos;agent répondra automatiquement aux appels entrants
                </Text>
              </View>
              <Switch
                value={settings.isEnabled}
                onValueChange={() => {
                  console.log('[Settings] Toggle AI Agent clicked', {
                    currentEnabled: settings.isEnabled,
                    minutesRemaining: localSubscription?.minutesRemaining,
                    vapiPhoneNumber: user?.vapiPhoneNumber,
                    countryCode: user?.countryCode,
                  });
                  toggleAIAgent(
                    localSubscription?.minutesRemaining,
                    user?.vapiPhoneNumber,
                    user?.countryCode || '+33'
                  );
                }}
                trackColor={{ false: '#334155', true: '#3B82F6' }}
                thumbColor="#fff"
                ios_backgroundColor="#334155"
                disabled={!localSubscription || (localSubscription.minutesRemaining === 0 && !settings.isEnabled)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Personnaliser votre agent IA</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Prompt personnalisé</Text>
            <Text style={styles.helpText}>
              Personnalisez le message de votre agent IA et adaptez-le à votre activité pour mieux gérer vos appels entrants. Ce prompt permet à l&apos;agent de présenter votre entreprise et de gérer efficacement les demandes de vos appelants.
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Exemple : Bonjour, je suis l'assistant vocal de [Nom de votre entreprise]. [Prénom Nom] est actuellement [statut - en réunion/indisponible]. Je peux prendre votre message et vous aider avec [services proposés]. Comment puis-je vous assister aujourd'hui ?"
              placeholderTextColor="#64748B"
              value={prompt}
              onChangeText={handlePromptChange}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            {hasChanges && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePrompt}>
                <Save size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Programmer l&apos;activation de l&apos;agent IA</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.scheduleDescription}>
              Définissez une date et des horaires pour activer automatiquement l&apos;agent IA
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date d&apos;activation</Text>
              <TextInput
                style={styles.dateInput}
                value={activationDate}
                onChangeText={setActivationDate}
                placeholder="JJ/MM/AAAA"
                placeholderTextColor="#64748B"
              />
            </View>
            <View style={styles.timeRow}>
              <View style={[styles.inputGroup, styles.timeInputGroup]}>
                <Text style={styles.inputLabel}>Heure de début</Text>
                <TextInput
                  style={styles.dateInput}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#64748B"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={[styles.inputGroup, styles.timeInputGroup]}>
                <Text style={styles.inputLabel}>Heure de fin</Text>
                <TextInput
                  style={styles.dateInput}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#64748B"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveActivationDate}
            >
              <Save size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Programmer l&apos;activation</Text>
            </TouchableOpacity>
            <Text style={styles.helpText}>
              L&apos;agent IA sera automatiquement activé à la date et aux heures indiquées. Format attendu : JJ/MM/AAAA pour la date et HH:MM pour les heures (exemple : 25/12/2025, 09:00, 18:00)
            </Text>
          </View>
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E2E8F0',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 120,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  dateInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputGroup: {
    flex: 1,
  },
});
