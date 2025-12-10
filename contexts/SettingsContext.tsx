import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { SettingsContextType, AIAgentSettings } from '@/types';
import { mockSettings } from '@/mocks/data';

const SETTINGS_STORAGE_KEY = 'ai_agent_settings';

export const [SettingsProvider, useSettings] = createContextHook((): SettingsContextType => {
  const [settings, setSettings] = useState<AIAgentSettings>(mockSettings);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('[Settings] Initializing with defaults immediately');
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('[Settings] Loading settings from storage in background...');
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
        console.log('[Settings] Loaded settings from storage:', parsed);
      } else {
        const defaultSettings = { ...mockSettings, isEnabled: false };
        setSettings(defaultSettings);
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
        console.log('[Settings] Initialized with default settings (isEnabled: false)');
      }
    } catch (error) {
      console.error('[Settings] Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AIAgentSettings>) => {
    setIsLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAIAgent = async (minutesRemaining?: number, vapiPhoneNumber?: string, countryCode?: string) => {
    if (settings.isEnabled) {
      handleDeactivation(vapiPhoneNumber, countryCode);
      return;
    }

    if (minutesRemaining === undefined || minutesRemaining <= 0) {
      Alert.alert(
        'Crédit épuisé',
        'Vous n\'avez plus de minutes disponibles. Veuillez passer à un forfait supérieur.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (vapiPhoneNumber && countryCode) {
      const cleanedVirtualNumber = vapiPhoneNumber.replace(/[\s\-\.\(\)]/g, '');
      
      let ccfCode = '*61*';
      if (countryCode === '+212') {
        ccfCode = '**61*';
      } else if (countryCode === '+1') {
        ccfCode = '*61*';
      }
      
      const virtualNumber = cleanedVirtualNumber;
      const deepLink = `tel:${ccfCode}${virtualNumber}#`;
      
      console.log('[Settings] Deep link generated:', deepLink);
      
      Alert.alert(
        '✅ Activation de l\'Agent IA',
        `Pour finaliser l'activation, composez le code de renvoi d'appel sur votre téléphone.\n\n➡️ Code à composer :\n${ccfCode}${virtualNumber}#\n\nAppuyez sur "Composer" pour ouvrir automatiquement votre clavier téléphonique.`,
        [
          {
            text: 'Composer',
            onPress: async () => {
              if (Platform.OS !== 'web') {
                Linking.openURL(deepLink).catch(err => {
                  console.error('Erreur lors de l\'ouverture du lien:', err);
                  Alert.alert(
                    'ℹ️ Composer Manuellement',
                    `Composez ce code sur votre téléphone :\n\n${ccfCode}${virtualNumber}#\n\nCe code active le transfert d'appel vers votre Agent IA.`,
                    [{ text: 'OK' }]
                  );
                });
              } else {
                Alert.alert(
                  'ℹ️ Code de Renvoi',
                  `Composez ce code sur votre téléphone :\n\n${ccfCode}${virtualNumber}#\n\nCe code active le transfert d'appel vers votre Agent IA.`,
                  [{ text: 'OK' }]
                );
              }
              await updateSettings({ isEnabled: true });
            },
          },
          { 
            text: 'Plus tard', 
            style: 'cancel',
            onPress: () => {
              console.log('[Settings] User cancelled activation');
            },
          },
        ]
      );
    } else {
      await updateSettings({ isEnabled: !settings.isEnabled });
    }
  };

  const handleDeactivation = (vapiPhoneNumber?: string, countryCode?: string) => {
    if (vapiPhoneNumber && countryCode) {
      let deactivationCode = '#61#';
      if (countryCode === '+212') {
        deactivationCode = '##61#';
      } else if (countryCode === '+1') {
        deactivationCode = '#61#';
      } else {
        deactivationCode = '##002#';
      }
      
      const deepLink = `tel:${deactivationCode}`;
      
      console.log('[Settings] Deactivation deep link generated:', deepLink);
      
      Alert.alert(
        '🔴 Désactivation de l\'Agent IA',
        `Pour finaliser la désactivation, annulez le renvoi d'appel sur votre téléphone.\n\n➡️ Code à composer :\n${deactivationCode}\n\nAppuyez sur "Annuler le Transfert" pour ouvrir automatiquement votre clavier téléphonique.`,
        [
          {
            text: 'Annuler le Transfert',
            onPress: async () => {
              await updateSettings({ isEnabled: false });
              
              if (Platform.OS !== 'web') {
                Linking.openURL(deepLink).catch(err => {
                  console.error('Erreur lors de l\'ouverture du lien:', err);
                  Alert.alert(
                    'ℹ️ Composer Manuellement',
                    `Composez ce code sur votre téléphone :\n\n${deactivationCode}\n\nCe code annule le transfert d'appel.`,
                    [{ text: 'OK' }]
                  );
                });
              } else {
                Alert.alert(
                  'ℹ️ Code d\'Annulation',
                  `Composez ce code sur votre téléphone :\n\n${deactivationCode}\n\nCe code annule le transfert d'appel.`,
                  [{ text: 'OK' }]
                );
              }
            },
          },
          { 
            text: 'Plus tard', 
            style: 'cancel',
            onPress: () => {
              console.log('[Settings] User cancelled deactivation');
            },
          },
        ]
      );
    } else {
      updateSettings({ isEnabled: false });
    }
  };

  return {
    settings,
    isLoading,
    updateSettings,
    toggleAIAgent,
  };
});
