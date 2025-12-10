import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdmin } from '@/contexts/AdminContext';
import { Phone, Plus, Trash2, X, CheckCircle } from 'lucide-react-native';
import { VirtualNumber } from '@/types';

export default function VirtualNumbersManagement() {
  const { virtualNumbers, addVirtualNumber, removeVirtualNumber } = useAdmin();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newNumber, setNewNumber] = useState<Partial<VirtualNumber>>({
    phoneNumber: '',
    country: '',
    countryCode: '',
    provider: 'Twilio',
    status: 'active',
    assignedUserId: null,
    webhookUrl: '',
  });

  const handleAddNumber = async () => {
    if (!newNumber.phoneNumber || !newNumber.country || !newNumber.countryCode) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    try {
      await addVirtualNumber({
        phoneNumber: newNumber.phoneNumber!,
        country: newNumber.country!,
        countryCode: newNumber.countryCode!,
        provider: newNumber.provider || 'Twilio',
        status: newNumber.status || 'active',
        assignedUserId: newNumber.assignedUserId || null,
        webhookUrl: newNumber.webhookUrl || '',
      });
      setShowAddModal(false);
      setNewNumber({
        phoneNumber: '',
        country: '',
        countryCode: '',
        provider: 'Twilio',
        status: 'active',
        assignedUserId: null,
        webhookUrl: '',
      });
      Alert.alert('Succès', 'Numéro virtuel ajouté avec succès');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'ajouter le numéro virtuel');
    }
  };

  const handleDeleteNumber = (id: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce numéro ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeVirtualNumber(id);
              Alert.alert('Succès', 'Numéro supprimé');
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer le numéro');
            }
          },
        },
      ]
    );
  };

  const numbersByCountry = virtualNumbers.reduce<{ [key: string]: VirtualNumber[] }>((acc, num) => {
    if (!acc[num.country]) {
      acc[num.country] = [];
    }
    acc[num.country].push(num);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Numéros Virtuels</Text>
          <Text style={styles.subtitle}>Gestion des numéros par pays</Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Ajouter un numéro</Text>
          </TouchableOpacity>
        </View>

        {Object.keys(numbersByCountry).length === 0 ? (
          <View style={styles.emptyState}>
            <Phone size={48} color="#64748B" />
            <Text style={styles.emptyText}>Aucun numéro virtuel configuré</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des numéros pour commencer à gérer les appels
            </Text>
          </View>
        ) : (
          Object.entries(numbersByCountry).map(([country, numbers]) => (
            <View key={country} style={styles.countrySection}>
              <View style={styles.countryHeader}>
                <Text style={styles.countryTitle}>{country}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{numbers.length}</Text>
                </View>
              </View>

              {numbers.map((number) => (
                <View key={number.id} style={styles.numberCard}>
                  <View style={styles.numberInfo}>
                    <View style={styles.numberHeader}>
                      <Phone size={20} color="#3B82F6" />
                      <Text style={styles.phoneNumber}>{number.phoneNumber}</Text>
                      {number.status === 'active' && (
                        <CheckCircle size={16} color="#10B981" />
                      )}
                    </View>
                    <View style={styles.numberDetails}>
                      <Text style={styles.detailLabel}>Code pays: {number.countryCode}</Text>
                      <Text style={styles.detailLabel}>Fournisseur: {number.provider}</Text>
                      {number.assignedUserId && (
                        <Text style={styles.detailLabel}>
                          Assigné à: {number.assignedUserId}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNumber(number.id)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un numéro virtuel</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Numéro de téléphone *</Text>
                <TextInput
                  style={styles.input}
                  value={newNumber.phoneNumber}
                  onChangeText={(text) => setNewNumber({ ...newNumber, phoneNumber: text })}
                  placeholder="+33 1 23 45 67 89"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pays *</Text>
                <TextInput
                  style={styles.input}
                  value={newNumber.country}
                  onChangeText={(text) => setNewNumber({ ...newNumber, country: text })}
                  placeholder="France"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Code pays *</Text>
                <TextInput
                  style={styles.input}
                  value={newNumber.countryCode}
                  onChangeText={(text) => setNewNumber({ ...newNumber, countryCode: text })}
                  placeholder="+33"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fournisseur</Text>
                <TextInput
                  style={styles.input}
                  value={newNumber.provider}
                  onChangeText={(text) => setNewNumber({ ...newNumber, provider: text })}
                  placeholder="Twilio"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>URL Webhook</Text>
                <TextInput
                  style={styles.input}
                  value={newNumber.webhookUrl}
                  onChangeText={(text) => setNewNumber({ ...newNumber, webhookUrl: text })}
                  placeholder="https://votre-domaine.com/webhooks/vapi"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.modalButton} onPress={handleAddNumber}>
                <Text style={styles.modalButtonText}>Ajouter le numéro</Text>
              </TouchableOpacity>
            </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
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
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#94A3B8',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  countrySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  countryTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  badge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  numberCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  numberInfo: {
    flex: 1,
  },
  numberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    flex: 1,
  },
  numberDetails: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  deleteButton: {
    padding: 12,
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
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
  modalButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
