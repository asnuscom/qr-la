import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '@/services/authService';
import { AuthState } from '@/types';

export default function LoginScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsub = authService.subscribe((state) => {
      setAuthState(state);
      if (state.isAuthenticated && state.user) {
        // Redirect if already logged in
        router.replace('/panel' as any);
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta adresinizi ve şifrenizi girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.signIn(email.trim(), password.trim());
      setIsSubmitting(false);
      router.replace('/panel' as any);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Giriş Başarısız', err?.message || 'E-posta veya şifre hatalı.');
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen adınızı, e-posta adresinizi ve şifrenizi girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.signUp(email.trim(), password.trim(), displayName.trim());
      setIsSubmitting(false);
      router.replace('/panel' as any);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Kayıt Başarısız', err?.message || 'Kayıt sırasında bir hata oluştu.');
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    await authService.signInAsDemoHost();
    setIsSubmitting(false);
    router.replace('/panel' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>
          <View style={styles.brandRow}>
            <Ionicons name="qr-code" size={18} color="#C5A059" />
            <Text style={styles.brandText}>
              QR<Text style={{ color: '#C5A059' }}>-la</Text>
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Center Card */}
        <View style={styles.authCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-circle-outline" size={38} color="#C5A059" />
          </View>

          <Text style={styles.title}>Ev Sahibi Girişi</Text>
          <Text style={styles.subtitle}>
            Düğün ve etkinliklerinizi yönetmek, fotoğrafları indirmek ve canlı projeksiyonu başlatmak için giriş yapın.
          </Text>

          {/* Guest Notice Callout */}
          <View style={styles.guestNotice}>
            <Ionicons name="information-circle-outline" size={16} color="#8A6D3B" />
            <Text style={styles.guestNoticeText}>
              Misafir misiniz? Fotoğraf yüklemek için hesap oluşturmanıza gerek yok. Masadaki QR kodu kameranızla okutmanız yeterlidir!
            </Text>
          </View>

          {/* Quick 1-Click Demo Login */}
          <TouchableOpacity
            style={styles.demoLoginBtn}
            onPress={handleDemoLogin}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={16} color="#B8860B" />
            <Text style={styles.demoLoginBtnText}>1 Tıkla Demo Ev Sahibi Girişi</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>VEYA E-POSTA İLE</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Tab Selector */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'login' && styles.tabBtnActive]}
              onPress={() => setTab('login')}
            >
              <Text style={[styles.tabBtnText, tab === 'login' && styles.tabBtnTextActive]}>
                Giriş Yap
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, tab === 'register' && styles.tabBtnActive]}
              onPress={() => setTab('register')}
            >
              <Text style={[styles.tabBtnText, tab === 'register' && styles.tabBtnTextActive]}>
                Yeni Hesap Aç
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          {tab === 'register' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adınız & Soyadınız (veya Çift İsimleri)</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Merve & Yavuz"
                placeholderTextColor="#9CA3AF"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-Posta Adresi</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@mail.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={tab === 'login' ? handleLogin : handleRegister}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {tab === 'login' ? 'Giriş Yap & Panele Geç' : 'Kayıt Ol & Etkinliğini Kur'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
  },
  navbar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    backgroundColor: '#FFF',
    marginBottom: 24,
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1817',
  },
  authCard: {
    width: '90%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3EFE6',
    shadowColor: '#C5A059',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  guestNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    marginBottom: 18,
  },
  guestNoticeText: {
    fontSize: 11,
    color: '#8A6D3B',
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
  demoLoginBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 18,
  },
  demoLoginBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 4,
    width: '100%',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabBtnTextActive: {
    color: '#1A1817',
    fontWeight: '700',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1817',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#C5A059',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#C5A059',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
