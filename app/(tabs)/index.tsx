import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useCalls } from '@/contexts/CallsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Phone, Clock, TrendingUp, AlertCircle, Calendar, Package, Gift, X, Volume2, RefreshCw, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';



export default function DashboardScreen() {
  const authContext = useAuth();
  const callsContext = useCalls();
  const settingsContext = useSettings();
  const router = useRouter();

  const user = authContext?.user || null;
  const calls = callsContext?.calls || [];
  const callsLoading = callsContext?.isLoading || false;
  const refreshCallsFunc = callsContext?.refreshCalls;
  const settings = settingsContext?.settings || { isEnabled: false, language: 'fr', timezone: 'Europe/Paris' };
  const toggleAIAgent = settingsContext?.toggleAIAgent || (() => {});
  const settingsLoading = settingsContext?.isLoading || false;

  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [mockSubscription, setMockSubscription] = useState<any>(null);
  const [isLoadingMockSub, setIsLoadingMockSub] = useState<boolean>(true);

  const renewPlanMutation = trpc.billing.renewPlanEarly.useMutation({
    onSuccess: async () => {
      const stored = await AsyncStorage.getItem('user_subscription_mock');
      if (stored) {
        setMockSubscription(JSON.parse(stored));
      }
      setShowRenewalModal(false);
      Alert.alert('Succès', 'Votre pack a été renouvelé avec succès');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message || 'Impossible de renouveler le pack');
    },
  });

  console.log('[Dashboard] Rendering, user:', user?.id);

  useEffect(() => {
    const loadMockSubscription = async () => {
      try {
        const stored = await AsyncStorage.getItem('user_subscription_mock');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('[Dashboard] Loaded mock subscription:', parsed);
          setMockSubscription(parsed);
        } else {
          console.log('[Dashboard] No mock subscription found');
        }
      } catch (error) {
        console.error('[Dashboard] Error loading mock subscription:', error);
      } finally {
        setIsLoadingMockSub(false);
      }
    };
    
    if (user) {
      loadMockSubscription();
    }
  }, [user]);

  useEffect(() => {
    const checkReferralPrompt = async () => {
      try {
        const lastPrompt = await AsyncStorage.getItem('last_referral_prompt');
        const now = Date.now();
        
        if (!lastPrompt || now - parseInt(lastPrompt) > 7 * 24 * 60 * 60 * 1000) {
          console.log('[Dashboard] Showing referral modal for ALL users (user:', user?.id, ')');
          setTimeout(() => setShowReferralModal(true), 3000);
          await AsyncStorage.setItem('last_referral_prompt', now.toString());
        } else {
          console.log('[Dashboard] Referral modal already shown recently (last:', new Date(parseInt(lastPrompt)).toISOString(), ')');
        }
      } catch (error) {
        console.error('[Dashboard] Error checking referral prompt:', error);
      }
    };

    if (user) {
      console.log('[Dashboard] Checking referral prompt for user:', user.id, 'isLoadingMockSub:', isLoadingMockSub);
      checkReferralPrompt();
    }
  }, [user, mockSubscription, isLoadingMockSub]);

  const subscriptionQuery = trpc.billing.getUserSubscription.useQuery(
    { userId: user?.id || '' },
    {
      enabled: false,
      retry: 1,
      staleTime: 30000,
    }
  );

  const callsQuery = trpc.calls.getUserCalls.useQuery(
    { userId: user?.id || '' },
    {
      enabled: false,
      retry: 1,
      staleTime: 30000,
    }
  );

  if (subscriptionQuery.error) {
    console.log('[Dashboard] Subscription query error:', subscriptionQuery.error.message);
  }
  if (callsQuery.error) {
    console.log('[Dashboard] Calls query error:', callsQuery.error.message);
  }

  const recentCalls = callsQuery.data?.calls?.slice(0, 5) || calls.slice(0, 5);
  const totalCalls = callsQuery.data?.calls?.length || calls.length;
  const todayCalls = (callsQuery.data?.calls || calls).filter(call => {
    const callDate = new Date(call.timestamp);
    const today = new Date();
    return callDate.toDateString() === today.toDateString();
  }).length;

  const subscription = mockSubscription || subscriptionQuery.data;
  const planData = SUBSCRIPTION_PLANS.find(p => p.id === subscription?.planId);
  const percentageUsed = subscription
    ? Math.round(((subscription.minutesIncluded - subscription.minutesRemaining) / subscription.minutesIncluded) * 100)
    : 0;

  const onRefresh = useCallback(async () => {
    await Promise.all([
      refreshCallsFunc ? refreshCallsFunc() : Promise.resolve(),
      subscriptionQuery.refetch(),
      callsQuery.refetch(),
    ]);
  }, [refreshCallsFunc, subscriptionQuery, callsQuery]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={callsLoading || settingsLoading}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.name}>{user?.name || 'Utilisateur'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: settings.isEnabled ? '#10B981' : '#EF4444' },
              ]}
            />
            <Text style={styles.statusText}>
              {settings.isEnabled ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>

        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Package size={20} color="#3B82F6" />
              <Text style={styles.kpiLabel}>Pack Actif</Text>
            </View>
            <Text style={styles.kpiValue}>{planData?.name || 'Aucun plan'}</Text>
            <TouchableOpacity
              style={styles.changePackButton}
              onPress={() => router.push('/pricing' as any)}
            >
              <Text style={styles.changePackButtonText}>Choisir un pack</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Clock size={20} color="#10B981" />
              <Text style={styles.kpiLabel}>Minutes Restantes</Text>
            </View>
            <Text style={styles.kpiValue}>
              {subscription?.minutesRemaining ?? 0} / {subscription?.minutesIncluded ?? 0}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percentageUsed}%` }]} />
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Calendar size={20} color="#F59E0B" />
              <Text style={styles.kpiLabel}>Renouvellement</Text>
            </View>
            <Text style={styles.kpiValue}>
              {subscription && subscription.planId === 'free' 
                ? '-' 
                : subscription && subscription.renewalDate
                  ? new Date(subscription.renewalDate).toLocaleDateString('fr-FR')
                  : 'Non défini'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Phone size={20} color="#8B5CF6" />
              <Text style={styles.kpiLabel}>Total Appels</Text>
            </View>
            <Text style={styles.kpiValue}>{totalCalls}</Text>
          </View>
        </View>

        <View style={styles.aiToggleCard}>
          <View style={styles.aiToggleHeader}>
            <View style={styles.aiToggleIcon}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.aiToggleAppIcon}
              />
            </View>
            <View style={styles.aiToggleInfo}>
              <Text style={styles.aiToggleTitle}>Activer l&apos;agent Vocal IA</Text>
              <Text style={styles.aiToggleSubtitle}>
                {settings.isEnabled
                  ? "L'agent répondra automatiquement aux appels entrants"
                  : 'Actuellement désactivé'}
              </Text>
            </View>
            <Switch
              value={settings.isEnabled}
              onValueChange={() => toggleAIAgent(
                subscription?.minutesRemaining, 
                user?.phoneNumber, 
                user?.countryCode || '+33'
              )}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
              thumbColor="#fff"
              ios_backgroundColor="#334155"
              disabled={subscription?.minutesRemaining === 0 && !settings.isEnabled}
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{totalCalls}</Text>
            <Text style={styles.statLabel}>Total appels</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{todayCalls}</Text>
            <Text style={styles.statLabel}>Aujourd&apos;hui</Text>
          </View>
        </View>

        {subscription && subscription.minutesRemaining !== undefined && subscription.minutesRemaining <= 0 && subscription.planId !== 'enterprise' && !isLoadingMockSub && (
          <View style={styles.errorCard}>
            <AlertCircle size={20} color="#EF4444" />
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorTitle}>Crédit épuisé</Text>
              <Text style={styles.errorText}>
                Votre forfait de minutes est épuisé. Renouvelez maintenant ou choisissez un autre pack.
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => setShowRenewalModal(true)}
              >
                <Text style={styles.upgradeButtonText}>Options de renouvellement</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {!settings.isEnabled && subscription && (subscription.minutesRemaining ?? 0) > 0 && !isLoadingMockSub && (
          <View style={styles.warningCard}>
            <AlertCircle size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              L&apos;agent IA est désactivé. Activez-le pour qu&apos;il réponde à vos appels.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appels récents</Text>
            <TouchableOpacity onPress={() => router.push('/history' as any)}>
              <Text style={styles.seeAllButton}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          {recentCalls.length === 0 ? (
            <View style={styles.emptyState}>
              <Phone size={48} color="#475569" />
              <Text style={styles.emptyStateText}>Aucun appel pour le moment</Text>
            </View>
          ) : (
            recentCalls.map(call => {
              const statusColor = call.status === 'completed' ? '#10B981' : call.status === 'missed' ? '#EF4444' : '#F59E0B';
              const statusText = call.status === 'completed' ? 'Traité' : call.status === 'missed' ? 'Manqué' : 'En cours';
              
              return (
                <TouchableOpacity
                  key={call.id}
                  style={styles.callCard}
                  onPress={() => router.push(`/call/${call.id}` as any)}
                >
                  <View style={styles.callHeader}>
                    <View style={styles.callAvatar}>
                      <Text style={styles.callAvatarText}>
                        {call.callerName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.callInfo}>
                      <Text style={styles.callName}>{call.callerName}</Text>
                      <Text style={styles.callNumber}>{call.callerNumber}</Text>
                    </View>
                    <View style={styles.callMeta}>
                      <View style={styles.audioIndicator}>
                        <Volume2 size={16} color="#3B82F6" />
                      </View>
                      <Text style={styles.callTime}>{formatTime(call.timestamp)}</Text>
                      <View style={[styles.statusBadgeSmall, { backgroundColor: statusColor + '20' }]}>
                        <View style={[styles.statusDotSmall, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusTextSmall, { color: statusColor }]}>
                          {statusText}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.callFooter}>
                    <Text style={styles.callDuration}>
                      Durée: {formatDuration(call.duration)}
                    </Text>
                    <Text style={styles.callSummary} numberOfLines={2}>
                      {call.summary}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showReferralModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReferralModal(false)}
            >
              <X size={24} color="#94A3B8" />
            </TouchableOpacity>
            
            <View style={styles.giftIconContainer}>
              <Gift size={48} color="#fff" />
            </View>
            
            <Text style={styles.modalTitle}>Invitez vos amis !</Text>
            <Text style={styles.modalDescription}>
              Gagnez 5 minutes gratuites pour chaque ami qui s&apos;inscrit et s&apos;abonne avec votre code de parrainage.
            </Text>
            
            <TouchableOpacity
              style={styles.referralButton}
              onPress={() => {
                setShowReferralModal(false);
                router.push('/referral' as any);
              }}
            >
              <Text style={styles.referralButtonText}>Voir mon code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setShowReferralModal(false)}
            >
              <Text style={styles.skipButtonText}>Plus tard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRenewalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenewalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.renewalModalCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRenewalModal(false)}
            >
              <X size={24} color="#94A3B8" />
            </TouchableOpacity>
            
            <View style={styles.alertIconContainer}>
              <AlertCircle size={48} color="#fff" />
            </View>
            
            <Text style={styles.renewalModalTitle}>Crédit épuisé</Text>
            <Text style={styles.renewalModalDescription}>
              Vous avez utilisé toutes vos minutes. Choisissez une option pour continuer à utiliser votre Agent IA.
            </Text>
            
            <TouchableOpacity
              style={styles.renewCurrentButton}
              onPress={() => {
                if (user?.id && subscription?.planId) {
                  renewPlanMutation.mutate({
                    userId: user.id,
                    planId: subscription.planId,
                  });
                }
              }}
              disabled={renewPlanMutation.isPending}
            >
              <RefreshCw size={20} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.renewCurrentButtonText}>Renouveler ce pack maintenant</Text>
                <Text style={styles.renewCurrentButtonSubtext}>
                  {planData?.name || 'Pack actuel'} - €{planData?.price || 0} - {planData?.minutesIncluded || 0} min
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.chooseOtherButton}
              onPress={() => {
                setShowRenewalModal(false);
                router.push('/pricing' as any);
              }}
            >
              <ShoppingBag size={20} color="#3B82F6" />
              <Text style={styles.chooseOtherButtonText}>Choisir un autre pack</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#94A3B8',
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E2E8F0',
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  kpiLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600' as const,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  aiToggleCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiToggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  aiToggleAppIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  aiToggleInfo: {
    flex: 1,
  },
  aiToggleTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  aiToggleSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#422006',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#78350F',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#FDE68A',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  seeAllButton: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  callCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  callAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  callAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  callNumber: {
    fontSize: 13,
    color: '#94A3B8',
  },
  callMeta: {
    alignItems: 'flex-end',
  },
  audioIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  callTime: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  callDuration: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#3B82F6',
    marginBottom: 8,
  },
  callSummary: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusTextSmall: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  callFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  errorCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#450A0A',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FEE2E2',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FCA5A5',
    lineHeight: 20,
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  referralButton: {
    width: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  referralButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  renewalModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  renewalModalTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  renewalModalDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  renewCurrentButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 12,
  },
  renewCurrentButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 4,
  },
  renewCurrentButtonSubtext: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#D1FAE5',
  },
  chooseOtherButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  chooseOtherButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
  },
  changePackButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  changePackButtonText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
