import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventModel } from '@/types';

interface QRCardTemplateProps {
  event: EventModel;
}

export const QRCardTemplate: React.FC<QRCardTemplateProps> = ({ event }) => {
  const [tableNumber, setTableNumber] = useState('7');
  const [cardTheme, setCardTheme] = useState<'gold' | 'rose' | 'slate'>('gold');

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qr-la.com/${event.slug}&color=1a1817&bgcolor=ffffff`;

  const themeColors = {
    gold: { border: '#C5A059', badgeBg: '#FAF7F2', text: '#8A6D3B' },
    rose: { border: '#B76E79', badgeBg: '#FDF2F4', text: '#9B4D58' },
    slate: { border: '#334155', badgeBg: '#F8FAFC', text: '#1E293B' },
  }[cardTheme];

  return (
    <View style={styles.container}>
      {/* Configuration Controls Bar */}
      <View style={styles.controlsBar}>
        <View style={styles.inputWrap}>
          <Text style={styles.controlLabel}>Masa Numarası:</Text>
          <TextInput
            style={styles.tableInput}
            value={tableNumber}
            onChangeText={setTableNumber}
            placeholder="Örn: 12"
          />
        </View>

        <View style={styles.themeSelector}>
          <Text style={styles.controlLabel}>Tema:</Text>
          <TouchableOpacity
            style={[styles.colorDot, { backgroundColor: '#C5A059' }]}
            onPress={() => setCardTheme('gold')}
          />
          <TouchableOpacity
            style={[styles.colorDot, { backgroundColor: '#B76E79' }]}
            onPress={() => setCardTheme('rose')}
          />
          <TouchableOpacity
            style={[styles.colorDot, { backgroundColor: '#334155' }]}
            onPress={() => setCardTheme('slate')}
          />
        </View>

        {Platform.OS === 'web' && (
          <TouchableOpacity style={styles.printBtn} onPress={handlePrint} activeOpacity={0.8}>
            <Ionicons name="print-outline" size={18} color="#FFF" />
            <Text style={styles.printBtnText}>Yazdır / PDF İndir</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Printable Card Area */}
      <View style={[styles.cardPaper, { borderColor: themeColors.border }]}>
        <View style={[styles.innerBorder, { borderColor: themeColors.border }]}>
          {/* Header */}
          <Text style={[styles.coupleNames, { color: themeColors.text }]}>
            {event.hosts.brideOrPrimary || 'Merve'} & {event.hosts.groomOrSecondary || 'Yavuz'}
          </Text>
          <Text style={styles.subHeading}>BU MUTLU GÜNÜMÜZÜ BİRLİKTE ÖLÜMSÜZLEŞTİRELİM</Text>

          {/* Table Number Pill */}
          <View style={[styles.tableBadge, { backgroundColor: themeColors.badgeBg, borderColor: themeColors.border }]}>
            <Text style={[styles.tableBadgeText, { color: themeColors.text }]}>
              {tableNumber ? `MASA ${tableNumber}` : 'MASA KARTI'}
            </Text>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <Image source={{ uri: qrUrl }} style={styles.qrImage} />
          </View>

          {/* Slogan & Instructions */}
          <Text style={styles.actionTitle}>Kameranızı Açın & QR Kodu Okutun</Text>
          <Text style={styles.actionDesc}>
            Uygulama indirmeye gerek yok! Çektiğiniz tüm güzel fotoğrafları saniyeler içinde yükleyin ve anı defterimize not bırakın.
          </Text>

          {/* Footer Web link */}
          <View style={styles.footerRow}>
            <Ionicons name="sparkles" size={14} color={themeColors.border} />
            <Text style={styles.footerLink}>qr-la.com/{event.slug}</Text>
            <Ionicons name="sparkles" size={14} color={themeColors.border} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  controlsBar: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tableInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 60,
    textAlign: 'center',
    fontWeight: '700',
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A1817',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  printBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardPaper: {
    width: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  innerBorder: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  coupleNames: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  tableBadge: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  tableBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  qrContainer: {
    width: 170,
    height: 170,
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1817',
    textAlign: 'center',
    marginBottom: 6,
  },
  actionDesc: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
  },
});
