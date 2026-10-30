import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QRCode from 'qrcode';
import { authService } from '@/services/authService';
import { petService, cleanPetSlug } from '@/services/petService';
import { PetData, PetSpecies, PetGender } from '@/types';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

const SPECIES_OPTIONS: { id: PetSpecies; label: string; icon: string }[] = [
  { id: 'dog', label: 'Köpek', icon: 'paw' },
  { id: 'cat', label: 'Kedi', icon: 'logo-octocat' },
  { id: 'bird', label: 'Kuş', icon: 'airplane' },
  { id: 'other', label: 'Diğer', icon: 'heart' },
];

const PRESET_PHOTO_SUGGESTIONS = [
  {
    label: 'Golden / Sarı Köpek',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'British Kedi',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Çoban / Kurt',
    url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Tekir Kedi',
    url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
  },
];

export default function PetManagementScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);
  const [currentUser] = useState(authService.getState().user);
  const [userPets, setUserPets] = useState<PetData[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | 'new'>('new');
  const [_isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<PetGender>('male');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [vetClinicName, setVetClinicName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [vetAddress, setVetAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [personalityInput, setPersonalityInput] = useState('');
  const [personalityList, setPersonalityList] = useState<string[]>([]);
  const [allergiesInput, setAllergiesInput] = useState('');
  const [allergiesList, setAllergiesList] = useState<string[]>([]);

  // 🚨 Lost Alert Form States
  const [isLost, setIsLost] = useState(false);
  const [lostLocation, setLostLocation] = useState('');
  const [lostDate, setLostDate] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [lostNotes, setLostNotes] = useState('');

  // Collar QR Modal States
  const [collarModalVisible, setCollarModalVisible] = useState(false);
  const [collarQrDataUrl, setCollarQrDataUrl] = useState('');

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Pati Künyesi (Petguru) Yönetimi | QR-la';
    }
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setSpecies('dog');
    setBreed('');
    setGender('male');
    setAge('');
    setColor('');
    setPhotoUrl(PRESET_PHOTO_SUGGESTIONS[0].url);
    setMicrochipNumber('');
    setOwnerName(currentUser?.displayName || 'Ayşe Yılmaz');
    setOwnerPhone('05321234567');
    setOwnerWhatsapp('905321234567');
    setOwnerAddress('Moda, Kadıköy / İstanbul');
    setVetClinicName('');
    setVetPhone('');
    setVetAddress('');
    setSpecialNotes('');
    setPersonalityList(['İnsan Canlısı', 'Oyunbaz']);
    setAllergiesList([]);
    setIsLost(false);
    setLostLocation('');
    setLostDate('');
    setRewardAmount('');
    setLostNotes('');
  };

  const fillFormWithPet = (pet: PetData) => {
    setName(pet.name || '');
    setSlug(pet.slug || '');
    setSpecies(pet.species || 'dog');
    setBreed(pet.breed || '');
    setGender(pet.gender || 'male');
    setAge(pet.age || '');
    setColor(pet.color || '');
    setPhotoUrl(pet.photoUrl || '');
    setMicrochipNumber(pet.microchipNumber || '');
    setOwnerName(pet.ownerName || '');
    setOwnerPhone(pet.ownerPhone || '');
    setOwnerWhatsapp(pet.ownerWhatsapp || '');
    setOwnerAddress(pet.ownerAddress || '');
    setVetClinicName(pet.vetClinicName || '');
    setVetPhone(pet.vetPhone || '');
    setVetAddress(pet.vetAddress || '');
    setSpecialNotes(pet.specialNotes || '');
    setPersonalityList(pet.personality || []);
    setAllergiesList(pet.allergies || []);
    setIsLost(pet.lostInfo?.isLost || false);
    setLostLocation(pet.lostInfo?.lostLocation || '');
    setLostDate(pet.lostInfo?.lostDate || '');
    setRewardAmount(pet.lostInfo?.rewardAmount || '');
    setLostNotes(pet.lostInfo?.notes || '');
  };

  const loadPets = async () => {
    setIsLoading(true);
    try {
      const uid = currentUser?.uid || 'demo-host-ayse';
      const pets = await petService.getUserPets(uid);
      setUserPets(pets);
      if (pets.length > 0 && selectedPetId === 'new') {
        fillFormWithPet(pets[0]);
        setSelectedPetId(pets[0].id);
      }
    } catch (err) {
      console.error('Failed to load pets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [currentUser]);

  const handleSelectPet = (pet: PetData) => {
    setSelectedPetId(pet.id);
    fillFormWithPet(pet);
  };

  const handleAddNewPet = () => {
    setSelectedPetId('new');
    resetForm();
  };

  const handleAddPersonality = () => {
    if (personalityInput.trim() && !personalityList.includes(personalityInput.trim())) {
      setPersonalityList([...personalityList, personalityInput.trim()]);
      setPersonalityInput('');
    }
  };

  const handleRemovePersonality = (trait: string) => {
    setPersonalityList(personalityList.filter(t => t !== trait));
  };

  const handleAddAllergy = () => {
    if (allergiesInput.trim() && !allergiesList.includes(allergiesInput.trim())) {
      setAllergiesList([...allergiesList, allergiesInput.trim()]);
      setAllergiesInput('');
    }
  };

  const handleRemoveAllergy = (item: string) => {
    setAllergiesList(allergiesList.filter(a => a !== item));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Lütfen evcil hayvanınızın adını girin.');
      return;
    }
    if (!ownerPhone.trim()) {
      alert('Lütfen acil durumda aranacak sahip telefonunu girin.');
      return;
    }

    setIsSaving(true);
    try {
      const effectiveSlug = cleanPetSlug(slug || name);
      const petPayload: Partial<PetData> & { name: string; ownerPhone: string; slug: string } = {
        id: selectedPetId === 'new' ? undefined : selectedPetId,
        slug: effectiveSlug,
        userId: currentUser?.uid || 'demo-host-ayse',
        name: name.trim(),
        species,
        breed: breed.trim() || 'Melez',
        gender,
        age: age.trim() || '1 Yaşında',
        color: color.trim(),
        photoUrl: photoUrl.trim() || PRESET_PHOTO_SUGGESTIONS[0].url,
        microchipNumber: microchipNumber.trim(),
        ownerName: ownerName.trim() || 'Evcil Hayvan Sahibi',
        ownerPhone: ownerPhone.trim(),
        ownerWhatsapp: ownerWhatsapp.trim() || ownerPhone.replace(/\D/g, ''),
        ownerAddress: ownerAddress.trim(),
        vetClinicName: vetClinicName.trim(),
        vetPhone: vetPhone.trim(),
        vetAddress: vetAddress.trim(),
        specialNotes: specialNotes.trim(),
        personality: personalityList,
        allergies: allergiesList,
        lostInfo: {
          isLost,
          lostLocation: isLost ? lostLocation.trim() : undefined,
          lostDate: isLost ? lostDate.trim() || new Date().toLocaleDateString('tr-TR') : undefined,
          rewardAmount: isLost ? rewardAmount.trim() : undefined,
          notes: isLost ? lostNotes.trim() : undefined,
          emergencyPhone: isLost ? ownerPhone.trim() : undefined,
        },
      };

      const saved = await petService.savePet(petPayload);
      alert(`🎉 "${saved.name}" isimli pati künyesi başarıyla kaydedildi!`);

      await loadPets();
      setSelectedPetId(saved.id);
    } catch (err: any) {
      alert(`Kayıt sırasında bir hata oluştu: ${err?.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLostQuick = async (pet: PetData) => {
    const nextStatus = !pet.lostInfo?.isLost;
    const confirmMsg = nextStatus
      ? `🚨 "${pet.name}" için Acil Kayıp Alarmı açılsın mı? Künye tarandığında ekran acil durum kırmızı alarmına bürünecektir.`
      : `"${pet.name}" bulundu mu? Kayıp alarmı kapatılacak.`;

    if (Platform.OS === 'web') {
      if (!window.confirm(confirmMsg)) return;
    }

    try {
      await petService.toggleLostStatus(pet.id, nextStatus, {
        lostLocation: pet.ownerAddress || 'Kadıköy',
        lostDate: 'Bugün',
        rewardAmount: '5.000 ₺ Ödül',
        notes: 'Lütfen görenlerin hemen aramasını veya WhatsApp ile konum atmasını rica ederiz.',
      });
      await loadPets();
    } catch {}
  };

  const openCollarQrModal = async (pet: PetData) => {
    try {
      const url = `https://qr-la.com/p/${pet.slug}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#03120B',
          light: '#FFFFFF',
        },
      });
      setCollarQrDataUrl(dataUrl);
      setCollarModalVisible(true);
    } catch (err) {
      console.error('Failed to generate collar QR:', err);
    }
  };

  const printCollarModal = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    }
  };

  const currentPetObj = userPets.find(p => p.id === selectedPetId);

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
            <Ionicons name="arrow-back" size={20} color="#10B981" />
            <Text style={styles.backBtnText}>Panela Dön</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ThemeToggleBtn size="sm" />
            <View style={styles.headerBadge}>
              <Ionicons name="paw" size={14} color="#10B981" />
              <Text style={styles.headerBadgeText}>Petguru x QR-la</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pageTitle}>🐾 Akıllı Tasma Künyesi & Kayıp Takibi</Text>
                <Text style={styles.pageSubtitle}>
          Paslanmaz çelik metal künyeler için ultra-kısa link formatı, tek dokunuşla kayıp alarmı ve GPS konum bildirme sistemi.
        </Text>

        {/* Petguru Master Database Banner */}
        <View style={styles.petguruSyncBanner}>
          <View style={styles.petguruSyncIconWrap}>
            <Ionicons name="cloud-done-outline" size={24} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.petguruSyncTitle}>⚡ Petguru Canlı Veritabanı ile Senkronize</Text>
            <Text style={styles.petguruSyncDesc}>
              Evcil can dostunuzun aşı, çip ve sahip bilgileri doğrudan Petguru ekosisteminde saklanır. QR-la, bu künyeler için ultra hızlı QR yönlendirme ve canlı GPS alarm ağ geçididir.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.petguruAppBtn}
            onPress={() => {
              const url = 'https://petguru.app/evcil-hayvanlarim';
              if (Platform.OS === 'web') window.open(url, '_blank');
              else Linking.openURL(url);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.petguruAppBtnText}>Petguru'da Yönet ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Existing Pets Horizontal Cards */}
        <View style={styles.petListSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petListScroll}>
            {userPets.map(p => {
              const isSelected = p.id === selectedPetId;
              const isPetiLost = p.lostInfo?.isLost;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.petCardItem,
                    isSelected && styles.petCardItemSelected,
                    isPetiLost && styles.petCardItemLost,
                  ]}
                  onPress={() => handleSelectPet(p)}
                  activeOpacity={0.85}
                >
                  <View style={styles.petCardThumbWrapper}>
                    <Image source={{ uri: p.photoUrl }} style={styles.petCardThumb} />
                    {isPetiLost && (
                      <View style={styles.lostIndicatorDot}>
                        <Ionicons name="alert" size={10} color="#FFF" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.petCardName}>{p.name}</Text>
                  <Text style={styles.petCardBreed}>{p.breed}</Text>
                  <View style={styles.petCardTagCode}>
                    <Text style={styles.petCardTagText}>/p/{p.slug}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Add New Pet Button */}
            <TouchableOpacity
              style={[
                styles.addNewPetBtn,
                selectedPetId === 'new' && styles.addNewPetBtnActive,
              ]}
              onPress={handleAddNewPet}
              activeOpacity={0.85}
            >
              <View style={styles.addNewPetIconCircle}>
                <Ionicons name="add" size={24} color="#10B981" />
              </View>
              <Text style={styles.addNewPetText}>Yeni Pati Ekle</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Selected Pet Quick Action Bar (if an existing pet is selected) */}
        {currentPetObj && (
          <View style={styles.quickBar}>
            <View style={styles.quickBarInfo}>
              <Text style={styles.quickBarName}>
                {currentPetObj.name} • {currentPetObj.breed}
              </Text>
              <Text style={styles.quickBarScans}>
                👁️ {currentPetObj.viewCount || 0} Tarama • 📍 {currentPetObj.scanLogs?.length || 0} GPS Logu
              </Text>
            </View>

            <View style={styles.quickBarActions}>
              <TouchableOpacity
                style={[
                  styles.quickLostToggle,
                  currentPetObj.lostInfo?.isLost ? styles.quickLostToggleActive : {},
                ]}
                onPress={() => handleToggleLostQuick(currentPetObj)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={currentPetObj.lostInfo?.isLost ? 'warning' : 'shield-checkmark'}
                  size={16}
                  color="#FFF"
                />
                <Text style={styles.quickLostToggleText}>
                  {currentPetObj.lostInfo?.isLost ? '🚨 Alarm Açık' : 'Kayıp Alarmı'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickLiveBtn}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.open(`/p/${currentPetObj.slug}`, '_blank');
                  } else {
                    router.push(`/p/${currentPetObj.slug}` as any);
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={16} color="#10B981" />
                <Text style={styles.quickLiveBtnText}>Canlı Gör</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCollarBtn}
                onPress={() => openCollarQrModal(currentPetObj)}
                activeOpacity={0.8}
              >
                <Ionicons name="qr-code-outline" size={16} color="#03120B" />
                <Text style={styles.quickCollarBtnText}>Künye QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MAIN PET FORM CARD */}
        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>
            {selectedPetId === 'new' ? '🐾 Yeni Evcil Hayvan Bilgileri' : `✏️ ${name} Bilgilerini Düzenle`}
          </Text>

          {/* 1. Basic Info */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dostumuzun Adı *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Örn: Duman, Pamuk, Ares, Luna"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Tür</Text>
              <View style={styles.speciesRow}>
                {SPECIES_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.speciesPill,
                      species === opt.id && styles.speciesPillActive,
                    ]}
                    onPress={() => setSpecies(opt.id)}
                  >
                    <Text
                      style={[
                        styles.speciesPillText,
                        species === opt.id && styles.speciesPillTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Cinsiyet</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.genderPill, gender === 'male' && styles.genderPillActive]}
                  onPress={() => setGender('male')}
                >
                  <Ionicons name="male" size={14} color={gender === 'male' ? '#FFF' : '#9CA3AF'} />
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                    Erkek
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderPill, gender === 'female' && styles.genderPillActive]}
                  onPress={() => setGender('female')}
                >
                  <Ionicons name="female" size={14} color={gender === 'female' ? '#FFF' : '#9CA3AF'} />
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                    Dişi
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Irk / Cinsi</Text>
              <TextInput
                style={styles.textInput}
                value={breed}
                onChangeText={setBreed}
                placeholder="Örn: Golden Retriever, British Shorthair"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Yaşı</Text>
              <TextInput
                style={styles.textInput}
                value={age}
                onChangeText={setAge}
                placeholder="Örn: 2 Yaşında, 8 Aylık"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Renk / Ayırt Edici İşaret</Text>
              <TextInput
                style={styles.textInput}
                value={color}
                onChangeText={setColor}
                placeholder="Örn: Bal Köpüğü, Beyaz Patili"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Özel Kısa URL (Slug)</Text>
              <TextInput
                style={styles.textInput}
                value={slug}
                onChangeText={setSlug}
                placeholder="Örn: duman, k9x2 (qr-la.com/p/duman)"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Microchip */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mikroçip Kimlik Numarası (Varsa)</Text>
            <TextInput
              style={styles.textInput}
              value={microchipNumber}
              onChangeText={setMicrochipNumber}
              placeholder="Örn: 990000018492019"
              placeholderTextColor="#6B7280"
            />
          </View>

          {/* Photo URL & Presets */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fotoğraf URL'si</Text>
            <TextInput
              style={styles.textInput}
              value={photoUrl}
              onChangeText={setPhotoUrl}
              placeholder="https://..."
              placeholderTextColor="#6B7280"
            />
            <Text style={styles.helperText}>Hızlı önerilerden seçebilirsiniz:</Text>
            <View style={styles.presetsRow}>
              {PRESET_PHOTO_SUGGESTIONS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetChip}
                  onPress={() => setPhotoUrl(preset.url)}
                >
                  <Text style={styles.presetChipText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 2. 🚨 CRITICAL EMERGENCY LOST ALARM TOGGLE */}
          <View style={styles.emergencyLostBox}>
            <View style={styles.emergencyLostHeader}>
              <View style={styles.emergencyLostTitleCol}>
                <View style={styles.emergencyIconRow}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={styles.emergencyLostTitle}>🚨 Acil Kayıp Alarmı Modu</Text>
                </View>
                <Text style={styles.emergencyLostDesc}>
                  Dostunuz kaybolduğunda bu modu açın. Künyeyi tarayan kişi ilk anda büyük kırmızı alarm banner'ı, ödül miktarını ve tek dokunuşla WhatsApp konum gönderme butonunu görür.
                </Text>
              </View>
              <Switch
                value={isLost}
                onValueChange={setIsLost}
                trackColor={{ false: '#374151', true: '#EF4444' }}
                thumbColor={isLost ? '#FFF' : '#9CA3AF'}
              />
            </View>

            {isLost && (
              <View style={styles.lostExpandedFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabelLost}>Ödül Tutarı (Varsa)</Text>
                  <TextInput
                    style={styles.textInputLost}
                    value={rewardAmount}
                    onChangeText={setRewardAmount}
                    placeholder="Örn: 5.000 ₺ Ödül"
                    placeholderTextColor="#F87171"
                  />
                </View>

                <View style={styles.rowTwoCols}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabelLost}>Kaybolduğu Konum / Park</Text>
                    <TextInput
                      style={styles.textInputLost}
                      value={lostLocation}
                      onChangeText={setLostLocation}
                      placeholder="Örn: Moda Sahil Parkı civarı"
                      placeholderTextColor="#F87171"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabelLost}>Kayıp Zamanı</Text>
                    <TextInput
                      style={styles.textInputLost}
                      value={lostDate}
                      onChangeText={setLostDate}
                      placeholder="Örn: Dün akşam 20:00"
                      placeholderTextColor="#F87171"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabelLost}>Bulan Kişiye Özel Not</Text>
                  <TextInput
                    style={[styles.textInputLost, { height: 70 }]}
                    value={lostNotes}
                    onChangeText={setLostNotes}
                    placeholder="Örn: Çok ürkektir, mama gösterirseniz gelir. Lütfen tutun ve hemen arayın."
                    placeholderTextColor="#F87171"
                    multiline
                  />
                </View>
              </View>
            )}
          </View>

          {/* 3. Owner & Contact Information */}
          <Text style={[styles.formSectionTitle, { marginTop: 24 }]}>👤 Sahip & Acil İletişim Bilgileri</Text>
          
          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Sahip Adı Soyadı *</Text>
              <TextInput
                style={styles.textInput}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="Örn: Ayşe Yılmaz"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Sahip Telefonu *</Text>
              <TextInput
                style={styles.textInput}
                value={ownerPhone}
                onChangeText={setOwnerPhone}
                placeholder="0532xxxxxxx"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>WhatsApp Hattı (Numara)</Text>
              <TextInput
                style={styles.textInput}
                value={ownerWhatsapp}
                onChangeText={setOwnerWhatsapp}
                placeholder="90532xxxxxxx"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>İlçe / Şehir</Text>
              <TextInput
                style={styles.textInput}
                value={ownerAddress}
                onChangeText={setOwnerAddress}
                placeholder="Örn: Moda, Kadıköy / İstanbul"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          {/* 4. Veterinary Clinic */}
          <Text style={[styles.formSectionTitle, { marginTop: 24 }]}>🏥 Kayıtlı Veteriner Kliniği</Text>

          <View style={styles.rowTwoCols}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Klinik Adı</Text>
              <TextInput
                style={styles.textInput}
                value={vetClinicName}
                onChangeText={setVetClinicName}
                placeholder="Örn: Kadıköy Pati Veteriner Polikliniği"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Klinik Telefonu</Text>
              <TextInput
                style={styles.textInput}
                value={vetPhone}
                onChangeText={setVetPhone}
                placeholder="0216xxxxxxx"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* 5. Personality & Allergies */}
          <Text style={[styles.formSectionTitle, { marginTop: 24 }]}>🐾 Karakter & Hassasiyetler</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Karakter Özellikleri Ekle</Text>
            <View style={styles.addTagRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={personalityInput}
                onChangeText={setPersonalityInput}
                placeholder="Örn: Çok Uysal, Oyunbaz, Çocuk Dostu"
                placeholderTextColor="#6B7280"
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddPersonality}>
                <Ionicons name="add" size={20} color="#03120B" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsFlex}>
              {personalityList.map((trait, idx) => (
                <View key={idx} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{trait}</Text>
                  <TouchableOpacity onPress={() => handleRemovePersonality(trait)}>
                    <Ionicons name="close-circle" size={14} color="#6EE7B7" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Alerjiler & Sağlık Hassasiyetleri</Text>
            <View style={styles.addTagRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={allergiesInput}
                onChangeText={setAllergiesInput}
                placeholder="Örn: Tavuk Proteini Alerjisi, Tahılsız Beslenir"
                placeholderTextColor="#6B7280"
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddAllergy}>
                <Ionicons name="add" size={20} color="#03120B" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsFlex}>
              {allergiesList.map((item, idx) => (
                <View key={idx} style={[styles.tagPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                  <Text style={[styles.tagPillText, { color: '#FDE68A' }]}>{item}</Text>
                  <TouchableOpacity onPress={() => handleRemoveAllergy(item)}>
                    <Ionicons name="close-circle" size={14} color="#FBBF24" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Özel Yaklaşım / Bakım Notu</Text>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              value={specialNotes}
              onChangeText={setSpecialNotes}
              placeholder="Örn: Günde 2 kez eklem vitamini alır. Ani seslerden ürker, yumuşak konuşulması gerekir."
              placeholderTextColor="#6B7280"
              multiline
            />
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#03120B" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#03120B" />
                <Text style={styles.saveBtnText}>
                  {selectedPetId === 'new' ? 'Pati Künyesini Kaydet & Yayınla' : 'Değişiklikleri Güncelle'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* PRINTABLE COLLAR TAG MODAL */}
        {collarModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="hardware-chip-outline" size={22} color="#10B981" />
                  <Text style={styles.modalTitle}>Lazer Tasma Künyesi & QR</Text>
                </View>
                <TouchableOpacity onPress={() => setCollarModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Physical Collar Tag Preview */}
              <View style={styles.collarDiscMockup}>
                <View style={styles.collarHole} />
                <Text style={styles.collarDiscTitle}>{name || 'DOSTUN ADI'}</Text>
                {collarQrDataUrl ? (
                  <Image source={{ uri: collarQrDataUrl }} style={styles.collarQrImg} />
                ) : null}
                <Text style={styles.collarShortUrl}>qr-la.com/p/{slug || name.toLowerCase()}</Text>
                <Text style={styles.collarEngraveNote}>Lazer Paslanmaz Çelik 30mm</Text>
              </View>

              <Text style={styles.modalTip}>
                Bu QR kod ultra-kısa link formatındadır. 25mm - 30mm küçük paslanmaz çelik tasma künyelerine lazerle kazındığında gece veya hareket halinde bile 1 saniyede hatasız okunur.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.printBtn} onPress={printCollarModal} activeOpacity={0.85}>
                  <Ionicons name="print-outline" size={18} color="#03120B" />
                  <Text style={styles.printBtnText}>Şablonu Yazdır / PDF İndir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setCollarModalVisible(false)}
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
      color: '#059669',
      fontSize: 14,
      fontWeight: '700',
    },
    headerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0',
      gap: 6,
    },
    headerBadgeText: {
      color: '#059669',
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
    // Horizontal list
    petListSection: {
      marginBottom: 18,
    },
    petListScroll: {
      gap: 12,
      paddingVertical: 4,
    },
    petCardItem: {
      width: 140,
      backgroundColor: isDark ? 'rgba(6, 40, 26, 0.6)' : colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : colors.border,
      padding: 12,
      alignItems: 'center',
    },
    petCardItemSelected: {
      borderColor: '#10B981',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#F0FDF4',
    },
    petCardItemLost: {
      borderColor: '#EF4444',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
    },
    petCardThumbWrapper: {
      position: 'relative',
      marginBottom: 8,
    },
    petCardThumb: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 2,
      borderColor: '#10B981',
    },
    lostIndicatorDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#FFF',
    },
    petCardName: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    petCardBreed: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 6,
    },
    petCardTagCode: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#F3F4F6',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    petCardTagText: {
      color: '#059669',
      fontSize: 10,
      fontWeight: '700',
      fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    },
    addNewPetBtn: {
      width: 130,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
    },
    addNewPetBtnActive: {
      borderColor: '#10B981',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
    },
    addNewPetIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    addNewPetText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    // Quick Bar
    quickBar: {
      backgroundColor: isDark ? 'rgba(6, 40, 26, 0.8)' : colors.card,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : colors.border,
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
    quickBarScans: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    quickBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    quickLostToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FEF2F2',
      borderWidth: 1,
      borderColor: '#EF4444',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 6,
    },
    quickLostToggleActive: {
      backgroundColor: '#DC2626',
    },
    quickLostToggleText: {
      color: '#DC2626',
      fontSize: 12,
      fontWeight: '800',
    },
    quickLiveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 6,
    },
    quickLiveBtnText: {
      color: '#059669',
      fontSize: 12,
      fontWeight: '700',
    },
    quickCollarBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B981',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 6,
    },
    quickCollarBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    // Form Card
    formCard: {
      backgroundColor: isDark ? 'rgba(6, 40, 26, 0.5)' : colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : colors.border,
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
    speciesRow: {
      flexDirection: 'row',
      gap: 6,
    },
    speciesPill: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    speciesPillActive: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
      borderColor: '#10B981',
    },
    speciesPillText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    speciesPillTextActive: {
      color: '#059669',
      fontWeight: '800',
    },
    genderRow: {
      flexDirection: 'row',
      gap: 6,
    },
    genderPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 9,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    genderPillActive: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
      borderColor: '#10B981',
    },
    genderText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    genderTextActive: {
      color: '#059669',
      fontWeight: '800',
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
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#A7F3D0',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    presetChipText: {
      color: '#059669',
      fontSize: 11,
      fontWeight: '600',
    },
    emergencyLostBox: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#FECACA',
      borderRadius: 18,
      padding: 16,
      marginTop: 10,
      marginBottom: 10,
    },
    emergencyLostHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    emergencyLostTitleCol: {
      flex: 1,
    },
    emergencyIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    emergencyLostTitle: {
      color: '#DC2626',
      fontSize: 15,
      fontWeight: '800',
    },
    emergencyLostDesc: {
      color: isDark ? '#FCA5A5' : '#7F1D1D',
      fontSize: 11,
      lineHeight: 16,
    },
    lostExpandedFields: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FECACA',
    },
    inputLabelLost: {
      fontSize: 12,
      fontWeight: '700',
      color: '#DC2626',
      marginBottom: 6,
    },
    textInputLost: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : '#FFF',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
    },
    addTagRow: {
      flexDirection: 'row',
      gap: 8,
    },
    addTagBtn: {
      backgroundColor: '#10B981',
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tagsFlex: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    tagPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      gap: 6,
    },
    tagPillText: {
      color: '#059669',
      fontSize: 12,
      fontWeight: '600',
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#10B981',
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
    collarDiscMockup: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#E5E7EB',
      borderWidth: 6,
      borderColor: '#9CA3AF',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      position: 'relative',
      marginBottom: 16,
    },
    collarHole: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: isDark ? '#062015' : '#F1F5F9',
      borderWidth: 2,
      borderColor: '#9CA3AF',
      position: 'absolute',
      top: 10,
    },
    collarDiscTitle: {
      fontSize: 13,
      fontWeight: '900',
      color: '#111827',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 8,
    },
    collarQrImg: {
      width: 86,
      height: 86,
      marginVertical: 4,
    },
    collarShortUrl: {
      fontSize: 10,
      fontWeight: '800',
      color: '#1F2937',
      fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    },
    collarEngraveNote: {
      fontSize: 8,
      color: '#6B7280',
      fontWeight: '600',
      marginTop: 2,
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
      backgroundColor: '#10B981',
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
    petguruSyncBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#BBF7D0',
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
      gap: 12,
    },
    petguruSyncIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 10,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    petguruSyncTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#10B981',
      marginBottom: 2,
    },
    petguruSyncDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    petguruAppBtn: {
      backgroundColor: '#10B981',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    petguruAppBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    closeBtnText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
  });
