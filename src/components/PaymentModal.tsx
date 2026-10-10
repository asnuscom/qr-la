import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentItem, TransactionRecord, paymentService } from '../services/paymentService';
import { authService } from '../services/authService';

interface PaymentModalProps {
  visible: boolean;
  item: PaymentItem | null;
  onClose: () => void;
  onSuccess: (transaction: TransactionRecord) => void;
}

type PaymentStep = 'form' | 'success';

const BANK_ACCOUNTS = [
  {
    id: 'garanti',
    bankName: 'Garanti BBVA',
    holder: 'Asnus Bilişim & QR-la',
    ibanFormatted: 'TR84 0006 2000 0001 2938 4719 02',
    ibanRaw: 'TR840006200000012938471902',
    badge: '7/24 FAST',
  },
  {
    id: 'isbank',
    bankName: 'İş Bankası',
    holder: 'Asnus Bilişim Ltd. Şti.',
    ibanFormatted: 'TR88 0006 4000 0002 9876 5432 10',
    ibanRaw: 'TR880006400000029876543210',
    badge: 'Anında Havale',
  },
];

const WHATSAPP_PHONE = '905415779166';

export default function PaymentModal({ visible, item, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('form');
  const [selectedBankId, setSelectedBankId] = useState<string>('garanti');

  // Müşteri İletişim Bilgileri
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // Kupon Kodu
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{ discountTL: number; message: string } | null>(null);

  // İşlem Durumu
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedTransaction, setCompletedTransaction] = useState<TransactionRecord | null>(null);
  const [copiedIbanId, setCopiedIbanId] = useState<string | null>(null);

  // Modal açıldığında state sıfırlama & profil bilgisi çekme
  useEffect(() => {
    if (visible) {
      const currentUser = authService.getState().user;
      setStep('form');
      setSelectedBankId('garanti');
      setCustomerName(currentUser?.displayName || 'Samet Sunman');
      setCustomerPhone('0541 577 91 66');
      setCustomerEmail(currentUser?.email || 'samet@qr-la.com');
      setOrderNote('');
      setCouponCode('');
      setCouponDiscount(null);
      setErrorMessage(null);
      setCompletedTransaction(null);
      setCopiedIbanId(null);
    }
  }, [visible]);

  if (!item) return null;

  // Kupon Uygula
  const handleApplyCoupon = () => {
    setErrorMessage(null);
    const res = paymentService.checkCoupon(couponCode, item.price);
    if (res.valid) {
      setCouponDiscount({ discountTL: res.discountTL, message: res.message });
    } else {
      setCouponDiscount(null);
      setErrorMessage(res.message);
    }
  };

  // Toplam Tutar Hesaplama
  const discountTL = couponDiscount?.discountTL || 0;
  const finalPrice = Math.max(0, item.price - discountTL);

  // IBAN Kopyalama
  const handleCopyIban = (bank: typeof BANK_ACCOUNTS[0]) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(bank.ibanRaw);
    }
    setCopiedIbanId(bank.id);
    setTimeout(() => setCopiedIbanId(null), 2500);
  };

  // WhatsApp Mesajı Oluştur & İletişim Aç
  const buildWhatsAppMessage = (invoiceNo?: string) => {
    const selectedBank = BANK_ACCOUNTS.find((b) => b.id === selectedBankId) || BANK_ACCOUNTS[0];
    const targetInfo = item.targetSlug ? `qr-la.com/${item.targetSlug}` : 'Genel QR-la Hesabı';

    return (
      `Merhaba QR-la Ekibi! 👋\n\n` +
      `Aşağıdaki siparişim için Havale / EFT ile ödeme gerçekleştirdim, dekontumu iletiyorum ve onay talep ediyorum:\n\n` +
      `📦 Paket / Hizmet: ${item.title}\n` +
      `💰 Tutar: ${finalPrice} ₺ ${discountTL > 0 ? `(${discountTL} ₺ kupon indirimi uygulandı)` : ''}\n` +
      `🏦 Yatırılan Banka: ${selectedBank.bankName} (${selectedBank.holder})\n` +
      `🔗 İlgili QR: ${targetInfo}\n` +
      (item.description ? `📋 Sipariş Detayı: ${item.description}\n` : '') +
      `👤 Ad Soyad: ${customerName.trim() || 'Müşteri'}\n` +
      `📞 İletişim Telefon: ${customerPhone.trim() || 'Belirtilmedi'}\n` +
      `📧 E-posta: ${customerEmail.trim() || 'musteri@qr-la.com'}\n` +
      (invoiceNo ? `🧾 Sipariş Kodu: ${invoiceNo}\n` : '') +
      (orderNote.trim() ? `📝 Notum: ${orderNote.trim()}\n` : '') +
      `\nLütfen dekontu inceleyerek siparişimi / paketimi onaylayınız. Teşekkürler!`
    );
  };

  const openWhatsAppUrl = (msg: string) => {
    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    } else {
      Linking.openURL(waUrl).catch(() => {
        Alert.alert('Bilgi', 'WhatsApp uygulaması açılamadı. Lütfen WhatsApp web veya telefonunuzu kontrol edin.');
      });
    }
  };

  // Havale Siparişini Onayla ve WhatsApp'a Yönlendir
  const handleProceedWhatsAppOrder = async () => {
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Lütfen iletişim için telefon / WhatsApp numaranızı giriniz.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Ödeme kaydını oluştur ve etkinliği anında yükselt
      const result = await paymentService.processPayment({
        item,
        paymentMethod: 'bank_transfer',
        couponCode: couponDiscount ? couponCode : undefined,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'musteri@qr-la.com',
      });

      if (result.success) {
        setCompletedTransaction(result.transaction);
        setStep('success');
        onSuccess(result.transaction);

        // 2. WhatsApp penceresini aç
        const waMsg = buildWhatsAppMessage(result.transaction.invoiceNo);
        setTimeout(() => {
          openWhatsAppUrl(waMsg);
        }, 300);
      } else {
        setErrorMessage(result.error || 'Sipariş oluşturulamadı.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'İşlem sırasında teknik bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeBank = BANK_ACCOUNTS.find((b) => b.id === selectedBankId) || BANK_ACCOUNTS[0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Üst Bar */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.whatsappIconWrap}>
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.modalHeaderTitle}>
                  {step === 'success'
                    ? 'Sipariş Bildirimi Alındı'
                    : 'Havale / EFT ile Ödeme & WhatsApp İletişimi'}
                </Text>
                <Text style={styles.modalHeaderSub}>
                  7/24 FAST • WhatsApp Destek Hattı: +90 541 577 91 66
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Hata Mesajı */}
          {errorMessage && (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          )}

          {/* ADIM 1: HAVALE / EFT BİLGİLERİ VE WHATSAPP SİPARİŞ FORMU */}
          {step === 'form' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Paket Özet Kartı */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  </View>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>{finalPrice} ₺</Text>
                    {item.period ? (
                      <Text style={styles.pricePeriodText}>/{item.period}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Özellikler */}
                <View style={styles.summaryFeatures}>
                  {item.features.slice(0, 3).map((f, i) => (
                    <View key={i} style={styles.featureLine}>
                      <Ionicons name="checkmark-circle" size={14} color="#C5A059" />
                      <Text style={styles.featureLineText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Havale / FAST Banka Hesapları Kartı */}
              <View style={styles.bankSection}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="business" size={16} color="#C5A059" />
                  <Text style={styles.sectionTitle}>Resmi Banka Hesap Bilgilerimiz:</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Aşağıdaki IBAN numaralarından birine FAST veya Havale ile ödemenizi gönderin.
                </Text>

                {/* Banka Seçim Sekmeleri */}
                <View style={styles.bankTabsRow}>
                  {BANK_ACCOUNTS.map((b) => {
                    const isSelected = selectedBankId === b.id;
                    return (
                      <TouchableOpacity
                        key={b.id}
                        style={[styles.bankTabBtn, isSelected && styles.bankTabBtnActive]}
                        onPress={() => setSelectedBankId(b.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.bankTabText, isSelected && styles.bankTabTextActive]}>
                          {b.bankName}
                        </Text>
                        <View style={[styles.bankTabBadge, isSelected && styles.bankTabBadgeActive]}>
                          <Text style={[styles.bankTabBadgeText, isSelected && styles.bankTabBadgeTextActive]}>
                            {b.badge}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Seçili Banka Detayı */}
                <View style={styles.activeBankCard}>
                  <View style={styles.bankDetailRow}>
                    <Text style={styles.bankDetailLabel}>Hesap Sahibi:</Text>
                    <Text style={styles.bankDetailVal}>{activeBank.holder}</Text>
                  </View>

                  <View style={styles.ibanDisplayBlock}>
                    <Text style={styles.ibanCode}>{activeBank.ibanFormatted}</Text>
                    <TouchableOpacity
                      style={styles.copyIbanBtn}
                      onPress={() => handleCopyIban(activeBank)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={copiedIbanId === activeBank.id ? 'checkmark-circle' : 'copy-outline'}
                        size={16}
                        color={copiedIbanId === activeBank.id ? '#10B981' : '#F8FAFC'}
                      />
                      <Text
                        style={[
                          styles.copyIbanBtnText,
                          copiedIbanId === activeBank.id && { color: '#10B981' },
                        ]}
                      >
                        {copiedIbanId === activeBank.id ? 'Kopyalandı' : 'IBAN Kopyala'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.transferTipBox}>
                    <Ionicons name="information-circle" size={16} color="#F59E0B" />
                    <Text style={styles.transferTipText}>
                      Havale açıklama kısmına{' '}
                      <Text style={{ fontWeight: '700', color: '#F8FAFC' }}>
                        "{item.targetSlug || 'QR-la'} - {customerName || 'Adınız'}"
                      </Text>{' '}
                      yazmanız işleminizi hızlandıracaktır.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Müşteri İletişim Bilgileri (WhatsApp için) */}
              <View style={styles.customerFormBlock}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="person-circle-outline" size={17} color="#25D366" />
                  <Text style={styles.sectionTitle}>İletişim & Fatura Bilgileriniz:</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Ad Soyad *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>WhatsApp / Telefon Numarası *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                    placeholder="0541 577 91 66"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>E-posta Adresi (Fatura için)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={customerEmail}
                    onChangeText={setCustomerEmail}
                    placeholder="ornek@qr-la.com"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Sipariş Notu (İsteğe Bağlı)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={orderNote}
                    onChangeText={setOrderNote}
                    placeholder="Örn: Ödemeyi Garanti'den Samet adına gönderdim..."
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              {/* Kupon Kodu Alanı */}
              <View style={styles.couponSection}>
                <Text style={styles.fieldLabel}>İndirim Kuponu / Promosyon Kodu:</Text>
                <View style={styles.couponRow}>
                  <TextInput
                    style={styles.couponInput}
                    value={couponCode}
                    onChangeText={setCouponCode}
                    placeholder="Örn: ASNUSVIP, YUZDE20, VIP100"
                    placeholderTextColor="#64748B"
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.applyCouponBtn}
                    onPress={handleApplyCoupon}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.applyCouponBtnText}>Uygula</Text>
                  </TouchableOpacity>
                </View>

                {couponDiscount && (
                  <View style={styles.couponSuccessAlert}>
                    <Ionicons name="gift" size={16} color="#10B981" />
                    <Text style={styles.couponSuccessText}>
                      {couponDiscount.message} (-{couponDiscount.discountTL} ₺)
                    </Text>
                  </View>
                )}
              </View>

              {/* Fatura Toplamı */}
              <View style={styles.checkoutTotals}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Paket Tutarı:</Text>
                  <Text style={styles.totalVal}>{item.price} ₺</Text>
                </View>
                {discountTL > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: '#10B981' }]}>Kupon İndirimi:</Text>
                    <Text style={[styles.totalVal, { color: '#10B981' }]}>-{discountTL} ₺</Text>
                  </View>
                )}
                <View style={styles.totalDivider} />
                <View style={styles.totalRow}>
                  <Text style={styles.grandTotalLabel}>Ödenecek Tutar (KDV Dahil):</Text>
                  <Text style={styles.grandTotalVal}>{finalPrice} ₺</Text>
                </View>
              </View>

              {/* WhatsApp Butonu (Ana Eylem) */}
              <TouchableOpacity
                style={styles.whatsAppSubmitBtn}
                onPress={handleProceedWhatsAppOrder}
                disabled={isProcessing}
                activeOpacity={0.88}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.whatsAppSubmitBtnText}>
                        WhatsApp ile Siparişi Tamamla ({finalPrice} ₺)
                      </Text>
                      <Text style={styles.whatsAppSubmitSubText}>
                        Dekont iletmek üzere anında WhatsApp sohbeti başlatılır
                      </Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ADIM 2: SİPARİŞ BAŞARILI & WHATSAPP BEKLEME EKRANI */}
          {step === 'success' && completedTransaction && (
            <View style={styles.successBlock}>
              <View style={styles.successCelebrationBadge}>
                <Ionicons name="checkmark-done-circle" size={64} color="#25D366" />
              </View>

              <Text style={styles.successTitle}>🎉 Sipariş Bildiriminiz Alındı!</Text>
              <Text style={styles.successSub}>
                Havale / EFT bildiriminiz sistemimize kaydedildi. WhatsApp üzerinden dekontunuz
                doğrulanarak paketiniz anında tam yetkili hale getirilecektir.
              </Text>

              {/* Fatura Bilgileri Kartı */}
              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Hizmet / Paket:</Text>
                  <Text style={styles.receiptVal}>{completedTransaction.itemTitle}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>İşlem Tutarı:</Text>
                  <Text style={[styles.receiptVal, { color: '#C5A059', fontWeight: '800' }]}>
                    {completedTransaction.amount} ₺
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Ödeme Yöntemi:</Text>
                  <Text style={styles.receiptVal}>Havale / FAST (WhatsApp Dekont)</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Fatura / Sipariş No:</Text>
                  <Text style={styles.receiptVal}>{completedTransaction.invoiceNo}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Referans Kodu:</Text>
                  <Text style={styles.receiptVal}>{completedTransaction.id}</Text>
                </View>
              </View>

              {/* Butonlar */}
              <View style={styles.successButtonsRow}>
                <TouchableOpacity
                  style={styles.reopenWhatsAppBtn}
                  onPress={() => openWhatsAppUrl(buildWhatsAppMessage(completedTransaction.invoiceNo))}
                  activeOpacity={0.88}
                >
                  <Ionicons name="logo-whatsapp" size={19} color="#FFFFFF" />
                  <Text style={styles.reopenWhatsAppBtnText}>WhatsApp Görüşmesini Aç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.printReceiptBtn}
                  onPress={() => paymentService.printReceipt(completedTransaction)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="print-outline" size={17} color="#CBD5E1" />
                  <Text style={styles.printReceiptBtnText}>e-Arşiv Sipariş Fişi Yazdır</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.finishSuccessBtn}
                  onPress={onClose}
                  activeOpacity={0.88}
                >
                  <Text style={styles.finishSuccessBtnText}>Kapat & Panele Dön</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#090D16',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  whatsappIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  modalHeaderTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  modalHeaderSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#450A0A',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 12,
    gap: 10,
  },
  errorAlertText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  itemDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  priceBadge: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderWidth: 1,
    borderColor: '#C5A059',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceBadgeText: {
    color: '#C5A059',
    fontSize: 18,
    fontWeight: '800',
  },
  pricePeriodText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  summaryFeatures: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 10,
  },
  featureLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureLineText: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  bankSection: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
  },
  bankTabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  bankTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  bankTabBtnActive: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderColor: '#C5A059',
  },
  bankTabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  bankTabTextActive: {
    color: '#C5A059',
    fontWeight: '700',
  },
  bankTabBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bankTabBadgeActive: {
    backgroundColor: '#C5A059',
  },
  bankTabBadgeText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  bankTabBadgeTextActive: {
    color: '#090D16',
  },
  activeBankCard: {
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankDetailLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  bankDetailVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  ibanDisplayBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  ibanCode: {
    color: '#C5A059',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  copyIbanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  copyIbanBtnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
  },
  transferTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: 10,
    borderRadius: 10,
  },
  transferTipText: {
    color: '#FDE68A',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  customerFormBlock: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    fontSize: 13,
  },
  couponSection: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  couponRow: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  applyCouponBtn: {
    backgroundColor: '#C5A059',
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponBtnText: {
    color: '#090D16',
    fontSize: 13,
    fontWeight: '700',
  },
  couponSuccessAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  couponSuccessText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '600',
  },
  checkoutTotals: {
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  totalVal: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  grandTotalLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  grandTotalVal: {
    color: '#C5A059',
    fontSize: 20,
    fontWeight: '800',
  },
  whatsAppSubmitBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#25D366',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  whatsAppSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  whatsAppSubmitSubText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  successBlock: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  successCelebrationBadge: {
    marginTop: 8,
  },
  successTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    marginVertical: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  receiptVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  successButtonsRow: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  reopenWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  reopenWhatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  printReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  printReceiptBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  finishSuccessBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C5A059',
    paddingVertical: 13,
    borderRadius: 14,
  },
  finishSuccessBtnText: {
    color: '#090D16',
    fontSize: 14,
    fontWeight: '700',
  },
});
