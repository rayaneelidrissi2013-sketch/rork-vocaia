import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdmin } from '@/contexts/AdminContext';
import { DollarSign, Clock, TrendingUp, Users } from 'lucide-react-native';

export default function AdminDashboard() {
  const { isLoading } = useAdmin();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Tableau de Bord</Text>
          <Text style={styles.subtitle}>Vue d&apos;ensemble de votre plateforme VocaIA</Text>
        </View>

        <View style={styles.statsOverview}>
          <View style={styles.statOverviewCard}>
            <Users size={28} color="#8B5CF6" />
            <View style={styles.statOverviewContent}>
              <Text style={styles.statOverviewValue}>247</Text>
              <Text style={styles.statOverviewLabel}>Total Utilisateurs</Text>
            </View>
          </View>
          <View style={styles.statOverviewCard}>
            <Clock size={28} color="#3B82F6" />
            <View style={styles.statOverviewContent}>
              <Text style={styles.statOverviewValue}>45,832</Text>
              <Text style={styles.statOverviewLabel}>Minutes Totales</Text>
            </View>
          </View>
          <View style={styles.statOverviewCard}>
            <Clock size={28} color="#06B6D4" />
            <View style={styles.statOverviewContent}>
              <Text style={styles.statOverviewValue}>12,450</Text>
              <Text style={styles.statOverviewLabel}>Minutes Ce Mois</Text>
            </View>
          </View>
          <View style={styles.statOverviewCard}>
            <DollarSign size={28} color="#10B981" />
            <View style={styles.statOverviewContent}>
              <Text style={styles.statOverviewValue}>€8,947</Text>
              <Text style={styles.statOverviewLabel}>Revenus Mois Actuel</Text>
            </View>
          </View>
          <View style={styles.statOverviewCard}>
            <DollarSign size={28} color="#84CC16" />
            <View style={styles.statOverviewContent}>
              <Text style={styles.statOverviewValue}>€7,123</Text>
              <Text style={styles.statOverviewLabel}>Revenus Mois Précédent</Text>
            </View>
          </View>
          <View style={styles.statOverviewCard}>
            <TrendingUp size={28} color="#F59E0B" />
            <View style={styles.statOverviewContent}>
              <Text style={styles.statOverviewValue}>389</Text>
              <Text style={styles.statOverviewLabel}>Appels Ce Mois</Text>
            </View>
          </View>
        </View>


      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7F1D1D',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secretInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secretInput: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    color: '#fff',
  },
  eyeButton: {
    padding: 16,
  },
  helpText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 18,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#78350F',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#FCD34D',
    lineHeight: 18,
  },
  statsOverview: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statOverviewCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    gap: 16,
  },
  statOverviewContent: {
    flex: 1,
  },
  statOverviewValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  statOverviewLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
