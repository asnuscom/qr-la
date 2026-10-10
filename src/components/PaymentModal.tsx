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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentItem, CreditCardData, TransactionRecord, paymentService } from '../services/paymentService';

interface PaymentModalProps {
  visible: boolean;
  item: PaymentItem | null;
  onClose: () => void;
  onSuccess: (transaction: TransactionRecord) => void;
}

type PaymentStep = 'form' | 'three_d_secure' | 'success';

export default function PaymentModal({ visible, item, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('form');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer'>('credit_card');

  // Kart Bilgileri
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expireMonth, setExpireMonth] = useState('12');
  const [expireYear, setExpireYear] = useState('28');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [customerEmail, setCustomerEmail] = useState('');

  // Kupon Kodu
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{ discountTL: number; message: string } | null>(null);

  // 3D Secure SMS Kodu
  const [smsCode, setSmsCode] = useState('');
  const [expectedSmsCode] = useState('192345');
  const [countdown, setCountdown] = useState(180);

  // İşlem Durumu
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedTransaction, setCompletedTransaction] = useState<TransactionRecord | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);

  // Modal açıldığında state sıfırlama
  useEffect(() => {
    if (visible) {
      setStep('form');
      setPaymentMethod('credit_card');
      setCardNumber('5428 9123 4819 9166');
      setCardHolder('SAMET SUNMAN');
      setExpireMonth('12');
      setExpireYear('28');
      setCvv('428');
      setInstallments(1);
      setCustomerEmail('samet@qr-la.com');
      setCouponCode('');
      setCouponDiscount(null);
      setErrorMessage(null);
      setCompletedTransaction(null);
      setSmsCode('');
      setCountdown(180);
    }
  }, [visible]);

  // 3D Secure Sayacı
  useEffect(() => {
    let timer: any;
    if (step === 'three_d_secure' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!item) return null;

  // Kart Numarası Formatlama (4'erli gruplar)
  const handleCardNumberChange = (text: string) => {
    const raw = text.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Kart Markası Tespiti
  const cardBrand = paymentService.detectCardBrand(cardNumber);

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

  // Formdan Ödemeye Geçiş
  const handleProceedPayment = () => {
    setErrorMessage(null);

    if (paymentMethod === 'bank_transfer') {
      finalizeTransaction();
      return;
    }

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15) {
      setErrorMessage('Lütfen geçerli bir kredi kartı numarası giriniz.');
      return;
    }
    if (!cardHolder.trim()) {
      setErrorMessage('Kart üzerindeki ismi giriniz.');
      return;
    }
    if (!cvv || cvv.length < 3) {
      setErrorMessage('Lütfen geçerli 3 haneli CVV kodunu giriniz.');
      return;
    }

    // 3D Secure adımına geç
    setStep('three_d_secure');
    setCountdown(180);
  };

  // 3D Secure Onayı
  const handleVerify3DSecure = () => {
    if (smsCode.trim() !== expectedSmsCode && smsCode.trim() !== '123456') {
      setErrorMessage('Girdiğiniz SMS doğrulama kodu hatalı. Lütfen tekrar deneyin.');
      return;
    }
    finalizeTransaction();
  };

  // İşlemi Kesinleştir
  const finalizeTransaction = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const cardData: CreditCardData | undefined =
      paymentMethod === 'credit_card'
        ? {
            cardNumber,
            cardHolder,
            expireMonth,
            expireYear,
            cvv,
            installments,
          }
        : undefined;

    try {
      const result = await paymentService.processPayment({
        item,
        paymentMethod,
        cardData,
        couponCode: couponDiscount ? couponCode : undefined,
        customerName: cardHolder || 'Değerli Müşteri',
        customerEmail: customerEmail || 'musteri@qr-la.com',
      });

      if (result.success) {
        setCompletedTransaction(result.transaction);
        setStep('success');
        onSuccess(result.transaction);
      } else {
        setErrorMessage(result.error || 'Ödeme tamamlanamadı.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ödeme sırasında teknik bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  // IBAN Kopyalama
  const handleCopyIban = () => {
    const iban = 'TR840006200000012938471902';
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(iban);
    }
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Üst Bar */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.securityIconWrap}>
                <Ionicons name="shield-checkmark" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.modalHeaderTitle}>
                  {step === 'three_d_secure'
                    ? '3D Secure Güvenlik Onayı'
                    : step === 'success'
                    ? 'Ödeme Başarılı & Aktif'
                    : 'Güvenli Ödeme & Aktivasyon'}
                </Text>
                <Text style={styles.modalHeaderSub}>256-Bit SSL • BKM Express Uyumlu</Text>
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

          {/* ADIM 1: FORM VE SİPARİŞ ÖZETİ */}
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
                    <Text style={styles.priceBadgeText}>{item.price} ₺</Text>
                    {item.period ? (
                      <Text style={styles.pricePeriodText}>/{item.period}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Özellikler */}
                <View style={styles.summaryFeatures}>
                  {item.features.slice(0, 3).map((f, i) => (
                    <View key={i} style={styles.featureLine}>
                      <Ionicons name="checkmark-circle" size={14} color="#D4AF37" />
                      <Text style={styles.featureLineText}>{f}</Text>
                    </View>
                  ))}
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
                    placeholder="Örn: ASNUSVIP, YUZDE20, HOSGELDIN"
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

              {/* Ödeme Yöntemi Seçici */}
              <View style={styles.paymentMethodToggle}>
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'credit_card' && styles.methodBtnActive,
                  ]}
                  onPress={() => setPaymentMethod('credit_card')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="card"
                    size={18}
                    color={paymentMethod === 'credit_card' ? '#D4AF37' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.methodBtnText,
                      paymentMethod === 'credit_card' && styles.methodBtnTextActive,
                    ]}
                  >
                    Kredi / Banka Kartı
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'bank_transfer' && styles.methodBtnActive,
                  ]}
                  onPress={() => setPaymentMethod('bank_transfer')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="cash-outline"
                    size={18}
                    color={paymentMethod === 'bank_transfer' ? '#D4AF37' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.methodBtnText,
                      paymentMethod === 'bank_transfer' && styles.methodBtnTextActive,
                    ]}
                  >
                    Havale / EFT / FAST
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Kredi Kartı Formu */}
              {paymentMethod === 'credit_card' ? (
                <View style={styles.cardFormBlock}>
                  {/* Canlı Lüks Kart Görseli */}
                  <View style={styles.virtualCard}>
                    <View style={styles.virtualCardTop}>
                      <View style={styles.cardChip} />
                      <View style={styles.cardBrandBadge}>
                        <Text style={styles.cardBrandText}>{cardBrand}</Text>
                      </View>
                    </View>

                    <Text style={styles.virtualCardNumber}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </Text>

                    <View style={styles.virtualCardBottom}>
                      <View>
                        <Text style={styles.virtualCardLabel}>KART SAHİBİ</Text>
                        <Text style={styles.virtualCardVal}>
                          {cardHolder || 'AD SOYAD'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.virtualCardLabel}>SON KULLANMA</Text>
                        <Text style={styles.virtualCardVal}>
                          {expireMonth}/{expireYear}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Form Girdileri */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>Kart Üzerindeki İsim Soyisim *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={cardHolder}
                      onChangeText={setCardHolder}
                      placeholder="SAMET SUNMAN"
                      placeholderTextColor="#64748B"
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>Kart Numarası *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={cardNumber}
                      onChangeText={handleCardNumberChange}
                      placeholder="5428 •••• •••• 9166"
                      placeholderTextColor="#64748B"
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.grid2Col}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.fieldLabel}>Son Kul. (AA / YY) *</Text>
                      <View style={styles.expiryRow}>
                        <TextInput
                          style={[styles.textInput, { flex: 1, textAlign: 'center' }]}
                          value={expireMonth}
                          onChangeText={setExpireMonth}
                          placeholder="12"
                          placeholderTextColor="#64748B"
                          keyboardType="number-pad"
                          maxLength={2}
                        />
                        <Text style={{ color: '#64748B', fontSize: 16 }}>/</Text>
                        <TextInput
                          style={[styles.textInput, { flex: 1, textAlign: 'center' }]}
                          value={expireYear}
                          onChangeText={setExpireYear}
                          placeholder="28"
                          placeholderTextColor="#64748B"
                          keyboardType="number-pad"
                          maxLength={2}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.fieldLabel}>Güvenlik Kodu (CVV) *</Text>
                      <TextInput
                        style={styles.textInput}
                        value={cvv}
                        onChangeText={setCvv}
                        placeholder="428"
                        placeholderTextColor="#64748B"
                        keyboardType="number-pad"
                        maxLength={4}
                      />
                    </View>
                  </View>

                  {/* Taksit Seçenekleri */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>Taksit Seçeneği:</Text>
                    <View style={styles.installmentsRow}>
                      {[
                        { inst: 1, label: 'Tek Çekim' },
                        { inst: 3, label: '3 Taksit' },
                        { inst: 6, label: '6 Taksit' },
                      ].map((t) => (
                        <TouchableOpacity
                          key={t.inst}
                          style={[
                            styles.instBtn,
                            installments === t.inst && styles.instBtnActive,
                          ]}
                          onPress={() => setInstallments(t.inst)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.instBtnText,
                              installments === t.inst && styles.instBtnTextActive,
                            ]}
                          >
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                /* Havale / EFT Bilgileri */
                <View style={styles.bankTransferBlock}>
                  <View style={styles.bankCard}>
                    <Text style={styles.bankName}>Garanti BBVA • Asnus Teknoloji A.Ş.</Text>
                    <Text style={styles.bankSub}>Hızlı FAST & Havale 7/24 Anında Otomatik Onay</Text>

                    <View style={styles.ibanRow}>
                      <Text style={styles.ibanText}>TR84 0006 2000 0001 2938 4719 02</Text>
                      <TouchableOpacity
                        style={styles.copyIbanBtn}
                        onPress={handleCopyIban}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={copiedIban ? 'checkmark' : 'copy-outline'}
                          size={15}
                          color={copiedIban ? '#10B981' : '#CBD5E1'}
                        />
                        <Text style={[styles.copyIbanBtnText, copiedIban && { color: '#10B981' }]}>
                          {copiedIban ? 'Kopyalandı' : 'Kopyala'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.transferNote}>
                      <Ionicons name="information-circle" size={16} color="#F59E0B" />
                      <Text style={styles.transferNoteText}>
                        Açıklama alanına etkinliğinizin adını veya e-postanızı yazınız. Ödemeniz
                        5 dakika içinde otomatik onaylanır.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

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

              {/* Onayla & Öde Butonu */}
              <TouchableOpacity
                style={styles.paySubmitBtn}
                onPress={handleProceedPayment}
                disabled={isProcessing}
                activeOpacity={0.88}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#0F172A" />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={18} color="#0F172A" />
                    <Text style={styles.paySubmitBtnText}>
                      {paymentMethod === 'credit_card'
                        ? `Güvenli Öde (${finalPrice} ₺)`
                        : `Havale Bildirimi Yap (${finalPrice} ₺)`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ADIM 2: 3D SECURE SMS DOĞRULAMA MODALI */}
          {step === 'three_d_secure' && (
            <View style={styles.threeDBlock}>
              <View style={styles.bankSecurityHeader}>
                <View style={styles.bankLogoBadge}>
                  <Ionicons name="business" size={24} color="#D4AF37" />
                </View>
                <Text style={styles.threeDTitle}>Bankanız 3D Secure Doğrulaması</Text>
                <Text style={styles.threeDSub}>
                  Lütfen 0541 ••• •• 66 nolu telefonunuza SMS ile gönderilen 6 haneli güvenlik
                  şifresini giriniz.
                </Text>
              </View>

              <View style={styles.countdownBadge}>
                <Ionicons name="time-outline" size={16} color="#D97706" />
                <Text style={styles.countdownText}>
                  Kalan Süre: {Math.floor(countdown / 60)}:
                  {String(countdown % 60).padStart(2, '0')}
                </Text>
              </View>

              <View style={styles.smsInputContainer}>
                <TextInput
                  style={styles.smsInput}
                  value={smsCode}
                  onChangeText={setSmsCode}
                  placeholder="192345"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={styles.demoCodeFillBtn}
                onPress={() => setSmsCode(expectedSmsCode)}
                activeOpacity={0.8}
              >
                <Ionicons name="flash-outline" size={14} color="#D4AF37" />
                <Text style={styles.demoCodeFillText}>Demo Kodu Otomatik Doldur ({expectedSmsCode})</Text>
              </TouchableOpacity>

              <View style={styles.threeDActionRow}>
                <TouchableOpacity
                  style={styles.threeDCancelBtn}
                  onPress={() => setStep('form')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.threeDCancelText}>Vazgeç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.threeDConfirmBtn}
                  onPress={handleVerify3DSecure}
                  disabled={isProcessing}
                  activeOpacity={0.88}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#0F172A" />
                  ) : (
                    <Text style={styles.threeDConfirmText}>Onayla ve Ödemeyi Tamamla</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ADIM 3: ÖDEME BAŞARILI VE MAKBUZ EKRANI */}
          {step === 'success' && completedTransaction && (
            <View style={styles.successBlock}>
              <View style={styles.successCelebrationBadge}>
                <Ionicons name="checkmark-done-circle" size={64} color="#10B981" />
              </View>

              <Text style={styles.successTitle}>🎉 Ödemeniz Başarıyla Alındı!</Text>
              <Text style={styles.successSub}>
                Paketiniz anında hesabınıza tanımlandı ve etkinleştirildi.
              </Text>

              {/* Fatura Bilgileri Kartı */}
              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Hizmet / Paket:</Text>
                  <Text style={styles.receiptVal}>{completedTransaction.itemTitle}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>İşlem Tutarı:</Text>
                  <Text style={[styles.receiptVal, { color: '#D4AF37', fontWeight: '800' }]}>
                    {completedTransaction.amount} ₺
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Fatura No:</Text>
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
                  style={styles.printReceiptBtn}
                  onPress={() => paymentService.printReceipt(completedTransaction)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="print-outline" size={17} color="#CBD5E1" />
                  <Text style={styles.printReceiptBtnText}>e-Arşiv Fatura Yazdır</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.finishSuccessBtn}
                  onPress={onClose}
                  activeOpacity={0.88}
                >
                  <Text style={styles.finishSuccessBtnText}>Harika, Kullanmaya Başla</Text>
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
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    width: '100%',
    maxWidth: 540,
    maxHeight: '92%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#131D31',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  modalHeaderSub: {
    color: '#94A3B8',
    fontSize: 11,
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
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceBadgeText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '800',
  },
  pricePeriodText: {
    color: '#D4AF37',
    fontSize: 10,
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
  couponSection: {
    gap: 8,
  },
  fieldLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 13,
  },
  applyCouponBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },
  applyCouponBtnText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  couponSuccessAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  couponSuccessText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentMethodToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  methodBtnActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#1E293B',
  },
  methodBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  methodBtnTextActive: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  cardFormBlock: {
    gap: 14,
  },
  virtualCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  virtualCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: 36,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
    opacity: 0.85,
  },
  cardBrandBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBrandText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  virtualCardNumber: {
    color: '#F8FAFC',
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  virtualCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  virtualCardLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  virtualCardVal: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  inputGroup: {
    gap: 6,
  },
  textInput: {
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 13,
  },
  grid2Col: {
    flexDirection: 'row',
    gap: 12,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  installmentsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  instBtn: {
    flex: 1,
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  instBtnActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#1E293B',
  },
  instBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  instBtnTextActive: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  bankTransferBlock: {
    gap: 12,
  },
  bankCard: {
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  bankName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  bankSub: {
    color: '#94A3B8',
    fontSize: 12,
  },
  ibanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  ibanText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  copyIbanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyIbanBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  transferNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  transferNoteText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  checkoutTotals: {
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  totalVal: {
    color: '#F8FAFC',
    fontSize: 13,
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
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '800',
  },
  paySubmitBtn: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  paySubmitBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  threeDBlock: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  bankSecurityHeader: {
    alignItems: 'center',
    gap: 8,
  },
  bankLogoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  threeDTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  threeDSub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 380,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451A03',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  countdownText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '600',
  },
  smsInputContainer: {
    width: '100%',
    maxWidth: 240,
    alignItems: 'center',
  },
  smsInput: {
    width: '100%',
    backgroundColor: '#131D31',
    borderWidth: 2,
    borderColor: '#D4AF37',
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  demoCodeFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  demoCodeFillText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  threeDActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  threeDCancelBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  threeDCancelText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  threeDConfirmBtn: {
    flex: 2,
    backgroundColor: '#D4AF37',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  threeDConfirmText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  successBlock: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  successCelebrationBadge: {
    marginTop: 10,
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
    maxWidth: 360,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#131D31',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginVertical: 6,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  receiptVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  successButtonsRow: {
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  printReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  printReceiptBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  finishSuccessBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishSuccessBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
