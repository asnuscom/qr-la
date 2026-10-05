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
      <Stack.Screen name="index" />
      <Stack.Screen name="duzenle" />
      <Stack.Screen name="qr-kart" />
      <Stack.Screen name="tarifeler" />
    </Stack>
  );
}
