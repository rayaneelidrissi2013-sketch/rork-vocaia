import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { CallsContextType, Call } from '@/types';
import { mockCalls } from '@/mocks/data';
import { scheduleCallNotification } from '@/utils/notifications';

const CALLS_STORAGE_KEY = 'calls_history';

export const [CallsProvider, useCalls] = createContextHook((): CallsContextType => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('[Calls] Initializing with mock data immediately');
    setCalls(mockCalls);
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      console.log('[Calls] Loading calls from storage in background...');
      const storedCalls = await AsyncStorage.getItem(CALLS_STORAGE_KEY);
      
      if (storedCalls) {
        const parsedCalls = JSON.parse(storedCalls);
        setCalls(parsedCalls);
        console.log('[Calls] Loaded', parsedCalls.length, 'calls');
      } else {
        await AsyncStorage.setItem(CALLS_STORAGE_KEY, JSON.stringify(mockCalls));
      }
    } catch (error) {
      console.error('[Calls] Error loading calls:', error);
    }
  };

  const refreshCalls = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const storedCalls = await AsyncStorage.getItem(CALLS_STORAGE_KEY);
      if (storedCalls) {
        const parsedCalls = JSON.parse(storedCalls);
        const previousCallsCount = calls.length;
        
        if (parsedCalls.length > previousCallsCount) {
          const newCalls = parsedCalls.slice(0, parsedCalls.length - previousCallsCount);
          for (const call of newCalls) {
            await scheduleCallNotification(
              call.callerNumber,
              call.callerName,
              call.summary
            );
          }
        }
        
        setCalls(parsedCalls);
      }
    } catch (error) {
      console.error('Error refreshing calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    calls,
    isLoading,
    refreshCalls,
  };
});
