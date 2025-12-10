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
import { UserCheck, UserX, ChevronRight, Trash2, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';

export default function UsersManagement() {
  const router = useRouter();
  const allUsersQuery = trpc.admin.getAllUsers.useQuery();
  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      allUsersQuery.refetch();
      Alert.alert('Succès', 'L\'utilisateur a été supprimé avec succès.');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message || 'Impossible de supprimer l\'utilisateur');
    },
  });

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Supprimer l\'utilisateur',
      `Êtes-vous sûr de vouloir supprimer ${userName} ? Cette action est irréversible et supprimera également tous les appels et paiements associés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteUserMutation.mutate({ userId });
          },
        },
      ]
    );
  };

  if (allUsersQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (allUsersQuery.error) {
    console.error('[UsersManagement] Error loading users:', allUsersQuery.error);
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur de chargement des utilisateurs</Text>
          <Text style={styles.errorSubtext}>{allUsersQuery.error.message}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => allUsersQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const users = allUsersQuery.data || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Gestion des Utilisateurs</Text>
            <Text style={styles.subtitle}>
              {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/user-details/new' as never)}
            activeOpacity={0.7}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <UserCheck size={24} color="#10B981" />
            <Text style={styles.statValue}>{users.filter((u: any) => u.isAgentActive).length}</Text>
            <Text style={styles.statLabel}>Utilisateurs actifs</Text>
          </View>
          <View style={styles.statCard}>
            <UserX size={24} color="#64748B" />
            <Text style={styles.statValue}>{users.filter((u: any) => !u.isAgentActive).length}</Text>
            <Text style={styles.statLabel}>Utilisateurs inactifs</Text>
          </View>
        </View>

        <View style={styles.section}>
          {users.map((user: any) => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.userCard}
              onPress={() => router.push(`/user-details/${user.id}` as never)}
              activeOpacity={0.7}
            >
              <View style={styles.userHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userProfession}>{user.profession || 'Utilisateur'}</Text>
                </View>
                <View style={styles.userHeaderRight}>
                  <View style={[styles.statusBadge, user.isAgentActive && styles.statusBadgeActive]}>
                    <Text style={[styles.statusText, user.isAgentActive && styles.statusTextActive]}>
                      {user.isAgentActive ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#94A3B8" />
                </View>
              </View>

              <View style={styles.userDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{user.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Téléphone</Text>
                  <Text style={styles.detailValue}>{user.phoneNumber || 'N/A'}</Text>
                </View>
                {user.vapiPhoneNumber && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Numéro virtuel</Text>
                    <Text style={styles.detailValue}>{user.vapiPhoneNumber}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Langue</Text>
                  <Text style={styles.detailValue}>{user.language}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Minutes restantes</Text>
                  <Text style={styles.detailValue}>{user.minutesRemaining}/{user.minutesIncluded}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteUser(user.id, user.name);
                }}
                activeOpacity={0.7}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Trash2 size={20} color="#EF4444" />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 22,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  userHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  userProfession: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statusBadge: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#065F46',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  statusTextActive: {
    color: '#10B981',
  },
  userDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E2E8F0',
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#450A0A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
});
