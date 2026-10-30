import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QRCode from 'qrcode';
import { authService } from '@/services/authService';
import { vcardService, cleanVCardSlug } from '@/services/vcardService';
import { VCardData, VCardThemeId, VCardBankInfo, VCardPortfolioItem } from '@/types';
import { VCARD_THEMES, getVCardTheme } from '@/modules/vcard/themes';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

const AVATAR_SUGGESTIONS = [
  {
    label: 'Erkek Yönetici 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Erkek Yönetici 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Kadın Yönetici 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Kadın Yönetici 2',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
  },
];

export default function VCardManagementScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);
  const [currentUser] = useState(authService.getState().user);
  const [userCards, setUserCards] = useState<VCardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | 'new'>('new');
  const [_isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('');
  const [slug, setSlug] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [theme, setTheme] = useState<VCardThemeId>('executive_dark');

  // Socials
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  // Bank Info
  const [bankAccounts, setBankAccounts] = useState<VCardBankInfo[]>([]);
  const [newBankName, setNewBankName] = useState('');
  const [newBankIban, setNewBankIban] = useState('');
  const [newBankHolder, setNewBankHolder] = useState('');

  // Portfolio
  const [portfolioLinks, setPortfolioLinks] = useState<VCardPortfolioItem[]>([]);
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortUrl, setNewPortUrl] = useState('');

  // NFC Card Modal
  const [nfcModalVisible, setNfcModalVisible] = useState(false);
  const [nfcQrDataUrl, setNfcQrDataUrl] = useState('');

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Dijital Kartvizit (vCard & NFC) Yönetimi | QR-la';
    }
  }, []);

  const resetForm = () => {
    setFullName('');
    setSlug('');
    setJobTitle('');
    setCompany('');
    setDepartment('');
    setAvatarUrl(AVATAR_SUGGESTIONS[0].url);
    setCoverUrl('');
    setBio('');
    setPhone('');
    setPhoneSecondary('');
    setWhatsapp('');
    setEmail(currentUser?.email || '');
    setWebsite('');
    setLocation('İstanbul / Türkiye');
    setMapUrl('');
    setTheme('executive_dark');
    setLinkedin('');
    setGithub('');
    setInstagram('');
    setTwitter('');
    setBankAccounts([]);
    setPortfolioLinks([]);
  };

  const fillFormWithCard = (card: VCardData) => {
    setFullName(card.fullName || '');
    setSlug(card.slug || '');
    setJobTitle(card.jobTitle || '');
    setCompany(card.company || '');
    setDepartment(card.department || '');
    setAvatarUrl(card.avatarUrl || '');
    setCoverUrl(card.coverUrl || '');
    setBio(card.bio || '');
    setPhone(card.phone || '');
    setPhoneSecondary(card.phoneSecondary || '');
    setWhatsapp(card.whatsapp || '');
    setEmail(card.email || '');
    setWebsite(card.website || '');
    setLocation(card.location || '');
    setMapUrl(card.mapUrl || '');
    setTheme(card.theme || 'executive_dark');
    setLinkedin(card.socials?.linkedin || '');
    setGithub(card.socials?.github || '');
    setInstagram(card.socials?.instagram || '');
    setTwitter(card.socials?.twitter || '');
    setBankAccounts(card.bankAccounts || []);
    setPortfolioLinks(card.portfolioLinks || []);
  };

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const uid = currentUser?.uid || 'demo-host-yavuz';
      const cards = await vcardService.getUserCards(uid);
      setUserCards(cards);
      if (cards.length > 0 && selectedCardId === 'new') {
        fillFormWithCard(cards[0]);
        setSelectedCardId(cards[0].id);
      }
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [currentUser]);

  const handleSelectCard = (c: VCardData) => {
    setSelectedCardId(c.id);
    fillFormWithCard(c);
  };

  const handleAddNewCard = () => {
    setSelectedCardId('new');
    resetForm();
  };

  const handleAddBank = () => {
    if (!newBankName.trim() || !newBankIban.trim()) {
      alert('Lütfen banka adı ve IBAN girin.');
      return;
    }
    const cleanIban = newBankIban.toUpperCase().trim();
    setBankAccounts([
      ...bankAccounts,
      {
        bankName: newBankName.trim(),
        iban: cleanIban,
        accountHolder: newBankHolder.trim() || fullName || 'Hesap Sahibi',
      },
    ]);
    setNewBankName('');
    setNewBankIban('');
    setNewBankHolder('');
  };

  const handleRemoveBank = (idx: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== idx));
  };

  const handleAddPortfolio = () => {
    if (!newPortTitle.trim() || !newPortUrl.trim()) {
      alert('Lütfen başlık ve bağlantı URL girin.');
      return;
    }
    setPortfolioLinks([
      ...portfolioLinks,
      {
        title: newPortTitle.trim(),
        url: newPortUrl.trim(),
        type: newPortUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'link',
      },
    ]);
    setNewPortTitle('');
    setNewPortUrl('');
  };

  const handleRemovePortfolio = (idx: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      alert('Lütfen ad ve soyadınızı girin.');
      return;
    }
    if (!phone.trim()) {
      alert('Lütfen cep telefonunuzu girin.');
      return;
    }

    setIsSaving(true);
    try {
      const effectiveSlug = cleanVCardSlug(slug || fullName);
      const cardPayload: Partial<VCardData> & { fullName: string; phone: string } = {
        id: selectedCardId === 'new' ? undefined : selectedCardId,
        slug: effectiveSlug,
        userId: currentUser?.uid || 'demo-host-yavuz',
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim() || 'Profesyonel',
        company: company.trim(),
        department: department.trim(),
        avatarUrl: avatarUrl.trim() || AVATAR_SUGGESTIONS[0].url,
        coverUrl: coverUrl.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        phoneSecondary: phoneSecondary.trim(),
        whatsapp: whatsapp.trim() || phone.replace(/\D/g, ''),
        email: email.trim(),
        website: website.trim(),
        location: location.trim(),
        mapUrl: mapUrl.trim(),
        theme,
        socials: {
          linkedin: linkedin.trim() || undefined,
          github: github.trim() || undefined,
          instagram: instagram.trim() || undefined,
          twitter: twitter.trim() || undefined,
        },
        bankAccounts,
        portfolioLinks,
        isNfcCardClaimed: true,
      };

      const saved = await vcardService.saveCard(cardPayload);
      alert(`🎉 "${saved.fullName}" kartviziti başarıyla kaydedildi!`);

      await loadCards();
      setSelectedCardId(saved.id);
    } catch (err: any) {
      alert(`Kayıt sırasında hata oluştu: ${err?.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openNfcModal = async (c: VCardData) => {
    try {
      const url = `https://qr-la.com/k/${c.slug}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 360,
        margin: 2,
        color: {
          dark: '#0A0B0E',
          light: '#FFFFFF',
        },
      });
      setNfcQrDataUrl(dataUrl);
      setNfcModalVisible(true);
    } catch (err) {
      console.error('Failed to generate NFC QR:', err);
    }
  };

  const printNfcCard = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    }
  };

  const currentCardObj = userCards.find(c => c.id === selectedCardId);
  const currentTheme = getVCardTheme(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/panel')}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#6366F1" />
            <Text style={styles.backBtnText}>Panela Dön</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ThemeToggleBtn size="sm" />
            <View style={styles.headerBadge}>
              <Ionicons name="card" size={14} color="#6366F1" />
              <Text style={styles.headerBadgeText}>Dijital Kartvizit & NFC</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pageTitle}>💼 Dijital Kartvizit (vCard & NFC) Yönetimi</Text>
        <Text style={styles.pageSubtitle}>
          Tek tıkla cep telefonu rehberine kişi kaydetme (.vcf), profesyonel profil sayfası ve lüks NFC akıllı kartvizit entegrasyonu.
        </Text>

        {/* Existing Cards Selector */}
        <View style={styles.cardListSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardListScroll}>
            {userCards.map(c => {
              const isSelected = c.id === selectedCardId;
              const cardTheme = getVCardTheme(c.theme);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.cardThumbItem,
                    isSelected && styles.cardThumbItemSelected,
                    { borderColor: isSelected ? cardTheme.primaryColor : 'rgba(255,255,255,0.1)' },
                  ]}
                  onPress={() => handleSelectCard(c)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: c.avatarUrl }} style={styles.cardThumbAvatar} />
                  <Text style={styles.cardThumbName} numberOfLines={1}>{c.fullName}</Text>
                  <Text style={styles.cardThumbJob} numberOfLines={1}>{c.jobTitle}</Text>
                  <View style={[styles.cardThumbSlugBadge, { backgroundColor: cardTheme.pillBg }]}>
                    <Text style={[styles.cardThumbSlugText, { color: cardTheme.accentColor }]}>
                      /{c.slug}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Add New Card Button */}
            <TouchableOpacity
              style={[
                styles.addNewCardBtn,
                selectedCardId === 'new' && styles.addNewCardBtnActive,
              ]}
              onPress={handleAddNewCard}
              activeOpacity={0.85}
            >
              <View style={styles.addNewCardIconCircle}>
                <Ionicons name="add" size={24} color="#6366F1" />
              </View>
              <Text style={styles.addNewCardText}>Yeni Kartvizit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Quick Actions Bar for Selected Card */}
        {currentCardObj && (
          <View style={styles.quickBar}>
            <View style={styles.quickBarInfo}>
              <Text style={styles.quickBarName}>{currentCardObj.fullName} • {currentCardObj.company}</Text>
              <Text style={styles.quickBarStats}>
                👁️ {currentCardObj.viewCount || 0} Görüntülenme • 📲 {currentCardObj.vcfDownloads || 0} Rehbere Kayıt
              </Text>
            </View>

            <View style={styles.quickBarActions}>
              <TouchableOpacity
                style={styles.quickLiveBtn}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.open(`/${currentCardObj.slug}`, '_blank');
                  } else {
                    router.push(`/${currentCardObj.slug}` as any);
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={16} color="#6366F1" />
                <Text style={styles.quickLiveBtnText}>Canlı Gör</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickNfcBtn}
                onPress={() => openNfcModal(currentCardObj)}
                activeOpacity={0.8}
              >
                <Ionicons name="hardware-chip-outline" size={16} color="#0A0B0E" />
                <Text style={styles.quickNfcBtnText}>NFC Kart & QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MAIN VCARD FORM */}
        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>
            {selectedCardId === 'new' ? '✨ Yeni Dijital Kartvizit Bilgileri' : `✏️ ${fullName} Profilini Düzenle`}
          </Text>

          {/* 1. Basic Personal Info */}
          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Ad Soyad *</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Örn: Samet Sunman, Av. Ali Yılmaz"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Özel Bağlantı (Slug)</Text>
              <TextInput
                style={styles.textInput}
                value={slug}
                onChangeText={setSlug}
                placeholder="Örn: samet-sunman (qr-la.com/samet-sunman)"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Unvan / Meslek</Text>
              <TextInput
                style={styles.textInput}
                value={jobTitle}
                onChangeText={setJobTitle}
                placeholder="Örn: Kıdemli Yazılım Mimarı, Kurucu Ortak"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Şirket / Kurum</Text>
              <TextInput
                style={styles.textInput}
                value={company}
                onChangeText={setCompany}
                placeholder="Örn: Asnus Bilişim, Yılmaz Hukuk"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          {/* Avatar URL & Presets */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Profil Fotoğrafı URL</Text>
            <TextInput
              style={styles.textInput}
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              placeholder="https://..."
              placeholderTextColor="#6B7280"
            />
            <Text style={styles.helperText}>Hızlı önerilen profil fotoğrafları:</Text>
            <View style={styles.presetsRow}>
              {AVATAR_SUGGESTIONS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetChip}
                  onPress={() => setAvatarUrl(preset.url)}
                >
                  <Text style={styles.presetChipText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hakkımda / Biyografi</Text>
            <TextInput
              style={[styles.textInput, { height: 75 }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Kendinizi, uzmanlıklarınızı ve çözdüğünüz problemleri 2-3 cümleyle anlatın."
              placeholderTextColor="#6B7280"
              multiline
            />
          </View>

          {/* 2. THEME SELECTOR */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tasarım & Renk Teması (6 Özel Tema)</Text>
            <View style={styles.themesGrid}>
              {Object.values(VCARD_THEMES).map(t => {
                const isSelected = theme === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.themeCardItem,
                      isSelected && styles.themeCardItemSelected,
                      { borderColor: isSelected ? t.primaryColor : 'rgba(255,255,255,0.1)' },
                    ]}
                    onPress={() => setTheme(t.id)}
                  >
                    <View style={[styles.themeColorBar, { backgroundColor: t.primaryColor }]} />
                    <Text style={styles.themeLabelText}>{t.label}</Text>
                    <Text style={styles.themeBadgeText}>{t.badge}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. Communication Details */}
          <Text style={[styles.formSectionTitle, { marginTop: 24 }]}>📞 İletişim Kanalları</Text>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Cep Telefonu *</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+90 541 xxx xx xx"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>WhatsApp Numarası</Text>
              <TextInput
                style={styles.textInput}
                value={whatsapp}
                onChangeText={setWhatsapp}
                placeholder="90541xxxxxxx"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>E-posta Adresi</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@sirket.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Web Sitesi</Text>
              <TextInput
                style={styles.textInput}
                value={website}
                onChangeText={setWebsite}
                placeholder="https://asnus.com"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Ofis / Şehir</Text>
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Örn: Maslak, İstanbul / Türkiye"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Google Harita Linki</Text>
              <TextInput
                style={styles.textInput}
                value={mapUrl}
                onChangeText={setMapUrl}
                placeholder="https://maps.google.com/..."
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* 4. Social Media Accounts */}
          <Text style={[styles.formSectionTitle, { marginTop: 24 }]}>🌐 Sosyal Medya Bağlantıları</Text>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>LinkedIn Profil URL</Text>
              <TextInput
                style={styles.textInput}
                value={linkedin}
                onChangeText={setLinkedin}
                placeholder="https://linkedin.com/in/..."
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>GitHub Profil URL</Text>
              <TextInput
                style={styles.textInput}
                value={github}
                onChangeText={setGithub}
                placeholder="https://github.com/..."
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Instagram</Text>
              <TextInput
                style={styles.textInput}
                value={instagram}
                onChangeText={setInstagram}
                placeholder="https://instagram.com/..."
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>X / Twitter</Text>
              <TextInput
                style={styles.textInput}
                value={twitter}
                onChangeText={setTwitter}
                placeholder="https://x.com/..."
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* 5. Bank Accounts & IBAN */}
          <Text style={[styles.formSectionTitle, { marginTop: 24 }]}>💳 Banka & IBAN Kartları (Tek Tıkla Kopyalama)</Text>
          <View style={styles.bankInputBlock}>
            <View style={styles.rowTwoCols}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={newBankName}
                onChangeText={setNewBankName}
                placeholder="Banka Adı (Garanti BBVA)"
                placeholderTextColor="#6B7280"
              />
              <TextInput
                style={[styles.textInput, { flex: 1.5 }]}
                value={newBankIban}
                onChangeText={setNewBankIban}
                placeholder="IBAN (TR...)"
                placeholderTextColor="#6B7280"
              />
            </View>
            <View style={[styles.rowTwoCols, { marginTop: 8 }]}>
              <TextInput
                style={[styles.textInput, { flex: 2 }]}
                value={newBankHolder}
                onChangeText={setNewBankHolder}
                placeholder="Hesap Sahibi Adı (Samet Sunman)"
                placeholderTextColor="#6B7280"
              />
              <TouchableOpacity style={styles.addBankBtn} onPress={handleAddBank}>
                <Ionicons name="add" size={18} color="#0A0B0E" />
                <Text style={styles.addBankBtnText}>Ekle</Text>
              </TouchableOpacity>
            </View>

            {/* Existing Banks List */}
            {bankAccounts.length > 0 && (
              <View style={styles.bankList}>
                {bankAccounts.map((b, idx) => (
                  <View key={idx} style={styles.bankItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bankItemName}>{b.bankName} • {b.accountHolder}</Text>
                      <Text style={styles.bankItemIban}>{b.iban}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveBank(idx)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 6. Portfolio / Catalogs */}
          <Text style={[styles.formSectionTitle, { marginTop: 24 }]}>📁 Portfolyo & Dosya Bağlantıları</Text>
          <View style={styles.portfolioInputBlock}>
            <View style={styles.rowTwoCols}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={newPortTitle}
                onChangeText={setNewPortTitle}
                placeholder="Başlık (Örn: Şirket Tanıtım Sunumu PDF)"
                placeholderTextColor="#6B7280"
              />
              <TextInput
                style={[styles.textInput, { flex: 1.5 }]}
                value={newPortUrl}
                onChangeText={setNewPortUrl}
                placeholder="URL (https://asnus.com/sunum.pdf)"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.addPortBtn} onPress={handleAddPortfolio}>
              <Ionicons name="add" size={18} color="#0A0B0E" />
              <Text style={styles.addPortBtnText}>Portfolyo Dosyası Ekle</Text>
            </TouchableOpacity>

            {portfolioLinks.length > 0 && (
              <View style={styles.portList}>
                {portfolioLinks.map((p, idx) => (
                  <View key={idx} style={styles.portItemRow}>
                    <Ionicons name="document-text-outline" size={18} color="#6366F1" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.portItemTitle}>{p.title}</Text>
                      <Text style={styles.portItemUrl} numberOfLines={1}>{p.url}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemovePortfolio(idx)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#0A0B0E" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#0A0B0E" />
                <Text style={styles.saveBtnText}>
                  {selectedCardId === 'new' ? 'Dijital Kartviziti Kaydet & Yayınla' : 'Kartvizit Bilgilerini Güncelle'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* NFC CARD PREVIEW MODAL */}
        {nfcModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="hardware-chip-outline" size={22} color="#6366F1" />
                  <Text style={styles.modalTitle}>Lüks NFC Akıllı Kartvizit</Text>
                </View>
                <TouchableOpacity onPress={() => setNfcModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Realistic Physical NFC Smart Card Mockup */}
              <View style={[styles.nfcCardMockup, { backgroundColor: currentTheme.nfcCardBg }]}>
                {/* Chip icon */}
                <View style={styles.nfcTopRow}>
                  <View style={styles.nfcChipSymbol}>
                    <Ionicons name="wifi" size={20} color={currentTheme.nfcText} />
                    <Text style={[styles.nfcContactlessText, { color: currentTheme.nfcText }]}>NFC</Text>
                  </View>
                  <Text style={[styles.nfcBrandLogo, { color: currentTheme.nfcText }]}>QR-la</Text>
                </View>

                {/* Card holder info */}
                <View style={styles.nfcMiddleRow}>
                  <Text style={[styles.nfcHolderName, { color: '#FFFFFF' }]}>{fullName || 'AD SOYAD'}</Text>
                  <Text style={[styles.nfcHolderJob, { color: currentTheme.accentColor }]}>{jobTitle || 'UNVAN'}</Text>
                  <Text style={styles.nfcHolderCompany}>{company || 'ŞİRKET ADI'}</Text>
                </View>

                {/* Bottom QR & Short link */}
                <View style={styles.nfcBottomRow}>
                  <View style={styles.nfcUrlCol}>
                    <Text style={styles.nfcTapPrompt}>Dokundur veya Okut</Text>
                    <Text style={[styles.nfcShortLink, { color: currentTheme.nfcText }]}>
                      qr-la.com/{slug || fullName.toLowerCase()}
                    </Text>
                  </View>
                  {nfcQrDataUrl ? (
                    <Image source={{ uri: nfcQrDataUrl }} style={styles.nfcQrCode} />
                  ) : null}
                </View>
              </View>

              <Text style={styles.modalTip}>
                Bu kartvizit ISO standartlarında 85.6mm x 54mm boyutlarındadır. İçerisine gömülü NTAG213/216 çipi sayesinde iPhone ve Android telefonlara dokundurulduğunda doğrudan profilinizi açar.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.printBtn} onPress={printNfcCard} activeOpacity={0.85}>
                  <Ionicons name="print-outline" size={18} color="#0A0B0E" />
                  <Text style={styles.printBtnText}>Baskı Şablonunu Yazdır</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setNfcModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.closeBtnText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean, colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 64,
      maxWidth: 780,
      width: '100%',
      alignSelf: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
    },
    backBtnText: {
      color: '#6366F1',
      fontSize: 14,
      fontWeight: '700',
    },
    headerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(197, 160, 89, 0.12)' : '#FAF5EA',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(197, 160, 89, 0.3)' : '#EFE7DA',
      gap: 6,
    },
    headerBadgeText: {
      color: isDark ? '#E2C078' : '#8A6D3B',
      fontSize: 12,
      fontWeight: '800',
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: -0.4,
      marginBottom: 6,
    },
    pageSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
      marginBottom: 20,
    },
    // Card list
    cardListSection: {
      marginBottom: 18,
    },
    cardListScroll: {
      gap: 12,
      paddingVertical: 4,
    },
    cardThumbItem: {
      width: 150,
      backgroundColor: isDark ? 'rgba(20, 23, 31, 0.7)' : colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      alignItems: 'center',
    },
    cardThumbItemSelected: {
      backgroundColor: isDark ? 'rgba(197, 160, 89, 0.15)' : '#FAF5EA',
    },
    cardThumbAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginBottom: 8,
    },
    cardThumbName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 2,
    },
    cardThumbJob: {
      color: colors.textMuted,
      fontSize: 11,
      marginBottom: 6,
    },
    cardThumbSlugBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    cardThumbSlugText: {
      fontSize: 10,
      fontWeight: '700',
      fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    },
    addNewCardBtn: {
      width: 140,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
    },
    addNewCardBtnActive: {
      borderColor: '#6366F1',
      backgroundColor: isDark ? 'rgba(197, 160, 89, 0.1)' : '#FAF5EA',
    },
    addNewCardIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(197, 160, 89, 0.15)' : '#FAF5EA',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    addNewCardText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    // Quick Bar
    quickBar: {
      backgroundColor: isDark ? 'rgba(20, 23, 31, 0.85)' : colors.card,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(197, 160, 89, 0.3)' : colors.border,
      borderRadius: 18,
      padding: 14,
      marginBottom: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
    },
    quickBarInfo: {},
    quickBarName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    quickBarStats: {
      color: isDark ? '#E2C078' : '#8A6D3B',
      fontSize: 12,
      marginTop: 2,
    },
    quickBarActions: {
      flexDirection: 'row',
      gap: 8,
    },
    quickLiveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(197, 160, 89, 0.15)' : '#FAF5EA',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(197, 160, 89, 0.35)' : '#EFE7DA',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 6,
    },
    quickLiveBtnText: {
      color: isDark ? '#E2C078' : '#8A6D3B',
      fontSize: 12,
      fontWeight: '700',
    },
    quickNfcBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6366F1',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 6,
    },
    quickNfcBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    // Form Card
    formCard: {
      backgroundColor: isDark ? 'rgba(20, 23, 31, 0.6)' : colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(197, 160, 89, 0.25)' : colors.border,
      padding: 20,
      marginBottom: 32,
    },
    formSectionTitle: {
      fontSize: 16,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    inputGroup: {
      marginBottom: 14,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    textInput: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
    },
    rowTwoCols: {
      flexDirection: 'row',
      gap: 12,
    },
    helperText: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 6,
      marginBottom: 4,
    },
    presetsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    presetChip: {
      backgroundColor: isDark ? 'rgba(197, 160, 89, 0.1)' : '#FAF5EA',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(197, 160, 89, 0.25)' : '#EFE7DA',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    presetChipText: {
      color: isDark ? '#E2C078' : '#8A6D3B',
      fontSize: 11,
      fontWeight: '600',
    },
    // Themes Grid
    themesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    themeCardItem: {
      flex: 1,
      minWidth: 140,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.35)' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 10,
    },
    themeCardItemSelected: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF5EA',
    },
    themeColorBar: {
      width: '100%',
      height: 4,
      borderRadius: 2,
      marginBottom: 6,
    },
    themeLabelText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    themeBadgeText: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    // Bank inputs
    bankInputBlock: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : '#F1F5F9',
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addBankBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6366F1',
      borderRadius: 12,
      gap: 6,
    },
    addBankBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    bankList: {
      gap: 8,
      marginTop: 12,
    },
    bankItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      borderRadius: 10,
    },
    bankItemName: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    bankItemIban: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    // Portfolio
    portfolioInputBlock: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : '#F1F5F9',
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addPortBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6366F1',
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
      marginTop: 8,
    },
    addPortBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    portList: {
      gap: 8,
      marginTop: 12,
    },
    portItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      borderRadius: 10,
    },
    portItemTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    portItemUrl: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6366F1',
      paddingVertical: 15,
      borderRadius: 16,
      gap: 8,
      marginTop: 16,
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    // Modal
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      zIndex: 9999,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      padding: 24,
      maxWidth: 440,
      width: '100%',
      alignItems: 'center',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 20,
    },
    modalTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    // NFC Card Simulation
    nfcCardMockup: {
      width: 320,
      height: 190,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    nfcTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    nfcChipSymbol: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    nfcContactlessText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
    },
    nfcBrandLogo: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    nfcMiddleRow: {
      marginVertical: 4,
    },
    nfcHolderName: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    nfcHolderJob: {
      fontSize: 12,
      fontWeight: '700',
      marginTop: 2,
    },
    nfcHolderCompany: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
      marginTop: 1,
    },
    nfcBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    nfcUrlCol: {
      flex: 1,
    },
    nfcTapPrompt: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    nfcShortLink: {
      fontSize: 10,
      fontWeight: '800',
      fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
      marginTop: 2,
    },
    nfcQrCode: {
      width: 52,
      height: 52,
      borderRadius: 6,
    },
    modalTip: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
      textAlign: 'center',
      marginBottom: 20,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
    },
    printBtn: {
      flex: 1.5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6366F1',
      paddingVertical: 12,
      borderRadius: 14,
      gap: 6,
    },
    printBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    closeBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F3EFE6',
      paddingVertical: 12,
      borderRadius: 14,
    },
    closeBtnText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
  });
