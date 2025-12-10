import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en';

interface Translations {
  fr: { [key: string]: string };
  en: { [key: string]: string };
}

const translations: Translations = {
  fr: {
    welcome: 'Bienvenue',
    login: 'Connexion',
    signup: 'Inscription',
    email: 'Email',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    signIn: 'Se connecter',
    register: "S'inscrire",
    adminAccess: 'Accès administration',
    fullName: 'Nom complet',
    phoneNumber: 'Numéro de téléphone',
    referralCode: 'Code de parrainage (optionnel)',
    acceptCGU: "J'accepte les",
    cgu: "Conditions Générales d'Utilisation",
    fillAllFields: 'Veuillez remplir tous les champs requis',
    mustAcceptCGU: "Vous devez accepter les Conditions Générales d'Utilisation",
    invalidPhoneFormat: 'Format de numéro de téléphone invalide',
    error: 'Erreur',
    success: 'Succès',
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    confirm: 'Confirmer',
    home: 'Accueil',
    history: 'Historique',
    settings: 'Paramètres',
    profile: 'Profil',
    calls: 'Appels',
    voiceAgent: 'Agent Vocal',
    activateAgent: "Activer l'agent Vocal IA",
    deactivateAgent: "Désactiver l'agent",
    agentActive: 'Agent actif',
    agentInactive: 'Agent inactif',
    recentCalls: 'Appels récents',
    noCalls: 'Aucun appel',
    minutes: 'minutes',
    minutesRemaining: 'minutes restantes',
    subscription: 'Abonnement',
    changeSubscription: 'Changer de forfait',
    customizeAgent: 'Personnaliser votre agent IA',
    agentMessage: 'Message de l\'agent',
    language: 'Langue',
    french: 'Français',
    english: 'Anglais',
    selectLanguage: 'Sélectionnez votre langue',
    voiceAssistant: 'Agent Vocal IA',
    yourIntelligentAssistant: 'Votre assistant téléphonique intelligent',
  },
  en: {
    welcome: 'Welcome',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    register: 'Sign Up',
    adminAccess: 'Admin Access',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    referralCode: 'Referral Code (optional)',
    acceptCGU: 'I accept the',
    cgu: 'Terms and Conditions',
    fillAllFields: 'Please fill in all required fields',
    mustAcceptCGU: 'You must accept the Terms and Conditions',
    invalidPhoneFormat: 'Invalid phone number format',
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    home: 'Home',
    history: 'History',
    settings: 'Settings',
    profile: 'Profile',
    calls: 'Calls',
    voiceAgent: 'Voice Agent',
    activateAgent: 'Activate AI Voice Agent',
    deactivateAgent: 'Deactivate Agent',
    agentActive: 'Agent active',
    agentInactive: 'Agent inactive',
    recentCalls: 'Recent Calls',
    noCalls: 'No calls',
    minutes: 'minutes',
    minutesRemaining: 'minutes remaining',
    subscription: 'Subscription',
    changeSubscription: 'Change Plan',
    customizeAgent: 'Customize your AI Agent',
    agentMessage: 'Agent Message',
    language: 'Language',
    french: 'French',
    english: 'English',
    selectLanguage: 'Select your language',
    voiceAssistant: 'AI Voice Assistant',
    yourIntelligentAssistant: 'Your intelligent phone assistant',
  },
};

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>('fr');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_language');
      if (stored && (stored === 'fr' || stored === 'en')) {
        setLanguage(stored as Language);
      }
    } catch (error) {
      console.error('[LanguageContext] Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('[LanguageContext] Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return {
    language,
    changeLanguage,
    t,
    isLoading,
  };
});
