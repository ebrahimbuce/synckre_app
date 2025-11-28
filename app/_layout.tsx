import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import '@/global.css';
import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { XIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { LogBox, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SheetProvider } from 'react-native-actions-sheet';
import { ChatActionSheet } from '@/components/chat/chat-action-sheet';

// 🔇 Ignora el warning para los modales secundarios
LogBox.ignoreLogs(['No native splash screen registered for given view controller']);

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Ocultar splash screen después de un breve delay
  React.useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        // Silenciar errores del splash screen
      }
    };

    const timeout = setTimeout(hideSplash, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Si no hay clave de Clerk, mostrar un mensaje de error en lugar de crashear
  if (!clerkKey) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>
          Configuración faltante
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 10 }}>
          EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY no está configurada
        </Text>
        <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
          Agrega esta variable en tu archivo .env
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <KeyboardProvider>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={clerkKey}
        >
          <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Routes />
            <PortalHost />
          </ThemeProvider>
        </ClerkProvider>
      </KeyboardProvider>
    </ErrorBoundary>
  );
}

// Error Boundary para capturar errores y evitar pantallas blancas
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error capturado y manejado silenciosamente
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#000' }}>
            Algo salió mal
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 10 }}>
            {this.state.error?.message || 'Error desconocido'}
          </Text>
          <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
            Revisa los logs de la consola para más detalles
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function Routes() {
  const router = useRouter();
  const [splashHidden, setSplashHidden] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);

  const { isSignedIn, isLoaded } = useAuth();

  // Ocultar el splash screen cuando Clerk esté listo
  React.useEffect(() => {
    const hideSplash = async () => {
      if (!splashHidden) {
        try {
          await SplashScreen.hideAsync();
          setSplashHidden(true);
        } catch (err) {
          setSplashHidden(true);
        }
      }
    };

    if (isLoaded) {
      hideSplash();
    } else {
      const timeout = setTimeout(() => {
        hideSplash();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isLoaded, splashHidden]);

  // Timeout de seguridad: ocultar splash después de 2 segundos máximo
  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!splashHidden) {
        try {
          await SplashScreen.hideAsync();
          setSplashHidden(true);
        } catch (err) {
          setSplashHidden(true);
        }
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [splashHidden]);

  // Marcar como no inicial después de un momento
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setInitialLoad(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Mostrar contenido incluso si Clerk no está cargado todavía
  if (!isLoaded && initialLoad) {
    return (
      <GestureHandlerRootView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <Text style={{ fontSize: 16, color: '#666' }}>Cargando...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  if (!isLoaded) {
    return (
      <GestureHandlerRootView className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
        <Stack>
          <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
        </Stack>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SheetProvider>
        <Stack>
          {/* Screens when NOT signed in */}
          <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
            <Stack.Screen name="(auth)/sign-up" options={SIGN_UP_SCREEN_OPTIONS} />
            <Stack.Screen name="(auth)/reset-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
            <Stack.Screen name="(auth)/forgot-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
          </Stack.Protected>

          {/* Screens when IS signed in */}
          <Stack.Protected guard={isSignedIn}>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings"
              options={{
                presentation: 'modal',
                headerTitle: 'Configuración',
                headerShadowVisible: false,
                headerLeft: () => (
                  <Button
                    onPressIn={() => router.back()}
                    size="icon"
                    variant="ghost"
                    className="ios:size-9 rounded-full web:mx-4">
                    <Icon as={XIcon} className="size-6" />
                  </Button>
                ),
              }}
            />
          </Stack.Protected>
        </Stack>
        <ChatActionSheet />
      </SheetProvider>
    </GestureHandlerRootView>
  );
}

const SIGN_IN_SCREEN_OPTIONS = {
  headerShown: false,
  title: 'Sign in',
};

const SIGN_UP_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerTransparent: true,
  gestureEnabled: false,
} as const;

const DEFAULT_AUTH_SCREEN_OPTIONS = {
  title: '',
  headerShadowVisible: false,
  headerTransparent: true,
};
