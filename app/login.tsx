import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, ChevronDown, Eye, EyeOff, CheckSquare, Square, FileText, Languages } from 'lucide-react-native';
import { COUNTRY_CODES, CountryCode } from '@/constants/countryCodes';
import { trpc } from '@/lib/trpc';
import { validatePhoneNumber } from '@/utils/phoneUtils';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES.find(c => c.dialCode === '+1') || COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [acceptedCGU, setAcceptedCGU] = useState<boolean>(false);
  const [showCGU, setShowCGU] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<'form' | 'verify'>('form');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [pendingUserData, setPendingUserData] = useState<{email: string, password: string, name: string, phoneNumber: string} | null>(null);

  const { login, register } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const router = useRouter();
  
  const cguQuery = trpc.admin.getCGU.useQuery();
  const allowedCountriesQuery = trpc.admin.getAllowedCountries.useQuery();
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);

  const sendCodeMutation = trpc.auth.sendVerificationCode.useMutation();
  const verifyCodeMutation = trpc.auth.verifyCode.useMutation();

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 4) {
      Alert.alert('Erreur', 'Veuillez entrer le code à 4 chiffres (1234)');
      return;
    }

    if (!pendingUserData) {
      Alert.alert('Erreur', 'Données utilisateur manquantes');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyCodeMutation.mutateAsync({
        phoneNumber: pendingUserData.phoneNumber,
        code: verificationCode,
      });

      if (result.verified) {
        await register(
          pendingUserData.email,
          pendingUserData.password,
          pendingUserData.name,
          pendingUserData.phoneNumber
        );
        router.replace('/pricing');
      } else {
        Alert.alert('Erreur', result.message || 'Code incorrect');
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingUserData) return;
    
    try {
      await sendCodeMutation.mutateAsync({ 
        phoneNumber: pendingUserData.phoneNumber,
        countryCode: selectedCountry.dialCode,
      });
      Alert.alert('Succès', 'Le code a été renvoyé');
    } catch {
      Alert.alert('Erreur', 'Impossible de renvoyer le code');
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    if (!isLogin && (!name || !phoneNumber)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }
    
    if (!isLogin && !acceptedCGU) {
      Alert.alert('Erreur', 'Vous devez accepter les Conditions Générales d\'Utilisation');
      return;
    }

    if (!isLogin && phoneNumber) {
      const validation = validatePhoneNumber(phoneNumber, selectedCountry.dialCode);
      if (!validation.valid) {
        Alert.alert('Erreur', validation.error || 'Numéro de téléphone invalide');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        router.replace('/(tabs)');
      } else {
        const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
        
        setPendingUserData({
          email,
          password,
          name,
          phoneNumber: fullPhoneNumber,
        });
        
        await sendCodeMutation.mutateAsync({ 
          phoneNumber: fullPhoneNumber,
          countryCode: selectedCountry.dialCode,
        });
        
        setVerificationStep('verify');
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setLoading(false);
    }
  };

  if (verificationStep === 'verify') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Phone size={48} color="#fff" strokeWidth={2} />
              </View>
              <Text style={styles.title}>Vérification</Text>
              <Text style={styles.subtitle}>
                Entrez le code à 4 chiffres envoyé par SMS
              </Text>
              <Text style={styles.phoneVerification}>
                {pendingUserData?.phoneNumber}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Code de vérification</Text>
                <TextInput
                  style={styles.verificationInput}
                  placeholder="1234"
                  placeholderTextColor="#64748B"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={4}
                  autoFocus
                />
                <Text style={styles.hint}>
                  Pour le test, utilisez le code: 1234
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Vérifier</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={sendCodeMutation.isPending}
              >
                <Text style={styles.resendButtonText}>
                  {sendCodeMutation.isPending ? 'Envoi...' : 'Renvoyer le code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setVerificationStep('form');
                  setVerificationCode('');
                  setPendingUserData(null);
                }}
              >
                <Text style={styles.backButtonText}>Retour</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.languageSelector}
              onPress={() => setShowLanguagePicker(true)}
            >
              <Languages size={18} color="#fff" strokeWidth={2.5} />
              <Text style={styles.languageSelectorText}>
                {language === 'fr' ? 'FR' : 'EN'}
              </Text>
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.appIcon}
              />
            </View>
            <Text style={styles.title}>VocaIA</Text>
            <Text style={styles.subtitle}>
              {t('yourIntelligentAssistant')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                  {t('login')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  {t('signup')}
                </Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nom complet</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Jean Dupont"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Numéro de téléphone</Text>
                  <View style={styles.phoneInputContainer}>
                    <TouchableOpacity
                      style={styles.countrySelector}
                      onPress={() => setShowCountryPicker(true)}
                    >
                      <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                      <Text style={styles.countryDialCode}>{selectedCountry.dialCode}</Text>
                      <ChevronDown size={16} color="#94A3B8" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="6 12 34 56 78"
                      placeholderTextColor="#64748B"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <Text style={styles.hint}>
                    Format valide : chiffres, espaces, tirets, points ou parenthèses
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Code de parrainage (optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VOCAIA2024"
                    placeholderTextColor="#64748B"
                    value={referralCode}
                    onChangeText={setReferralCode}
                    autoCapitalize="characters"
                  />
                  <Text style={styles.hint}>
                    Gagnez 5 minutes gratuites en utilisant un code de parrainage
                  </Text>
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#64748B" />
                  ) : (
                    <Eye size={20} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {!isLogin && (
              <View style={styles.cguContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setAcceptedCGU(!acceptedCGU)}
                >
                  {acceptedCGU ? (
                    <CheckSquare size={24} color="#3B82F6" />
                  ) : (
                    <Square size={24} color="#64748B" />
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={[styles.cguText, { flex: 0 }]}>
                        J&apos;accepte les{' '}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowCGU(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cguLink}>
                          Conditions Générales d&apos;Utilisation
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => {
                  Alert.alert(
                    'Mot de passe oublié ?',
                    'Pour réinitialiser votre mot de passe, veuillez contacter le support à support@vocaia.com avec votre adresse email.',
                    [
                      { text: 'OK', style: 'default' }
                    ]
                  );
                }}
              >
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'Se connecter' : "S'inscrire"}
                </Text>
              )}
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => router.push('/admin-login')}
                disabled={loading}
              >
                <Text style={styles.adminButtonText}>
                  Accès administration
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez votre pays</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={(() => {
                const allowedCountries = allowedCountriesQuery.data?.allowedCountries;
                console.log('[CountryPicker] Allowed countries from API:', allowedCountries);
                
                if (!allowedCountries || allowedCountries.length === 0) {
                  console.log('[CountryPicker] No allowed countries, defaulting to +1');
                  return COUNTRY_CODES.filter(c => c.dialCode === '+1');
                }
                
                const filtered = COUNTRY_CODES.filter(country => {
                  const isAllowed = allowedCountries.includes(country.dialCode);
                  console.log(`[CountryPicker] ${country.name} (${country.dialCode}): ${isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
                  return isAllowed;
                });
                
                console.log('[CountryPicker] Filtered countries count:', filtered.length);
                console.log('[CountryPicker] Filtered countries:', filtered.map(c => c.dialCode).join(', '));
                
                return filtered;
              })()}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.name}</Text>
                  <Text style={styles.countryItemDialCode}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCGU}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCGU(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cguModalContent}>
            <View style={styles.cguModalHeader}>
              <FileText size={24} color="#3B82F6" />
              <Text style={styles.cguModalTitle}>Conditions Générales d&apos;Utilisation</Text>
              <TouchableOpacity onPress={() => setShowCGU(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.cguModalScroll}>
              <Text style={styles.cguModalText}>
                {cguQuery.data?.cgu || 'Chargement des CGU...'}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.cguAcceptButton}
              onPress={() => {
                setAcceptedCGU(true);
                setShowCGU(false);
              }}
            >
              <Text style={styles.cguAcceptButtonText}>J&apos;accepte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLanguagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.languageItem}
              onPress={() => {
                changeLanguage('fr');
                setShowLanguagePicker(false);
              }}
            >
              <Text style={styles.languageItemFlag}>🇫🇷</Text>
              <Text style={styles.languageItemName}>{t('french')}</Text>
              {language === 'fr' && <Text style={styles.languageItemCheck}>✓</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageItem}
              onPress={() => {
                changeLanguage('en');
                setShowLanguagePicker(false);
              }}
            >
              <Text style={styles.languageItemFlag}>🇬🇧</Text>
              <Text style={styles.languageItemName}>{t('english')}</Text>
              {language === 'en' && <Text style={styles.languageItemCheck}>✓</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  hint: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic' as const,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  eyeButton: {
    padding: 16,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600' as const,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  adminButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#8B5CF6',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryDialCode: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalClose: {
    fontSize: 32,
    fontWeight: '300' as const,
    color: '#94A3B8',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  countryItemFlag: {
    fontSize: 28,
  },
  countryItemName: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  countryItemDialCode: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  cguContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cguText: {
    flex: 1,
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  cguLink: {
    color: '#3B82F6',
    textDecorationLine: 'underline' as const,
  },
  cguModalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  cguModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  cguModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  cguModalScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cguModalText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
  },
  cguAcceptButton: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cguAcceptButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  languageSelector: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  languageSelectorText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  languageItemFlag: {
    fontSize: 28,
  },
  languageItemName: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  languageItemCheck: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: '700' as const,
  },
  verificationInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    textAlign: 'center',
    letterSpacing: 8,
  },
  phoneVerification: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#3B82F6',
    marginTop: 8,
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
