import React from 'react';
import { Stack } from 'expo-router';

export default function EventLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF7F2' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Hoş Geldiniz | QR-la' }} />
      <Stack.Screen name="yukle" options={{ title: 'Fotoğraf Yükle | QR-la' }} />
      <Stack.Screen name="galeri" options={{ title: 'Fotoğraf Galerisi | QR-la' }} />
      <Stack.Screen name="ani-defteri" options={{ title: 'Anı Defteri | QR-la' }} />
      <Stack.Screen name="canli" options={{ title: 'Canlı Projeksiyon Yayını | QR-la', presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
