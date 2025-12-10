import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCalls } from '@/contexts/CallsContext';
import { Play, Pause, ArrowLeft, Phone, Clock, FileText, SkipBack, SkipForward } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

export default function CallDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { calls } = useCalls();
  const router = useRouter();
  
  const call = calls.find(c => c.id === id);
  
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const progressBarRef = useRef<View>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAudio = async () => {
    if (!call) return;
    
    try {
      setIsLoading(true);
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: call.audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(audioSound);
      
      const status = await audioSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      await loadAudio();
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleSeek = async (seekPosition: number) => {
    if (!sound) return;
    await sound.setPositionAsync(seekPosition);
  };

  const handleSkipForward = async () => {
    if (!sound) return;
    const newPosition = Math.min(position + 15000, duration);
    await sound.setPositionAsync(newPosition);
  };

  const handleSkipBackward = async () => {
    if (!sound) return;
    const newPosition = Math.max(position - 15000, 0);
    await sound.setPositionAsync(newPosition);
  };

  const handleChangePlaybackRate = async (rate: number) => {
    if (!sound) return;
    setPlaybackRate(rate);
    await sound.setRateAsync(rate, true);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!call) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Appel introuvable</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l&apos;appel</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.callerSection}>
          <View style={styles.callerAvatar}>
            <Text style={styles.callerAvatarText}>
              {call.callerName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.callerName}>{call.callerName}</Text>
          <Text style={styles.callerNumber}>{call.callerNumber}</Text>
          <View style={styles.callMetaBadge}>
            <Clock size={14} color="#94A3B8" />
            <Text style={styles.callMetaText}>{formatDate(call.timestamp)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Phone size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Enregistrement audio</Text>
          </View>
          
          <View style={styles.audioCard}>
            <TouchableOpacity
              style={styles.progressBar}
              onPress={(e) => {
                if (!sound || duration === 0) return;
                if (progressBarRef.current) {
                  progressBarRef.current.measure((x, y, width) => {
                    const locationX = e.nativeEvent.locationX;
                    const seekPosition = (locationX / width) * duration;
                    handleSeek(seekPosition);
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <View 
                ref={progressBarRef}
                style={[styles.progressFill, { width: `${progress}%` }]} 
              />
            </TouchableOpacity>
            
            <View style={styles.timeLabels}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkipBackward}
                disabled={!sound}
              >
                <SkipBack size={24} color={sound ? "#fff" : "#64748B"} />
                <Text style={styles.skipText}>15s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : isPlaying ? (
                  <Pause size={32} color="#fff" fill="#fff" />
                ) : (
                  <Play size={32} color="#fff" fill="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkipForward}
                disabled={!sound}
              >
                <SkipForward size={24} color={sound ? "#fff" : "#64748B"} />
                <Text style={styles.skipText}>15s</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.speedControls}>
              <Text style={styles.speedLabel}>Vitesse de lecture:</Text>
              <View style={styles.speedButtons}>
                {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.speedButton,
                      playbackRate === rate && styles.speedButtonActive,
                    ]}
                    onPress={() => handleChangePlaybackRate(rate)}
                    disabled={!sound}
                  >
                    <Text
                      style={[
                        styles.speedButtonText,
                        playbackRate === rate && styles.speedButtonTextActive,
                      ]}
                    >
                      {rate}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.costInfo}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Durée de l&apos;appel</Text>
                <Text style={styles.costValue}>{Math.floor(call.duration / 60)} min {call.duration % 60} s</Text>
              </View>
              <View style={styles.costRowHighlight}>
                <Text style={styles.costLabelHighlight}>Minutes facturées</Text>
                <Text style={styles.costValueHighlight}>{Math.ceil(call.duration / 60)} min</Text>
              </View>
              <View style={styles.costRowHighlight}>
                <Text style={styles.costLabelHighlight}>Coût utilisateur</Text>
                <Text style={styles.costValueHighlight}>€{(Math.ceil(call.duration / 60) * 0.35).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Résumé IA</Text>
          </View>
          
          <View style={styles.textCard}>
            <Text style={styles.summaryText}>{call.summary}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Transcription</Text>
          </View>
          
          <View style={styles.textCard}>
            <Text style={styles.transcriptionText}>{call.transcription}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  callerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  callerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  callerAvatarText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#fff',
  },
  callerName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  callerNumber: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 12,
  },
  callMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  callMetaText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  audioCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  timeText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600' as const,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 24,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  skipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600' as const,
  },
  speedControls: {
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  speedLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
    fontWeight: '600' as const,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  speedButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speedButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
  },
  speedButtonText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600' as const,
  },
  speedButtonTextActive: {
    color: '#fff',
  },
  textCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryText: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  transcriptionText: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 22,
    fontStyle: 'italic' as const,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#EF4444',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  costInfo: {
    width: '100%',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E2E8F0',
  },
  costRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  costLabelHighlight: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  costValueHighlight: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#fff',
  },
});
