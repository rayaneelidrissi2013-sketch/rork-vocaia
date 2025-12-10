import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import { User, AuthContextType } from '@/types';
import { trpc } from '@/lib/trpc';

export const [AuthProvider, useAuth] = createContextHook(
  (): AuthContextType => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const registerMutation = trpc.auth.register.useMutation();
    const loginMutation = trpc.auth.login.useMutation();

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

    const login = async (email: string, password: string) => {
      try {
        setIsLoading(true);

        const response = await loginMutation.mutateAsync({
          email,
          password,
        });

        if (!response.success) {
          throw new Error('Login failed');
        }

        const user: User = {
          ...response.user,
          role: response.user.role as 'user' | 'admin' | undefined,
        };
        setUser(user);
      } catch (error) {
        console.error('[Auth] Login error:', error);
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

      login,
      adminLogin: login,

      register,
      logout: async () => setUser(null),
      setPlanActive: async () => {},
    };
  }
);
