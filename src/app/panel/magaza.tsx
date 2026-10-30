import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import {
  ecosystemService,
  SHOP_PRODUCTS,
  ShopProduct,
  ShopOrder,
  EcosystemAsset,
} from '@/services/ecosystemService';
import PaymentModal from '@/components/PaymentModal';
import { PaymentItem, TransactionRecord } from '@/services/paymentService';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

export default function PhygitalShopScreen() {
  const router = useRouter();
  const [currentUser] = useState(authService.getState().user);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userAssets, setUserAssets] = useState<EcosystemAsset[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);

  // Checkout Modal
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [selectedAssetSlug, setSelectedAssetSlug] = useState<string>('');
  const [customerName, setCustomerName] = useState(currentUser?.displayName || 'Samet Sunman');
  const [phone, setPhone] = useState('0541 577 91 66');
  const [city, setCity] = useState('İstanbul / Kadıköy');
  const [address, setAddress] = useState('Moda Cad. No:42 D:5');
  const [paymentMethod, setPaymentMethod] = useState<'Kart' | 'Havale'>('Kart');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<PaymentItem | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Fiziksel Baskı & Matbaa Mağazası | QR-la';
    }
  }, []);

  useEffect(() => {
    async function init() {
      const assets = await ecosystemService.getAllUserAssets(
        currentUser?.uid || 'demo-host-yavuz'
      );
      setUserAssets(assets);
      if (assets.length > 0) {
        setSelectedAssetSlug(assets[0].slug);
      }
      setOrders(ecosystemService.getUserOrders());
    }
    init();
  }, [currentUser?.uid]);

  const handleOpenCheckout = (product: ShopProduct) => {
    setSelectedProduct(product);
    // Auto-match asset of same category if available
    const matched = userAssets.find((a) => a.moduleType === product.category);
    if (matched) setSelectedAssetSlug(matched.slug);
    setCheckoutModalVisible(true);
  };

  const handleCompleteOrder = () => {
    if (!selectedProduct) return;
    if (!customerName || !phone || !address || !city) {
      alert('Lütfen teslimat ve iletişim bilgilerini eksiksiz doldurunuz.');
      return;
    }

    // Doğrudan Güvenli Ödeme Modalı'na aktar
    setSelectedPaymentItem({
      id: `shop-${selectedProduct.id}`,
      title: `${selectedProduct.title} (Fiziksel Baskı)`,
      category: 'shop_product',
      price: selectedProduct.price,
      originalPrice: selectedProduct.originalPrice,
      targetSlug: selectedAssetSlug || 'qr-kod',
      description: `${customerName} adına ${city} teslimat adresine kargolanacak sipariş.`,
      features: selectedProduct.features,
    });
    setCheckoutModalVisible(false);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = (transaction: TransactionRecord) => {
    if (!selectedProduct) return;

    const created = ecosystemService.createOrder({
      productTitle: selectedProduct.title,
      assetSlug: selectedAssetSlug || 'qr-kod',
      price: transaction.amount,
      customerName,
      phone,
      address,
      city,
    });

    setOrders([created, ...orders]);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 5000);
  };

  const filteredProducts = SHOP_PRODUCTS.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/panel' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#FFFFFF' : colors.text} />
          <Text style={styles.backBtnText}>Panele Dön</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <ThemeToggleBtn size="sm" />
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/panel' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="apps-outline" size={17} color="#6366F1" />
            <Text style={[styles.headerBtnText, { color: '#6366F1' }]}>Varlıklarım</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/panel/analitik' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="bar-chart-outline" size={17} color="#D97706" />
            <Text style={[styles.headerBtnText, { color: '#D97706' }]}>Analitik</Text>
          </TouchableOpacity>
        </View>
      </View>

      {orderSuccess && (
        <View style={styles.successBar}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.successBarText}>
            🎉 Siparişiniz başarıyla alındı! Baskı atölyemize iletildi, kargo takip kodunuz hazırlandı.
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Title */}
        <View style={styles.titleWrap}>
          <View style={styles.titleIconBadge}>
            <Ionicons name="bag-handle" size={26} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Phygital Baskı & Matbaa Mağazası</Text>
            <Text style={styles.pageSubtitle}>
              Dijital QR kodlarınızı güneşten solmayan UV stickerlara, 30mm lazer çelik künyelere ve lüks NFC akıllı kartlara dönüştürün.
            </Text>
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {[
            { id: 'all', label: 'Tüm Ürünler' },
            { id: 'vehicle', label: '🚗 Cam Stickerları' },
            { id: 'pet', label: '🐾 Çelik Pati Künyesi' },
            { id: 'vcard', label: '💼 Lüks NFC Kartvizit' },
            { id: 'menu', label: '🍽️ Masa Menü Standı' },
            { id: 'event', label: '💍 Düğün Masa Kartı' },
          ].map((c) => {
            const isSel = selectedCategory === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.categoryPill, isSel && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(c.id)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSel && styles.categoryPillTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Product Cards Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((prod) => (
            <View key={prod.id} style={styles.productCard}>
              <View style={styles.productImageWrap}>
                <Image source={{ uri: prod.image }} style={styles.productImage} />
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{prod.badge}</Text>
                </View>
              </View>

              <View style={styles.productContent}>
                <Text style={styles.productTitle}>{prod.title}</Text>
                <Text style={styles.productDesc}>{prod.description}</Text>

                <View style={styles.featuresList}>
                  {prod.features.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.specsBox}>
                  <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.specsText}>{prod.specs}</Text>
                </View>

                {/* Price & Order Action */}
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceCurrent}>{prod.price} ₺</Text>
                    {prod.originalPrice ? (
                      <Text style={styles.priceOld}>{prod.originalPrice} ₺</Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={styles.orderBtn}
                    onPress={() => handleOpenCheckout(prod)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="bag-add" size={16} color="#FFFFFF" />
                    <Text style={styles.orderBtnText}>Sipariş Ver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Orders Tracking Section */}
        {orders.length > 0 && (
          <View style={styles.ordersSection}>
            <View style={styles.ordersHeaderRow}>
              <Ionicons name="cube-outline" size={20} color="#F59E0B" />
              <Text style={styles.ordersSectionTitle}>Mevcut Siparişleriniz ({orders.length})</Text>
            </View>

            <View style={styles.ordersList}>
              {orders.map((ord) => (
                <View key={ord.id} style={styles.orderCard}>
                  <View style={styles.orderCardLeft}>
                    <View style={styles.orderIdBadge}>
                      <Text style={styles.orderIdText}>{ord.id}</Text>
                    </View>
                    <Text style={styles.orderTitle}>{ord.productTitle}</Text>
                    <Text style={styles.orderMeta}>
                      Bağlı Varlık: <Text style={{ color: '#FBBF24' }}>qr-la.com/{ord.assetSlug}</Text> • {ord.city}
                    </Text>
                    <Text style={styles.orderTracking}>
                      Kargo Takip No: <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>{ord.trackingNumber}</Text>
                    </Text>
                  </View>

                  <View style={styles.orderCardRight}>
                    <View style={styles.statusBadgeKargo}>
                      <Ionicons name="car-outline" size={13} color="#10B981" />
                      <Text style={styles.statusBadgeKargoText}>{ord.status}</Text>
                    </View>
                    <Text style={styles.orderPriceText}>{ord.price} ₺</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Checkout Modal */}
      <Modal
        visible={checkoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.checkoutModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Siparişi Tamamla</Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {selectedProduct?.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              {/* Asset Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Baskıya Basılacak QR Varlığınız *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                  {userAssets.map((a) => {
                    const isSel = selectedAssetSlug === a.slug;
                    return (
                      <TouchableOpacity
                        key={a.id}
                        style={[
                          styles.assetSelectPill,
                          isSel && styles.assetSelectPillActive,
                        ]}
                        onPress={() => setSelectedAssetSlug(a.slug)}
                      >
                        <Ionicons
                          name={a.icon as any}
                          size={14}
                          color={isSel ? '#FFFFFF' : '#9CA3AF'}
                        />
                        <Text
                          style={[
                            styles.assetSelectPillText,
                            isSel && styles.assetSelectPillTextActive,
                          ]}
                        >
                          {a.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Delivery Details */}
              <View style={styles.grid2Col}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Ad Soyad *</Text>
                  <TextInput
                    style={styles.input}
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder="Samet Sunman"
                    placeholderTextColor="#6B7280"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Telefon *</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="0541..."
                    placeholderTextColor="#6B7280"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>İl / İlçe *</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="İstanbul / Kadıköy"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Açık Teslimat Adresi *</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Cadde, sokak, bina ve daire no..."
                  placeholderTextColor="#6B7280"
                  multiline
                />
              </View>

              {/* Payment selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ödeme Yöntemi</Text>
                <View style={styles.paymentMethodRow}>
                  <TouchableOpacity
                    style={[
                      styles.payOption,
                      paymentMethod === 'Kart' && styles.payOptionActive,
                    ]}
                    onPress={() => setPaymentMethod('Kart')}
                  >
                    <Ionicons
                      name="card"
                      size={16}
                      color={paymentMethod === 'Kart' ? '#10B981' : '#9CA3AF'}
                    />
                    <Text
                      style={[
                        styles.payOptionText,
                        paymentMethod === 'Kart' && styles.payOptionTextActive,
                      ]}
                    >
                      Kredi / Banka Kartı
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.payOption,
                      paymentMethod === 'Havale' && styles.payOptionActive,
                    ]}
                    onPress={() => setPaymentMethod('Havale')}
                  >
                    <Ionicons
                      name="cash-outline"
                      size={16}
                      color={paymentMethod === 'Havale' ? '#10B981' : '#9CA3AF'}
                    />
                    <Text
                      style={[
                        styles.payOptionText,
                        paymentMethod === 'Havale' && styles.payOptionTextActive,
                      ]}
                    >
                      Havale / EFT
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.checkoutSummaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ürün Bedeli:</Text>
                  <Text style={styles.summaryVal}>{selectedProduct?.price} ₺</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Hızlı Kargo:</Text>
                  <Text style={[styles.summaryVal, { color: '#10B981' }]}>Ücretsiz (0 ₺)</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Toplam Tutar:</Text>
                  <Text style={styles.summaryTotalVal}>{selectedProduct?.price} ₺</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCheckoutModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleCompleteOrder}
              >
                <Ionicons name="bag-check" size={18} color="#FFFFFF" />
                <Text style={styles.modalConfirmBtnText}>Siparişi Onayla ({selectedProduct?.price} ₺)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Online Ödeme Modalı */}
      <PaymentModal
        visible={paymentModalVisible}
        item={selectedPaymentItem}
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
      />
    </SafeAreaView>
  );
}

function getStyles(isDark: boolean, colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? '#10121A' : '#FFFFFF',
      flexWrap: 'wrap',
      gap: 10,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    backBtnText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: isDark ? '#1B1E2E' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerBtnText: {
      fontSize: 12,
      fontWeight: '700',
    },
    successBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(16, 185, 129, 0.3)',
    },
    successBarText: {
      color: '#10B981',
      fontSize: 13,
      fontWeight: '600',
    },
    scrollContainer: {
      padding: 20,
      maxWidth: 960,
      alignSelf: 'center',
      width: '100%',
      paddingBottom: 60,
    },
    titleWrap: {
      flexDirection: 'row',
      gap: 14,
      marginBottom: 20,
      alignItems: 'flex-start',
    },
    titleIconBadge: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 4,
    },
    pageSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    categoryScroll: {
      gap: 8,
      paddingBottom: 20,
    },
    categoryPill: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryPillActive: {
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    categoryPillText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    categoryPillTextActive: {
      color: '#10B981',
      fontWeight: '800',
    },
    productsGrid: {
      gap: 18,
      marginBottom: 32,
    },
    productCard: {
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    productImageWrap: {
      width: '100%',
      maxWidth: 300,
      height: 220,
      position: 'relative',
      backgroundColor: isDark ? '#1E2230' : '#F1F5F9',
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    badgePill: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: 'rgba(16, 185, 129, 0.9)',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    badgePillText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    productContent: {
      flex: 1,
      minWidth: 280,
      padding: 20,
      justifyContent: 'space-between',
    },
    productTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 6,
    },
    productDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 12,
    },
    featuresList: {
      gap: 6,
      marginBottom: 12,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    featureText: {
      color: isDark ? '#D1D5DB' : '#4B5563',
      fontSize: 12,
    },
    specsBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? '#1B1E2E' : '#F1F5F9',
      padding: 8,
      borderRadius: 8,
      marginBottom: 16,
    },
    specsText: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceCurrent: {
      color: '#10B981',
      fontSize: 24,
      fontWeight: '900',
    },
    priceOld: {
      color: colors.textSecondary,
      fontSize: 13,
      textDecorationLine: 'line-through',
    },
    orderBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#10B981',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    orderBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
    },
    ordersSection: {
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
    },
    ordersHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
    },
    ordersSectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    ordersList: {
      gap: 10,
    },
    orderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#1B1E2E' : '#F1F5F9',
      borderRadius: 14,
      padding: 14,
      flexWrap: 'wrap',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderCardLeft: {
      flex: 1,
      minWidth: 220,
    },
    orderIdBadge: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB',
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 4,
    },
    orderIdText: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
    },
    orderTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
      marginBottom: 2,
    },
    orderMeta: {
      color: colors.textSecondary,
      fontSize: 11,
      marginBottom: 4,
    },
    orderTracking: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    orderCardRight: {
      alignItems: 'flex-end',
      gap: 6,
    },
    statusBadgeKargo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    statusBadgeKargoText: {
      color: '#10B981',
      fontSize: 11,
      fontWeight: '700',
    },
    orderPriceText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    checkoutModalCard: {
      width: '100%',
      maxWidth: 520,
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 22,
    },
    modalHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    modalSubtitle: {
      color: '#10B981',
      fontSize: 13,
      fontWeight: '600',
      marginTop: 2,
    },
    formGroup: {
      marginBottom: 12,
    },
    grid2Col: {
      flexDirection: 'row',
      gap: 10,
    },
    label: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark ? '#1B1E2E' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: colors.text,
      fontSize: 13,
    },
    assetSelectPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: isDark ? '#1B1E2E' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    assetSelectPillActive: {
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    assetSelectPillText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    assetSelectPillTextActive: {
      color: colors.text,
      fontWeight: '700',
    },
    paymentMethodRow: {
      flexDirection: 'row',
      gap: 10,
    },
    payOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: isDark ? '#1B1E2E' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
    },
    payOptionActive: {
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    payOptionText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    payOptionTextActive: {
      color: '#10B981',
      fontWeight: '700',
    },
    checkoutSummaryCard: {
      backgroundColor: isDark ? '#1B1E2E' : '#F1F5F9',
      borderRadius: 12,
      padding: 12,
      marginTop: 6,
      gap: 6,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryLabel: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    summaryVal: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    summaryDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    summaryTotalLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    summaryTotalVal: {
      color: '#10B981',
      fontSize: 16,
      fontWeight: '900',
    },
    modalFooterRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },
    modalCancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    modalCancelBtnText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    modalConfirmBtn: {
      flex: 1.6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#10B981',
      paddingVertical: 12,
      borderRadius: 12,
    },
    modalConfirmBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });
}
