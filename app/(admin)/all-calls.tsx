import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Phone, Search, Clock, User } from 'lucide-react-native';
import { formatDuration } from '@/utils/formatters';

type Call = {
  id: string;
  userId: string;
  userName: string;
  phoneNumber: string;
  duration: number;
  timestamp: string;
  status: 'completed' | 'missed' | 'ongoing';
  transcription?: string;
};

const MOCK_CALLS: Call[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Marie Martin',
    phoneNumber: '+33 6 98 76 54 32',
    duration: 120,
    timestamp: '2024-01-20T14:30:00Z',
    status: 'completed',
    transcription: "Bonjour, je souhaiterais prendre rendez-vous avec le docteur. Je suis disponible jeudi après-midi ou vendredi matin...",
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Pierre Durand',
    phoneNumber: '+33 6 45 67 89 12',
    duration: 45,
    timestamp: '2024-01-20T11:15:00Z',
    status: 'completed',
    transcription: "Bonjour, j'ai reçu votre devis mais j'aimerais avoir plus d'informations sur les tarifs mentionnés...",
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Sophie Bernard',
    phoneNumber: '+33 6 23 45 67 89',
    duration: 180,
    timestamp: '2024-01-19T16:45:00Z',
    status: 'completed',
    transcription: 'Bonjour, je vous appelle pour confirmer ma commande de 50 unités...',
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Inconnu',
    phoneNumber: '+33 6 11 22 33 44',
    duration: 30,
    timestamp: '2024-01-19T09:20:00Z',
    status: 'completed',
    transcription: 'Bonjour, je vous appelle pour vous présenter une offre exceptionnelle...',
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Luc Petit',
    phoneNumber: '+33 6 55 66 77 88',
    duration: 90,
    timestamp: '2024-01-18T13:00:00Z',
    status: 'completed',
    transcription: "Bonjour, je voulais savoir quels sont vos horaires pendant les vacances scolaires ?...",
  },
];

export default function AllCallsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [calls] = useState<Call[]>(MOCK_CALLS);

  const filteredCalls = calls.filter(
    (call) =>
      call.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.phoneNumber.includes(searchQuery) ||
      call.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCallPress = (call: Call) => {
    console.log('[AllCalls] Navigating to call details:', call.id, 'for user:', call.userName, 'userId:', call.userId);
    router.push(`/call/${call.id}` as never);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Call['status']) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'missed':
        return '#EF4444';
      case 'ongoing':
        return '#3B82F6';
    }
  };

  const getStatusText = (status: Call['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'missed':
        return 'Manqué';
      case 'ongoing':
        return 'En cours';
    }
  };

  const renderCallItem = ({ item }: { item: Call }) => (
    <TouchableOpacity
      style={styles.callCard}
      onPress={() => handleCallPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.callHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userIcon}>
            <User size={20} color="#3B82F6" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userId}>ID: {item.userId}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.callInfo}>
        <View style={styles.infoRow}>
          <Phone size={16} color="#94A3B8" />
          <Text style={styles.infoText}>{item.phoneNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color="#94A3B8" />
          <Text style={styles.infoText}>
            {formatDuration(item.duration)} • {formatDate(item.timestamp)}
          </Text>
        </View>
      </View>

      {item.transcription && (
        <View style={styles.transcriptionPreview}>
          <Text style={styles.transcriptionText} numberOfLines={2}>
            {item.transcription}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des Appels</Text>
        <Text style={styles.subtitle}>Tous les appels des utilisateurs</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom, téléphone ou ID..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{calls.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {calls.filter((c) => c.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Terminés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {calls.filter((c) => c.status === 'missed').length}
          </Text>
          <Text style={styles.statLabel}>Manqués</Text>
        </View>
      </View>

      <FlatList
        data={filteredCalls}
        renderItem={renderCallItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Phone size={48} color="#334155" />
            <Text style={styles.emptyText}>Aucun appel trouvé</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Les appels apparaîtront ici'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 12,
    fontSize: 15,
    color: '#fff',
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
  },
  callInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  transcriptionPreview: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  transcriptionText: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#E2E8F0',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
  },
});
