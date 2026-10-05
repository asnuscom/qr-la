import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { EventModel } from '@/types';

export default function EventLayout() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const loadEvent = async () => {
      setIsLoading(true);
      const ev = await eventService.getEvent(slug);
      setEvent(ev);
      if (!ev || !ev.settings.isPrivate) {
        setIsUnlocked(true);
      }
      setIsLoading(false);
    };
    loadEvent();
  }, [slug]);

  const handleVerifyPin = () => {
    if (!event) return;
    if (event.settings.pinCode === pinInput.trim()) {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
        <Text style={styles.loadingText}>Etkinlik yükleniyor...</Text>
      </View>
    );
  }

  // If private and not yet unlocked, render PIN screen modal
  if (event?.settings.isPrivate && !isUnlocked) {
    return (
      <View style={styles.pinContainer}>
        <View style={styles.pinCard}>
          <View style={styles.lockCircle}>
            <Ionicons name="lock-closed" size={32} color="#C5A059" />
          </View>
          <Text style={styles.pinTitle}>{event.title}</Text>
          <Text style={styles.pinDesc}>
            Bu etkinlik gizlidir. Masanızdaki QR kartının altındaki 4 haneli PIN kodunu giriniz.
          </Text>

          <TextInput
            style={[styles.pinInput, pinError && styles.pinInputError]}
            keyboardType="numeric"
            maxLength={6}
            placeholder="PIN Kodu"
            placeholderTextColor="#9CA3AF"
            value={pinInput}
            onChangeText={(txt) => {
              setPinInput(txt);
              setPinError(false);
            }}
            secureTextEntry
          />

          {pinError && (
            <Text style={styles.errorText}>Hatalı PIN kodu. Lütfen tekrar deneyin.</Text>
          )}

          <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyPin}>
            <Text style={styles.verifyBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8A6D3B',
    fontWeight: '600',
  },
  pinContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pinCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  lockCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAD7BB',
  },
  pinTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1817',
    textAlign: 'center',
    marginBottom: 8,
  },
  pinDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  pinInput: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    color: '#1A1817',
    marginBottom: 12,
  },
  pinInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 12,
  },
  verifyBtn: {
    width: '100%',
    backgroundColor: '#C5A059',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
