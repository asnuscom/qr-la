import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Switch,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventModel } from '@/types';

interface QRCardTemplateProps {
  event: EventModel;
}

type CardThemeId = 'gold' | 'sage' | 'rose' | 'midnight' | 'minimal';
type CardLayoutId = 'single' | 'tent';

export const QRCardTemplate: React.FC<QRCardTemplateProps> = ({ event }) => {
  const [showTableNumber, setShowTableNumber] = useState(false);
  const [tableNumber, setTableNumber] = useState('1');
  const [badgeText, setBadgeText] = useState('FOTOĞRAF & ANI PAYLAŞIMI');
  const [cardTheme, setCardTheme] = useState<CardThemeId>('gold');
  const [cardLayout, setCardLayout] = useState<CardLayoutId>('single');
  const [customSlogan, setCustomSlogan] = useState(
    'Kameranızı açıp QR kodu okutun, en özel kareleri bizimle paylaşın!'
  );

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=https://qr-la.com/${event.slug}&color=1a1817&bgcolor=ffffff`;

  const themeConfigs: Record<
    CardThemeId,
    {
      name: string;
      border: string;
      cardBg: string;
      badgeBg: string;
      badgeBorder: string;
      badgeTextColor: string;
      namesColor: string;
      primaryTextColor: string;
      accentColor: string;
      dotColor: string;
      isDark?: boolean;
    }
  > = {
    gold: {
      name: 'Altın Zarafet',
      border: '#C5A059',
      cardBg: '#FFFFFF',
      badgeBg: '#FAF5EA',
      badgeBorder: '#EAD7BB',
      badgeTextColor: '#8A6D3B',
      namesColor: '#8A6D3B',
      primaryTextColor: '#1A1817',
      accentColor: '#C5A059',
      dotColor: '#C5A059',
    },
    sage: {
      name: 'Rustik Botanik',
      border: '#2D5A43',
      cardBg: '#FCFDFB',
      badgeBg: '#F0F5F2',
      badgeBorder: '#C2D6CC',
      badgeTextColor: '#2D5A43',
      namesColor: '#2D5A43',
      primaryTextColor: '#1A2E24',
      accentColor: '#4C8366',
      dotColor: '#2D5A43',
    },
    rose: {
      name: 'Romantik Gül',
      border: '#B76E79',
      cardBg: '#FFFFFF',
      badgeBg: '#FDF4F5',
      badgeBorder: '#F3D2D7',
      badgeTextColor: '#9B4D58',
      namesColor: '#9B4D58',
      primaryTextColor: '#331B20',
      accentColor: '#B76E79',
      dotColor: '#B76E79',
    },
    midnight: {
      name: 'Gece & Altın',
      border: '#C5A059',
      cardBg: '#181716',
      badgeBg: '#2A2622',
      badgeBorder: '#C5A059',
      badgeTextColor: '#E5C07A',
      namesColor: '#E5C07A',
      primaryTextColor: '#F9F6F0',
      accentColor: '#C5A059',
      dotColor: '#1A1817',
      isDark: true,
    },
    minimal: {
      name: 'Modern Minimal',
      border: '#27272A',
      cardBg: '#FFFFFF',
      badgeBg: '#F4F4F5',
      badgeBorder: '#E4E4E7',
      badgeTextColor: '#18181B',
      namesColor: '#18181B',
      primaryTextColor: '#18181B',
      accentColor: '#52525B',
      dotColor: '#18181B',
    },
  };

  const currentTheme = themeConfigs[cardTheme];

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadQR = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(qrUrl, '_blank');
    } else {
      Linking.openURL(qrUrl);
    }
  };

  const formattedEventDate = new Date(event.eventDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const renderCardContent = (isBackSide = false) => (
    <View
      style={[
        styles.innerBorder,
        {
          borderColor: currentTheme.border,
          backgroundColor: currentTheme.cardBg,
        },
      ]}
    >
      {/* Top Corner Ornaments */}
      <View style={styles.ornamentRow}>
        <Ionicons name="sparkles-sharp" size={14} color={currentTheme.accentColor} />
        <Text style={[styles.dateTag, { color: currentTheme.isDark ? '#A1A1AA' : '#6B7280' }]}>
          {formattedEventDate}
        </Text>
        <Ionicons name="sparkles-sharp" size={14} color={currentTheme.accentColor} />
      </View>

      {/* Couple Names */}
      <Text style={[styles.coupleNames, { color: currentTheme.namesColor }]}>
        {event.hosts.brideOrPrimary || 'Şule'} & {event.hosts.groomOrSecondary || 'Samet'}
      </Text>

      {/* Badge (No Table Number / Table Number) */}
      <View
        style={[
          styles.badgeContainer,
          {
            backgroundColor: currentTheme.badgeBg,
            borderColor: currentTheme.badgeBorder,
          },
        ]}
      >
        <Ionicons
          name={showTableNumber ? 'restaurant-outline' : 'camera-outline'}
          size={13}
          color={currentTheme.badgeTextColor}
        />
        <Text style={[styles.badgeText, { color: currentTheme.badgeTextColor }]}>
          {showTableNumber ? `MASA ${tableNumber || '1'}` : badgeText}
        </Text>
      </View>

      {/* QR Code Container with High Contrast Base */}
      <View
        style={[
          styles.qrContainer,
          {
            borderColor: currentTheme.border,
            backgroundColor: '#FFFFFF',
          },
        ]}
      >
        <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
        <View style={styles.qrCenterBadge}>
          <Ionicons name="camera" size={16} color="#FFF" />
        </View>
      </View>

      {/* Action Title & Slogan */}
      <Text
        style={[
          styles.actionTitle,
          { color: currentTheme.primaryTextColor },
        ]}
      >
        {isBackSide ? 'Anı Defterine Not Bırakın' : 'Fotoğrafları Bizimle Paylaşın'}
      </Text>
      <Text
        style={[
          styles.actionDesc,
          { color: currentTheme.isDark ? '#D4D4D8' : '#4B5563' },
        ]}
      >
        {customSlogan}
      </Text>

      {/* 3 Step Icons */}
      <View style={styles.stepsRow}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, { backgroundColor: currentTheme.badgeBg, borderColor: currentTheme.badgeBorder }]}>
            <Ionicons name="scan" size={14} color={currentTheme.badgeTextColor} />
          </View>
          <Text style={[styles.stepText, { color: currentTheme.isDark ? '#D4D4D8' : '#4B5563' }]}>1. Tara</Text>
        </View>
        <View style={[styles.stepLine, { backgroundColor: currentTheme.accentColor + '40' }]} />
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, { backgroundColor: currentTheme.badgeBg, borderColor: currentTheme.badgeBorder }]}>
            <Ionicons name="cloud-upload" size={14} color={currentTheme.badgeTextColor} />
          </View>
          <Text style={[styles.stepText, { color: currentTheme.isDark ? '#D4D4D8' : '#4B5563' }]}>2. Yükle</Text>
        </View>
        <View style={[styles.stepLine, { backgroundColor: currentTheme.accentColor + '40' }]} />
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, { backgroundColor: currentTheme.badgeBg, borderColor: currentTheme.badgeBorder }]}>
            <Ionicons name="tv" size={14} color={currentTheme.badgeTextColor} />
          </View>
          <Text style={[styles.stepText, { color: currentTheme.isDark ? '#D4D4D8' : '#4B5563' }]}>3. Ekranda Gör</Text>
        </View>
      </View>

      {/* Web Link Footer */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerLink, { color: currentTheme.namesColor }]}>
          qr-la.com/{event.slug}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Studio Configuration Toolbox */}
      <View style={styles.toolboxCard}>
        <View style={styles.toolboxHeader}>
          <View style={styles.toolboxIconCircle}>
            <Ionicons name="color-wand" size={20} color="#C5A059" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolboxTitle}>Masa & Stand QR Kartı Stüdyosu</Text>
            <Text style={styles.toolboxSubtitle}>
              Masanosuz genel stand veya masa numaralı formatı seçip yüksek kalitede yazdırın.
            </Text>
          </View>
        </View>

        {/* Option 1: Masa Numarası Switch */}
        <View style={styles.controlRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Masa Numarası Gösterilsin mi?</Text>
            <Text style={styles.settingDesc}>
              {showTableNumber
                ? 'Masa numarası etkin (Örn: MASA 7)'
                : 'Masa numarasız genel stand versiyonu (Önerilen)'}
            </Text>
          </View>
          <Switch
            value={showTableNumber}
            onValueChange={setShowTableNumber}
            trackColor={{ false: '#E5E7EB', true: '#C5A059' }}
            thumbColor="#FFF"
          />
        </View>

        {showTableNumber ? (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Masa Numarası:</Text>
            <TextInput
              style={styles.tableTextInput}
              value={tableNumber}
              onChangeText={setTableNumber}
              placeholder="Örn: 12"
              keyboardType="number-pad"
            />
          </View>
        ) : (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Rozet Başlığı:</Text>
            <TextInput
              style={styles.textInputFull}
              value={badgeText}
              onChangeText={setBadgeText}
              placeholder="Örn: FOTOĞRAF & ANI PAYLAŞIMI"
            />
          </View>
        )}

        {/* Option 2: Format / Layout Mode */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeaderLabel}>Baskı Formatı:</Text>
        <View style={styles.layoutSelectorRow}>
          <TouchableOpacity
            style={[
              styles.layoutBtn,
              cardLayout === 'single' && styles.layoutBtnActive,
            ]}
            onPress={() => setCardLayout('single')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="document-outline"
              size={18}
              color={cardLayout === 'single' ? '#C5A059' : '#6B7280'}
            />
            <View>
              <Text style={[styles.layoutBtnTitle, cardLayout === 'single' && styles.layoutBtnTitleActive]}>
                Tek Yüzlü Kart (A5 / A6)
              </Text>
              <Text style={styles.layoutBtnDesc}>Çerçeve veya şövale için ideal</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.layoutBtn,
              cardLayout === 'tent' && styles.layoutBtnActive,
            ]}
            onPress={() => setCardLayout('tent')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="triangle-outline"
              size={18}
              color={cardLayout === 'tent' ? '#C5A059' : '#6B7280'}
            />
            <View>
              <Text style={[styles.layoutBtnTitle, cardLayout === 'tent' && styles.layoutBtnTitleActive]}>
                Üçgen Masa Standı (Katlamalı)
              </Text>
              <Text style={styles.layoutBtnDesc}>Çift taraflı masa üstü piramit</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Option 3: Theme Selector */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeaderLabel}>Tasarım Teması:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themePillsRow}>
          {(Object.keys(themeConfigs) as CardThemeId[]).map((themeId) => {
            const conf = themeConfigs[themeId];
            const isSelected = cardTheme === themeId;
            return (
              <TouchableOpacity
                key={themeId}
                style={[
                  styles.themePill,
                  isSelected && styles.themePillActive,
                ]}
                onPress={() => setCardTheme(themeId)}
                activeOpacity={0.8}
              >
                <View style={[styles.themeDot, { backgroundColor: conf.border }]} />
                <Text style={[styles.themePillText, isSelected && styles.themePillTextActive]}>
                  {conf.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Option 4: Slogan Quick Picks */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeaderLabel}>Slogan / Açıklama Metni:</Text>
        <TextInput
          style={styles.textInputFull}
          value={customSlogan}
          onChangeText={setCustomSlogan}
          placeholder="Kart üzerindeki açıklama metni..."
        />
        <View style={styles.quickSlogansRow}>
          <TouchableOpacity
            style={styles.quickSloganChip}
            onPress={() =>
              setCustomSlogan('Kameranızı açıp QR kodu okutun, en özel kareleri bizimle paylaşın!')
            }
          >
            <Text style={styles.quickSloganChipText}>✨ Standart Paylaşım</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickSloganChip}
            onPress={() =>
              setCustomSlogan('Çektiğiniz tüm fotoğraflar anında salondaki dev projeksiyon ekranına yansısın!')
            }
          >
            <Text style={styles.quickSloganChipText}>📺 Canlı Projeksiyon Vurgusu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickSloganChip}
            onPress={() =>
              setCustomSlogan('Bizim için çektiğiniz fotoğrafları yükleyin ve anı defterimize güzel bir not bırakın.')
            }
          >
            <Text style={styles.quickSloganChipText}>📖 Anı Defteri Odaklı</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {Platform.OS === 'web' && (
            <TouchableOpacity style={styles.printActionBtn} onPress={handlePrint} activeOpacity={0.85}>
              <Ionicons name="print-outline" size={18} color="#FFF" />
              <Text style={styles.printActionBtnText}>Baskı Al / PDF Kaydet</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.downloadQrBtn} onPress={handleDownloadQR} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={18} color="#1A1817" />
            <Text style={styles.downloadQrBtnText}>QR Kodunu İndir (HD)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Printable Preview Area */}
      <View style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <Ionicons name="eye-outline" size={16} color="#C5A059" />
          <Text style={styles.previewHeaderText}>
            CANLI BASKI ÖNİZLEMESİ ({currentTheme.name} - {cardLayout === 'tent' ? 'Çift Taraflı Üçgen Stand' : 'Tek Yüz'})
          </Text>
        </View>

        {cardLayout === 'single' ? (
          /* Single Card View */
          <View
            style={[
              styles.cardPaper,
              {
                borderColor: currentTheme.border,
                backgroundColor: currentTheme.cardBg,
              },
            ]}
          >
            {renderCardContent(false)}
          </View>
        ) : (
          /* Tent-Fold (Double Sided) View */
          <View style={styles.tentWrapper}>
            {/* Front Side */}
            <View
              style={[
                styles.cardPaper,
                {
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.cardBg,
                },
              ]}
            >
              <View style={styles.tentSideTag}>
                <Text style={styles.tentSideTagText}>ÖN YÜZ</Text>
              </View>
              {renderCardContent(false)}
            </View>

            {/* Fold Line */}
            <View style={styles.foldLineContainer}>
              <View style={styles.foldDash} />
              <View style={styles.foldBadge}>
                <Ionicons name="cut-outline" size={12} color="#6B7280" />
                <Text style={styles.foldBadgeText}>KATLAMA & YAPACAK ÇİZGİSİ</Text>
              </View>
              <View style={styles.foldDash} />
            </View>

            {/* Back Side */}
            <View
              style={[
                styles.cardPaper,
                {
                  borderColor: currentTheme.border,
                  backgroundColor: currentTheme.cardBg,
                },
              ]}
            >
              <View style={styles.tentSideTag}>
                <Text style={styles.tentSideTagText}>ARKA YÜZ</Text>
              </View>
              {renderCardContent(true)}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  toolboxCard: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    shadowColor: '#C5A059',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  toolboxHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  toolboxIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolboxTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 2,
  },
  toolboxSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 11,
    color: '#6B7280',
  },
  inputRow: {
    marginBottom: 12,
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tableTextInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EAD7BB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    maxWidth: 100,
  },
  textInputFull: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1817',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F3EFE6',
    marginVertical: 14,
  },
  sectionHeaderLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 8,
  },
  layoutSelectorRow: {
    gap: 8,
  },
  layoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    padding: 12,
    borderRadius: 12,
  },
  layoutBtnActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
  },
  layoutBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  layoutBtnTitleActive: {
    color: '#8A6D3B',
  },
  layoutBtnDesc: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  themePillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  themePillActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
  },
  themeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  themePillTextActive: {
    color: '#8A6D3B',
  },
  quickSlogansRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  quickSloganChip: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  quickSloganChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A6D3B',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  printActionBtn: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#1A1817',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  printActionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  downloadQrBtn: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: '#EAD7BB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadQrBtnText: {
    color: '#8A6D3B',
    fontSize: 13,
    fontWeight: '800',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  previewHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  cardPaper: {
    width: 360,
    maxWidth: '100%',
    borderRadius: 24,
    padding: 14,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
  },
  innerBorder: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  coupleNames: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  qrContainer: {
    width: 175,
    height: 175,
    padding: 10,
    borderRadius: 18,
    borderWidth: 2,
    marginBottom: 14,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrCenterBadge: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    width: '100%',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 9,
    fontWeight: '700',
  },
  stepLine: {
    width: 24,
    height: 1.5,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tentWrapper: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  tentSideTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EAD7BB',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 10,
  },
  tentSideTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A6D3B',
  },
  foldLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 360,
    maxWidth: '100%',
    paddingVertical: 6,
  },
  foldDash: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  foldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  foldBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
});

