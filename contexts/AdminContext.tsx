import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { AdminContextType, APIKeys, GlobalAgentSettings, VirtualNumber, AdminUser } from '@/types';

const API_KEYS_STORAGE = 'admin_api_keys';
const VIRTUAL_NUMBERS_STORAGE = 'admin_virtual_numbers';
const GLOBAL_SETTINGS_STORAGE = 'admin_global_settings';
const ADMIN_USERS_STORAGE = 'admin_users';

const defaultAPIKeys: APIKeys = {
  vapiSecretKey: '',
  vapiWebhookSecret: '',
  cpaasAccountSid: '',
  cpaasAuthToken: '',
  cpaasProvider: 'Twilio',
  cloudStorageKey: '',
  cloudStorageProvider: 'Google Cloud Storage',
};

const defaultGlobalSettings: GlobalAgentSettings = {
  defaultPrompt: 'Bonjour, je suis l\'assistant IA de [USER_NAME]. Il/Elle n\'est pas disponible pour le moment. Comment puis-je vous aider ?',
  defaultLanguage: 'fr',
  defaultTemperature: 0.5,
  defaultMaxTokens: 250,
  defaultVoiceType: 'fr-FR-Neural',
};

export const [AdminProvider, useAdmin] = createContextHook((): AdminContextType => {
  const [apiKeys, setAPIKeys] = useState<APIKeys>(defaultAPIKeys);
  const [virtualNumbers, setVirtualNumbers] = useState<VirtualNumber[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalAgentSettings>(defaultGlobalSettings);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('[Admin] Initializing with defaults immediately');
    loadAllData();
    initializeAllowedCountries();
  }, []);
  
  const initializeAllowedCountries = async () => {
    try {
      const stored = await AsyncStorage.getItem('allowed_countries');
      if (!stored) {
        console.log('[Admin] Initializing allowed_countries to ["+1"]');
        await AsyncStorage.setItem('allowed_countries', JSON.stringify(['+1']));
      }
    } catch (error) {
      console.error('[Admin] Error initializing allowed countries:', error);
    }
  };

  const loadAllData = async () => {
    try {
      console.log('[Admin] Loading admin data from storage in background...');
      const [keysData, numbersData, settingsData, usersData] = await Promise.all([
        AsyncStorage.getItem(API_KEYS_STORAGE),
        AsyncStorage.getItem(VIRTUAL_NUMBERS_STORAGE),
        AsyncStorage.getItem(GLOBAL_SETTINGS_STORAGE),
        AsyncStorage.getItem(ADMIN_USERS_STORAGE),
      ]);

      if (keysData) setAPIKeys(JSON.parse(keysData));
      if (numbersData) setVirtualNumbers(JSON.parse(numbersData));
      if (settingsData) setGlobalSettings(JSON.parse(settingsData));
      if (usersData) setAdminUsers(JSON.parse(usersData));
      console.log('[Admin] Admin data loaded');
    } catch (error) {
      console.error('[Admin] Error loading admin data:', error);
    }
  };

  const updateAPIKeys = async (keys: Partial<APIKeys>) => {
    try {
      const updatedKeys = { ...apiKeys, ...keys };
      setAPIKeys(updatedKeys);
      await AsyncStorage.setItem(API_KEYS_STORAGE, JSON.stringify(updatedKeys));
      console.log('API keys updated successfully');
    } catch (error) {
      console.error('Error updating API keys:', error);
      throw error;
    }
  };

  const updateGlobalSettings = async (settings: Partial<GlobalAgentSettings>) => {
    try {
      const updatedSettings = { ...globalSettings, ...settings };
      setGlobalSettings(updatedSettings);
      await AsyncStorage.setItem(GLOBAL_SETTINGS_STORAGE, JSON.stringify(updatedSettings));
      console.log('Global settings updated successfully');
    } catch (error) {
      console.error('Error updating global settings:', error);
      throw error;
    }
  };

  const addVirtualNumber = async (number: Omit<VirtualNumber, 'id' | 'createdAt'>) => {
    try {
      const newNumber: VirtualNumber = {
        ...number,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updatedNumbers = [...virtualNumbers, newNumber];
      setVirtualNumbers(updatedNumbers);
      await AsyncStorage.setItem(VIRTUAL_NUMBERS_STORAGE, JSON.stringify(updatedNumbers));
      console.log('Virtual number added successfully');
    } catch (error) {
      console.error('Error adding virtual number:', error);
      throw error;
    }
  };

  const removeVirtualNumber = async (id: string) => {
    try {
      const updatedNumbers = virtualNumbers.filter(num => num.id !== id);
      setVirtualNumbers(updatedNumbers);
      await AsyncStorage.setItem(VIRTUAL_NUMBERS_STORAGE, JSON.stringify(updatedNumbers));
      console.log('Virtual number removed successfully');
    } catch (error) {
      console.error('Error removing virtual number:', error);
      throw error;
    }
  };

  const assignNumberToUser = async (numberId: string, userId: string | null) => {
    try {
      const updatedNumbers = virtualNumbers.map(num =>
        num.id === numberId ? { ...num, assignedUserId: userId } : num
      );
      setVirtualNumbers(updatedNumbers);
      await AsyncStorage.setItem(VIRTUAL_NUMBERS_STORAGE, JSON.stringify(updatedNumbers));
      console.log('Number assigned to user successfully');
    } catch (error) {
      console.error('Error assigning number to user:', error);
      throw error;
    }
  };

  const updateUserAgent = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      const updatedUsers = adminUsers.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      );
      setAdminUsers(updatedUsers);
      await AsyncStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(updatedUsers));
      console.log('User agent updated successfully');
    } catch (error) {
      console.error('Error updating user agent:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await loadAllData();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    apiKeys,
    virtualNumbers,
    globalSettings,
    adminUsers,
    isLoading,
    updateAPIKeys,
    updateGlobalSettings,
    addVirtualNumber,
    removeVirtualNumber,
    assignNumberToUser,
    updateUserAgent,
    refreshData,
  };
});
