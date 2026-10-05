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
      <Stack.Screen name="index" />
      <Stack.Screen name="yukle" />
      <Stack.Screen name="galeri" />
      <Stack.Screen name="ani-defteri" />
      <Stack.Screen name="canli" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
