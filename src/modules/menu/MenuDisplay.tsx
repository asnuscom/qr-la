import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Platform,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RestaurantData, MenuItem, MenuItemTag } from '@/types';
import { getMenuTheme } from './themes';

interface MenuDisplayProps {
  restaurant: RestaurantData;
  tableNumber?: string;
}

export function MenuDisplay({ restaurant, tableNumber }: MenuDisplayProps) {
  const router = useRouter();
  const theme = getMenuTheme(restaurant.theme);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<MenuItemTag | 'all'>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    restaurant.categories[0]?.id || ''
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [wifiCopied, setWifiCopied] = useState(false);
  const [waiterModalVisible, setWaiterModalVisible] = useState(false);
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [serviceFeedback, setServiceFeedback] = useState<{
    type: 'waiter' | 'bill';
    message: string;
  } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'Nakit' | 'Kredi Kartı' | 'Yemek Kartı / Sodexo'
  >('Kredi Kartı');

  // Wi-Fi Copy
  const copyWifiPassword = () => {
    if (!restaurant.wifiPassword) return;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(restaurant.wifiPassword);
    }
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2500);
  };

  // Open Google Maps
  const openMaps = () => {
    const url =
      restaurant.mapUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        restaurant.address || restaurant.name
      )}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  // Call Restaurant
  const callRestaurant = () => {
    if (restaurant.phone) {
      Linking.openURL(`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`);
    }
  };

  // Share Menu
  const shareMenu = async () => {
    const shareUrl =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.href
        : `https://qr-la.com/m/${restaurant.slug}`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: restaurant.name,
          text: `${restaurant.name} - Dijital Menü`,
          url: shareUrl,
        });
      } else {
        await Share.share({
          message: `${restaurant.name} Dijital Menüsü:\n${shareUrl}`,
        });
      }
    } catch {}
  };

  // Handle Waiter Call
  const handleCallWaiter = () => {
    const masaText = tableNumber ? `Masa ${tableNumber}` : 'Masanız';
    setWaiterModalVisible(false);
    setServiceFeedback({
      type: 'waiter',
      message: `🛎️ ${masaText} için servis personeli yönlendirildi! Personelimiz en kısa sürede masanızda olacaktır.`,
    });
    setTimeout(() => setServiceFeedback(null), 5000);
  };

  // Handle Bill Request
  const handleRequestBill = () => {
    const masaText = tableNumber ? `Masa ${tableNumber}` : 'Masanız';
    setBillModalVisible(false);
    setServiceFeedback({
      type: 'bill',
      message: `🧾 ${masaText} için "${selectedPaymentMethod}" ile hesap talebiniz kasaya iletildi.`,
    });
    setTimeout(() => setServiceFeedback(null), 5000);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return restaurant.items.filter((item) => {
      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.allergens?.some((a) => a.toLowerCase().includes(q));

      // Dietary tag match
      const matchesTag = selectedTag === 'all' || (item.tags && item.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [restaurant.items, searchQuery, selectedTag]);

  // Group items by category
  const categoriesWithItems = useMemo(() => {
    return restaurant.categories
      .map((cat) => {
        const items = filteredItems.filter((i) => i.categoryId === cat.id);
        return {
          ...cat,
          items,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [restaurant.categories, filteredItems]);

  const tagLabels: Record<MenuItemTag, { label: string; icon: string; color: string }> = {
    chef_pick: { label: 'Şefin Önerisi', icon: 'star', color: '#F59E0B' },
    popular: { label: 'Popüler', icon: 'flame', color: '#EF4444' },
    vegetarian: { label: 'Vejetaryen', icon: 'leaf', color: '#10B981' },
    vegan: { label: 'Vegan', icon: 'nutrition', color: '#059669' },
    gluten_free: { label: 'Glutensiz', icon: 'shield-checkmark', color: '#0EA5E9' },
    spicy: { label: 'Acılı', icon: 'bonfire', color: '#DC2626' },
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundGradient[0] }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Cover Photo Header */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: restaurant.coverUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View
            style={[
              styles.coverGradientOverlay,
              {
                backgroundColor: 'rgba(0,0,0,0.45)',
              },
            ]}
          />

          {/* Top Bar Floating Controls */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.topCircleBtn}
              onPress={() => router.push('/')}
              activeOpacity={0.8}
            >
              <Ionicons name="home-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.topBarRight}>
              {tableNumber && (
                <View style={[styles.tablePill, { backgroundColor: theme.primaryColor }]}>
                  <Ionicons name="restaurant-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.tablePillText}>MASA {tableNumber}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.topCircleBtn}
                onPress={shareMenu}
                activeOpacity={0.8}
              >
                <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Restaurant Profile Badge */}
          <View style={styles.profileBadgeWrap}>
            <View style={[styles.logoBorder, { borderColor: theme.accentColor }]}>
              <Image source={{ uri: restaurant.logoUrl }} style={styles.logoImage} />
            </View>
          </View>
        </View>

        {/* Restaurant Header Details */}
        <View style={styles.headerInfoSection}>
          <Text style={[styles.restaurantName, { color: theme.textColor }]}>
            {restaurant.name}
          </Text>

          <View style={styles.cuisineRow}>
            <View style={[styles.cuisineBadge, { backgroundColor: theme.pillBg }]}>
              <Text style={[styles.cuisineBadgeText, { color: theme.accentColor }]}>
                {restaurant.cuisine}
              </Text>
            </View>
            {restaurant.openingHours && (
              <View style={[styles.hoursBadge, { borderColor: theme.borderColor }]}>
                <Ionicons name="time-outline" size={13} color={theme.subtextColor} />
                <Text style={[styles.hoursBadgeText, { color: theme.subtextColor }]}>
                  {restaurant.openingHours}
                </Text>
              </View>
            )}
          </View>

          {restaurant.description ? (
            <Text style={[styles.restaurantDesc, { color: theme.subtextColor }]}>
              {restaurant.description}
            </Text>
          ) : null}

          {/* Quick Info & Action Chips */}
          <View style={styles.actionChipRow}>
            {restaurant.phone && (
              <TouchableOpacity
                style={[styles.infoChip, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
                onPress={callRestaurant}
                activeOpacity={0.8}
              >
                <Ionicons name="call-outline" size={15} color={theme.accentColor} />
                <Text style={[styles.infoChipText, { color: theme.textColor }]}>Ara / Rezervasyon</Text>
              </TouchableOpacity>
            )}

            {restaurant.address && (
              <TouchableOpacity
                style={[styles.infoChip, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
                onPress={openMaps}
                activeOpacity={0.8}
              >
                <Ionicons name="location-outline" size={15} color={theme.accentColor} />
                <Text style={[styles.infoChipText, { color: theme.textColor }]} numberOfLines={1}>
                  Yol Tarifi
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Wi-Fi Info Card */}
          {restaurant.wifiSsid ? (
            <View
              style={[
                styles.wifiCard,
                { backgroundColor: theme.cardBackground, borderColor: theme.borderColor },
              ]}
            >
              <View style={styles.wifiIconWrap}>
                <Ionicons name="wifi-outline" size={20} color={theme.accentColor} />
              </View>
              <View style={styles.wifiTextCol}>
                <Text style={[styles.wifiLabel, { color: theme.subtextColor }]}>ÜCRETSİZ MİSAFİR Wİ-Fİ</Text>
                <Text style={[styles.wifiSsid, { color: theme.textColor }]}>
                  Ağ: <Text style={{ fontWeight: '800' }}>{restaurant.wifiSsid}</Text>
                </Text>
                {restaurant.wifiPassword ? (
                  <Text style={[styles.wifiPass, { color: theme.subtextColor }]}>
                    Şifre: <Text style={{ fontWeight: '700', color: theme.accentColor }}>{restaurant.wifiPassword}</Text>
                  </Text>
                ) : null}
              </View>
              {restaurant.wifiPassword ? (
                <TouchableOpacity
                  style={[
                    styles.wifiCopyBtn,
                    { backgroundColor: wifiCopied ? '#10B981' : theme.pillBg },
                  ]}
                  onPress={copyWifiPassword}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={wifiCopied ? 'checkmark-circle' : 'copy-outline'}
                    size={16}
                    color={wifiCopied ? '#FFFFFF' : theme.accentColor}
                  />
                  <Text
                    style={[
                      styles.wifiCopyBtnText,
                      { color: wifiCopied ? '#FFFFFF' : theme.accentColor },
                    ]}
                  >
                    {wifiCopied ? 'Kopyalandı!' : 'Kopyala'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {/* Interactive Table Service Buttons */}
          {(restaurant.enableWaiterCall || restaurant.enableBillRequest) && (
            <View style={styles.serviceButtonsRow}>
              {restaurant.enableWaiterCall && (
                <TouchableOpacity
                  style={[styles.serviceBtn, { backgroundColor: '#D97706' }]}
                  onPress={() => setWaiterModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.serviceBtnText}>Garson Çağır</Text>
                </TouchableOpacity>
              )}

              {restaurant.enableBillRequest && (
                <TouchableOpacity
                  style={[styles.serviceBtn, { backgroundColor: '#059669' }]}
                  onPress={() => setBillModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.serviceBtnText}>Hesap İste</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Feedback Toast Banner */}
          {serviceFeedback && (
            <View
              style={[
                styles.feedbackBanner,
                {
                  backgroundColor:
                    serviceFeedback.type === 'waiter'
                      ? 'rgba(217, 119, 6, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',
                  borderColor:
                    serviceFeedback.type === 'waiter' ? '#D97706' : '#10B981',
                },
              ]}
            >
              <Text
                style={[
                  styles.feedbackBannerText,
                  {
                    color:
                      serviceFeedback.type === 'waiter' ? '#FCD34D' : '#6EE7B7',
                  },
                ]}
              >
                {serviceFeedback.message}
              </Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: theme.cardBackground, borderColor: theme.borderColor },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={theme.subtextColor} />
            <TextInput
              style={[styles.searchInput, { color: theme.textColor }]}
              placeholder="Yemek, içecek veya alerjen ara..."
              placeholderTextColor={theme.subtextColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.subtextColor} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Dietary Tag Filter Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagFilterRow}
        >
          <TouchableOpacity
            style={[
              styles.tagFilterPill,
              selectedTag === 'all'
                ? { backgroundColor: theme.primaryColor, borderColor: theme.primaryColor }
                : { backgroundColor: theme.cardBackground, borderColor: theme.borderColor },
            ]}
            onPress={() => setSelectedTag('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tagFilterText,
                { color: selectedTag === 'all' ? '#FFFFFF' : theme.textColor },
              ]}
            >
              Tümü ({restaurant.items.length})
            </Text>
          </TouchableOpacity>

          {(Object.keys(tagLabels) as MenuItemTag[]).map((tagKey) => {
            const meta = tagLabels[tagKey];
            const isSelected = selectedTag === tagKey;
            const count = restaurant.items.filter((i) => i.tags?.includes(tagKey)).length;
            if (count === 0) return null;

            return (
              <TouchableOpacity
                key={tagKey}
                style={[
                  styles.tagFilterPill,
                  isSelected
                    ? { backgroundColor: meta.color, borderColor: meta.color }
                    : { backgroundColor: theme.cardBackground, borderColor: theme.borderColor },
                ]}
                onPress={() => setSelectedTag(isSelected ? 'all' : tagKey)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={meta.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : meta.color}
                />
                <Text
                  style={[
                    styles.tagFilterText,
                    { color: isSelected ? '#FFFFFF' : theme.textColor },
                  ]}
                >
                  {meta.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sticky-like Category Tabs */}
        {restaurant.categories.length > 1 && !searchQuery && selectedTag === 'all' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsScroll}
          >
            {restaurant.categories.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              const itemCount = restaurant.items.filter((i) => i.categoryId === cat.id).length;

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryTab,
                    isActive && [styles.categoryTabActive, { borderColor: theme.accentColor }],
                  ]}
                  onPress={() => setActiveCategoryId(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      isActive
                        ? { color: theme.accentColor, fontWeight: '800' }
                        : { color: theme.subtextColor },
                    ]}
                  >
                    {cat.name} ({itemCount})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Menu Items List */}
        <View style={styles.menuItemsSection}>
          {categoriesWithItems.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <Ionicons name="fast-food-outline" size={48} color={theme.subtextColor} />
              <Text style={[styles.emptyStateTitle, { color: theme.textColor }]}>
                Aramanızla Eşleşen Ürün Bulunamadı
              </Text>
              <Text style={[styles.emptyStateDesc, { color: theme.subtextColor }]}>
                Farklı bir arama terimi deneyin veya filtreleri sıfırlayın.
              </Text>
              <TouchableOpacity
                style={[styles.resetFilterBtn, { backgroundColor: theme.primaryColor }]}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedTag('all');
                }}
              >
                <Text style={styles.resetFilterBtnText}>Filtreleri Temizle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            categoriesWithItems
              .filter(
                (cat) =>
                  Boolean(searchQuery) ||
                  selectedTag !== 'all' ||
                  !activeCategoryId ||
                  cat.id === activeCategoryId
              )
              .map((cat) => (
                <View key={cat.id} style={styles.categoryBlock}>
                  <View style={styles.categoryHeaderRow}>
                    <Text style={[styles.categoryTitle, { color: theme.textColor }]}>
                      {cat.name}
                    </Text>
                    <View style={[styles.categoryCountBadge, { backgroundColor: theme.pillBg }]}>
                      <Text
                        style={[styles.categoryCountText, { color: theme.accentColor }]}
                      >
                        {cat.items.length} çeşit
                      </Text>
                    </View>
                  </View>

                  {cat.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.dishCard,
                        {
                          backgroundColor: theme.cardBackground,
                          borderColor: theme.borderColor,
                        },
                      ]}
                      onPress={() => setSelectedItem(item)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.dishContentRow}>
                        <View style={styles.dishInfoCol}>
                          {/* Tags row */}
                          {item.tags && item.tags.length > 0 && (
                            <View style={styles.dishTagsRow}>
                              {item.tags.map((tag) => {
                                const tMeta = tagLabels[tag];
                                if (!tMeta) return null;
                                return (
                                  <View
                                    key={tag}
                                    style={[
                                      styles.dishTagBadge,
                                      { backgroundColor: `${tMeta.color}18` },
                                    ]}
                                  >
                                    <Ionicons
                                      name={tMeta.icon as any}
                                      size={11}
                                      color={tMeta.color}
                                    />
                                    <Text
                                      style={[styles.dishTagText, { color: tMeta.color }]}
                                    >
                                      {tMeta.label}
                                    </Text>
                                  </View>
                                );
                              })}
                            </View>
                          )}

                          <Text style={[styles.dishName, { color: theme.textColor }]}>
                            {item.name}
                          </Text>

                          {item.description ? (
                            <Text
                              style={[styles.dishDesc, { color: theme.subtextColor }]}
                              numberOfLines={2}
                            >
                              {item.description}
                            </Text>
                          ) : null}

                          {/* Allergens & Calories */}
                          <View style={styles.metaRow}>
                            {item.calories ? (
                              <View style={styles.metaPill}>
                                <Ionicons
                                  name="flame-outline"
                                  size={11}
                                  color={theme.subtextColor}
                                />
                                <Text
                                  style={[styles.metaText, { color: theme.subtextColor }]}
                                >
                                  {item.calories} kcal
                                </Text>
                              </View>
                            ) : null}

                            {item.allergens && item.allergens.length > 0 ? (
                              <View style={styles.metaPill}>
                                <Ionicons
                                  name="alert-circle-outline"
                                  size={11}
                                  color="#F59E0B"
                                />
                                <Text style={[styles.metaText, { color: '#F59E0B' }]}>
                                  {item.allergens.join(', ')}
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          {/* Price */}
                          <View style={styles.priceRow}>
                            <Text style={[styles.dishPrice, { color: theme.priceColor }]}>
                              {item.price} {restaurant.currency}
                            </Text>
                            {!item.isAvailable && (
                              <View style={styles.unavailablePill}>
                                <Text style={styles.unavailableText}>Tükendi</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Dish Photo */}
                        {item.photoUrl ? (
                          <View style={styles.dishPhotoWrap}>
                            <Image
                              source={{ uri: item.photoUrl }}
                              style={styles.dishPhoto}
                              resizeMode="cover"
                            />
                            {!item.isAvailable && (
                              <View style={styles.photoUnavailableOverlay}>
                                <Text style={styles.photoUnavailableText}>Tükendi</Text>
                              </View>
                            )}
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.poweredRow}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <View style={styles.poweredBadge}>
              <Ionicons name="qr-code-outline" size={14} color="#C5A059" />
              <Text style={styles.poweredText}>
                Powered by <Text style={{ fontWeight: '800', color: '#C5A059' }}>QR-la</Text>
              </Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.footerSubtext, { color: theme.subtextColor }]}>
            Masadan Menüye 1 Saniye • Fiyatlarımıza KDV Dahildir
          </Text>
        </View>
      </ScrollView>

      {/* Item Detail Modal */}
      <Modal
        visible={Boolean(selectedItem)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.backgroundGradient[1], borderColor: theme.borderColor },
            ]}
          >
            {selectedItem?.photoUrl ? (
              <View style={styles.modalPhotoWrap}>
                <Image
                  source={{ uri: selectedItem.photoUrl }}
                  style={styles.modalPhoto}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.modalCloseCircle}
                  onPress={() => setSelectedItem(null)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalNoPhotoHeader}>
                <TouchableOpacity
                  style={styles.modalCloseSimple}
                  onPress={() => setSelectedItem(null)}
                >
                  <Ionicons name="close" size={22} color={theme.textColor} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalBody}>
              {/* Tags */}
              {selectedItem?.tags && selectedItem.tags.length > 0 && (
                <View style={styles.dishTagsRow}>
                  {selectedItem.tags.map((tag) => {
                    const tMeta = tagLabels[tag];
                    if (!tMeta) return null;
                    return (
                      <View
                        key={tag}
                        style={[
                          styles.dishTagBadge,
                          { backgroundColor: `${tMeta.color}20` },
                        ]}
                      >
                        <Ionicons name={tMeta.icon as any} size={12} color={tMeta.color} />
                        <Text style={[styles.dishTagText, { color: tMeta.color }]}>
                          {tMeta.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <Text style={[styles.modalTitle, { color: theme.textColor }]}>
                {selectedItem?.name}
              </Text>

              <Text style={[styles.modalPrice, { color: theme.priceColor }]}>
                {selectedItem?.price} {restaurant.currency}
              </Text>

              <Text style={[styles.modalDesc, { color: theme.subtextColor }]}>
                {selectedItem?.description}
              </Text>

              {/* Nutrition & Allergens Details */}
              {(selectedItem?.calories || (selectedItem?.allergens && selectedItem.allergens.length > 0)) && (
                <View
                  style={[
                    styles.modalMetaCard,
                    { backgroundColor: theme.cardBackground, borderColor: theme.borderColor },
                  ]}
                >
                  {selectedItem.calories ? (
                    <View style={styles.modalMetaRow}>
                      <Ionicons name="flame" size={16} color="#F59E0B" />
                      <Text style={[styles.modalMetaLabel, { color: theme.subtextColor }]}>
                        Enerji Değeri:
                      </Text>
                      <Text style={[styles.modalMetaVal, { color: theme.textColor }]}>
                        {selectedItem.calories} kcal
                      </Text>
                    </View>
                  ) : null}

                  {selectedItem.allergens && selectedItem.allergens.length > 0 ? (
                    <View style={styles.modalMetaRow}>
                      <Ionicons name="alert-circle" size={16} color="#EF4444" />
                      <Text style={[styles.modalMetaLabel, { color: theme.subtextColor }]}>
                        Alerjen Uyarısı:
                      </Text>
                      <Text style={[styles.modalMetaVal, { color: '#F87171' }]}>
                        {selectedItem.allergens.join(', ')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: theme.primaryColor }]}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.modalCloseBtnText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Waiter Call Confirmation Modal */}
      <Modal
        visible={waiterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWaiterModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.serviceModalCard,
              { backgroundColor: theme.backgroundGradient[1], borderColor: theme.borderColor },
            ]}
          >
            <View style={[styles.serviceIconCircle, { backgroundColor: '#D97706' }]}>
              <Ionicons name="notifications" size={32} color="#FFFFFF" />
            </View>

            <Text style={[styles.serviceModalTitle, { color: theme.textColor }]}>
              Garson Çağır
            </Text>

            <Text style={[styles.serviceModalDesc, { color: theme.subtextColor }]}>
              {tableNumber
                ? `Masa ${tableNumber} için servis personeline anlık bildirim iletilsin mi?`
                : 'Masanız için servis personeline anlık bildirim iletilsin mi?'}
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.borderColor }]}
                onPress={() => setWaiterModalVisible(false)}
              >
                <Text style={[styles.modalCancelBtnText, { color: theme.subtextColor }]}>
                  Vazgeç
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: '#D97706' }]}
                onPress={handleCallWaiter}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.modalConfirmBtnText}>Evet, Çağır</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bill Request Modal */}
      <Modal
        visible={billModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBillModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.serviceModalCard,
              { backgroundColor: theme.backgroundGradient[1], borderColor: theme.borderColor },
            ]}
          >
            <View style={[styles.serviceIconCircle, { backgroundColor: '#059669' }]}>
              <Ionicons name="receipt" size={32} color="#FFFFFF" />
            </View>

            <Text style={[styles.serviceModalTitle, { color: theme.textColor }]}>
              Hesap İsteyin
            </Text>

            <Text style={[styles.serviceModalDesc, { color: theme.subtextColor }]}>
              Ödeme tercihinizi seçin, pos cihazı veya nakit para üstüyle birlikte masanıza gelelim.
            </Text>

            {/* Payment method selector */}
            <View style={styles.paymentMethodList}>
              {(['Kredi Kartı', 'Nakit', 'Yemek Kartı / Sodexo'] as const).map((method) => {
                const isSelected = selectedPaymentMethod === method;
                return (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentMethodItem,
                      {
                        backgroundColor: isSelected ? theme.pillBg : theme.cardBackground,
                        borderColor: isSelected ? theme.accentColor : theme.borderColor,
                      },
                    ]}
                    onPress={() => setSelectedPaymentMethod(method)}
                  >
                    <Ionicons
                      name={
                        method === 'Kredi Kartı'
                          ? 'card-outline'
                          : method === 'Nakit'
                          ? 'cash-outline'
                          : 'wallet-outline'
                      }
                      size={18}
                      color={isSelected ? theme.accentColor : theme.subtextColor}
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        {
                          color: isSelected ? theme.accentColor : theme.textColor,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {method}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={theme.accentColor}
                        style={{ marginLeft: 'auto' }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.borderColor }]}
                onPress={() => setBillModalVisible(false)}
              >
                <Text style={[styles.modalCancelBtnText, { color: theme.subtextColor }]}>
                  Vazgeç
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: '#059669' }]}
                onPress={handleRequestBill}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.modalConfirmBtnText}>Hesabı Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 60,
  },
  coverContainer: {
    position: 'relative',
    height: 240,
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  tablePillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  profileBadgeWrap: {
    position: 'absolute',
    bottom: -40,
    alignSelf: 'center',
    zIndex: 12,
  },
  logoBorder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  headerInfoSection: {
    marginTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  cuisineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cuisineBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  cuisineBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  hoursBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  restaurantDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    maxWidth: 420,
  },
  actionChipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  infoChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  wifiCard: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  wifiIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wifiTextCol: {
    flex: 1,
  },
  wifiLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  wifiSsid: {
    fontSize: 13,
  },
  wifiPass: {
    fontSize: 12,
    marginTop: 1,
  },
  wifiCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  wifiCopyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  serviceButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 440,
    marginBottom: 16,
  },
  serviceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  serviceBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  feedbackBanner: {
    width: '100%',
    maxWidth: 440,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  feedbackBannerText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 14,
    alignItems: 'center',
  },
  searchBar: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  tagFilterRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  tagFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  tagFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTabsScroll: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  categoryTab: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {},
  categoryTabText: {
    fontSize: 14,
  },
  menuItemsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  categoryBlock: {
    width: '100%',
    maxWidth: 520,
    marginBottom: 24,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  categoryCountBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dishCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dishContentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dishInfoCol: {
    flex: 1,
  },
  dishTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  dishTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
  },
  dishTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dishName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  dishDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  dishPrice: {
    fontSize: 17,
    fontWeight: '800',
  },
  unavailablePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  unavailableText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  dishPhotoWrap: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  dishPhoto: {
    width: '100%',
    height: '100%',
  },
  photoUnavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUnavailableText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyStateWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 6,
  },
  emptyStateDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetFilterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  resetFilterBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  poweredRow: {
    marginBottom: 6,
  },
  poweredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  poweredText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  footerSubtext: {
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  modalPhotoWrap: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  modalPhoto: {
    width: '100%',
    height: '100%',
  },
  modalCloseCircle: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalNoPhotoHeader: {
    padding: 16,
    alignItems: 'flex-end',
  },
  modalCloseSimple: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalMetaCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 20,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalMetaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalMetaVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalCloseBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  serviceModalCard: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  serviceIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceModalDesc: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentMethodList: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  paymentMethodText: {
    fontSize: 14,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
