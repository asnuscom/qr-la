import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { notificationService } from '@/services/notificationService';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    notificationService.registerForPushNotificationsAsync().catch(() => {});

    if (Platform.OS !== 'web') {
      const response = Notifications.getLastNotificationResponse();
      const initialUrl = response?.notification.request.content.data?.url;
      if (typeof initialUrl === 'string') {
        router.push(initialUrl as any);
      }

      const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
        const url = resp.notification.request.content.data?.url;
        if (typeof url === 'string') {
          router.push(url as any);
        }
      });

      return () => {
        sub.remove();
      };
    }
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'QR-la | Düğünde & Nikahta Karekodla Fotoğraf Yüklemesi - Davetiye Etkinlik Albümü',
          }}
        />
        <Stack.Screen
          name="giris"
          options={{ title: 'Giriş Yap & Kayıt Ol | QR-la' }}
        />
        <Stack.Screen
          name="demo"
          options={{ title: 'Canlı Düğün Demosu | QR-la' }}
        />
        <Stack.Screen
          name="[slug]"
          options={{ title: 'Etkinlik | QR-la' }}
        />
        <Stack.Screen
          name="panel"
          options={{ title: 'Yönetim Paneli | QR-la' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
