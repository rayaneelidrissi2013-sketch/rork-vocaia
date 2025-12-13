import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/lib/trpc';
import * as WebBrowser from 'expo-web-browser';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Sparkles } from 'lucide-react-native';
import { SubscriptionPlan } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 60, 340);

export default function PricingScreen() {
  const router = useRouter();
  const { user, setPlanActive } = useAuth();
  const params = useLocalSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const plansQuery = trpc.billing.getPlans.useQuery();
  const createSubscriptionMutation = trpc.billing.createSubscription.useMutation();
  const completePayPalPaymentMutation = trpc.billing.completePayPalPayment.useMutation();

  const handlePayPalReturn = useCallback(async () => {
    if (params.paypal === 'success' && params.token && user?.id) {
      console.log('[Pricing] PayPal success detected, completing payment...');
      setIsProcessing(true);
      
      try {
        const result = await completePayPalPaymentMutation.mutateAsync({
          orderId: params.token as string,
          userId: user.id,
        });

        console.log('[Pricing] Payment completed successfully:', result);
        
        Alert.alert(
          'Paiement réussi!',
          `Votre abonnement a été activé avec succès. Vous disposez de ${result.subscription.minutesIncluded} minutes.`,
          [
            {
              text: 'Continuer',
              onPress: () => {
                router.replace('/(tabs)');
              },
            },
          ]
        );
      } catch (error: any) {
        console.error('[Pricing] Error completing payment:', error);
        Alert.alert(
          'Erreur',
          'Une erreur est survenue lors de l\'activation de votre abonnement. Veuillez contacter le support.'
        );
      } finally {
        setIsProcessing(false);
      }
    } else if (params.paypal === 'cancelled') {
      Alert.alert(
        'Paiement annulé',
        'Vous avez annulé le paiement PayPal.'
      );
    } else if (params.paypal === 'error') {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du paiement PayPal.'
      );
    }
  }, [params.paypal, params.token, user?.id, completePayPalPaymentMutation, router]);

  useEffect(() => {
    handlePayPalReturn();
  }, [handlePayPalReturn]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.isEnterprise) {
      router.push('/enterprise-contact' as never);
      return;
    }

    if (plan.id === 'gratuit') {
      setSelectedPlan(plan.id);
      setIsProcessing(true);

      try {
        console.log('[Pricing] User subscribing to free plan:', plan.id, plan.name);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const subscriptionData = {
          planId: plan.id,
          planName: plan.name,
          minutesIncluded: plan.minutesIncluded,
          minutesRemaining: plan.minutesIncluded,
          price: plan.price,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        console.log('[Pricing] Storing subscription data:', subscriptionData);
        await AsyncStorage.setItem('user_subscription_mock', JSON.stringify(subscriptionData));
        
        const currentSettings = await AsyncStorage.getItem('ai_agent_settings');
        if (!currentSettings) {
          const defaultSettings = {
            isEnabled: false,
            language: 'fr',
            timezone: 'Europe/Paris',
          };
          console.log('[Pricing] Initializing agent settings with isEnabled: false');
          await AsyncStorage.setItem('ai_agent_settings', JSON.stringify(defaultSettings));
        } else {
          const settings = JSON.parse(currentSettings);
          if (settings.isEnabled) {
            settings.isEnabled = false;
            console.log('[Pricing] Resetting agent to disabled (isEnabled: false)');
            await AsyncStorage.setItem('ai_agent_settings', JSON.stringify(settings));
          }
        }
        
        await setPlanActive();
        
        Alert.alert(
          'Succès!',
          `Vous avez souscrit au plan ${plan.name}. Vous disposez de ${plan.minutesIncluded} minute(s).`,
          [
            {
              text: 'Continuer',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } catch (error) {
        console.error('[Pricing] Error subscribing to free plan:', error);
        Alert.alert('Erreur', 'Une erreur est survenue');
      } finally {
        setIsProcessing(false);
        setSelectedPlan(null);
      }
      return;
    }

    setSelectedPlan(plan.id);
    setIsProcessing(true);

    try {
      console.log('[Pricing] User subscribing to paid plan:', plan.id, plan.name);
      
      if (!user?.id) {
        Alert.alert('Erreur', 'Vous devez être connecté pour souscrire à un pack');
        return;
      }

      const backendUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://vocaia-backend-clean-production.up.railway.app';
      const returnUrl = `${backendUrl}/webhooks/paypal/return`;
      const cancelUrl = `${backendUrl}/webhooks/paypal/cancel`;

      console.log('[Pricing] Creating PayPal order with:', {
        planId: plan.id,
        userId: user.id,
        returnUrl,
        cancelUrl,
      });

      const result = await createSubscriptionMutation.mutateAsync({
        planId: plan.id,
        userId: user.id,
        returnUrl,
        cancelUrl,
      });

      console.log('[Pricing] PayPal result:', result);

      if (result.success && result.approvalUrl) {
        console.log('[Pricing] Redirecting to PayPal:', result.approvalUrl);
        const browserResult = await WebBrowser.openBrowserAsync(result.approvalUrl);
        console.log('[Pricing] Browser result:', browserResult);
        
        Alert.alert(
          'Paiement en cours',
          'Veuillez compléter le paiement sur PayPal. Une fois terminé, votre abonnement sera activé.',
          [{ text: 'OK' }]
        );
      } else {
        console.error('[Pricing] Invalid PayPal response:', result);
        throw new Error('Impossible de créer la commande PayPal');
      }
    } catch (error: any) {
      console.error('[Pricing] Error subscribing:', error);
      let errorMessage = 'Une erreur est survenue lors du paiement';
      
      if (error.message) {
        if (error.message.includes('Identifiants PayPal')) {
          errorMessage = 'Configuration PayPal invalide. Veuillez contacter l\'administrateur.';
        } else if (error.message.includes('Authentification')) {
          errorMessage = 'Erreur d\'authentification PayPal. Vérifiez les identifiants dans les paramètres admin.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Erreur de paiement', errorMessage);
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const renderPlanCard = (plan: any) => {
    const isSelected = selectedPlan === plan.id;
    const isProcessingThis = isProcessing && isSelected;

    return (
      <View
        key={plan.id}
        style={[
          styles.planCard,
          plan.isRecommended && styles.planCardRecommended,
        ]}
      >
        {plan.isRecommended && (
          <View style={styles.recommendedBadge}>
            <Sparkles size={16} color="#fff" />
            <Text style={styles.recommendedText}>Meilleure Valeur</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {!plan.isEnterprise ? (
            <>
              <View style={styles.priceContainer}>
                <Text style={styles.priceSymbol}>€</Text>
                <Text style={styles.priceAmount}>{plan.price}</Text>
              </View>
              <Text style={styles.minutesIncluded}>
                {plan.minutesIncluded} minute{plan.minutesIncluded > 1 ? 's' : ''} incluse{plan.minutesIncluded > 1 ? 's' : ''}
              </Text>
            </>
          ) : (
            <Text style={styles.enterprisePrice}>Sur Mesure</Text>
          )}
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature: string, index: number) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkIconContainer}>
                <Check size={16} color="#10B981" strokeWidth={3} />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            plan.isRecommended && styles.subscribeButtonRecommended,
            isProcessingThis && styles.subscribeButtonProcessing,
          ]}
          onPress={() => handleSubscribe(plan)}
          disabled={isProcessing}
        >
          {isProcessingThis ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[
                styles.subscribeButtonText,
                plan.isRecommended && styles.subscribeButtonTextRecommended,
              ]}
            >
              {plan.isEnterprise ? 'Demander un devis' : plan.id === 'gratuit' ? "Démarrer l'essai gratuit" : "S'abonner avec PayPal"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.backgroundContainer}>
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />
      </View>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Choisissez l&apos;efficacité qui vous correspond</Text>
            <Text style={styles.subtitle}>Ne manquez plus jamais un appel ni une opportunité.
Notre solution tout-en-un automatise et archive 100% de vos communications.</Text>
            <Text style={styles.description}>
              Assistant vocal IA 24H/7J - Facturation prépayées à la minute - Valable 30 jours
            </Text>
          </View>



          {plansQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Chargement des packs...</Text>
            </View>
          ) : plansQuery.isError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Erreur lors du chargement des packs</Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {(plansQuery.data?.plans || []).map(plan => renderPlanCard(plan))}
            </View>
          )}


        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#1E3A8A',
    opacity: 0.1,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#3B82F6',
    opacity: 0.05,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 600,
    marginBottom: 20,
  },
  featuresIncluded: {
    marginTop: 16,
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600' as const,
    marginVertical: 4,
  },
  overageInfo: {
    marginHorizontal: 24,
    marginVertical: 24,
    alignItems: 'center',
  },
  overageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  overageTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#E2E8F0',
  },
  overageRate: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#3B82F6',
  },
  overageDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  plansContainer: {
    paddingHorizontal: Math.max((width - CARD_WIDTH) / 2, 24),
    gap: 24,
  },
  planCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#334155',
    width: CARD_WIDTH,
    alignSelf: 'center',
  },
  planCardRecommended: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A5F',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
    alignSelf: 'center',
  },
  recommendedText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#fff',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priceSymbol: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#3B82F6',
    marginTop: 8,
  },
  priceAmount: {
    fontSize: 56,
    fontWeight: '900' as const,
    color: '#fff',
    lineHeight: 56,
  },
  pricePeriod: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#94A3B8',
    marginTop: 8,
  },
  minutesIncluded: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
  },
  subscribeButton: {
    backgroundColor: '#334155',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  subscribeButtonRecommended: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  subscribeButtonProcessing: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
  },
  subscribeButtonTextRecommended: {
    color: '#fff',
  },
  enterprisePrice: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#8B5CF6',
    marginVertical: 12,
  },
  overageNote: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  errorContainer: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});
