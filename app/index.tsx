import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, MessageSquare, Shield, Zap } from 'lucide-react-native';
import Constants from 'expo-constants';

export default function HomeScreen() {
  const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 'Non configuré';

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#d946ef']}
        style={styles.header}
      >
        <Text style={styles.title}>VocaIA</Text>
        <Text style={styles.subtitle}>Votre assistant vocal intelligent</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Statut de l'application</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, styles.dotGreen]} />
            <Text style={styles.statusText}>Frontend: Actif</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.dot, styles.dotGreen]} />
            <Text style={styles.statusText}>Backend Railway: Connecté</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.dot, styles.dotGreen]} />
            <Text style={styles.statusText}>Base Supabase: Connectée</Text>
          </View>
          <Text style={styles.apiInfo}>API: {apiUrl}</Text>
        </View>

        <Text style={styles.sectionTitle}>Fonctionnalités</Text>
        
        <View style={styles.features}>
          <View style={styles.featureCard}>
            <Phone color="#6366f1" size={32} />
            <Text style={styles.featureTitle}>Appels vocaux</Text>
            <Text style={styles.featureDesc}>Gérez vos appels intelligemment</Text>
          </View>

          <View style={styles.featureCard}>
            <MessageSquare color="#8b5cf6" size={32} />
            <Text style={styles.featureTitle}>Messages</Text>
            <Text style={styles.featureDesc}>Transcription automatique</Text>
          </View>

          <View style={styles.featureCard}>
            <Shield color="#d946ef" size={32} />
            <Text style={styles.featureTitle}>Sécurité</Text>
            <Text style={styles.featureDesc}>Vos données protégées</Text>
          </View>

          <View style={styles.featureCard}>
            <Zap color="#f59e0b" size={32} />
            <Text style={styles.featureTitle}>Rapide</Text>
            <Text style={styles.featureDesc}>Réponses instantanées</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Commencer</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  dotGreen: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 15,
    color: '#475569',
  },
  apiInfo: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    fontFamily: 'monospace' as const,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    marginBottom: 32,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});
