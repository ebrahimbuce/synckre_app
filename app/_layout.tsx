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
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SheetProvider } from 'react-native-actions-sheet';
import { ChatActionSheet } from '@/components/chat/chat-action-sheet';

// 🔇 Ignora el warning para los modales secundarios
LogBox.ignoreLogs(['No native splash screen registered for given view controller']);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <KeyboardProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Routes />
          <PortalHost />
        </ThemeProvider>
      </ClerkProvider>
    </KeyboardProvider>
  );
}

function Routes() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // 👇 Solo ocultamos el splash UNA VEZ, cuando la auth está lista
  React.useEffect(() => {
    if (isLoaded) {
      const hide = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (err) {
          console.warn('Error hiding splash screen:', err);
        }
      };
      hide();
    }
  }, [isLoaded]);

  if (!isLoaded) return null;

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
