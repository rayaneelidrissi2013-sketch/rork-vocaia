import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Building2, Mail, Phone, User, Briefcase } from 'lucide-react-native';

export default function EnterpriseContactScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    role: '',
    message: '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.company || !formData.email || !formData.phone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Demande envoyée !',
        'Notre équipe commerciale vous contactera sous 24h pour discuter de votre projet.',
        [
          {
            text: 'Retour',
            onPress: () => router.back(),
          },
        ]
      );
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pack Entreprise</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleSection}>
              <Text style={styles.title}>Solutions personnalisées pour votre organisation</Text>
              <Text style={styles.subtitle}>Demande de devis</Text>
              <Text style={styles.description}>
                Remplissez ce formulaire et notre équipe commerciale vous contactera sous 24h
              </Text>
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>POURQUOI LE PACK ENTREPRISE ?</Text>
              <Text style={styles.benefitsSubtitle}>
                Votre centre d&apos;appels IA 100% autonome et performant
              </Text>
              <Text style={styles.benefitsDescription}>
                Libérez-vous des contraintes humaines et passez à l&apos;ère de l&apos;intelligence artificielle. Une solution clé en main qui révolutionne votre accueil téléphonique.
              </Text>

              <View style={styles.benefitsGrid}>
                <View style={styles.benefitCard}>
                  <Text style={styles.benefitEmoji}>✅</Text>
                  <Text style={styles.benefitTitle}>Solution de réceptionniste IA professionnelle</Text>
                  <Text style={styles.benefitItem}>• 1200+ minutes d&apos;appels IA/mois - Capacité illimitée virtuelle</Text>
                  <Text style={styles.benefitItem}>• Fonctionnement 24h/24 et 7j/7 - Jamais de pause, jamais de congés</Text>
                  <Text style={styles.benefitItem}>• Zéro charge salariale - Fin des charges sociales, arrêts maladie et turnover</Text>
                </View>

                <View style={styles.benefitCard}>
                  <Text style={styles.benefitEmoji}>🚀</Text>
                  <Text style={styles.benefitTitle}>Intégration Enterprise avancée</Text>
                  <Text style={styles.benefitItem}>• Solutions sur-mesure - Adaptées à vos processus métiers spécifiques</Text>
                  <Text style={styles.benefitItem}>• Agents IA Multilingues - Une seule solution pour tous vos marchés internationaux</Text>
                  <Text style={styles.benefitItem}>• Account Manager dédié - Un expert à votre service</Text>
                  <Text style={styles.benefitItem}>• Support prioritaire 24/7 - Assistance garantie</Text>
                </View>

                <View style={styles.benefitCard}>
                  <Text style={styles.benefitEmoji}>💡</Text>
                  <Text style={styles.benefitTitle}>Valeur ajoutée exclusive</Text>
                  <Text style={styles.benefitItem}>• Tarification sur mesure - Optimisez votre budget</Text>
                  <Text style={styles.benefitItem}>• Évolutivité instantanée - Adaptez votre capacité en temps réel</Text>
                  <Text style={styles.benefitItem}>• Rapports détaillés - Analyse complète de vos appels</Text>
                </View>
              </View>

              <View style={styles.finalMessage}>
                <Text style={styles.finalEmoji}>📞</Text>
                <Text style={styles.finalTitle}>Transformez votre standard téléphonique en atout stratégique</Text>
                <Text style={styles.finalSubtitle}>Une efficacité inégalée, sans les contraintes humaines.</Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nom complet <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Jean Dupont"
                    placeholderTextColor="#64748B"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Entreprise <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Building2 size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom de votre entreprise"
                    placeholderTextColor="#64748B"
                    value={formData.company}
                    onChangeText={(text) => setFormData({ ...formData, company: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email professionnel <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="vous@entreprise.com"
                    placeholderTextColor="#64748B"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Téléphone <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+33 6 12 34 56 78"
                    placeholderTextColor="#64748B"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Poste / Fonction</Text>
                <View style={styles.inputWrapper}>
                  <Briefcase size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Directeur, Responsable IT..."
                    placeholderTextColor="#64748B"
                    value={formData.role}
                    onChangeText={(text) => setFormData({ ...formData, role: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Votre message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Décrivez vos besoins et attentes..."
                  placeholderTextColor="#64748B"
                  value={formData.message}
                  onChangeText={(text) => setFormData({ ...formData, message: text })}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Envoyer ma demande</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#8B5CF6',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#8B5CF6',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  benefitsSubtitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 26,
  },
  benefitsDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 24,
  },
  benefitsGrid: {
    gap: 16,
  },
  benefitCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  benefitEmoji: {
    fontSize: 28,
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 12,
  },
  benefitItem: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 6,
  },
  finalMessage: {
    marginTop: 24,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    alignItems: 'center',
  },
  finalEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  finalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  finalSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 16,
  },
  textArea: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
  },
});
