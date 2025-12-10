import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Save,
  Edit2,
  Lock,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';

export default function UserDetailsScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const isCreating = userId === 'new';

  const [isEditing, setIsEditing] = useState<boolean>(isCreating);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    profession: '',
    planId: 'free',
  });

  const allUsersQuery = trpc.admin.getAllUsers.useQuery();
  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      Alert.alert('Succès', 'Utilisateur créé avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      allUsersQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      Alert.alert('Succès', 'Utilisateur modifié avec succès');
      setIsEditing(false);
      allUsersQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const updatePasswordMutation = trpc.admin.updateUserPassword.useMutation({
    onSuccess: () => {
      Alert.alert('Succès', 'Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      setNewPassword('');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const currentUser = React.useMemo(() => {
    if (isCreating || !allUsersQuery.data) return null;
    return allUsersQuery.data.find((u: any) => u.id === userId);
  }, [allUsersQuery.data, userId, isCreating]);

  React.useEffect(() => {
    if (currentUser && !isCreating) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        password: '',
        phoneNumber: currentUser.phoneNumber || '',
        profession: currentUser.profession || '',
        planId: currentUser.planId || 'free',
      });
    }
  }, [currentUser, isCreating]);

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.phoneNumber) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isCreating) {
      if (!formData.password || formData.password.length < 6) {
        Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      createUserMutation.mutate(formData);
    } else {
      updateUserMutation.mutate({
        userId: userId as string,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        profession: formData.profession,
        planId: formData.planId,
      });
    }
  };

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    updatePasswordMutation.mutate({
      userId: userId as string,
      newPassword,
    });
  };

  if (!isCreating && allUsersQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isCreating ? 'Nouvel Utilisateur' : 'Détails Utilisateur'}
        </Text>
        {!isCreating && !isEditing && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Edit2 size={20} color="#3B82F6" />
          </TouchableOpacity>
        )}
        {!isEditing && <View style={styles.backButton} />}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Personnelles</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom complet *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Jean Dupont"
              placeholderTextColor="#64748B"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="email@exemple.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={isEditing}
            />
          </View>

          {isCreating && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe *</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Minimum 6 caractères"
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </View>
          )}

          {!isCreating && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={() => setShowPasswordModal(true)}
              >
                <Lock size={20} color="#3B82F6" />
                <Text style={styles.passwordButtonText}>Modifier le mot de passe</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              placeholder="+33612345678"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Profession</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.profession}
              onChangeText={(text) => setFormData({ ...formData, profession: text })}
              placeholder="Avocat, Médecin..."
              placeholderTextColor="#64748B"
              editable={isEditing}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnement</Text>
          
          <View style={styles.plansContainer}>
            {SUBSCRIPTION_PLANS.filter(p => p.id !== 'enterprise').map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  formData.planId === plan.id && styles.planCardActive,
                  !isEditing && styles.planCardDisabled,
                ]}
                onPress={() => isEditing && setFormData({ ...formData, planId: plan.id })}
                disabled={!isEditing}
              >
                <Text style={[
                  styles.planName,
                  formData.planId === plan.id && styles.planNameActive,
                ]}>
                  {plan.name}
                </Text>
                <Text style={styles.planPrice}>€{plan.price}</Text>
                <Text style={styles.planMinutes}>{plan.minutesIncluded} min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isEditing && (
          <View style={styles.actions}>
            {!isCreating && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  if (currentUser) {
                    setFormData({
                      name: currentUser.name || '',
                      email: currentUser.email || '',
                      password: '',
                      phoneNumber: currentUser.phoneNumber || '',
                      profession: currentUser.profession || '',
                      planId: currentUser.planId || 'free',
                    });
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.saveButton, !isCreating && { flex: 1 }]}
              onPress={handleSave}
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {(createUserMutation.isPending || updateUserMutation.isPending) ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Save size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {isCreating ? 'Créer l\'utilisateur' : 'Enregistrer'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le mot de passe</Text>
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nouveau mot de passe (min. 6 caractères)"
              placeholderTextColor="#64748B"
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleChangePassword}
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 20,
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
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
  plansContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  planCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  planCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A5F',
  },
  planCardDisabled: {
    opacity: 0.6,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  planNameActive: {
    color: '#3B82F6',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 4,
  },
  planMinutes: {
    fontSize: 14,
    color: '#94A3B8',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#94A3B8',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtonPrimary: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#64748B',
  },
});
