import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function PanelLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'QR-la Workspace | Ortak Yönetim Paneli' }} />
      <Stack.Screen name="etkinlik" options={{ title: 'Düğün & Etkinlik Paneli | QR-la' }} />
      <Stack.Screen name="duzenle" options={{ title: 'Etkinlik Detaylarını Düzenle | QR-la' }} />
      <Stack.Screen name="ayarlar" options={{ title: 'Özel Bağlantı & Gizlilik Ayarları | QR-la' }} />
      <Stack.Screen name="qr-kart" options={{ title: 'Masa QR Kartı Şablonu | QR-la' }} />
      <Stack.Screen name="arac" options={{ title: 'Araç & Motosiklet Park Tagı | QR-la' }} />
      <Stack.Screen name="pati" options={{ title: 'Pati Künyesi (Petguru) | QR-la' }} />
      <Stack.Screen name="kartvizit" options={{ title: 'Dijital Kartvizit (vCard & NFC) | QR-la' }} />
      <Stack.Screen name="menu" options={{ title: 'Restoran & Kafe Menü QR | QR-la' }} />
      <Stack.Screen name="varliklar" options={{ title: 'Tüm QR Varlıklarım | QR-la' }} />
      <Stack.Screen name="analitik" options={{ title: 'Dinamik QR Analitiği | QR-la' }} />
      <Stack.Screen name="magaza" options={{ title: 'Baskı & Matbaa Mağazası | QR-la' }} />
      <Stack.Screen name="qr-studio" options={{ title: 'QR Kod Tasarım Stüdyosu | QR-la' }} />
      <Stack.Screen name="tarifeler" options={{ title: 'Kota ve Paket Yükseltme | QR-la' }} />
    </Stack>
  );
}
