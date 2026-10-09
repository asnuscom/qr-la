import { authService } from '@/services/authService';
import { eventService } from '@/services/eventService';
import { isRealFirebaseConfigured, storage } from '@/services/firebase';
import { slugify } from '@/services/mockData';
import { convertHeicToJpegIfNeeded } from '@/services/compression';
import { DatePickerModal, TimePickerModal } from '@/components/DateTimePickerModal';
import { AlbumModel, EventModel, EventType, ScheduleItem } from '@/types';
import { DraggableScrollView } from '@/components/DraggableScrollView';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Curated luxury cover photo presets so user can pick with one tap
const COVER_PRESETS = [
  {
    id: 'cover-1',
    name: 'Klasik Vals',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cover-2',
    name: 'Kır Düğünü & Çiçek',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cover-3',
    name: 'Boğaz & Sahil',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cover-4',
    name: 'Romantik Mum Işığı',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
  },
];

const THEME_PRESETS = [
  { name: 'Şampanya Altın', color: '#C5A059' },
  { name: 'Gül Kurusu', color: '#B76E79' },
  { name: 'Zümrüt Yeşili', color: '#059669' },
  { name: 'Asil Gece', color: '#1E293B' },
];

const EVENT_TYPES: { id: EventType; label: string; icon: any }[] = [
  { id: 'dugun', label: 'Düğün', icon: 'heart' },
  { id: 'nisan', label: 'Nişan & Söz', icon: 'heart-half' },
  { id: 'kina', label: 'Kına Gecesi', icon: 'sparkles' },
  { id: 'dogumgunu', label: 'Doğum Günü', icon: 'gift' },
  { id: 'sunnet', label: 'Sünnet', icon: 'ribbon' },
  { id: 'parti', label: 'Parti & Kutlama', icon: 'musical-notes' },
  { id: 'diger', label: 'Özel Gün', icon: 'calendar' },
];

// Helpers to parse and format Event Dates strictly in Turkey Timezone (Europe/Istanbul UTC+3)
const parseEventDateTurkey = (isoString?: string): { dateStr: string; timeStr: string } => {
  if (!isoString) return { dateStr: '2026-10-18', timeStr: '19:00' };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { dateStr: '2026-10-18', timeStr: '19:00' };

    const dateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);

    let timeStr = new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);

    timeStr = timeStr.replace('.', ':').trim();
    if (timeStr.length === 4 && timeStr.indexOf(':') === 1) {
      timeStr = '0' + timeStr;
    }
    if (timeStr.startsWith('24:')) {
      timeStr = '00:' + timeStr.slice(3);
    }

    return { dateStr, timeStr: timeStr || '19:00' };
  } catch {
    return { dateStr: '2026-10-18', timeStr: '19:00' };
  }
};

const formatEventDateToTurkeyIso = (dateStr: string, timeStr: string): string => {
  try {
    const cleanDate = (dateStr || '').trim();
    let cleanTime = (timeStr || '19:00').trim().replace('.', ':');
    if (cleanTime.length === 4 && cleanTime.indexOf(':') === 1) {
      cleanTime = '0' + cleanTime;
    }
    const timeWithSec = cleanTime.length === 5 ? `${cleanTime}:00` : cleanTime;
    const turkeyIso = `${cleanDate}T${timeWithSec}+03:00`;
    const d = new Date(turkeyIso);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {}
  return new Date().toISOString();
};

export default function EventFormScreen() {
  const router = useRouter();
  const { slug: paramSlug } = useLocalSearchParams<{ slug?: string }>();

  const user = authService.getState().user;
  const userSlug =
    (user &&
      user.uid !== 'demo-host-yavuz' &&
      user.events?.find(
        (s) => s && s !== 'demo-panel' && s !== 'samet-ve-sule'
      )) ||
    user?.events?.[0];
  const initialSlug = paramSlug || userSlug || 'demo-panel';
  const [loadedSlug, setLoadedSlug] = useState<string>(initialSlug);
  const activeSavedSlug = loadedSlug || initialSlug;
  const isDemo = activeSavedSlug === 'demo-panel' || !user || user.uid === 'demo-host-yavuz';

  const showDemoLockedNotice = (fieldName: string) => {
    Alert.alert(
      'Demo Modu Kilitlidir 🔒',
      `Demo etkinliğinde "${fieldName}" değiştirilemez. Kendi etkinliğinizi oluşturup kişiselleştirmek için lütfen ücretsiz kayıt olun.`,
      [
        { text: 'Anladım', style: 'cancel' },
        {
          text: 'Kayıt Ol',
          onPress: () => router.push({ pathname: '/giris', params: { tab: 'register' } } as any),
        },
      ]
    );
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = isDemo ? 'Demo Etkinlik Ayarları | QR-la' : 'Etkinlik Detaylarını Düzenle | QR-la';
    }
  }, [isDemo]);

  // Form State initialized with rich defaults
  const [slug, setSlug] = useState(initialSlug);
  const [hasUserEditedSlug, setHasUserEditedSlug] = useState(false);
  const [slugCheckStatus, setSlugCheckStatus] = useState<{ checked: boolean; available: boolean; message?: string } | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [eventType, setEventType] = useState<EventType>('dugun');
  const [brideName, setBrideName] = useState('Şule');
  const [groomName, setGroomName] = useState('Samet');
  const [title, setTitle] = useState('Samet & Şule Düğünü');
  const [subtitle, setSubtitle] = useState(
    'Bu mutlu anımıza ortak olduğunuz için teşekkür ederiz. Masanızdaki QR kodu okutarak anılarınızı hemen paylaşabilirsiniz.'
  );
  const [eventDateStr, setEventDateStr] = useState('2026-10-18');
  const [eventTimeStr, setEventTimeStr] = useState('19:00');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState('');
  const [isUploadingInvitation, setIsUploadingInvitation] = useState(false);
  const [showManualInvitationUrl, setShowManualInvitationUrl] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(COVER_PRESETS[0].url);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#C5A059');

  const [venueName, setVenueName] = useState('Sait Halim Paşa Yalısı');
  const [venueAddress, setVenueAddress] = useState(
    'Köybaşı Cad. No:83, Yeniköy, Sarıyer / İstanbul'
  );
  const [mapUrl, setMapUrl] = useState(
    'https://maps.google.com/?q=Sait+Halim+Pasa+Yalisi+Istanbul'
  );

  const [isPrivate, setIsPrivate] = useState(false);
  const [pinCode, setPinCode] = useState('1923');
  const [enableCompression, setEnableCompression] = useState(true);
  const [allowGuestDownloads, setAllowGuestDownloads] = useState(true);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);
  const [allowGuestbook, setAllowGuestbook] = useState(true);
  const [autoApprovePhotos, setAutoApprovePhotos] = useState(true);

  // Schedule Timeline State
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: '1', time: '18:30', title: 'Karşılama Kokteyli', description: 'Canlı müzik ve ikramlar' },
    { id: '2', time: '19:30', title: 'Nikah Töreni & İlk Dans', description: 'İlk vals' },
    { id: '3', time: '20:30', title: 'Akşam Yemeği & Orkestra', description: 'Yemek ve müzik dinletisi' },
    { id: '4', time: '22:00', title: 'Düğün Pastası Kesimi', description: 'Pasta merasimi' },
    { id: '5', time: '23:00', title: 'After Party & Canlı DJ', description: 'Kapanış partisi' },
  ]);

  // New Schedule Item Inputs
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleDesc, setNewScheduleDesc] = useState('');

  // Editing Existing Schedule Item
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editScheduleTime, setEditScheduleTime] = useState('');
  const [editScheduleTitle, setEditScheduleTitle] = useState('');
  const [editScheduleDesc, setEditScheduleDesc] = useState('');

  const [albums, setAlbums] = useState<AlbumModel[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Load existing event if available, or generate default
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const slugToLoad = paramSlug || initialSlug;
        const ev = await eventService.getEvent(slugToLoad, user?.displayName);
        if (ev) {
          setLoadedSlug(ev.slug);
          setSlug(ev.slug);
          setHasUserEditedSlug(false);
          setSlugCheckStatus(null);
          setEventType(ev.eventType || 'dugun');
          setBrideName(ev.hosts.brideOrPrimary || 'Şule');
          setGroomName(ev.hosts.groomOrSecondary || 'Samet');
          setTitle(ev.title);
          setSubtitle(ev.subtitle || '');
          setCoverPhotoUrl(ev.coverPhotoUrl);
          setPrimaryColor(ev.theme.primaryColor || '#C5A059');
          setVenueName(ev.venue.name);
          setVenueAddress(ev.venue.address);
          setMapUrl(ev.venue.mapUrl);
          setInvitationUrl(ev.invitationUrl || '');

          setIsPrivate(ev.settings.isPrivate);
          setPinCode(ev.settings.pinCode || '1923');
          const isOrigQuality = Boolean((ev.settings as any)?.originalQuality || ev.settings.enableCompression === false);
          setEnableCompression(!isOrigQuality);
          setAllowGuestDownloads(ev.settings.allowGuestDownloads);
          setIsLiveFeedActive(ev.settings.isLiveFeedActive);
          setAllowGuestbook(ev.settings.allowGuestbook ?? true);
          setAutoApprovePhotos(ev.settings.autoApprovePhotos ?? true);

          if (ev.schedule && ev.schedule.length > 0) {
            setSchedule(ev.schedule);
          }

          // Parse date and time cleanly in Turkey timezone (GMT+3)
          const { dateStr, timeStr } = parseEventDateTurkey(ev.eventDate);
          setEventDateStr(dateStr);
          setEventTimeStr(timeStr);
        }

        const alb = await eventService.getAlbums(ev?.slug || slugToLoad);
        setAlbums(alb);
      } catch (err) {
        console.warn('Load event form err:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [paramSlug, initialSlug, user?.displayName]);

  // Debounced slug availability verification
  useEffect(() => {
    if (!slug || isDemo || slug === activeSavedSlug) {
      setSlugCheckStatus(null);
      setIsCheckingSlug(false);
      return;
    }

    if (slug.length < 3) {
      setSlugCheckStatus({
        checked: true,
        available: false,
        message: 'Bağlantı adı en az 3 karakterden oluşmalıdır.',
      });
      return;
    }

    setIsCheckingSlug(true);
    const timer = setTimeout(async () => {
      try {
        const res = await eventService.checkSlugAvailability(slug, user?.uid);
        setSlugCheckStatus({
          checked: true,
          available: res.available,
          message: res.available ? `qr-la.com/${res.formattedSlug} bağlantısı kullanılabilir!` : res.reason,
        });
      } catch {
        setSlugCheckStatus(null);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [slug, activeSavedSlug, isDemo, user?.uid]);

  // When bride or groom names change, automatically update suggested title and slug
  const handleNameChange = (newBride: string, newGroom: string) => {
    if (isDemo) {
      showDemoLockedNotice('Gelin ve damat isimleri');
      return;
    }
    setBrideName(newBride);
    setGroomName(newGroom);

    if (newBride && newGroom) {
      setTitle(`${newBride.trim()} & ${newGroom.trim()} Düğünü`);
      // Only auto-update slug if host hasn't typed a custom slug
      if (!hasUserEditedSlug) {
        const generatedSlug = slugify(`${newBride.trim()} & ${newGroom.trim()}`);
        setSlug(generatedSlug);
      }
    }
  };

  const handleSlugChange = (raw: string) => {
    if (isDemo) {
      showDemoLockedNotice('Özel Bağlantı Linki (Slug)');
      return;
    }
    setHasUserEditedSlug(true);
    // Sanitize in real-time: lowercase alphanumeric and hyphens only
    const sanitized = raw.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(sanitized);
  };

  // Schedule Management Handlers
  const handleAddScheduleItem = () => {
    if (!newScheduleTitle.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen akış başlığını girin.');
      return;
    }
    const newItem: ScheduleItem = {
      id: `sch-${Date.now().toString(36)}`,
      time: newScheduleTime.trim() || '19:00',
      title: newScheduleTitle.trim(),
      description: newScheduleDesc.trim() || undefined,
    };
    setSchedule([...schedule, newItem]);
    setNewScheduleTime('');
    setNewScheduleTitle('');
    setNewScheduleDesc('');
  };

  const handleQuickAddSchedule = (time: string, quickTitle: string, quickDesc?: string) => {
    const newItem: ScheduleItem = {
      id: `sch-${Date.now().toString(36)}-${Math.floor(Math.random() * 100)}`,
      time,
      title: quickTitle,
      description: quickDesc,
    };
    setSchedule([...schedule, newItem]);
  };

  const handleDeleteScheduleItem = (id: string) => {
    setSchedule(schedule.filter((s) => s.id !== id));
  };

  const handleStartEditSchedule = (item: ScheduleItem) => {
    setEditingScheduleId(item.id);
    setEditScheduleTime(item.time);
    setEditScheduleTitle(item.title);
    setEditScheduleDesc(item.description || '');
  };

  const handleSaveEditSchedule = () => {
    if (!editScheduleTitle.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen başlık girin.');
      return;
    }
    setSchedule(
      schedule.map((item) =>
        item.id === editingScheduleId
          ? {
            ...item,
            time: editScheduleTime.trim() || item.time,
            title: editScheduleTitle.trim(),
            description: editScheduleDesc.trim() || undefined,
          }
          : item
      )
    );
    setEditingScheduleId(null);
  };

  // Category Management Handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const name = newCategoryName.trim();
    const newId = `alb-${Date.now().toString(36)}`;
    const newAlbum: AlbumModel = {
      id: newId,
      name,
      slug: slugify(name) || `cat-${Date.now()}`,
      order: albums.length + 1,
      photoCount: 0,
    };
    setAlbums([...albums, newAlbum]);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (albumId: string) => {
    if (albumId === 'alb-all' || albumId === 'alb-genel') {
      Alert.alert('İşlem Engellendi', 'Bu temel sistem kategorisi silinemez.');
      return;
    }
    setAlbums(albums.filter((a) => a.id !== albumId));
  };

  const handleUploadCoverPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsUploadingCover(true);

      // Convert iPhone HEIC/HEIF to JPEG for 100% universal browser compatibility
      const conv = await convertHeicToJpegIfNeeded(asset.uri, asset.fileName || asset.mimeType);
      const safeUri = conv.uri;
      const safeBlob = conv.blob;

      if (isRealFirebaseConfigured && storage) {
        let blobToUpload = safeBlob;
        if (!blobToUpload) {
          const response = await fetch(safeUri);
          blobToUpload = await response.blob();
        }
        const fileExt = 'jpg';
        const coverRef = ref(storage, `events/${slug || activeSavedSlug}/covers/cover-${Date.now()}.${fileExt}`);
        await uploadBytes(coverRef, blobToUpload, { contentType: 'image/jpeg' });
        const downloadUrl = await getDownloadURL(coverRef);
        setCoverPhotoUrl(downloadUrl);
        Alert.alert('Harika! 📸', 'Kapak fotoğrafı başarıyla yüklendi.');
      } else {
        setCoverPhotoUrl(safeUri);
        Alert.alert('Bilgi', 'Kapak fotoğrafı seçildi.');
      }
    } catch (err: any) {
      console.error('Cover upload error:', err);
      Alert.alert('Hata', 'Kapak fotoğrafı yüklenirken bir sorun oluştu: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleUploadInvitationImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsUploadingInvitation(true);

      const conv = await convertHeicToJpegIfNeeded(asset.uri, asset.fileName || asset.mimeType);
      const safeUri = conv.uri;
      const safeBlob = conv.blob;

      if (isRealFirebaseConfigured && storage) {
        let blobToUpload = safeBlob;
        if (!blobToUpload) {
          const response = await fetch(safeUri);
          blobToUpload = await response.blob();
        }
        const fileExt = 'jpg';
        const invRef = ref(storage, `events/${slug || activeSavedSlug}/invitations/davetiye-${Date.now()}.${fileExt}`);
        await uploadBytes(invRef, blobToUpload, { contentType: 'image/jpeg' });
        const downloadUrl = await getDownloadURL(invRef);
        setInvitationUrl(downloadUrl);
        Alert.alert('Harika! 💌', 'Davetiye görseli başarıyla yüklendi.');
      } else {
        setInvitationUrl(safeUri);
        Alert.alert('Bilgi', 'Davetiye görseli seçildi.');
      }
    } catch (err: any) {
      console.error('Invitation image upload error:', err);
      Alert.alert('Hata', 'Davetiye yüklenirken bir sorun oluştu: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setIsUploadingInvitation(false);
    }
  };

  const handleUploadInvitationDoc = async () => {
    try {
      setIsUploadingInvitation(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsUploadingInvitation(false);
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.name || '';
      const mimeType = asset.mimeType || '';
      const isPdf =
        mimeType.includes('pdf') ||
        fileName.toLowerCase().endsWith('.pdf') ||
        asset.uri.toLowerCase().includes('.pdf');

      let uploadUri = asset.uri;
      let uploadBlob: Blob | null = null;
      let contentType = isPdf ? 'application/pdf' : 'image/jpeg';
      let fileExt = isPdf ? 'pdf' : 'jpg';

      if (!isPdf) {
        const conv = await convertHeicToJpegIfNeeded(asset.uri, fileName || mimeType);
        uploadUri = conv.uri;
        uploadBlob = conv.blob || null;
      }

      if (isRealFirebaseConfigured && storage) {
        if (!uploadBlob) {
          const response = await fetch(uploadUri);
          uploadBlob = await response.blob();
        }
        const invRef = ref(storage, `events/${slug || activeSavedSlug}/invitations/davetiye-${Date.now()}.${fileExt}`);
        await uploadBytes(invRef, uploadBlob, { contentType });
        const downloadUrl = await getDownloadURL(invRef);
        setInvitationUrl(downloadUrl);
        Alert.alert('Harika! 💌', isPdf ? 'PDF davetiyeniz başarıyla yüklendi.' : 'Davetiye görseli başarıyla yüklendi.');
      } else {
        setInvitationUrl(uploadUri);
        Alert.alert('Bilgi', 'Davetiye dosyası seçildi.');
      }
    } catch (err: any) {
      console.error('Invitation doc upload error:', err);
      Alert.alert('Hata', 'Davetiye dosyası yüklenirken bir sorun oluştu: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setIsUploadingInvitation(false);
    }
  };

  const handleSave = async () => {
    if (isDemo) {
      Alert.alert(
        'Demo Modu (Salt Okunur) 🔒',
        'Örnek düğün demosunun isimleri, bağlantısı (slug) ve ayarları diğer ziyaretçilerin incelemesi için kilitlidir.\n\nKendi etkinliğinizi oluşturmak ve tüm ayarları özgürce düzenlemek için hemen ücretsiz hesap açabilirsiniz!',
        [
          { text: 'İncelemeye Devam Et', style: 'cancel' },
          {
            text: 'Kayıt Ol',
            onPress: () => router.push({ pathname: '/giris', params: { tab: 'register' } } as any),
          },
        ]
      );
      return;
    }

    if (!title.trim() || !slug.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen etkinlik başlığı ve linkini girin.');
      return;
    }

    const cleanSlug = slugify(slug);
    if (!cleanSlug || cleanSlug.length < 3) {
      Alert.alert('Eksik Bilgi', 'Özel bağlantı linki en az 3 karakterden oluşmalıdır.');
      return;
    }

    if (slugCheckStatus && !slugCheckStatus.available && cleanSlug !== activeSavedSlug) {
      Alert.alert('Bağlantı Kullanılamıyor', slugCheckStatus.message || 'Lütfen farklı bir bağlantı adı seçin.');
      return;
    }

    setIsSaving(true);
    try {
      // Compute final ISO eventDate locked to Turkey Timezone (GMT+3)
      const finalEventDate = formatEventDateToTurkeyIso(eventDateStr, eventTimeStr);

      const updatedData: Partial<EventModel> = {
        slug: cleanSlug,
        eventType,
        title: title.trim(),
        subtitle: subtitle.trim(),
        hosts: {
          brideOrPrimary: brideName.trim(),
          groomOrSecondary: groomName.trim(),
        },
        eventDate: finalEventDate,
        invitationUrl: invitationUrl.trim() || undefined,
        coverPhotoUrl,
        theme: {
          primaryColor,
          backgroundColor: '#FAF7F2',
          secondaryColor: '#EAD7BB',
          textColor: '#1A1817',
        },
        venue: {
          name: venueName.trim(),
          address: venueAddress.trim(),
          mapUrl: mapUrl.trim(),
        },
        schedule,
        settings: {
          isPrivate,
          pinCode,
          enableCompression,
          originalQuality: !enableCompression,
          allowGuestDownloads,
          isLiveFeedActive,
          allowGuestbook,
          autoApprovePhotos,
        },
      };

      if (cleanSlug !== activeSavedSlug) {
        // Slug changed! Migrate all albums, photos, guestbook, and user profile
        await eventService.renameEventSlug(activeSavedSlug, cleanSlug, updatedData);
        await eventService.saveAlbums(cleanSlug, albums);
        if (user) {
          await authService.updateUserEventSlug(user.uid, activeSavedSlug, cleanSlug);
        }
        setLoadedSlug(cleanSlug);
        setSlug(cleanSlug);
        setHasUserEditedSlug(false);
        setSlugCheckStatus(null);
        if (router.setParams) {
          router.setParams({ slug: cleanSlug });
        }
      } else {
        await eventService.saveEvent(cleanSlug, updatedData);
        await eventService.saveAlbums(cleanSlug, albums);
        if (user) {
          await authService.addEventToUser(user.uid, cleanSlug);
        }
        setLoadedSlug(cleanSlug);
        setSlug(cleanSlug);
        setHasUserEditedSlug(false);
        setSlugCheckStatus(null);
      }

      setIsSaving(false);
      Alert.alert('Harika! 🎉', 'Etkinliğiniz başarıyla güncellendi ve kaydedildi!', [
        {
          text: 'Panele Dön',
          onPress: () => router.push({ pathname: '/panel', params: { slug: cleanSlug } } as any),
        },
        {
          text: 'Sayfayı Gör',
          onPress: () => router.push(`/${cleanSlug}` as any),
        },
      ]);
    } catch (e: any) {
      console.error(e);
      setIsSaving(false);
      Alert.alert('Hata', e?.message || 'Etkinlik kaydedilirken bir sorun oluştu.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C5A059" />
          <Text style={styles.loadingText}>Etkinlik ayarları yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Formatted date preview for UX (Turkey Timezone GMT+3)
  let formattedDatePreview = '';
  try {
    const previewIso = formatEventDateToTurkeyIso(eventDateStr, eventTimeStr);
    const d = new Date(previewIso);
    if (!isNaN(d.getTime())) {
      formattedDatePreview = d.toLocaleDateString('tr-TR', {
        timeZone: 'Europe/Istanbul',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      });
    }
  } catch (_e) { }

  const handleLogout = async () => {
    const executeLogout = async () => {
      try {
        await authService.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
      router.replace('/giris' as any);
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm('Yönetim panelinden ve hesabınızdan çıkış yapmak istediğinize emin misiniz?');
      if (confirmed) {
        await executeLogout();
      }
    } else {
      Alert.alert(
        'Çıkış Yap',
        'Yönetim panelinden ve hesabınızdan çıkış yapmak istediğinize emin misiniz?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Çıkış Yap',
            style: 'destructive',
            onPress: executeLogout,
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>Etkinlik Bilgilerini Düzenle</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.headerLogoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={15} color="#EF4444" />
              <Text style={styles.headerLogoutText}>Çıkış</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveHeaderBtn}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveHeaderBtnText}>{isSaving ? '...' : 'Kaydet'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Warning Banner */}
        {isDemo && (
          <View style={styles.demoWarningBanner}>
            <View style={styles.demoWarningIcon}>
              <Ionicons name="lock-closed" size={20} color="#B45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.demoWarningTitle}>Demo Modu: Salt Okunur 🔒</Text>
              <Text style={styles.demoWarningText}>
                Örnek düğün yönetim panelini inceliyorsunuz. İsimler, başlık ve etkinlik bağlantısı (slug) demoda kilitlidir.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.demoRegisterBtn}
              onPress={() => router.push({ pathname: '/giris', params: { tab: 'register' } } as any)}
            >
              <Text style={styles.demoRegisterBtnText}>Kendi Etkinliğini Başlat</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 1: Event Type, Names & Date */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>1. Etkinlik Türü & Temel Bilgiler</Text>

          {/* Event Type Chips */}
          <View style={styles.labelRowWithBadge}>
            <Text style={styles.label}>Etkinlik Türü</Text>
            {isDemo && (
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={10} color="#B45309" />
                <Text style={styles.lockedBadgeText}>Kilitli</Text>
              </View>
            )}
          </View>
          <DraggableScrollView contentContainerStyle={styles.typeChipsScroll}>
            {EVENT_TYPES.map((t) => {
              const isSelected = eventType === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeChip, isSelected && styles.typeChipActive, isDemo && !isSelected && styles.typeChipDisabled]}
                  onPress={() => isDemo ? showDemoLockedNotice('Etkinlik türü') : setEventType(t.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={t.icon}
                    size={16}
                    color={isSelected ? '#FFF' : '#8A6D3B'}
                  />
                  <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </DraggableScrollView>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <View style={styles.labelRowWithBadge}>
                <Text style={styles.label}>Gelin / 1. Ev Sahibi</Text>
                {isDemo && (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={10} color="#B45309" />
                    <Text style={styles.lockedBadgeText}>Kilitli</Text>
                  </View>
                )}
              </View>
              {isDemo ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => showDemoLockedNotice('Gelin / Ev Sahibi İsmi')}
                >
                  <TextInput
                    style={[styles.input, styles.inputLocked]}
                    value={brideName}
                    placeholder="Örn: Şule"
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={styles.input}
                  value={brideName}
                  onChangeText={(val) => handleNameChange(val, groomName)}
                  placeholder="Örn: Şule"
                />
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <View style={styles.labelRowWithBadge}>
                <Text style={styles.label}>Damat / 2. İsim</Text>
                {isDemo && (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={10} color="#B45309" />
                    <Text style={styles.lockedBadgeText}>Kilitli</Text>
                  </View>
                )}
              </View>
              {isDemo ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => showDemoLockedNotice('Damat / 2. İsim')}
                >
                  <TextInput
                    style={[styles.input, styles.inputLocked]}
                    value={groomName}
                    placeholder="Örn: Samet"
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={styles.input}
                  value={groomName}
                  onChangeText={(val) => handleNameChange(brideName, val)}
                  placeholder="Örn: Samet"
                />
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRowWithBadge}>
              <Text style={styles.label}>Etkinlik Başlığı</Text>
              {isDemo && (
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={10} color="#B45309" />
                  <Text style={styles.lockedBadgeText}>Kilitli</Text>
                </View>
              )}
            </View>
            {isDemo ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => showDemoLockedNotice('Etkinlik Başlığı')}
              >
                <TextInput
                  style={[styles.input, styles.inputLocked]}
                  value={title}
                  placeholder="Örn: Samet & Şule Düğünü"
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            ) : (
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Örn: Samet & Şule Düğünü"
              />
            )}
          </View>

          {/* Custom Slug / URL */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRowWithBadge}>
              <Text style={styles.label}>Özel Bağlantı (Slug / URL)</Text>
              {isDemo ? (
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={10} color="#B45309" />
                  <Text style={styles.lockedBadgeText}>Demoda Kilitli</Text>
                </View>
              ) : slugCheckStatus && slug !== activeSavedSlug ? (
                <View
                  style={[
                    styles.slugStatusBadge,
                    slugCheckStatus.available ? styles.slugStatusBadgeSuccess : styles.slugStatusBadgeError,
                  ]}
                >
                  <Ionicons
                    name={slugCheckStatus.available ? 'checkmark-circle' : 'alert-circle'}
                    size={11}
                    color={slugCheckStatus.available ? '#059669' : '#DC2626'}
                  />
                  <Text
                    style={[
                      styles.slugStatusBadgeText,
                      slugCheckStatus.available
                        ? styles.slugStatusBadgeTextSuccess
                        : styles.slugStatusBadgeTextError,
                    ]}
                  >
                    {slugCheckStatus.available ? 'Kullanılabilir' : 'Alınamaz'}
                  </Text>
                </View>
              ) : null}
            </View>

            {isDemo ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => showDemoLockedNotice('Özel Bağlantı Linki (Slug)')}
                style={[styles.slugLockedBox, styles.inputLocked]}
              >
                <Ionicons name="lock-closed" size={16} color="#B45309" />
                <Text style={styles.slugPrefixText}>qr-la.com/</Text>
                <Text style={styles.slugValueText}>{slug || 'demo-panel'}</Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.slugInputContainer,
                  slugCheckStatus && !slugCheckStatus.available && styles.slugInputContainerError,
                  slugCheckStatus && slugCheckStatus.available && slug !== activeSavedSlug && styles.slugInputContainerSuccess,
                ]}
              >
                <View style={styles.slugPrefixWrap}>
                  <Ionicons name="link-outline" size={16} color="#8A6D3B" />
                  <Text style={styles.slugPrefixText}>qr-la.com/</Text>
                </View>
                <TextInput
                  style={styles.slugTextInput}
                  value={slug}
                  onChangeText={handleSlugChange}
                  placeholder="ornek-dugun"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isCheckingSlug ? (
                  <ActivityIndicator size="small" color="#C5A059" style={{ marginRight: 8 }} />
                ) : slug !== activeSavedSlug ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSlug(activeSavedSlug);
                      setHasUserEditedSlug(false);
                      setSlugCheckStatus(null);
                    }}
                    style={styles.slugResetBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="refresh" size={13} color="#8A6D3B" />
                    <Text style={styles.slugResetText}>Geri Al</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {isDemo ? (
              <Text style={styles.helperText}>
                Demo linki diğer misafirlerin incelemesi için sabittir. Kendi özel kısa linkinizi oluşturmak için ücretsiz hesap açabilirsiniz.
              </Text>
            ) : slugCheckStatus?.message ? (
              <Text
                style={[
                  styles.slugFeedbackText,
                  slugCheckStatus.available ? styles.slugFeedbackSuccess : styles.slugFeedbackError,
                ]}
              >
                {slugCheckStatus.available ? `✅ ${slugCheckStatus.message}` : `⚠️ ${slugCheckStatus.message}`}
              </Text>
            ) : slug !== activeSavedSlug ? (
              <Text style={styles.slugNoticeText}>
                ⚠️ Bağlantıyı değiştirdiğinizde misafirlerin erişeceği adres ve QR kartlarınız "qr-la.com/{slug}" olarak güncellenecektir.
              </Text>
            ) : (
              <Text style={styles.helperText}>
                Misafirleriniz bu kısa bağlantı üzerinden fotoğraflara ulaşır (Örn: qr-la.com/{slug}). Sadece harf, rakam ve tire (-) içerebilir.
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Karşılama Alt Yazısı (Misafirlere Mesajınız)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={subtitle}
              onChangeText={setSubtitle}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Interactive Date & Time Picker Triggers (NO text boxes) */}
          <View style={styles.dateTimePickersContainer}>
            {/* Date Picker Trigger Card */}
            <TouchableOpacity
              style={styles.pickerTriggerCard}
              onPress={() => setIsDatePickerOpen(true)}
              activeOpacity={0.85}
            >
              <View style={styles.pickerIconWrap}>
                <Ionicons name="calendar" size={22} color="#C5A059" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.pickerHeaderRow}>
                  <Text style={styles.pickerCardLabel}>ETKİNLİK TARİHİ</Text>
                  <View style={styles.tzBadge}>
                    <Text style={styles.tzBadgeText}>GMT+3 🇹🇷</Text>
                  </View>
                </View>
                <Text style={styles.pickerCardValue}>
                  {formattedDatePreview || eventDateStr}
                </Text>
                <Text style={styles.pickerTapHint}>Takvimden seçmek için tıklayın 📅</Text>
              </View>
              <View style={styles.pickerActionBadge}>
                <Text style={styles.pickerActionBadgeText}>Değiştir</Text>
                <Ionicons name="chevron-forward" size={14} color="#8A6D3B" />
              </View>
            </TouchableOpacity>

            {/* Time Picker Trigger Card */}
            <TouchableOpacity
              style={styles.pickerTriggerCard}
              onPress={() => setIsTimePickerOpen(true)}
              activeOpacity={0.85}
            >
              <View style={[styles.pickerIconWrap, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                <Ionicons name="time" size={22} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.pickerHeaderRow}>
                  <Text style={styles.pickerCardLabel}>BAŞLANGIÇ SAATİ</Text>
                  <View style={[styles.tzBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.tzBadgeText, { color: '#166534' }]}>TSİ</Text>
                  </View>
                </View>
                <Text style={styles.pickerCardValue}>
                  Saat {eventTimeStr}
                </Text>
                <Text style={styles.pickerTapHint}>Saati ayarlamak için tıklayın ⏰</Text>
              </View>
              <View style={[styles.pickerActionBadge, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
                <Text style={[styles.pickerActionBadgeText, { color: '#166534' }]}>Değiştir</Text>
                <Ionicons name="chevron-forward" size={14} color="#166534" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Time Presets */}
          <View style={styles.timePresetsRow}>
            <Text style={styles.quickLabel}>Hızlı Saat:</Text>
            {['17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '21:00'].map((timePreset) => {
              const isSelected = eventTimeStr === timePreset;
              return (
                <TouchableOpacity
                  key={timePreset}
                  style={[styles.timePresetChip, isSelected && styles.timePresetChipActive]}
                  onPress={() => setEventTimeStr(timePreset)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timePresetChipText, isSelected && styles.timePresetChipTextActive]}>
                    {timePreset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Digital Invitation Section (Direct Upload & Link) */}
          <View style={styles.invitationSectionContainer}>
            <View style={styles.invitationHeaderRow}>
              <View style={styles.invitationHeaderLeft}>
                <View style={styles.invitationIconCircle}>
                  <Ionicons name="mail-open-outline" size={20} color="#C5A059" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invitationTitle}>Dijital Davetiye (Fotoğraf / PDF / Link)</Text>
                  <Text style={styles.invitationSubtitle}>
                    Misafirlerin etkinlik sayfasında görüntüleyebileceği dijital davetiye.
                  </Text>
                </View>
              </View>
            </View>

            {/* Current Uploaded Invitation Preview */}
            {Boolean(invitationUrl && invitationUrl.trim()) && (
              <View style={styles.invitationPreviewCard}>
                {invitationUrl.toLowerCase().includes('.pdf') ? (
                  <View style={styles.invitationPdfRow}>
                    <View style={styles.pdfIconBadge}>
                      <Ionicons name="document-text" size={28} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.invitationBadgeTag}>
                        <Text style={styles.invitationBadgeTagText}>YÜKLÜ PDF DAVETİYE</Text>
                      </View>
                      <Text style={styles.invitationFileName} numberOfLines={1}>
                        {invitationUrl.split('/').pop()?.split('?')[0] || 'Dijital Davetiye.pdf'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.invitationImageRow}>
                    <Image source={{ uri: invitationUrl }} style={styles.invitationThumbImage} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.invitationBadgeTag}>
                        <Text style={styles.invitationBadgeTagText}>YÜKLÜ GÖRSEL DAVETİYE</Text>
                      </View>
                      <Text style={styles.invitationFileName} numberOfLines={1}>
                        {invitationUrl.split('/').pop()?.split('?')[0] || 'Davetiye Görseli'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Actions: Open & Remove */}
                <View style={styles.invitationActionsRow}>
                  <TouchableOpacity
                    style={styles.invitationActionBtn}
                    onPress={() => {
                      const url = invitationUrl.startsWith('http') ? invitationUrl : `https://${invitationUrl}`;
                      if (Platform.OS === 'web') {
                        window.open(url, '_blank');
                      } else {
                        Linking.openURL(url);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="eye-outline" size={15} color="#1A1817" />
                    <Text style={styles.invitationActionBtnText}>Önizle / Aç</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.invitationActionBtn, styles.invitationRemoveBtn]}
                    onPress={() => {
                      Alert.alert(
                        'Davetiyeyi Kaldır',
                        'Yüklü dijital davetiyeyi kaldırmak istediğinize emin misiniz?',
                        [
                          { text: 'Vazgeç', style: 'cancel' },
                          {
                            text: 'Kaldır',
                            style: 'destructive',
                            onPress: () => setInvitationUrl(''),
                          },
                        ]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={15} color="#EF4444" />
                    <Text style={[styles.invitationActionBtnText, { color: '#EF4444' }]}>Kaldır</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Upload Buttons */}
            <View style={styles.invitationUploadButtonsRow}>
              <TouchableOpacity
                style={[styles.invitationUploadBtn, isUploadingInvitation && styles.uploadBtnDisabled]}
                onPress={handleUploadInvitationImage}
                disabled={isUploadingInvitation}
                activeOpacity={0.85}
              >
                {isUploadingInvitation ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="images" size={16} color="#FFF" />
                    <Text style={styles.invitationUploadBtnText}>
                      {invitationUrl ? 'Görseli Değiştir' : 'Fotoğraf Yükle'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.invitationUploadBtn,
                  styles.invitationUploadDocBtn,
                  isUploadingInvitation && styles.uploadBtnDisabled,
                ]}
                onPress={handleUploadInvitationDoc}
                disabled={isUploadingInvitation}
                activeOpacity={0.85}
              >
                {isUploadingInvitation ? (
                  <ActivityIndicator size="small" color="#8A6D3B" />
                ) : (
                  <>
                    <Ionicons name="document-attach" size={16} color="#8A6D3B" />
                    <Text style={styles.invitationUploadDocBtnText}>
                      {invitationUrl ? 'PDF Değiştir' : 'PDF / Dosya Yükle'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle Manual URL Link */}
            <TouchableOpacity
              style={styles.manualLinkToggle}
              onPress={() => setShowManualInvitationUrl(!showManualInvitationUrl)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showManualInvitationUrl ? 'chevron-up' : 'link-outline'}
                size={14}
                color="#8A6D3B"
              />
              <Text style={styles.manualLinkToggleText}>
                {showManualInvitationUrl
                  ? 'Harici Link Alanını Gizle'
                  : 'Veya Harici Web / LCV Bağlantısı Girin (URL)'}
              </Text>
            </TouchableOpacity>

            {showManualInvitationUrl && (
              <View style={[styles.inputGroup, { marginTop: 6, marginBottom: 0 }]}>
                <Text style={styles.label}>Harici Davetiye Web Linki</Text>
                <TextInput
                  style={styles.input}
                  value={invitationUrl}
                  onChangeText={setInvitationUrl}
                  placeholder="https://orneksite.com/davetiye"
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Text style={styles.fieldHint}>
                  Canva linki, dijital LCV formu veya harici davetiye web sitenizi buraya yapıştırabilirsiniz.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Section 2: Cover Photo & Theme */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>2. Kapak Fotoğrafı & Tema Rengi</Text>

          {/* Current Cover Preview Card with Device Upload Action */}
          <View style={styles.coverPreviewCard}>
            <Image source={{ uri: coverPhotoUrl }} style={styles.coverPreviewImg} />
            <View style={styles.coverPreviewOverlay}>
              <View style={styles.coverActiveBadge}>
                <Ionicons name="image" size={13} color="#FFF" />
                <Text style={styles.coverActiveBadgeText}>Mevcut Kapak Görseli</Text>
              </View>

              <TouchableOpacity
                style={styles.coverUploadActionBtn}
                onPress={handleUploadCoverPhoto}
                disabled={isUploadingCover}
                activeOpacity={0.85}
              >
                {isUploadingCover ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={16} color="#FFF" />
                    <Text style={styles.coverUploadActionBtnText}>
                      Cihazımdan Fotoğraf Yükle
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Veya Hazır Kapak Fotoğraflarından Seçin:</Text>
          <DraggableScrollView contentContainerStyle={styles.presetsScroll}>
            {COVER_PRESETS.map((preset) => {
              const isSelected = coverPhotoUrl === preset.url;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetCard, isSelected && styles.presetCardActive]}
                  onPress={() => setCoverPhotoUrl(preset.url)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: preset.url }} style={styles.presetImage} />
                  <View style={[styles.presetTag, isSelected && styles.presetTagActive]}>
                    <Text style={[styles.presetTagText, isSelected && styles.presetTagTextActive]}>
                      {preset.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </DraggableScrollView>

          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <Text style={styles.label}>Veya Özel Kapak Görseli Linkinizi Girin (URL):</Text>
            <TextInput
              style={styles.input}
              value={coverPhotoUrl}
              onChangeText={setCoverPhotoUrl}
              placeholder="https://..."
            />
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Tema Rengi:</Text>
          <View style={styles.themeRow}>
            {THEME_PRESETS.map((theme) => {
              const isSelected = primaryColor === theme.color;
              return (
                <TouchableOpacity
                  key={theme.color}
                  style={[
                    styles.themeChip,
                    isSelected && { borderColor: theme.color, borderWidth: 2 },
                  ]}
                  onPress={() => setPrimaryColor(theme.color)}
                >
                  <View style={[styles.colorCircle, { backgroundColor: theme.color }]} />
                  <Text style={styles.themeChipText}>{theme.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Hex Color */}
          <View style={[styles.row, { marginTop: 10, alignItems: 'center' }]}>
            <View style={[styles.colorCircle, { backgroundColor: primaryColor, width: 32, height: 32, marginRight: 8 }]} />
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                value={primaryColor}
                onChangeText={setPrimaryColor}
                placeholder="#C5A059"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Section 3: Venue Details */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>3. Düğün / Etkinlik Mekanı & Ulaşım</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mekan Adı</Text>
            <TextInput
              style={styles.input}
              value={venueName}
              onChangeText={setVenueName}
              placeholder="Örn: Sait Halim Paşa Yalısı"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mekan Adresi</Text>
            <TextInput
              style={styles.input}
              value={venueAddress}
              onChangeText={setVenueAddress}
              placeholder="Adres, İlçe / Şehir"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Google Haritalar Linki (Yol Tarifi İçin)</Text>
            <TextInput
              style={styles.input}
              value={mapUrl}
              onChangeText={setMapUrl}
              placeholder="https://maps.google.com/..."
            />
          </View>
        </View>

        {/* Section 4: Event Schedule & Timeline (Program Akışı) */}
        <View style={styles.formCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={styles.cardHeader}>4. Etkinlik Akışı & Zaman Çizelgesi</Text>
            <View style={styles.categoryCountBadge}>
              <Text style={styles.categoryCountBadgeText}>{schedule.length} Madde</Text>
            </View>
          </View>
          <Text style={styles.cardSub}>
            Misafirlerinizin etkinlik boyunca programı (kokteyl, nikah, yemek, pasta vb.) saatleriyle takip etmesini sağlayın.
          </Text>

          {/* Quick Schedule Templates */}
          <Text style={[styles.label, { marginTop: 6 }]}>Hızlı Şablon Ekle:</Text>
          <DraggableScrollView contentContainerStyle={styles.quickScheduleScroll}>
            <TouchableOpacity
              style={styles.quickScheduleChip}
              onPress={() => handleQuickAddSchedule('18:30', 'Karşılama Kokteyli', 'Canlı müzik ve ikramlar')}
            >
              <Text style={styles.quickScheduleChipText}>+ Kokteyl (18:30)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickScheduleChip}
              onPress={() => handleQuickAddSchedule('19:30', 'Nikah Töreni & İlk Dans', 'İlk vals')}
            >
              <Text style={styles.quickScheduleChipText}>+ Nikah & Vals (19:30)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickScheduleChip}
              onPress={() => handleQuickAddSchedule('20:30', 'Akşam Yemeği & Müzik', 'Yemek servisi')}
            >
              <Text style={styles.quickScheduleChipText}>+ Akşam Yemeği (20:30)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickScheduleChip}
              onPress={() => handleQuickAddSchedule('22:00', 'Düğün Pastası Kesimi', 'Pasta merasimi')}
            >
              <Text style={styles.quickScheduleChipText}>+ Pasta Kesimi (22:00)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickScheduleChip}
              onPress={() => handleQuickAddSchedule('23:00', 'After Party & Canlı DJ', 'Gece eğlencesi')}
            >
              <Text style={styles.quickScheduleChipText}>+ After Party (23:00)</Text>
            </TouchableOpacity>
          </DraggableScrollView>

          {/* Existing Schedule Items List */}
          <View style={styles.scheduleList}>
            {schedule.map((item, index) => {
              const isEditing = editingScheduleId === item.id;

              if (isEditing) {
                return (
                  <View key={item.id} style={styles.scheduleEditCard}>
                    <Text style={styles.scheduleEditTitle}>Akış Maddesini Düzenle</Text>
                    <View style={styles.row}>
                      <View style={{ width: 80, marginRight: 8 }}>
                        <Text style={styles.label}>Saat</Text>
                        <TextInput
                          style={styles.input}
                          value={editScheduleTime}
                          onChangeText={setEditScheduleTime}
                          placeholder="19:00"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Başlık</Text>
                        <TextInput
                          style={styles.input}
                          value={editScheduleTitle}
                          onChangeText={setEditScheduleTitle}
                          placeholder="Nikah & Dans"
                        />
                      </View>
                    </View>
                    <View style={[styles.inputGroup, { marginTop: 8 }]}>
                      <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
                      <TextInput
                        style={styles.input}
                        value={editScheduleDesc}
                        onChangeText={setEditScheduleDesc}
                        placeholder="Kısa açıklama..."
                      />
                    </View>
                    <View style={styles.scheduleEditActions}>
                      <TouchableOpacity
                        style={styles.cancelEditBtn}
                        onPress={() => setEditingScheduleId(null)}
                      >
                        <Text style={styles.cancelEditBtnText}>Vazgeç</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveEditBtn}
                        onPress={handleSaveEditSchedule}
                      >
                        <Text style={styles.saveEditBtnText}>Tamamla</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              return (
                <View key={item.id} style={styles.scheduleItemRow}>
                  <View style={styles.scheduleIndexBadge}>
                    <Text style={styles.scheduleIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.scheduleTimeBadge}>
                    <Text style={styles.scheduleTimeText}>{item.time}</Text>
                  </View>
                  <View style={styles.scheduleInfoCol}>
                    <Text style={styles.scheduleTitleText}>{item.title}</Text>
                    {item.description ? (
                      <Text style={styles.scheduleDescText}>{item.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.scheduleActionBtns}>
                    <TouchableOpacity
                      style={styles.scheduleEditBtn}
                      onPress={() => handleStartEditSchedule(item)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="pencil" size={16} color="#8A6D3B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.scheduleDeleteBtn}
                      onPress={() => handleDeleteScheduleItem(item.id)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Add New Schedule Item Form */}
          <View style={styles.addScheduleCard}>
            <Text style={styles.addScheduleHeader}>+ Yeni Akış / Program Maddesi Ekle</Text>
            <View style={styles.row}>
              <View style={{ width: 85, marginRight: 8 }}>
                <Text style={styles.label}>Saat</Text>
                <TextInput
                  style={styles.input}
                  value={newScheduleTime}
                  onChangeText={setNewScheduleTime}
                  placeholder="20:00"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Başlık</Text>
                <TextInput
                  style={styles.input}
                  value={newScheduleTitle}
                  onChangeText={setNewScheduleTitle}
                  placeholder="Örn: Takı Töreni & Eğlence"
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { marginTop: 8 }]}>
              <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
              <TextInput
                style={styles.input}
                value={newScheduleDesc}
                onChangeText={setNewScheduleDesc}
                placeholder="Örn: Sahne önünde tebrik ve fotoğraf çekimi"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.addScheduleBtn,
                !newScheduleTitle.trim() && { opacity: 0.6 },
              ]}
              onPress={handleAddScheduleItem}
              disabled={!newScheduleTitle.trim()}
            >
              <Ionicons name="add-circle" size={18} color="#FFF" />
              <Text style={styles.addScheduleBtnText}>Akışa Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 5: Privacy, Moderation & Live Feed */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>5. Gizlilik, Kurallar & Canlı Yayın</Text>

          {/* PIN Protection */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>PIN Kodu ile Galeriyi Koru</Text>
              <Text style={styles.switchSub}>
                Fotoğraf galerisine yalnızca masadaki PIN koduna sahip misafirler girebilir.
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {isPrivate && (
            <View style={styles.pinBox}>
              <Text style={styles.label}>4 Haneli Giriş PIN Kodu:</Text>
              <TextInput
                style={styles.pinInput}
                value={pinCode}
                onChangeText={setPinCode}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          )}

          {/* Original Quality Upload Option */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.switchLabel}>Orijinal Kalitede Yükle</Text>
                {!enableCompression && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningBadgeText}>Kota Hızlı Dolar</Text>
                  </View>
                )}
              </View>
              <Text style={styles.switchSub}>
                {!enableCompression
                  ? 'Fotoğraflar sıkıştırılmadan orijinal ham çözünürlüğünde (3-8 MB) yüklenir.'
                  : 'Fotoğraflar kalite kaybı olmadan optimize edilerek hızlı yüklenir.'}
              </Text>
            </View>
            <Switch
              value={!enableCompression}
              onValueChange={(val) => setEnableCompression(!val)}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {/* Guest Download Permission */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Misafirler Fotoğraf İndirebilsin</Text>
              <Text style={styles.switchSub}>
                Misafirler galerideki fotoğrafları telefonlarına tek tek veya topluca indirebilir.
              </Text>
            </View>
            <Switch
              value={allowGuestDownloads}
              onValueChange={setAllowGuestDownloads}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {/* Live Feed Projector Toggle */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Canlı Projeksiyon & Slayt Modu</Text>
              <Text style={styles.switchSub}>
                Salondaki dev ekranda yeni yüklenen fotoğraflar canlı olarak yansıtılsın.
              </Text>
            </View>
            <Switch
              value={isLiveFeedActive}
              onValueChange={setIsLiveFeedActive}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {/* Guestbook Toggle */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Ziyaretçi Anı Defteri & Tebrik Notları</Text>
              <Text style={styles.switchSub}>
                Misafirleriniz çiftinize özel tebrik ve iyi dilek notları bırakabilsin.
              </Text>
            </View>
            <Switch
              value={allowGuestbook}
              onValueChange={setAllowGuestbook}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {/* Auto Approve Photos */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Fotoğrafları Otomatik Onayla</Text>
              <Text style={styles.switchSub}>
                Yüklenen fotoğraflar moderasyon beklemeden anında galeride ve canlı yayında görünsün.
              </Text>
            </View>
            <Switch
              value={autoApprovePhotos}
              onValueChange={setAutoApprovePhotos}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>
        </View>

        {/* Section 6: Gallery Categories (Albums) */}
        <View style={styles.formCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={styles.cardHeader}>6. Fotoğraf Galerisi Kategorileri</Text>
            <View style={styles.categoryCountBadge}>
              <Text style={styles.categoryCountBadgeText}>{albums.filter((a) => a.id !== 'alb-all').length} Kategori</Text>
            </View>
          </View>
          <Text style={styles.cardSub}>
            Misafirler fotoğraf yüklerken bu kategorileri seçebilir. 'Genel' varsayılan kategoridir.
          </Text>

          {/* Add Category Input */}
          <View style={styles.addCategoryRow}>
            <TextInput
              style={styles.addCategoryInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Yeni kategori adı (örn: Pasta Kesimi, Kına)"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={[styles.addCategoryBtn, !newCategoryName.trim() && { opacity: 0.5 }]}
              onPress={handleAddCategory}
              disabled={!newCategoryName.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.addCategoryBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Categories List */}
          <View style={styles.categoriesList}>
            {albums
              .filter((a) => a.id !== 'alb-all')
              .map((album) => {
                const isSystem = album.id === 'alb-genel';
                return (
                  <View key={album.id} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <Ionicons
                        name={isSystem ? 'folder' : 'folder-outline'}
                        size={18}
                        color={isSystem ? '#C5A059' : '#8A6D3B'}
                      />
                      <Text style={styles.categoryNameText}>{album.name}</Text>
                      {isSystem && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                        </View>
                      )}
                    </View>
                    {!isSystem && (
                      <TouchableOpacity
                        style={styles.deleteCategoryBtn}
                        onPress={() => handleDeleteCategory(album.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
          </View>
        </View>

        {/* Save CTA Button */}
        <TouchableOpacity
          style={[styles.bigSaveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#FFF" />
              <Text style={styles.bigSaveBtnText}>Etkinliği Kaydet & Hemen Yayınla</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Interactive Calendar Date Picker Modal */}
      <DatePickerModal
        visible={isDatePickerOpen}
        value={eventDateStr}
        onConfirm={setEventDateStr}
        onClose={() => setIsDatePickerOpen(false)}
      />

      {/* Interactive Time Picker Modal */}
      <TimePickerModal
        visible={isTimePickerOpen}
        value={eventTimeStr}
        onConfirm={setEventTimeStr}
        onClose={() => setIsTimePickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scroll: {
    paddingBottom: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8A6D3B',
    fontWeight: '600',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
  },
  saveHeaderBtn: {
    backgroundColor: '#C5A059',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveHeaderBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  headerLogoutText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F3EFE6',
    shadowColor: '#C5A059',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  typeChipsScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    // @ts-ignore
    userSelect: Platform.OS === 'web' ? 'none' : undefined,
  },
  typeChipActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6D3B',
  },
  typeChipTextActive: {
    color: '#FFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1817',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  datePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  datePreviewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  presetsScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  presetCard: {
    width: 140,
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    // @ts-ignore
    userSelect: Platform.OS === 'web' ? 'none' : undefined,
  },
  presetCardActive: {
    borderColor: '#C5A059',
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(26,24,23,0.75)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  presetTagActive: {
    backgroundColor: '#C5A059',
  },
  presetTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  presetTagTextActive: {
    color: '#FFF',
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1817',
  },
  quickScheduleScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  quickScheduleChip: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    // @ts-ignore
    userSelect: Platform.OS === 'web' ? 'none' : undefined,
  },
  quickScheduleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  scheduleList: {
    marginTop: 10,
    gap: 8,
  },
  scheduleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#F3EFE6',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  scheduleIndexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  scheduleTimeBadge: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#C5A059',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scheduleTimeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C5A059',
  },
  scheduleInfoCol: {
    flex: 1,
  },
  scheduleTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
  },
  scheduleDescText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  scheduleActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleEditBtn: {
    padding: 4,
  },
  scheduleDeleteBtn: {
    padding: 4,
  },
  scheduleEditCard: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#C5A059',
    borderRadius: 14,
    padding: 14,
  },
  scheduleEditTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C5A059',
    marginBottom: 10,
  },
  scheduleEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  cancelEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelEditBtnText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveEditBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#C5A059',
  },
  saveEditBtnText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '700',
  },
  addScheduleCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  addScheduleHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D3B',
    marginBottom: 10,
  },
  addScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  addScheduleBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  warningBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  pinBox: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  pinInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#C5A059',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
    color: '#1A1817',
    width: 120,
    alignSelf: 'center',
    marginTop: 4,
  },
  categoryCountBadge: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  addCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addCategoryInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1A1817',
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C5A059',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addCategoryBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#F3EFE6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1817',
  },
  defaultBadge: {
    backgroundColor: '#EFE7DA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A6D3B',
  },
  deleteCategoryBtn: {
    padding: 4,
  },
  bigSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#C5A059',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#C5A059',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  bigSaveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  demoWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  demoWarningIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoWarningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  demoWarningText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
  },
  demoRegisterBtn: {
    backgroundColor: '#B45309',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  demoRegisterBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  labelRowWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  inputLocked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    color: '#6B7280',
  },
  slugLockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  slugPrefixText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  slugValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  slugInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  slugInputContainerSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  slugInputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  slugPrefixWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  slugTextInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  slugResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  slugResetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  slugStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  slugStatusBadgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  slugStatusBadgeError: {
    backgroundColor: '#FEE2E2',
  },
  slugStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  slugStatusBadgeTextSuccess: {
    color: '#059669',
  },
  slugStatusBadgeTextError: {
    color: '#DC2626',
  },
  slugFeedbackText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  slugFeedbackSuccess: {
    color: '#059669',
  },
  slugFeedbackError: {
    color: '#DC2626',
  },
  slugNoticeText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 15,
  },
  helperText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    lineHeight: 15,
  },
  typeChipDisabled: {
    opacity: 0.5,
  },
  tzBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tzBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  timePresetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 2,
  },
  timePresetChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timePresetChipActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  timePresetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  timePresetChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  coverPreviewCard: {
    position: 'relative',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coverPreviewImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'space-between',
    padding: 12,
  },
  coverActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  coverActiveBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  coverUploadActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#C5A059',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  coverUploadActionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dateTimePickersContainer: {
    gap: 12,
    marginBottom: 10,
  },
  pickerTriggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pickerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pickerCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  pickerCardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 2,
  },
  pickerTapHint: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  pickerActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pickerActionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  invitationSectionContainer: {
    marginTop: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  invitationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invitationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  invitationIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invitationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 2,
  },
  invitationSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  invitationPreviewCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  invitationImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invitationThumbImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  invitationPdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pdfIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invitationBadgeTag: {
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  invitationBadgeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  invitationFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1817',
  },
  invitationActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  invitationActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  invitationRemoveBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  invitationActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  invitationUploadButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  invitationUploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  invitationUploadDocBtn: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    shadowOpacity: 0,
    elevation: 0,
  },
  invitationUploadBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  invitationUploadDocBtnText: {
    color: '#8A6D3B',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
  manualLinkToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  manualLinkToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A6D3B',
    textDecorationLine: 'underline',
  },
  fieldHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    lineHeight: 14,
  },
});
