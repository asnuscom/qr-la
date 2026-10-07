import React from 'react';
import { Stack } from 'expo-router';

export default function PanelLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF7F2' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Yönetim Paneli | QR-la' }} />
      <Stack.Screen name="duzenle" options={{ title: 'Etkinlik Detaylarını Düzenle | QR-la' }} />
      <Stack.Screen name="qr-kart" options={{ title: 'Masa QR Kartı Şablonu | QR-la' }} />
      <Stack.Screen name="tarifeler" options={{ title: 'Kota ve Paket Yükseltme | QR-la' }} />
    </Stack>
  );
}
