import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCalls } from '@/contexts/CallsContext';
import { Search, Phone, Volume2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HistoryScreen() {
  const { calls, isLoading, refreshCalls } = useCalls();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();

  const filteredCalls = calls.filter(
    call =>
      call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.callerNumber.includes(searchQuery) ||
      call.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = useCallback(async () => {
    await refreshCalls();
  }, [refreshCalls]);

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
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: diffDays > 365 ? 'numeric' : undefined,
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des appels</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un appel..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        {filteredCalls.length === 0 ? (
          <View style={styles.emptyState}>
            <Phone size={48} color="#475569" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Aucun appel trouvé' : 'Aucun appel pour le moment'}
            </Text>
          </View>
        ) : (
          <View style={styles.callsList}>
            {filteredCalls.map(call => (
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
                    <Text style={styles.callDuration}>
                      {formatDuration(call.duration)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.callSummary} numberOfLines={2}>
                  {call.summary}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  callsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
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
  },
  callSummary: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
});
