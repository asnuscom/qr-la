import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VCardData, VCardBankInfo, VCardPortfolioItem } from '@/types';
import { getVCardTheme } from './themes';
import { downloadVCard } from './vcfGenerator';
import { vcardService } from '@/services/vcardService';

interface VCardDisplayProps {
  card: VCardData;
}

export function VCardDisplay({ card }: VCardDisplayProps) {
  const theme = getVCardTheme(card.theme);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    vcardService.recordView(card.slug);
  }, [card.slug]);

  const handleSaveToContacts = () => {
    downloadVCard(card);
    vcardService.recordVcfDownload(card.slug);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCall = () => {
    if (card.phone) {
      Linking.openURL(`tel:${card.phone.replace(/\s+/g, '')}`);
    }
  };

  const handleWhatsapp = () => {
    const rawNumber = card.whatsapp || card.phone;
    const phone = rawNumber.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(`Merhaba ${card.fullName}, dijital kartvizitiniz üzerinden ulaşıyorum.`)}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const handleEmail = () => {
    if (card.email) {
      Linking.openURL(`mailto:${card.email}`);
    }
  };

  const openUrl = (url: string) => {
    if (!url) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    if (Platform.OS === 'web') {
      window.open(full, '_blank');
    } else {
      Linking.openURL(full);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.href
          : `https://qr-la.com/${card.slug}`;
      await Share.share({
        title: `${card.fullName} | Dijital Kartvizit`,
        message: `${card.fullName} - ${card.jobTitle} (${card.company}) dijital kartviziti: ${shareUrl}`,
        url: shareUrl,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundGradient[0] }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Top Navbar */}
        <View style={styles.topBar}>
          <View style={[styles.logoBadge, { borderColor: theme.borderColor, backgroundColor: theme.pillBg }]}>
            <Ionicons name="card" size={14} color={theme.accentColor} />
            <Text style={[styles.logoText, { color: theme.textColor }]}>
              QR-la <Text style={{ color: theme.accentColor }}>vCard & NFC</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.8}
            accessibilityLabel="Kartviziti Paylaş"
          >
            <Ionicons name="share-social-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* HERO PROFILE CARD */}
        <View style={[styles.heroCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          {/* Cover Header */}
          <View style={[styles.coverBanner, { backgroundColor: theme.pillBg }]}>
            {card.coverUrl ? (
              <Image source={{ uri: card.coverUrl }} style={styles.coverImg} resizeMode="cover" />
            ) : (
              <View style={[styles.coverFallback, { backgroundColor: theme.pillBg }]} />
            )}
          </View>

          {/* Avatar with Halo */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: card.avatarUrl }} style={[styles.avatar, { borderColor: theme.accentColor }]} />
            <View style={[styles.verifiedBadge, { backgroundColor: theme.primaryColor }]}>
              <Ionicons name="checkmark" size={12} color="#FFF" />
            </View>
          </View>

          {/* Name & Titles */}
          <Text style={[styles.fullName, { color: theme.textColor }]}>{card.fullName}</Text>
          <Text style={[styles.jobTitle, { color: theme.accentColor }]}>{card.jobTitle}</Text>
          <Text style={[styles.companyText, { color: theme.subtextColor }]}>{card.company}</Text>

          {card.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={theme.accentColor} />
              <Text style={[styles.locationText, { color: theme.subtextColor }]}>{card.location}</Text>
            </View>
          ) : null}

          {/* PRIMARY HERO ACTION: 📲 REHBERE KAYDET (1-CLICK VCF) */}
          <TouchableOpacity
            style={[styles.saveVcfBtn, { backgroundColor: theme.primaryColor }]}
            onPress={handleSaveToContacts}
            activeOpacity={0.88}
          >
            <Ionicons name="person-add" size={18} color="#FFF" />
            <Text style={styles.saveVcfBtnText}>Kişiyi Rehbere Kaydet</Text>
          </TouchableOpacity>

          {downloadSuccess && (
            <View style={styles.vcfSuccessBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#34D399" />
              <Text style={styles.vcfSuccessText}>
                .vcf kartvizit dosyası hazırlandı, rehberinize aktarılıyor!
              </Text>
            </View>
          )}

          {/* Quick Communication Grid */}
          <View style={styles.commGrid}>
            <TouchableOpacity style={styles.commBtn} onPress={handleCall} activeOpacity={0.8}>
              <View style={[styles.commIconWrap, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Ionicons name="call" size={18} color="#38BDF8" />
              </View>
              <Text style={styles.commBtnText}>Ara</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.commBtn} onPress={handleWhatsapp} activeOpacity={0.8}>
              <View style={[styles.commIconWrap, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              </View>
              <Text style={styles.commBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.commBtn} onPress={handleEmail} activeOpacity={0.8}>
              <View style={[styles.commIconWrap, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                <Ionicons name="mail" size={18} color="#FACC15" />
              </View>
              <Text style={styles.commBtnText}>E-posta</Text>
            </TouchableOpacity>

            {card.website ? (
              <TouchableOpacity
                style={styles.commBtn}
                onPress={() => openUrl(card.website || '')}
                activeOpacity={0.8}
              >
                <View style={[styles.commIconWrap, { backgroundColor: `${theme.primaryColor}25` }]}>
                  <Ionicons name="globe-outline" size={18} color={theme.accentColor} />
                </View>
                <Text style={styles.commBtnText}>Web Sitesi</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* BIO / ABOUT SECTION */}
        {card.bio ? (
          <View style={[styles.cardSection, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="information-circle-outline" size={18} color={theme.accentColor} />
              <Text style={[styles.sectionHeading, { color: theme.textColor }]}>Hakkımda</Text>
            </View>
            <Text style={[styles.bioText, { color: theme.subtextColor }]}>{card.bio}</Text>
          </View>
        ) : null}

        {/* CONTACT DETAILS LIST */}
        <View style={[styles.cardSection, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="id-card-outline" size={18} color={theme.accentColor} />
            <Text style={[styles.sectionHeading, { color: theme.textColor }]}>İletişim Bilgileri</Text>
          </View>

          {/* Phone */}
          <View style={styles.contactRow}>
            <View style={styles.contactRowLeft}>
              <Ionicons name="phone-portrait-outline" size={18} color={theme.accentColor} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.contactFieldLabel}>Cep Telefonu</Text>
                <Text style={[styles.contactFieldValue, { color: theme.textColor }]}>{card.phone}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => copyToClipboard(card.phone, 'phone')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copiedField === 'phone' ? 'checkmark' : 'copy-outline'}
                size={16}
                color={copiedField === 'phone' ? '#34D399' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>

          {/* Secondary Phone */}
          {card.phoneSecondary ? (
            <View style={styles.contactRow}>
              <View style={styles.contactRowLeft}>
                <Ionicons name="business-outline" size={18} color={theme.accentColor} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.contactFieldLabel}>İş Telefonu / Dahili</Text>
                  <Text style={[styles.contactFieldValue, { color: theme.textColor }]}>{card.phoneSecondary}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(card.phoneSecondary || '', 'phoneSec')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={copiedField === 'phoneSec' ? 'checkmark' : 'copy-outline'}
                  size={16}
                  color={copiedField === 'phoneSec' ? '#34D399' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.contactRow}>
            <View style={styles.contactRowLeft}>
              <Ionicons name="mail-outline" size={18} color={theme.accentColor} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.contactFieldLabel}>E-posta</Text>
                <Text style={[styles.contactFieldValue, { color: theme.textColor }]}>{card.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => copyToClipboard(card.email, 'email')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copiedField === 'email' ? 'checkmark' : 'copy-outline'}
                size={16}
                color={copiedField === 'email' ? '#34D399' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>

          {/* Address & Map */}
          {card.location ? (
            <View style={styles.contactRow}>
              <View style={styles.contactRowLeft}>
                <Ionicons name="navigate-outline" size={18} color={theme.accentColor} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.contactFieldLabel}>Ofis / Konum</Text>
                  <Text style={[styles.contactFieldValue, { color: theme.textColor }]}>{card.location}</Text>
                </View>
              </View>
              {card.mapUrl ? (
                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() => openUrl(card.mapUrl || '')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="map-outline" size={16} color={theme.accentColor} />
                  <Text style={[styles.mapBtnText, { color: theme.accentColor }]}>Harita</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* SOCIAL MEDIA SECTION */}
        {card.socials && Object.keys(card.socials).length > 0 && (
          <View style={[styles.cardSection, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="share-social-outline" size={18} color={theme.accentColor} />
              <Text style={[styles.sectionHeading, { color: theme.textColor }]}>Sosyal Medya & Bağlantılar</Text>
            </View>

            <View style={styles.socialsGrid}>
              {card.socials.linkedin ? (
                <TouchableOpacity
                  style={styles.socialItem}
                  onPress={() => openUrl(card.socials.linkedin || '')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
                  <Text style={styles.socialItemText}>LinkedIn</Text>
                </TouchableOpacity>
              ) : null}

              {card.socials.github ? (
                <TouchableOpacity
                  style={styles.socialItem}
                  onPress={() => openUrl(card.socials.github || '')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-github" size={20} color="#FFFFFF" />
                  <Text style={styles.socialItemText}>GitHub</Text>
                </TouchableOpacity>
              ) : null}

              {card.socials.instagram ? (
                <TouchableOpacity
                  style={styles.socialItem}
                  onPress={() => openUrl(card.socials.instagram || '')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                  <Text style={styles.socialItemText}>Instagram</Text>
                </TouchableOpacity>
              ) : null}

              {card.socials.twitter ? (
                <TouchableOpacity
                  style={styles.socialItem}
                  onPress={() => openUrl(card.socials.twitter || '')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                  <Text style={styles.socialItemText}>X / Twitter</Text>
                </TouchableOpacity>
              ) : null}

              {card.socials.youtube ? (
                <TouchableOpacity
                  style={styles.socialItem}
                  onPress={() => openUrl(card.socials.youtube || '')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                  <Text style={styles.socialItemText}>YouTube</Text>
                </TouchableOpacity>
              ) : null}

              {card.socials.medium ? (
                <TouchableOpacity
                  style={styles.socialItem}
                  onPress={() => openUrl(card.socials.medium || '')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="newspaper-outline" size={20} color="#00AB6C" />
                  <Text style={styles.socialItemText}>Medium</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}

        {/* BANK ACCOUNTS & IBAN CARDS */}
        {card.bankAccounts && card.bankAccounts.length > 0 && (
          <View style={[styles.cardSection, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="wallet-outline" size={18} color={theme.accentColor} />
              <Text style={[styles.sectionHeading, { color: theme.textColor }]}>Banka & IBAN Bilgileri</Text>
            </View>

            <View style={styles.bankCardsList}>
              {card.bankAccounts.map((bank: VCardBankInfo, idx: number) => {
                const isCopied = copiedField === `iban-${idx}`;
                return (
                  <View key={idx} style={[styles.bankCard, { borderColor: theme.borderColor }]}>
                    <View style={styles.bankHeaderRow}>
                      <View style={styles.bankTitleRow}>
                        <Ionicons name="cash-outline" size={16} color={theme.accentColor} />
                        <Text style={styles.bankName}>{bank.bankName}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.copyIbanBtn, isCopied && { backgroundColor: '#059669' }]}
                        onPress={() => copyToClipboard(bank.iban, `iban-${idx}`)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isCopied ? 'checkmark' : 'copy-outline'}
                          size={14}
                          color="#FFF"
                        />
                        <Text style={styles.copyIbanText}>{isCopied ? 'Kopyalandı!' : 'IBAN Kopyala'}</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.ibanText}>{bank.iban}</Text>
                    <Text style={styles.accountHolderText}>Alıcı: {bank.accountHolder}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* PORTFOLIO & FILES */}
        {card.portfolioLinks && card.portfolioLinks.length > 0 && (
          <View style={[styles.cardSection, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text-outline" size={18} color={theme.accentColor} />
              <Text style={[styles.sectionHeading, { color: theme.textColor }]}>Portfolyo & Tanıtım Dosyaları</Text>
            </View>

            <View style={styles.portfolioList}>
              {card.portfolioLinks.map((item: VCardPortfolioItem, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.portfolioRow}
                  onPress={() => openUrl(item.url)}
                  activeOpacity={0.8}
                >
                  <View style={styles.portfolioIconWrap}>
                    <Ionicons
                      name={item.type === 'pdf' ? 'document' : 'link'}
                      size={18}
                      color={theme.accentColor}
                    />
                  </View>
                  <Text style={[styles.portfolioTitle, { color: theme.textColor }]}>{item.title}</Text>
                  <Ionicons name="open-outline" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* NFC CARD VERIFICATION FOOTER */}
        <View style={[styles.footerSeal, { borderColor: theme.borderColor, backgroundColor: theme.pillBg }]}>
          <Ionicons name="hardware-chip-outline" size={20} color={theme.accentColor} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerSealTitle, { color: theme.textColor }]}>
              NFC Akıllı Kartvizit Doğrulandı
            </Text>
            <Text style={[styles.footerSealSub, { color: theme.subtextColor }]}>
              Seri No: {card.nfcSerial || 'NFC-STANDARD-01'} • {card.viewCount || 1} Görüntülenme
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 56,
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  logoText: {
    fontSize: 13,
    fontWeight: '800',
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Hero Card
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 24,
    marginBottom: 16,
    backdropFilter: 'blur(20px)',
  },
  coverBanner: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  coverFallback: {
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -56,
    marginBottom: 12,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0A0B0E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  companyText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  saveVcfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    width: '90%',
    boxShadow: '0 4px 20px rgba(197, 160, 89, 0.35)',
  },
  saveVcfBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  vcfSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    borderWidth: 1,
    borderColor: '#34D399',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    width: '90%',
  },
  vcfSuccessText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  // Comm Grid
  commGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    width: '90%',
  },
  commBtn: {
    alignItems: 'center',
    flex: 1,
  },
  commIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  commBtnText: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
  },
  // Card Sections
  cardSection: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    backdropFilter: 'blur(16px)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 21,
  },
  // Contact details
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  contactRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactFieldLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  contactFieldValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  copyBtn: {
    padding: 6,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  mapBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Socials Grid
  socialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
  },
  socialItemText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Bank accounts
  bankCardsList: {
    gap: 12,
  },
  bankCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  copyIbanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  copyIbanText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  ibanText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  accountHolderText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  // Portfolio
  portfolioList: {
    gap: 8,
  },
  portfolioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  portfolioIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  // Footer seal
  footerSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginTop: 8,
  },
  footerSealTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  footerSealSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
