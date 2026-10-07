import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAF7F2' },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "QR-la | Masadaki Kodu QR'la, En Mutlu Anları Paylaş" }}
        />
        <Stack.Screen
          name="giris"
          options={{ title: "Giriş Yap & Kayıt Ol | QR-la" }}
        />
        <Stack.Screen
          name="demo"
          options={{ title: "Canlı Düğün Demosu | QR-la" }}
        />
        <Stack.Screen
          name="[slug]"
          options={{ title: "Etkinlik | QR-la" }}
        />
        <Stack.Screen
          name="panel"
          options={{ title: "Yönetim Paneli | QR-la" }}
        />
      </Stack>
    </>
  );
}
