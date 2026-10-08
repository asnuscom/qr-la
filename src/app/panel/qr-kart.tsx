import { QRCardTemplate } from '@/components/QRCardTemplate';
import { authService } from '@/services/authService';
import { eventService } from '@/services/eventService';
import { slugify } from '@/services/mockData';
import { EventModel } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRCardScreen() {
  const router = useRouter();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Masa QR Kartı Şablonu | QR-la';
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const user = authService.getState().user;
      let activeSlug = 'demo-panel';
      if (user && user.uid !== 'demo-host-yavuz') {
        activeSlug =
          user.events?.find((s) => s && s !== 'demo-panel' && s !== 'samet-ve-sule') ||
          slugify(user.displayName || user.email?.split('@')[0] || 'etkinlik');
      }
      const ev = await eventService.getEvent(activeSlug, user?.displayName);
      setEvent(ev);
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Navbar */}
        {/* @ts-ignore */}
        <View style={styles.navbar} className="no-print">
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/panel' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>
          <View style={styles.navTitleBox}>
            <Text style={styles.navTitle}>Masa & Stand QR Kartı</Text>
            <Text style={styles.navSub}>Masanosuz / Masa Standı & Baskı</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Printable Card Template */}
        <QRCardTemplate event={event} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scroll: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  navTitleBox: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
  },
  navSub: {
    fontSize: 11,
    color: '#8A6D3B',
    fontWeight: '600',
  },
});
