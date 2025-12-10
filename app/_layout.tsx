import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CallsProvider } from "@/contexts/CallsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 5000,
      networkMode: 'online',
      gcTime: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={localStyles.loadingContainer}>
          <Text style={localStyles.errorText}>Une erreur s&apos;est produite</Text>
          <Text style={localStyles.loadingText}>Veuillez redémarrer l&apos;application</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function useProtectedRoute(user: any, isAdmin: boolean, hasActivePlan: boolean, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = React.useState(false);

  useEffect(() => {
    if (isLoading) {
      console.log('[useProtectedRoute] Skipping - auth still loading');
      return;
    }

    if (hasNavigated) {
      console.log('[useProtectedRoute] Skipping - already navigated once');
      return;
    }
    
    const inTabs = segments[0] === "(tabs)";
    const inAdmin = segments[0] === "(admin)";
    const inLogin = segments[0] === "login";
    const inAdminLogin = segments[0] === "admin-login";
    const inPricing = segments[0] === "pricing";
    
    console.log('[useProtectedRoute] Checking navigation:', { user: !!user, isAdmin, hasActivePlan, segment: segments[0] });

    let shouldNavigate = false;
    let targetRoute = '';
    
    if (!user && (inTabs || inAdmin || inPricing)) {
      shouldNavigate = true;
      targetRoute = inAdmin ? "/admin-login" : "/login";
    } else if (user && !isAdmin && inAdmin) {
      shouldNavigate = true;
      targetRoute = "/(tabs)";
    } else if (user && isAdmin && (inTabs || inPricing)) {
      shouldNavigate = true;
      targetRoute = "/(admin)/dashboard";
    } else if (user && !isAdmin && !hasActivePlan && inTabs) {
      shouldNavigate = true;
      targetRoute = "/pricing";
    } else if (user && (inLogin || inAdminLogin)) {
      shouldNavigate = true;
      if (isAdmin) {
        targetRoute = "/(admin)/dashboard";
      } else if (!hasActivePlan) {
        targetRoute = "/pricing";
      } else {
        targetRoute = "/(tabs)";
      }
    }

    if (shouldNavigate && targetRoute) {
      console.log('[useProtectedRoute] Navigating to:', targetRoute);
      setHasNavigated(true);
      setTimeout(() => {
        router.replace(targetRoute as any);
      }, 100);
    }
  }, [user, isAdmin, hasActivePlan, segments, isLoading, router, hasNavigated]);
}

function RootLayoutNav() {
  const authContext = useAuth();
  
  const user = authContext?.user || null;
  const isAdmin = authContext?.isAdmin || false;
  const hasActivePlan = authContext?.hasActivePlan || false;
  const isLoading = authContext?.isLoading || false;
  
  console.log('[RootLayoutNav] Render:', { 
    user: user?.email, 
    isAdmin, 
    hasActivePlan, 
    isLoading
  });
  
  useEffect(() => {
    console.log('[RootLayoutNav] Mounting - hiding splash immediately');
    setTimeout(() => {
      SplashScreen.hideAsync().catch(e => console.log('[Splash] Hide error:', e));
    }, 200);
  }, []);

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then(token => {
        console.log('Notification token registered:', token);
      }).catch(error => {
        console.error('Failed to register for notifications:', error);
      });
    }
  }, [user]);

  useProtectedRoute(user, isAdmin, hasActivePlan, isLoading);

  console.log('[RootLayoutNav] Rendering stack immediately');

  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="admin-login" options={{ headerShown: false }} />
      <Stack.Screen name="pricing" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="call/[id]" options={{ headerShown: true, title: "Détails de l'appel" }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});



export default function RootLayout() {
  console.log('[RootLayout] Rendering');
  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <AuthProvider>
              <CallsProvider>
                <SettingsProvider>
                  <AdminProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <RootLayoutNav />
                    </GestureHandlerRootView>
                  </AdminProvider>
                </SettingsProvider>
              </CallsProvider>
            </AuthProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
