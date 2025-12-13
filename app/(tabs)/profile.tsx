import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Mail, Phone, Globe, Clock, LogOut, Gift, ChevronRight, Package, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const router = useRouter();
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);

  const subscriptionQuery = trpc.billing.getUserSubscription.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id, refetchOnMount: 'always' }
  );

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <User size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom complet</Text>
                <Text style={styles.infoValue}>{user?.name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Mail size={20} color="#10B981" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Phone size={20} color="#F59E0B" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>
                  {user?.phoneNumber}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.iconContainer}>
                <Globe size={20} color="#8B5CF6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Langue</Text>
                <Text style={styles.infoValue}>
                  {language === 'fr' ? 'Français' : 'English'}
                </Text>
              </View>
              <ChevronRight size={20} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Clock size={20} color="#EC4899" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fuseau horaire</Text>
                <Text style={styles.infoValue}>{user?.timezone}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pack actif</Text>

          <View style={styles.card}>
            {subscriptionQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#3B82F6" />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : subscriptionQuery.data ? (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Package size={20} color="#8B5CF6" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Pack</Text>
                    <Text style={styles.infoValue}>{subscriptionQuery.data.planName}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Minutes incluses</Text>
                    <Text style={styles.infoValue}>{subscriptionQuery.data.minutesIncluded} minute{subscriptionQuery.data.minutesIncluded > 1 ? 's' : ''}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Minutes restantes</Text>
                    <Text style={[styles.infoValue, { color: subscriptionQuery.data.minutesRemaining > 0 ? '#10B981' : '#EF4444' }]}>
                      {subscriptionQuery.data.minutesRemaining} minute{subscriptionQuery.data.minutesRemaining > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Renouvellement</Text>
                    <Text style={styles.infoValue}>
                      {subscriptionQuery.data.renewalDate ? formatDate(subscriptionQuery.data.renewalDate) : '-'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.changePlanButton}
                  onPress={() => {
                    if (subscriptionQuery.data?.planId) {
                      router.push(`/pricing?upgrade=true&currentPlanId=${subscriptionQuery.data.planId}` as any);
                    }
                  }}
                >
                  <Text style={styles.changePlanButtonText}>Changer de pack</Text>
                  <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.noSubscriptionContainer}>
                <Package size={48} color="#64748B" />
                <Text style={styles.noSubscriptionText}>Aucun pack actif</Text>
                <TouchableOpacity
                  style={styles.choosePlanButton}
                  onPress={() => router.push('/pricing' as any)}
                >
                  <Text style={styles.choosePlanButtonText}>Choisir un pack</Text>
                  <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Membre depuis</Text>
                <Text style={styles.infoValue}>
                  {user?.createdAt ? formatDate(user.createdAt) : '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.referralButton}
            onPress={() => router.push('/referral' as any)}
          >
            <Gift size={20} color="#8B5CF6" />
            <Text style={styles.referralButtonText}>Inviter des amis</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showLanguageModal && (
        <View style={styles.languageModalOverlay}>
          <TouchableOpacity 
            style={styles.languageModalBackground}
            activeOpacity={1}
            onPress={() => setShowLanguageModal(false)}
          />
          <View style={styles.languageModal}>
            <Text style={styles.languageModalTitle}>Choisir la langue</Text>
            <TouchableOpacity
              style={[styles.languageOption, language === 'fr' && styles.languageOptionActive]}
              onPress={() => {
                changeLanguage('fr');
                setShowLanguageModal(false);
              }}
            >
              <Text style={[styles.languageOptionText, language === 'fr' && styles.languageOptionTextActive]}>
                🇫🇷 Français
              </Text>
              {language === 'fr' && (
                <View style={styles.checkMark} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageOption, language === 'en' && styles.languageOptionActive]}
              onPress={() => {
                changeLanguage('en');
                setShowLanguageModal(false);
              }}
            >
              <Text style={[styles.languageOptionText, language === 'en' && styles.languageOptionTextActive]}>
                🇬🇧 English
              </Text>
              {language === 'en' && (
                <View style={styles.checkMark} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageCancelButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.languageCancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: '#fff',
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#94A3B8',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#94A3B8',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginHorizontal: 16,
  },
  referralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    gap: 12,
  },
  referralButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#8B5CF6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#EF4444',
  },
  languageModalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  languageModalBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  languageModal: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  languageOptionActive: {
    backgroundColor: '#2D1B69',
    borderColor: '#8B5CF6',
  },
  languageOptionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  languageOptionTextActive: {
    color: '#fff',
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
  },
  languageCancelButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center' as const,
  },
  languageCancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  changePlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  changePlanButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  noSubscriptionContainer: {
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  noSubscriptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  choosePlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 8,
  },
  choosePlanButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
