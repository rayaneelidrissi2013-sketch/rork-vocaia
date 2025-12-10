import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Gift, Share2 } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

export default function ReferralScreen() {
  const router = useRouter();
  const { data } = trpc.referral.getReferralStats.useQuery();
  
  const referralCode = data?.referralCode || 'VOCAIA2024';
  const referredCount = data?.referredCount || 0;
  const bonusMinutes = data?.bonusMinutes || 0;

  const handleShare = async (platform?: 'facebook' | 'twitter' | 'whatsapp' | 'linkedin' | 'tiktok' | 'instagram' | 'general') => {
    const message = `Rejoignez-moi sur VocaIA et obtenez 1 minute gratuite avec mon code de parrainage : ${referralCode} ! 🎁\n\nUn assistant vocal IA disponible 24/7 pour ne plus manquer aucun appel.\n\nhttps://vocaia.app/signup?ref=${referralCode}`;

    try {
      if (platform === 'facebook') {
        Alert.alert('Partage Facebook', 'Ouverture de l\'application Facebook...');
      } else if (platform === 'twitter') {
        Alert.alert('Partage X (Twitter)', 'Ouverture de l\'application X...');
      } else if (platform === 'whatsapp') {
        Alert.alert('Partage WhatsApp', 'Ouverture de l\'application WhatsApp...');
      } else if (platform === 'linkedin') {
        Alert.alert('Partage LinkedIn', 'Ouverture de l\'application LinkedIn...');
      } else if (platform === 'tiktok') {
        Alert.alert('Partage TikTok', 'Ouverture de l\'application TikTok...');
      } else if (platform === 'instagram') {
        Alert.alert('Partage Instagram', 'Ouverture de l\'application Instagram...');
      } else {
        await Share.share({
          message,
          title: 'Rejoignez VocaIA',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Parrainage</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.giftIcon}>
              <Gift size={48} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Invitez vos amis</Text>
            <Text style={styles.heroSubtitle}>
              Gagnez des minutes gratuites à chaque parrainage réussi
            </Text>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Users size={32} color="#3B82F6" />
              <Text style={styles.statValue}>{referredCount}</Text>
              <Text style={styles.statLabel}>Parrainages réussis</Text>
            </View>
            <View style={styles.statCard}>
              <Gift size={32} color="#10B981" />
              <Text style={styles.statValue}>{bonusMinutes}</Text>
              <Text style={styles.statLabel}>Minutes gagnées</Text>
            </View>
          </View>

          <View style={styles.howItWorksSection}>
            <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Partagez votre code</Text>
                <Text style={styles.stepDescription}>
                  Envoyez votre code de parrainage à vos amis et collègues
                </Text>
              </View>
            </View>
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Ils s&apos;inscrivent et s&apos;abonnent</Text>
                <Text style={styles.stepDescription}>
                  Vos amis créent un compte et obtiennent 1 minute offerte
                </Text>
              </View>
            </View>
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Vous gagnez des minutes</Text>
                <Text style={styles.stepDescription}>
                  Recevez 5 minutes gratuites pour chaque nouvel abonnement
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.codeSection}>
            <Text style={styles.sectionTitle}>Votre code de parrainage</Text>
            <View style={styles.codeCard}>
              <Text style={styles.codeText}>{referralCode}</Text>
            </View>
          </View>

          <View style={styles.shareSection}>
            <Text style={styles.sectionTitle}>Partagez maintenant</Text>
            
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShare('general')}
              activeOpacity={0.8}
            >
              <Share2 size={24} color="#fff" />
              <Text style={styles.shareButtonText}>Partager</Text>
            </TouchableOpacity>

            <Text style={styles.socialTitle}>Partager sur vos réseaux sociaux</Text>
            <View style={styles.socialGrid}>
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleShare('whatsapp')}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733585.png' }}
                  style={styles.socialLogo}
                />
                <Text style={styles.socialCardText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleShare('facebook')}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }}
                  style={styles.socialLogo}
                />
                <Text style={styles.socialCardText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleShare('twitter')}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5968/5968958.png' }}
                  style={styles.socialLogo}
                />
                <Text style={styles.socialCardText}>X</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleShare('linkedin')}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/174/174857.png' }}
                  style={styles.socialLogo}
                />
                <Text style={styles.socialCardText}>LinkedIn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleShare('tiktok')}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png' }}
                  style={styles.socialLogo}
                />
                <Text style={styles.socialCardText}>TikTok</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleShare('instagram')}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/174/174855.png' }}
                  style={styles.socialLogo}
                />
                <Text style={styles.socialCardText}>Instagram</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },
  giftIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 20,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 16,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  codeSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  codeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed' as const,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#3B82F6',
    letterSpacing: 2,
  },
  shareSection: {
    paddingHorizontal: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    marginBottom: 16,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  twitterButton: {
    backgroundColor: '#000000',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#E2E8F0',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  socialCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  socialLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  socialCardText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
