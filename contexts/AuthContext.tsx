import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import { User, AuthContextType } from '@/types';
import { trpc } from '@/lib/trpc';

export const [AuthProvider, useAuth] = createContextHook(
  (): AuthContextType => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ REGISTER via BACKEND (temporaire)
    const registerMutation = trpc.auth.register.useMutation();

    const register = async (
      email: string,
      _password: string,
      name: string,
      phoneNumber: string
    ) => {
      try {
        setIsLoading(true);

        const response = await registerMutation.mutateAsync({
          email,
          name,
          phoneNumber,
          language: 'fr',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        if (!response.success) {
          throw new Error('Registration failed');
        }

        const user: User = {
          ...response.user,
          role: response.user.role as 'user' | 'admin' | undefined,
        };
        setUser(user);
      } catch (error) {
        console.error('[Auth] Register error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    };

    return {
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      hasActivePlan: false,
      isLoading,

      // ✅ TEMPORAIREMENT DÉSACTIVÉS
      login: async () => {
        throw new Error('Login not implemented yet');
      },
      adminLogin: async () => {
        throw new Error('Admin login not implemented yet');
      },

      register,
      logout: async () => setUser(null),
      setPlanActive: async () => {},
    };
  }
);
