import React, { useEffect, useState, useMemo } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QRCode from 'qrcode';
import { authService } from '@/services/authService';
import { menuService, cleanMenuSlug } from '@/services/menuService';
import {
  RestaurantData,
  MenuThemeId,
  MenuCategory,
  MenuItem,
  MenuItemTag,
} from '@/types';
import { MENU_THEMES } from '@/modules/menu/themes';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

const FOOD_PHOTO_SUGGESTIONS = [
  {
    label: 'Et / Antrikot',
    url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Makarna / Pasta',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Burger / Sandviç',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Deniz Mahsülü / Balık',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Tatlı / Cheesecake',
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Kokteyl / İçecek',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
  },
];

export default function RestaurantMenuManagementScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);
  const [currentUser] = useState(authService.getState().user);
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | 'new'>('lucca-bistrot');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [currency, setCurrency] = useState('₺');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [theme, setTheme] = useState<MenuThemeId>('bistro_dark');
  const [tableCount, setTableCount] = useState(20);
  const [enableWaiterCall, setEnableWaiterCall] = useState(true);
  const [enableBillRequest, setEnableBillRequest] = useState(true);

  // Categories & Items
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // New Category input
  const [newCatName, setNewCatName] = useState('');

  // Item Edit / Create Modal
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPhotoUrl, setItemPhotoUrl] = useState('');
  const [itemCalories, setItemCalories] = useState('');
  const [itemAllergens, setItemAllergens] = useState('');
  const [itemTags, setItemTags] = useState<MenuItemTag[]>([]);
  const [itemIsAvailable, setItemIsAvailable] = useState(true);

  // Table Stand Modal
  const [tableStandModalVisible, setTableStandModalVisible] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<number>(1);
  const [tableQrDataUrl, setTableQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Restoran & Kafe Menü QR Yönetimi | QR-la';
    }
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setCuisine('Dünya Mutfağı & Bar');
    setDescription('Taze yerel lezzetler ve özel sunumlar.');
    setLogoUrl(
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'
    );
    setCoverUrl(
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    );
    setCurrency('₺');
    setPhone('02120000000');
    setAddress('İstanbul, Türkiye');
    setMapUrl('');
    setWifiSsid('Misafir_WiFi');
    setWifiPassword('wifi2026');
    setOpeningHours('10:00 - 00:00');
    setTheme('bistro_dark');
    setTableCount(20);
    setEnableWaiterCall(true);
    setEnableBillRequest(true);
    setCategories([
      { id: 'cat-1', name: 'Başlangıçlar', order: 1 },
      { id: 'cat-2', name: 'Ana Yemekler', order: 2 },
      { id: 'cat-3', name: 'Tatlılar & İçecekler', order: 3 },
    ]);
    setItems([]);
  };

  const fillFormWithRestaurant = (r: RestaurantData) => {
    setName(r.name || '');
    setSlug(r.slug || '');
    setCuisine(r.cuisine || '');
    setDescription(r.description || '');
    setLogoUrl(r.logoUrl || '');
    setCoverUrl(r.coverUrl || '');
    setCurrency(r.currency || '₺');
    setPhone(r.phone || '');
    setAddress(r.address || '');
    setMapUrl(r.mapUrl || '');
    setWifiSsid(r.wifiSsid || '');
    setWifiPassword(r.wifiPassword || '');
    setOpeningHours(r.openingHours || '');
    setTheme(r.theme || 'bistro_dark');
    setTableCount(r.tableCount || 20);
    setEnableWaiterCall(r.enableWaiterCall ?? true);
    setEnableBillRequest(r.enableBillRequest ?? true);
    setCategories(r.categories || []);
    setItems(r.items || []);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await menuService.getUserRestaurants(currentUser?.uid || 'demo-host-yavuz');
      setRestaurants(list);
      if (list.length > 0) {
        fillFormWithRestaurant(list[0]);
        setSelectedRestaurantId(list[0].id);
      } else {
        resetForm();
      }
    } catch (err) {
      console.error('Error loading restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

  const handleSelectRestaurant = (id: string | 'new') => {
    setSelectedRestaurantId(id);
    if (id === 'new') {
      resetForm();
    } else {
      const found = restaurants.find((r) => r.id === id || r.slug === id);
      if (found) fillFormWithRestaurant(found);
    }
  };

  // Generate Table QR Code
  useEffect(() => {
    async function genQr() {
      if (!slug) return;
      const targetUrl = `https://qr-la.com/m/${slug}?table=${selectedTableForQr}`;
      try {
        const url = await QRCode.toDataURL(targetUrl, {
          width: 320,
          margin: 1,
          color: {
            dark: '#14161F',
            light: '#FFFFFF',
          },
        });
        setTableQrDataUrl(url);
      } catch (err) {
        console.error('QR generation error:', err);
      }
    }
    if (tableStandModalVisible) {
      genQr();
    }
  }, [slug, selectedTableForQr, tableStandModalVisible]);

  // Save Restaurant
  const handleSave = async () => {
    if (!name.trim()) {
      alert('Lütfen restoran adını giriniz.');
      return;
    }
    if (!phone.trim()) {
      alert('Lütfen bir iletişim/rezervasyon telefonu giriniz.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const activeSlug = cleanMenuSlug(slug || name);
      const isUpdating = selectedRestaurantId !== 'new';
      const existing = restaurants.find(
        (r) => r.id === selectedRestaurantId || r.slug === selectedRestaurantId
      );

      const saved = await menuService.saveRestaurant({
        id: isUpdating && existing ? existing.id : undefined,
        slug: activeSlug,
        userId: currentUser?.uid || 'demo-host-yavuz',
        name: name.trim(),
        cuisine: cuisine.trim(),
        description: description.trim(),
        logoUrl: logoUrl.trim(),
        coverUrl: coverUrl.trim(),
        currency: currency.trim() || '₺',
        phone: phone.trim(),
        address: address.trim(),
        mapUrl: mapUrl.trim(),
        wifiSsid: wifiSsid.trim(),
        wifiPassword: wifiPassword.trim(),
        openingHours: openingHours.trim(),
        theme,
        tableCount: Number(tableCount) || 20,
        enableWaiterCall,
        enableBillRequest,
        categories,
        items,
        viewCount: existing?.viewCount || 0,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Reload
      const updatedList = await menuService.getUserRestaurants(
        currentUser?.uid || 'demo-host-yavuz'
      );
      setRestaurants(updatedList);
      setSelectedRestaurantId(saved.id);
    } catch (err) {
      console.error('Error saving restaurant:', err);
      alert('Kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add Category
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: MenuCategory = {
      id: `cat-${Date.now().toString(36)}`,
      name: newCatName.trim(),
      order: categories.length + 1,
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    if (confirm('Bu kategoriyi ve içindeki ürünleri kaldırmak istediğinize emin misiniz?')) {
      setCategories(categories.filter((c) => c.id !== catId));
      setItems(items.filter((i) => i.categoryId !== catId));
    }
  };

  // Open Item Modal for new
  const handleOpenNewItem = () => {
    setEditingItemId(null);
    setItemName('');
    setItemCategoryId(categories[0]?.id || '');
    setItemPrice('');
    setItemDesc('');
    setItemPhotoUrl(FOOD_PHOTO_SUGGESTIONS[0].url);
    setItemCalories('');
    setItemAllergens('');
    setItemTags(['popular']);
    setItemIsAvailable(true);
    setItemModalVisible(true);
  };

  // Open Item Modal for edit
  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemCategoryId(item.categoryId);
    setItemPrice(String(item.price));
    setItemDesc(item.description);
    setItemPhotoUrl(item.photoUrl || '');
    setItemCalories(item.calories ? String(item.calories) : '');
    setItemAllergens(item.allergens ? item.allergens.join(', ') : '');
    setItemTags(item.tags || []);
    setItemIsAvailable(item.isAvailable);
    setItemModalVisible(true);
  };

  // Save Item
  const handleSaveItem = () => {
    if (!itemName.trim() || !itemPrice.trim()) {
      alert('Ürün adı ve fiyatı zorunludur.');
      return;
    }
    const priceNum = parseFloat(itemPrice.replace(',', '.')) || 0;
    const calNum = itemCalories ? parseInt(itemCalories, 10) : undefined;
    const allergensArr = itemAllergens
      ? itemAllergens
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      : undefined;

    if (editingItemId) {
      // Update
      setItems(
        items.map((i) =>
          i.id === editingItemId
            ? {
                ...i,
                name: itemName.trim(),
                categoryId: itemCategoryId,
                price: priceNum,
                description: itemDesc.trim(),
                photoUrl: itemPhotoUrl.trim() || undefined,
                calories: calNum,
                allergens: allergensArr,
                tags: itemTags,
                isAvailable: itemIsAvailable,
              }
            : i
        )
      );
    } else {
      // Create
      const newItem: MenuItem = {
        id: `item-${Date.now().toString(36)}`,
        categoryId: itemCategoryId || categories[0]?.id || 'cat-1',
        name: itemName.trim(),
        price: priceNum,
        description: itemDesc.trim(),
        photoUrl: itemPhotoUrl.trim() || undefined,
        calories: calNum,
        allergens: allergensArr,
        tags: itemTags,
        isAvailable: itemIsAvailable,
      };
      setItems([...items, newItem]);
    }
    setItemModalVisible(false);
  };

  // Toggle item availability directly
  const handleToggleAvailable = (itemId: string) => {
    setItems(
      items.map((i) => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i))
    );
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    if (confirm('Bu ürünü menüden silmek istediğinize emin misiniz?')) {
      setItems(items.filter((i) => i.id !== itemId));
    }
  };

  // Toggle tag in modal
  const handleToggleTag = (tag: MenuItemTag) => {
    if (itemTags.includes(tag)) {
      setItemTags(itemTags.filter((t) => t !== tag));
    } else {
      setItemTags([...itemTags, tag]);
    }
  };

  // Filtered Items for manager
  const displayedItems = useMemo(() => {
    if (selectedCategoryFilter === 'all') return items;
    return items.filter((i) => i.categoryId === selectedCategoryFilter);
  }, [items, selectedCategoryFilter]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={styles.loadingText}>Restoran verileri yükleniyor...</Text>
      </View>
    );
  }

  const activeLiveUrl = slug ? `/m/${slug}` : '/m/lucca-bistrot';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/panel' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={styles.backBtnText}>Panele Dön</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <ThemeToggleBtn size="sm" />

          <TouchableOpacity
            style={styles.tentStandBtn}
            onPress={() => setTableStandModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="print-outline" size={17} color="#D97706" />
            <Text style={styles.tentStandBtnText}>Masa Standları</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.liveViewBtn}
            onPress={() => router.push(activeLiveUrl as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={17} color="#FFFFFF" />
            <Text style={styles.liveViewBtnText}>Canlı Gör</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={17} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {saveSuccess && (
        <View style={styles.successBar}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.successBarText}>
            Restoran ve menü başarıyla güncellendi! Anında yayında.
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.titleWrap}>
          <View style={styles.titleIconBadge}>
            <Ionicons name="restaurant" size={26} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Restoran & Kafe Menü QR</Text>
            <Text style={styles.pageSubtitle}>
              Masalardan anlık karekodla taranan, fotoğraflı, çoklu kategorili ve garson çağırma özellikli dijital menünüzü yönetin.
            </Text>
          </View>
        </View>

        {/* Restaurant Selector Tabs */}
        <View style={styles.selectorRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {restaurants.map((r) => {
              const isSelected = selectedRestaurantId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.selectorPill,
                    isSelected && styles.selectorPillActive,
                  ]}
                  onPress={() => handleSelectRestaurant(r.id)}
                >
                  <Text
                    style={[
                      styles.selectorPillText,
                      isSelected && styles.selectorPillTextActive,
                    ]}
                  >
                    🍽️ {r.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[
                styles.selectorPill,
                selectedRestaurantId === 'new' && styles.selectorPillActive,
              ]}
              onPress={() => handleSelectRestaurant('new')}
            >
              <Ionicons name="add" size={16} color="#D97706" />
              <Text style={styles.selectorPillText}>Yeni Menü Ekle</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Section 1: Mekan & Temel Bilgiler */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={20} color="#D97706" />
            <Text style={styles.cardTitle}>Restoran & Mekan Bilgileri</Text>
          </View>

          <View style={styles.grid2Col}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Restoran Adı *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Örn: Lucca Bistrot & Bar"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Menü Bağlantısı (Slug) *</Text>
              <View style={styles.slugInputWrap}>
                <Text style={styles.slugPrefix}>qr-la.com/m/</Text>
                <TextInput
                  style={styles.slugInput}
                  value={slug}
                  onChangeText={(t) => setSlug(cleanMenuSlug(t))}
                  placeholder="lucca-bistrot"
                  placeholderTextColor="#6B7280"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <View style={styles.grid2Col}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mutfak Türü / Konsept</Text>
              <TextInput
                style={styles.input}
                value={cuisine}
                onChangeText={setCuisine}
                placeholder="Örn: Modern Akdeniz & Dünya Mutfağı"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Para Birimi</Text>
              <TextInput
                style={styles.input}
                value={currency}
                onChangeText={setCurrency}
                placeholder="₺"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Karşılama / Menü Açıklaması</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Misafirlerinizi karşılayan samimi bir karşılama metni..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.grid2Col}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>İletişim / Rezervasyon Telefonu *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="0212 257 12 55"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Çalışma Saatleri</Text>
              <TextInput
                style={styles.input}
                value={openingHours}
                onChangeText={setOpeningHours}
                placeholder="Her gün 10:00 - 02:00"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          <View style={styles.grid2Col}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adres</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Bebek, Beşiktaş / İstanbul"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Google Haritalar Linki (Opsiyonel)</Text>
              <TextInput
                style={styles.input}
                value={mapUrl}
                onChangeText={setMapUrl}
                placeholder="https://maps.google.com/?q=..."
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          {/* Wi-Fi Settings */}
          <View style={styles.subCard}>
            <View style={styles.subCardHeader}>
              <Ionicons name="wifi-outline" size={18} color="#D97706" />
              <Text style={styles.subCardTitle}>Misafir Wi-Fi Ayarları (Menüde 1-Tık Kopyalanır)</Text>
            </View>
            <View style={styles.grid2Col}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Wi-Fi Ağ Adı (SSID)</Text>
                <TextInput
                  style={styles.input}
                  value={wifiSsid}
                  onChangeText={setWifiSsid}
                  placeholder="Lucca_Guest"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Wi-Fi Şifresi</Text>
                <TextInput
                  style={styles.input}
                  value={wifiPassword}
                  onChangeText={setWifiPassword}
                  placeholder="lucca_bebek_2026"
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>
          </View>

          {/* Görseller */}
          <View style={styles.grid2Col}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Logo Görsel URL</Text>
              <TextInput
                style={styles.input}
                value={logoUrl}
                onChangeText={setLogoUrl}
                placeholder="https://..."
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Kapak Fotoğrafı URL</Text>
              <TextInput
                style={styles.input}
                value={coverUrl}
                onChangeText={setCoverUrl}
                placeholder="https://..."
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>
        </View>

        {/* Section 2: Tasarım Teması */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette-outline" size={20} color="#D97706" />
            <Text style={styles.cardTitle}>Menü Tasarım Teması</Text>
          </View>

          <View style={styles.themesGrid}>
            {(Object.keys(MENU_THEMES) as MenuThemeId[]).map((themeKey) => {
              const t = MENU_THEMES[themeKey];
              const isSelected = theme === themeKey;

              return (
                <TouchableOpacity
                  key={themeKey}
                  style={[
                    styles.themeCard,
                    isSelected && styles.themeCardSelected,
                    { backgroundColor: t.backgroundGradient[0] },
                  ]}
                  onPress={() => setTheme(themeKey)}
                  activeOpacity={0.8}
                >
                  <View style={styles.themeHeaderRow}>
                    <View
                      style={[styles.themeColorDot, { backgroundColor: t.primaryColor }]}
                    />
                    <Text style={styles.themeLabel}>{t.label}</Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={t.accentColor}
                        style={{ marginLeft: 'auto' }}
                      />
                    )}
                  </View>
                  <Text style={styles.themeBadge}>{t.badge}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Masa & Servis Ayarları */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="options-outline" size={20} color="#D97706" />
            <Text style={styles.cardTitle}>Masa & Servis Özellikleri</Text>
          </View>

          <View style={styles.grid3Col}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Toplam Masa Sayısı</Text>
              <TextInput
                style={styles.input}
                value={String(tableCount)}
                onChangeText={(t) => setTableCount(parseInt(t, 10) || 1)}
                keyboardType="numeric"
                placeholder="20"
                placeholderTextColor="#6B7280"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.toggleCard,
                enableWaiterCall && styles.toggleCardActive,
              ]}
              onPress={() => setEnableWaiterCall(!enableWaiterCall)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={enableWaiterCall ? '#D97706' : '#6B7280'}
              />
              <View>
                <Text style={styles.toggleCardTitle}>Garson Çağır</Text>
                <Text style={styles.toggleCardDesc}>
                  {enableWaiterCall ? 'Aktif (Misafir butonu görür)' : 'Devre Dışı'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleCard,
                enableBillRequest && styles.toggleCardActive,
              ]}
              onPress={() => setEnableBillRequest(!enableBillRequest)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="receipt-outline"
                size={22}
                color={enableBillRequest ? '#059669' : '#6B7280'}
              />
              <View>
                <Text style={styles.toggleCardTitle}>Hesap İste</Text>
                <Text style={styles.toggleCardDesc}>
                  {enableBillRequest ? 'Aktif (Pos/Nakit seçimi)' : 'Devre Dışı'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 4: Menü Kategorileri */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list-outline" size={20} color="#D97706" />
            <Text style={styles.cardTitle}>Menü Kategorileri ({categories.length})</Text>
          </View>

          <View style={styles.categoryChipsList}>
            {categories.map((cat, idx) => (
              <View key={cat.id} style={styles.catChipRow}>
                <Text style={styles.catOrderNum}>{idx + 1}.</Text>
                <Text style={styles.catChipTitle}>{cat.name}</Text>
                <TouchableOpacity
                  style={styles.catDeleteBtn}
                  onPress={() => handleDeleteCategory(cat.id)}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addCategoryRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="Yeni kategori adı (örn: İtalyan Pizzalar)..."
              placeholderTextColor="#6B7280"
            />
            <TouchableOpacity
              style={styles.addCategoryBtn}
              onPress={handleAddCategory}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addCategoryBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 5: Yemekler & İçecekler Yönetimi */}
        <View style={styles.card}>
          <View style={styles.cardHeaderBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="fast-food-outline" size={20} color="#D97706" />
              <Text style={styles.cardTitle}>Yemekler & İçecekler ({items.length})</Text>
            </View>

            <TouchableOpacity
              style={styles.addNewItemBtn}
              onPress={handleOpenNewItem}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.addNewItemBtnText}>Yeni Ürün Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsRow}
          >
            <TouchableOpacity
              style={[
                styles.filterPill,
                selectedCategoryFilter === 'all' && styles.filterPillActive,
              ]}
              onPress={() => setSelectedCategoryFilter('all')}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedCategoryFilter === 'all' && styles.filterPillTextActive,
                ]}
              >
                Tümü ({items.length})
              </Text>
            </TouchableOpacity>

            {categories.map((c) => {
              const count = items.filter((i) => i.categoryId === c.id).length;
              const isSel = selectedCategoryFilter === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.filterPill, isSel && styles.filterPillActive]}
                  onPress={() => setSelectedCategoryFilter(c.id)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isSel && styles.filterPillTextActive,
                    ]}
                  >
                    {c.name} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Dish items table / list */}
          <View style={styles.itemsListContainer}>
            {displayedItems.length === 0 ? (
              <View style={styles.emptyItemsWrap}>
                <Ionicons name="nutrition-outline" size={40} color="#6B7280" />
                <Text style={styles.emptyItemsText}>Bu kategoride henüz ürün eklenmedi.</Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={handleOpenNewItem}
                >
                  <Text style={styles.emptyAddBtnText}>Hemen İlk Ürünü Ekle</Text>
                </TouchableOpacity>
              </View>
            ) : (
              displayedItems.map((item) => {
                const categoryObj = categories.find((c) => c.id === item.categoryId);

                return (
                  <View key={item.id} style={styles.itemRowCard}>
                    {item.photoUrl ? (
                      <Image source={{ uri: item.photoUrl }} style={styles.itemRowThumb} />
                    ) : (
                      <View style={styles.itemRowThumbPlaceholder}>
                        <Ionicons name="restaurant-outline" size={20} color="#9CA3AF" />
                      </View>
                    )}

                    <View style={styles.itemRowDetails}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.itemRowName}>{item.name}</Text>
                        <Text style={styles.itemRowCategoryBadge}>
                          {categoryObj?.name || 'Kategori Yok'}
                        </Text>
                      </View>

                      <Text style={styles.itemRowDesc} numberOfLines={1}>
                        {item.description || 'Açıklama girilmedi.'}
                      </Text>

                      <View style={styles.itemRowMetaRow}>
                        <Text style={styles.itemRowPrice}>
                          {item.price} {currency}
                        </Text>
                        {item.calories ? (
                          <Text style={styles.itemRowCal}>{item.calories} kcal</Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.itemRowActions}>
                      <TouchableOpacity
                        style={[
                          styles.availabilityBtn,
                          item.isAvailable
                            ? { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }
                            : { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' },
                        ]}
                        onPress={() => handleToggleAvailable(item.id)}
                      >
                        <Text
                          style={[
                            styles.availabilityBtnText,
                            { color: item.isAvailable ? '#10B981' : '#EF4444' },
                          ]}
                        >
                          {item.isAvailable ? 'Mevcut' : 'Tükendi'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleOpenEditItem(item)}
                      >
                        <Ionicons name="pencil" size={15} color="#D97706" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteItem(item.id)}
                      >
                        <Ionicons name="trash-outline" size={15} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Item Create / Edit Modal */}
      <Modal
        visible={itemModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.itemModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>
                {editingItemId ? 'Ürünü Düzenle' : 'Yeni Menü Ürünü Ekle'}
              </Text>
              <TouchableOpacity onPress={() => setItemModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ürün Adı *</Text>
                <TextInput
                  style={styles.input}
                  value={itemName}
                  onChangeText={setItemName}
                  placeholder="Örn: Trüflü Dana Carpaccio"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.grid2Col}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Kategori</Text>
                  <View style={styles.catSelectWrap}>
                    {categories.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.catSelectPill,
                          itemCategoryId === c.id && styles.catSelectPillActive,
                        ]}
                        onPress={() => setItemCategoryId(c.id)}
                      >
                        <Text
                          style={[
                            styles.catSelectPillText,
                            itemCategoryId === c.id && styles.catSelectPillTextActive,
                          ]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Fiyat ({currency}) *</Text>
                  <TextInput
                    style={styles.input}
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    placeholder="540"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ürün Açıklaması & İçindekiler</Text>
                <TextInput
                  style={[styles.input, { height: 70 }]}
                  value={itemDesc}
                  onChangeText={setItemDesc}
                  placeholder="İnce dilimlenmiş bonfile, roka, parmesan pulları ve trüf yağı..."
                  placeholderTextColor="#6B7280"
                  multiline
                />
              </View>

              <View style={styles.grid2Col}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Kalori (kcal)</Text>
                  <TextInput
                    style={styles.input}
                    value={itemCalories}
                    onChangeText={setItemCalories}
                    placeholder="420"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Alerjenler (Virgülle Ayırın)</Text>
                  <TextInput
                    style={styles.input}
                    value={itemAllergens}
                    onChangeText={setItemAllergens}
                    placeholder="Laktoz, Glüten, Kabuklu"
                    placeholderTextColor="#6B7280"
                  />
                </View>
              </View>

              {/* Tag selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Etiketler & Özellikler</Text>
                <View style={styles.tagsToggleRow}>
                  {(
                    [
                      { key: 'chef_pick', label: '⭐️ Şefin Önerisi' },
                      { key: 'popular', label: '🔥 Popüler' },
                      { key: 'vegetarian', label: '🌱 Vejetaryen' },
                      { key: 'vegan', label: '🥬 Vegan' },
                      { key: 'gluten_free', label: '🌾 Glutensiz' },
                      { key: 'spicy', label: '🌶️ Acılı' },
                    ] as const
                  ).map((t) => {
                    const isSel = itemTags.includes(t.key);
                    return (
                      <TouchableOpacity
                        key={t.key}
                        style={[
                          styles.tagTogglePill,
                          isSel && styles.tagTogglePillActive,
                        ]}
                        onPress={() => handleToggleTag(t.key)}
                      >
                        <Text
                          style={[
                            styles.tagTogglePillText,
                            isSel && styles.tagTogglePillTextActive,
                          ]}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Photo URL */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Fotoğraf URL</Text>
                <TextInput
                  style={styles.input}
                  value={itemPhotoUrl}
                  onChangeText={setItemPhotoUrl}
                  placeholder="https://..."
                  placeholderTextColor="#6B7280"
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  {FOOD_PHOTO_SUGGESTIONS.map((s, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.photoSuggestionPill}
                      onPress={() => setItemPhotoUrl(s.url)}
                    >
                      <Text style={styles.photoSuggestionPillText}>📸 {s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Availability */}
              <TouchableOpacity
                style={[
                  styles.modalAvailToggle,
                  itemIsAvailable && styles.modalAvailToggleActive,
                ]}
                onPress={() => setItemIsAvailable(!itemIsAvailable)}
              >
                <Ionicons
                  name={itemIsAvailable ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={itemIsAvailable ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.modalAvailToggleText}>
                  {itemIsAvailable ? 'Ürün Satışta (Sipariş Edilebilir)' : 'Tükendi (Menüde Tükendi Olarak Göster)'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setItemModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveItem}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.modalSaveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Table Tent Stand Mockup & Printer Modal */}
      <Modal
        visible={tableStandModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTableStandModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.standModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="print" size={22} color="#D97706" />
                <Text style={styles.modalHeaderTitle}>Masa QR Standı Şablonu</Text>
              </View>
              <TouchableOpacity onPress={() => setTableStandModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.standModalSubtitle}>
              Masalarınıza yerleştirebileceğiniz ahşap / akrilik çift taraflı masa kartı baskı tasarımı.
            </Text>

            {/* Table Number Selector */}
            <View style={styles.tableSelectorWrap}>
              <Text style={styles.tableSelectorLabel}>Görüntülenen Masa:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.from({ length: tableCount || 20 }, (_, i) => i + 1).map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.tableNumPill,
                      selectedTableForQr === num && styles.tableNumPillActive,
                    ]}
                    onPress={() => setSelectedTableForQr(num)}
                  >
                    <Text
                      style={[
                        styles.tableNumPillText,
                        selectedTableForQr === num && styles.tableNumPillTextActive,
                      ]}
                    >
                      Masa {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Printable Mockup Stand */}
            <View style={styles.standMockupFrame}>
              <View style={styles.standInnerCard}>
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.standLogo}
                  resizeMode="cover"
                />

                <Text style={styles.standRestName}>{name || 'Restoran'}</Text>
                <Text style={styles.standCuisine}>{cuisine || 'Dijital Menü'}</Text>

                {/* Table badge */}
                <View style={styles.standTableBadge}>
                  <Text style={styles.standTableBadgeText}>
                    MASA {selectedTableForQr < 10 ? `0${selectedTableForQr}` : selectedTableForQr}
                  </Text>
                </View>

                {/* QR Code */}
                {tableQrDataUrl ? (
                  <View style={styles.standQrContainer}>
                    <Image source={{ uri: tableQrDataUrl }} style={styles.standQrImage} />
                  </View>
                ) : (
                  <ActivityIndicator size="small" color="#D97706" />
                )}

                <Text style={styles.standQrCaption}>
                  Menüyü İncelemek İçin Kameranızla Okutunuz
                </Text>

                {/* Wi-Fi footer */}
                {wifiSsid ? (
                  <View style={styles.standWifiBar}>
                    <Ionicons name="wifi" size={12} color="#D97706" />
                    <Text style={styles.standWifiText}>
                      Wi-Fi: <Text style={{ fontWeight: '700' }}>{wifiSsid}</Text>
                      {wifiPassword ? ` • Şifre: ${wifiPassword}` : ''}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Print button */}
            <View style={styles.standActionRow}>
              <TouchableOpacity
                style={styles.standPrintBtn}
                onPress={() => {
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.print();
                  } else {
                    alert('Yazdırma işlemi için web tarayıcısından bağlanabilirsiniz.');
                  }
                }}
              >
                <Ionicons name="print" size={18} color="#FFFFFF" />
                <Text style={styles.standPrintBtnText}>Şablonu Yazdır (A5 / Masa Standı)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean, colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.bg,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      color: '#D97706',
      fontSize: 14,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
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
    tentStandBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(217, 119, 6, 0.4)' : '#FDE68A',
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.1)' : '#FFFBEB',
    },
    tentStandBtnText: {
      color: '#D97706',
      fontWeight: '700',
      fontSize: 13,
    },
    liveViewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: isDark ? '#1E2230' : '#F3EFE6',
    },
    liveViewBtnText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 13,
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: '#D97706',
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
    },
    successBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
    },
    successBarText: {
      color: '#059669',
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
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#FEF3C7',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 4,
    },
    pageSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    selectorRow: {
      marginBottom: 20,
    },
    selectorPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: isDark ? '#141622' : colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
    },
    selectorPillActive: {
      borderColor: '#D97706',
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.12)' : '#FEF3C7',
    },
    selectorPillText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    selectorPillTextActive: {
      color: '#B45309',
      fontWeight: '700',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      marginBottom: 20,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 18,
    },
    cardHeaderBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    grid2Col: {
      flexDirection: 'row',
      gap: 14,
      flexWrap: 'wrap',
    },
    grid3Col: {
      flexDirection: 'row',
      gap: 14,
      flexWrap: 'wrap',
    },
    formGroup: {
      flex: 1,
      minWidth: 260,
      marginBottom: 14,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
    },
    textArea: {
      height: 75,
      textAlignVertical: 'top',
    },
    slugInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
    },
    slugPrefix: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    slugInput: {
      flex: 1,
      color: '#D97706',
      fontSize: 13,
      fontWeight: '700',
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    subCard: {
      backgroundColor: isDark ? '#1B1E2E' : '#FFFBEB',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(217, 119, 6, 0.25)' : '#FDE68A',
      padding: 14,
      marginBottom: 14,
    },
    subCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    subCardTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#D97706',
    },
    themesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    themeCard: {
      flex: 1,
      minWidth: 180,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      backgroundColor: isDark ? 'transparent' : '#FAF7F2',
    },
    themeCardSelected: {
      borderColor: '#D97706',
      borderWidth: 2,
    },
    themeHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    themeColorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    themeLabel: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 13,
    },
    themeBadge: {
      color: colors.textMuted,
      fontSize: 11,
    },
    toggleCard: {
      flex: 1,
      minWidth: 180,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleCardActive: {
      borderColor: 'rgba(217, 119, 6, 0.4)',
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.08)' : '#FEF3C7',
    },
    toggleCardTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 13,
    },
    toggleCardDesc: {
      color: colors.textMuted,
      fontSize: 11,
    },
    categoryChipsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 14,
    },
    catChipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
    },
    catOrderNum: {
      color: '#D97706',
      fontWeight: '800',
      fontSize: 12,
    },
    catChipTitle: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 13,
    },
    catDeleteBtn: {
      padding: 2,
    },
    addCategoryRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    addCategoryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#D97706',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
    },
    addCategoryBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
    },
    addNewItemBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#D97706',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    addNewItemBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
    },
    filterPillsRow: {
      gap: 8,
      paddingBottom: 14,
    },
    filterPill: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterPillActive: {
      borderColor: '#D97706',
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#FEF3C7',
    },
    filterPillText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    filterPillTextActive: {
      color: '#B45309',
      fontWeight: '700',
    },
    itemsListContainer: {
      gap: 10,
    },
    emptyItemsWrap: {
      alignItems: 'center',
      paddingVertical: 32,
      gap: 8,
    },
    emptyItemsText: {
      color: colors.textMuted,
      fontSize: 13,
    },
    emptyAddBtn: {
      marginTop: 6,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: '#D97706',
    },
    emptyAddBtnText: {
      color: '#D97706',
      fontSize: 12,
      fontWeight: '700',
    },
    itemRowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1B1E2E' : '#FFFFFF',
      borderRadius: 14,
      padding: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemRowThumb: {
      width: 54,
      height: 54,
      borderRadius: 10,
    },
    itemRowThumbPlaceholder: {
      width: 54,
      height: 54,
      borderRadius: 10,
      backgroundColor: isDark ? '#272B40' : '#E5E7EB',
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemRowDetails: {
      flex: 1,
    },
    itemRowName: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
    },
    itemRowCategoryBadge: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 6,
      color: colors.textMuted,
      fontSize: 10,
    },
    itemRowDesc: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
      marginBottom: 4,
    },
    itemRowMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    itemRowPrice: {
      color: '#D97706',
      fontWeight: '800',
      fontSize: 13,
    },
    itemRowCal: {
      color: colors.textMuted,
      fontSize: 11,
    },
    itemRowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    availabilityBtn: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    availabilityBtnText: {
      fontSize: 11,
      fontWeight: '700',
    },
    editBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#FEF3C7',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    itemModalCard: {
      width: '100%',
      maxWidth: 540,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
    },
    modalHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    modalHeaderTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    catSelectWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    catSelectPill: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
    },
    catSelectPillActive: {
      borderColor: '#D97706',
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7',
    },
    catSelectPillText: {
      color: colors.textMuted,
      fontSize: 12,
    },
    catSelectPillTextActive: {
      color: '#B45309',
      fontWeight: '700',
    },
    tagsToggleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagTogglePill: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
    },
    tagTogglePillActive: {
      borderColor: '#D97706',
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7',
    },
    tagTogglePillText: {
      color: colors.textMuted,
      fontSize: 12,
    },
    tagTogglePillTextActive: {
      color: '#B45309',
      fontWeight: '700',
    },
    photoSuggestionPill: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      marginRight: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    photoSuggestionPillText: {
      color: colors.textMuted,
      fontSize: 11,
    },
    modalAvailToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
      marginBottom: 14,
    },
    modalAvailToggleActive: {
      borderColor: '#10B981',
    },
    modalAvailToggleText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
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
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
    modalSaveBtn: {
      flex: 1.5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#D97706',
      paddingVertical: 12,
      borderRadius: 12,
    },
    modalSaveBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
    standModalCard: {
      width: '100%',
      maxWidth: 520,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
    },
    standModalSubtitle: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: 14,
    },
    tableSelectorWrap: {
      marginBottom: 16,
    },
    tableSelectorLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 6,
    },
    tableNumPill: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    tableNumPillActive: {
      borderColor: '#D97706',
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7',
    },
    tableNumPillText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    tableNumPillTextActive: {
      color: '#B45309',
      fontWeight: '800',
    },
    standMockupFrame: {
      backgroundColor: isDark ? '#0A0B0E' : '#FAF7F2',
      borderRadius: 20,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(217, 119, 6, 0.5)' : '#FDE68A',
      padding: 16,
      alignItems: 'center',
    },
    standInnerCard: {
      width: '100%',
      maxWidth: 280,
      backgroundColor: isDark ? '#141620' : '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#EFE7DA',
      padding: 20,
      alignItems: 'center',
    },
    standLogo: {
      width: 54,
      height: 54,
      borderRadius: 27,
      borderWidth: 2,
      borderColor: '#D97706',
      marginBottom: 8,
    },
    standRestName: {
      color: colors.text,
      fontWeight: '900',
      fontSize: 17,
      textAlign: 'center',
      marginBottom: 2,
    },
    standCuisine: {
      color: colors.textMuted,
      fontSize: 11,
      textAlign: 'center',
      marginBottom: 10,
    },
    standTableBadge: {
      backgroundColor: '#D97706',
      paddingVertical: 5,
      paddingHorizontal: 14,
      borderRadius: 20,
      marginBottom: 12,
    },
    standTableBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
    },
    standQrContainer: {
      width: 160,
      height: 160,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    standQrImage: {
      width: '100%',
      height: '100%',
    },
    standQrCaption: {
      color: '#D97706',
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0.4,
      marginBottom: 8,
    },
    standWifiBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 8,
    },
    standWifiText: {
      color: colors.text,
      fontSize: 10,
    },
    standActionRow: {
      marginTop: 18,
    },
    standPrintBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#D97706',
      paddingVertical: 14,
      borderRadius: 14,
      width: '100%',
    },
    standPrintBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });
