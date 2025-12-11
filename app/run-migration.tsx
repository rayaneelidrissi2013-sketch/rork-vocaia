import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { trpcClient } from '@/lib/trpc';
import { Stack } from 'expo-router';

export default function RunMigrationScreen() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const runMigration = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('[MIGRATION UI] Calling runMigration API...');
      const response = await trpcClient.admin.runMigration.mutate();
      console.log('[MIGRATION UI] Response:', response);
      setResult(response);
    } catch (error: any) {
      console.error('[MIGRATION UI] Error:', error);
      setResult({
        success: false,
        message: error.message || 'Erreur lors de la migration',
        error: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('[MIGRATION UI] Auto-starting migration on mount...');
    runMigration();
  }, []);

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Exécuter la Migration SQL',
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: '#fff',
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔧 Migration Base de Données</Text>
          <Text style={styles.subtitle}>
            Migration en cours d&apos;exécution automatique...
          </Text>
          <Text style={styles.warning}>
            ⚠️ Cette opération crée toutes les tables dans PostgreSQL
          </Text>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e40af" />
            <Text style={styles.loadingText}>Migration en cours...</Text>
            <Text style={styles.loadingSubtext}>Veuillez patienter, cela peut prendre quelques secondes</Text>
          </View>
        )}

        {!isLoading && result && (
          <TouchableOpacity
            style={styles.button}
            onPress={runMigration}
          >
            <Text style={styles.buttonText}>Réexécuter la Migration</Text>
          </TouchableOpacity>
        )}

        {result && (
          <View style={[styles.resultContainer, result.success ? styles.success : styles.error]}>
            <Text style={styles.resultTitle}>
              {result.success ? '✅ Succès' : '❌ Erreur'}
            </Text>
            <Text style={styles.resultMessage}>{result.message}</Text>
            
            {result.success && result.tables && (
              <View style={styles.tablesContainer}>
                <Text style={styles.sectionTitle}>Tables créées:</Text>
                {result.tables.map((table: string) => (
                  <Text key={table} style={styles.tableItem}>• {table}</Text>
                ))}
              </View>
            )}
            
            {result.success && result.verification && (
              <View style={styles.verificationContainer}>
                <Text style={styles.sectionTitle}>Vérification:</Text>
                <Text style={styles.verificationItem}>
                  Plans d&apos;abonnement: {result.verification.subscriptionPlans}
                </Text>
                <Text style={styles.verificationItem}>
                  Paramètres globaux: {result.verification.globalSettings}
                </Text>
                <Text style={styles.verificationItem}>
                  Administrateurs: {result.verification.adminUsers}
                </Text>
              </View>
            )}
            
            {!result.success && result.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorCode}>Code: {result.error.code}</Text>
                {result.error.detail && (
                  <Text style={styles.errorDetail}>Détail: {result.error.detail}</Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  warning: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600' as const,
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1e40af',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1e40af',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  resultContainer: {
    margin: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  success: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 16,
  },
  tablesContainer: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 8,
  },
  tableItem: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    marginBottom: 4,
  },
  verificationContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  verificationItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  errorDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fee2e2',
  },
  errorCode: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 4,
    fontWeight: '600' as const,
  },
  errorDetail: {
    fontSize: 12,
    color: '#7f1d1d',
  },
});
