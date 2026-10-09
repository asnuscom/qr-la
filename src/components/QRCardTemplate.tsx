import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'qrcode';
import { EventModel } from '@/types';
import { DraggableScrollView } from '@/components/DraggableScrollView';

interface QRCardTemplateProps {
  event: EventModel;
}

export type CardThemeId = 'gold' | 'marble' | 'sage' | 'rose' | 'kraft' | 'midnight' | 'minimal';
export type CardLayoutId = 'single' | 'tent' | 'double' | 'quad';
export type CardSizeId = 'standard_10x15' | 'square_12x12' | 'large_13x18' | 'mini_85x55' | 'a5_15x21';

export interface CardSizeConfig {
  id: CardSizeId;
  name: string;
  label: string;
  widthMm: number;
  heightMm: number;
  desc: string;
  icon: string;
}

export const CARD_SIZES: Record<CardSizeId, CardSizeConfig> = {
  standard_10x15: {
    id: 'standard_10x15',
    name: 'Standart Masa Kartı',
    label: '10 x 15 cm (A6)',
    widthMm: 100,
    heightMm: 150,
    desc: 'En popüler şık masa kartı ölçüsü, çerçeve ve şövalelere tam uyumlu',
    icon: 'tablet-portrait-outline',
  },
  square_12x12: {
    id: 'square_12x12',
    name: 'Modern Kare Kart',
    label: '12 x 12 cm',
    widthMm: 120,
    heightMm: 120,
    desc: 'Minimalist ve modern masa düzenleri için estetik kare format',
    icon: 'square-outline',
  },
  large_13x18: {
    id: 'large_13x18',
    name: 'Büyük Boy Menü / Şövale',
    label: '13 x 18 cm (5x7")',
    widthMm: 130,
    heightMm: 180,
    desc: 'Büyük masalar, masa ortası şövale veya büyük çerçeveler için',
    icon: 'document-text-outline',
  },
  mini_85x55: {
    id: 'mini_85x55',
    name: 'Kompakt / Mini Kart',
    label: '8.5 x 5.5 cm',
    widthMm: 85,
    heightMm: 55,
    desc: 'Tabak içi peçete üstü veya küçük masa üstü notları için',
    icon: 'card-outline',
  },
  a5_15x21: {
    id: 'a5_15x21',
    name: 'Tam A5 / Karşılama Kartı',
    label: '15 x 21 cm (A5)',
    widthMm: 148,
    heightMm: 210,
    desc: 'Giriş masası, anı köşesi veya tekli büyük karşılama için',
    icon: 'easel-outline',
  },
};

export type CardFontId = 'playfair' | 'greatvibes' | 'cinzel' | 'montserrat' | 'inter';
export type QRIconId = 'camera' | 'heart' | 'sparkles' | 'none';
export type FramePresetId =
  | 'gold_geometric'
  | 'botanical'
  | 'floral_rose'
  | 'baroque_gold'
  | 'art_deco'
  | 'rustic_boho'
  | 'none';

export type CardDesignArchetype = 'classic' | 'polaroid' | 'table_hero' | 'bold_qr' | 'letter';

export interface CardDesignConfig {
  id: CardDesignArchetype;
  name: string;
  badge: string;
  desc: string;
  icon: string;
}

export const CARD_DESIGNS: Record<CardDesignArchetype, CardDesignConfig> = {
  classic: {
    id: 'classic',
    name: 'Klasik Davetiye',
    badge: '👑 Popüler',
    desc: 'Büyük isimler, zarif rozet ve dengeli dikey akış',
    icon: 'mail-outline',
  },
  polaroid: {
    id: 'polaroid',
    name: 'Vintage Polaroid',
    badge: '📸 Eğlenceli',
    desc: 'Retro anı fotoğrafı stili, alt kısımda el yazısı not',
    icon: 'camera-outline',
  },
  table_hero: {
    id: 'table_hero',
    name: 'Masa No Odaklı',
    badge: '🍽️ Masa Standı',
    desc: 'Üstte devasa asil masa numarası, tam masa standı',
    icon: 'restaurant-outline',
  },
  bold_qr: {
    id: 'bold_qr',
    name: 'Büyük & Net QR',
    badge: '⚡ Hızlı Tarama',
    desc: 'Maksimum boyutta QR kod, uzaktan anında tarama',
    icon: 'qr-code-outline',
  },
  letter: {
    id: 'letter',
    name: 'Teşekkür Mektubu',
    badge: '💌 Samimi Not',
    desc: 'Misafirlere özel sıcak karşılama ve teşekkür metni',
    icon: 'heart-outline',
  },
};

interface ThemeConfig {
  id: CardThemeId;
  name: string;
  desc: string;
  border: string;
  innerBorder: string;
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

const THEME_CONFIGS: Record<CardThemeId, ThemeConfig> = {
  gold: {
    id: 'gold',
    name: 'Altın Zarafet',
    desc: 'Lüks şampanya tonları & altın çerçeve',
    border: '#C5A059',
    innerBorder: '#E6CF9B',
    cardBg: '#FFFEFA',
    badgeBg: '#FAF5EA',
    badgeBorder: '#EAD7BB',
    badgeTextColor: '#8A6D3B',
    namesColor: '#8A6D3B',
    primaryTextColor: '#1A1817',
    accentColor: '#C5A059',
    dotColor: '#C5A059',
  },
  marble: {
    id: 'marble',
    name: 'Lüks Mermer',
    desc: 'Zarif beyaz mermer & altın yaldız',
    border: '#C5A059',
    innerBorder: '#D8C39D',
    cardBg: '#F8F9FA',
    badgeBg: '#F3F4F6',
    badgeBorder: '#D1D5DB',
    badgeTextColor: '#4B5563',
    namesColor: '#1F2937',
    primaryTextColor: '#111827',
    accentColor: '#C5A059',
    dotColor: '#C5A059',
  },
  sage: {
    id: 'sage',
    name: 'Rustik Botanik',
    desc: 'Doğal yeşillik, yaprak tonları & zümrüt',
    border: '#2D5A43',
    innerBorder: '#7FA690',
    cardBg: '#F7FAF8',
    badgeBg: '#EDF5F1',
    badgeBorder: '#BED6C9',
    badgeTextColor: '#2D5A43',
    namesColor: '#2D5A43',
    primaryTextColor: '#172E22',
    accentColor: '#478062',
    dotColor: '#2D5A43',
  },
  rose: {
    id: 'rose',
    name: 'Romantik Gül',
    desc: 'Pudra pembe, gül kurusu & sıcak tonlar',
    border: '#B76E79',
    innerBorder: '#DEAFB6',
    cardBg: '#FFF9FA',
    badgeBg: '#FDF2F4',
    badgeBorder: '#F2CDD4',
    badgeTextColor: '#9B4D58',
    namesColor: '#9B4D58',
    primaryTextColor: '#381E24',
    accentColor: '#B76E79',
    dotColor: '#B76E79',
  },
  kraft: {
    id: 'kraft',
    name: 'Doğal Kraft',
    desc: 'Doğal organik saman kağıdı & samimi hava',
    border: '#8C6D4F',
    innerBorder: '#BF9E7E',
    cardBg: '#F4ECE1',
    badgeBg: '#E9DEC9',
    badgeBorder: '#CBB499',
    badgeTextColor: '#6E4E30',
    namesColor: '#5C3E25',
    primaryTextColor: '#3E2A18',
    accentColor: '#8C6D4F',
    dotColor: '#8C6D4F',
  },
  midnight: {
    id: 'midnight',
    name: 'Gece & Altın',
    desc: 'Asil siyah kağıt üzerine parlayan altın',
    border: '#C5A059',
    innerBorder: '#E6CF9B',
    cardBg: '#141312',
    badgeBg: '#242220',
    badgeBorder: '#C5A059',
    badgeTextColor: '#E5C07A',
    namesColor: '#F3D492',
    primaryTextColor: '#F9F6F0',
    accentColor: '#C5A059',
    dotColor: '#F3D492',
    isDark: true,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Beyaz',
    desc: 'Mürekkep tasarruflu, temiz ve modern',
    border: '#27272A',
    innerBorder: '#A1A1AA',
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

const FONT_CONFIGS: Record<
  CardFontId,
  { name: string; styleName: string; family: string; desc: string }
> = {
  playfair: {
    name: 'Playfair Display',
    styleName: 'Zarif Klasik Serif',
    family: "'Playfair Display', Georgia, serif",
    desc: 'Düğün davetiyeleri ve lüks etkinlikler için klasik zarafet',
  },
  greatvibes: {
    name: 'Great Vibes',
    styleName: 'Romantik Kaligrafi',
    family: "'Great Vibes', cursive, serif",
    desc: 'Sanatsal ve romantik el yazısı stili',
  },
  cinzel: {
    name: 'Cinzel',
    styleName: 'Asil Kraliyet / Roman',
    family: "'Cinzel', Times New Roman, serif",
    desc: 'Görkemli ve soylu bir atmosfer',
  },
  montserrat: {
    name: 'Montserrat',
    styleName: 'Modern Şık Sans',
    family: "'Montserrat', sans-serif",
    desc: 'Çağdaş, dinamik ve net okunan başlıklar',
  },
  inter: {
    name: 'Inter / Minimal',
    styleName: 'Temiz Minimalist',
    family: "'Inter', -apple-system, sans-serif",
    desc: 'Sade, göz yormayan geometrik yazı tipi',
  },
};

export interface FramePresetConfig {
  id: FramePresetId;
  name: string;
  badge: string;
  desc: string;
  icon: string;
  previewBorderColor: string;
  suggestedTheme: CardThemeId;
  getSvg: (borderColor: string, accentColor: string) => string;
}

export const FRAME_PRESETS: Record<FramePresetId, FramePresetConfig> = {
  gold_geometric: {
    id: 'gold_geometric',
    name: 'Altın Geometrik',
    badge: '✨ Lüks',
    desc: 'Elmas köşe kesimleri ve yaldızlı çift çerçeve',
    icon: 'sparkles',
    previewBorderColor: '#C5A059',
    suggestedTheme: 'gold',
    getSvg: (border, accent) => `
      <svg width="100%" height="100%" viewBox="0 0 400 560" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="12" width="376" height="536" rx="16" fill="none" stroke="${border}" stroke-width="2"/>
        <rect x="20" y="20" width="360" height="520" rx="12" fill="none" stroke="${accent}" stroke-width="0.9" stroke-dasharray="5,2.5"/>
        <polygon points="12,36 36,12 12,12" fill="${border}" opacity="0.35"/>
        <polygon points="388,36 364,12 388,12" fill="${border}" opacity="0.35"/>
        <polygon points="12,524 36,548 12,548" fill="${border}" opacity="0.35"/>
        <polygon points="388,524 364,548 388,548" fill="${border}" opacity="0.35"/>
        <path d="M 38,12 L 38,38 L 12,38" fill="none" stroke="${border}" stroke-width="2.2"/>
        <path d="M 362,12 L 362,38 L 388,38" fill="none" stroke="${border}" stroke-width="2.2"/>
        <path d="M 38,548 L 38,522 L 12,522" fill="none" stroke="${border}" stroke-width="2.2"/>
        <path d="M 362,548 L 362,522 L 388,522" fill="none" stroke="${border}" stroke-width="2.2"/>
      </svg>
    `,
  },
  botanical: {
    id: 'botanical',
    name: 'Botanik Okaliptüs',
    badge: '🌿 Doğa',
    desc: 'Köşelerden sarkan zümrüt ve okaliptüs dalları',
    icon: 'leaf',
    previewBorderColor: '#2D5A43',
    suggestedTheme: 'sage',
    getSvg: (border, accent) => `
      <svg width="100%" height="100%" viewBox="0 0 400 560" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="14" width="372" height="532" rx="16" fill="none" stroke="${border}" stroke-width="1.8" stroke-opacity="0.75"/>
        <rect x="22" y="22" width="356" height="516" rx="12" fill="none" stroke="${accent}" stroke-width="0.8" stroke-opacity="0.45"/>
        <g fill="#2D5A43" opacity="0.85">
          <path d="M 14,14 Q 38,28 54,20 Q 42,42 14,38 Z"/>
          <path d="M 28,14 Q 46,36 66,32 Q 50,52 26,44 Z" opacity="0.65"/>
          <path d="M 14,34 Q 32,48 24,70 Q 10,54 14,34 Z" opacity="0.75"/>
          <circle cx="58" cy="22" r="3" fill="#478062"/>
          <circle cx="28" cy="56" r="2.5" fill="#478062"/>
        </g>
        <g fill="#2D5A43" opacity="0.85">
          <path d="M 386,14 Q 362,28 346,20 Q 358,42 386,38 Z"/>
          <path d="M 372,14 Q 354,36 334,32 Q 350,52 374,44 Z" opacity="0.65"/>
          <path d="M 386,34 Q 368,48 376,70 Q 390,54 386,34 Z" opacity="0.75"/>
          <circle cx="342" cy="22" r="3" fill="#478062"/>
          <circle cx="372" cy="56" r="2.5" fill="#478062"/>
        </g>
        <g fill="#2D5A43" opacity="0.85">
          <path d="M 14,546 Q 38,532 54,540 Q 42,518 14,522 Z"/>
          <path d="M 28,546 Q 46,524 66,528 Q 50,508 26,516 Z" opacity="0.65"/>
          <path d="M 14,526 Q 32,512 24,490 Q 10,506 14,526 Z" opacity="0.75"/>
        </g>
        <g fill="#2D5A43" opacity="0.85">
          <path d="M 386,546 Q 362,532 346,540 Q 358,518 386,522 Z"/>
          <path d="M 372,546 Q 354,524 334,528 Q 350,508 374,516 Z" opacity="0.65"/>
          <path d="M 386,526 Q 368,512 376,490 Q 390,506 386,526 Z" opacity="0.75"/>
        </g>
      </svg>
    `,
  },
  floral_rose: {
    id: 'floral_rose',
    name: 'Romantik Gül Çerçevesi',
    badge: '🌸 Romantik',
    desc: 'Pudra pembe güller ve zarif köşe buketleri',
    icon: 'flower',
    previewBorderColor: '#B76E79',
    suggestedTheme: 'rose',
    getSvg: (border, accent) => `
      <svg width="100%" height="100%" viewBox="0 0 400 560" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="14" width="372" height="532" rx="16" fill="none" stroke="${border}" stroke-width="1.8" stroke-opacity="0.8"/>
        <rect x="22" y="22" width="356" height="516" rx="12" fill="none" stroke="${accent}" stroke-width="0.8" stroke-dasharray="6,3"/>
        <g fill="#B76E79">
          <circle cx="36" cy="36" r="9" fill="#B76E79" opacity="0.85"/>
          <circle cx="34" cy="34" r="5.5" fill="#FFF" opacity="0.35"/>
          <circle cx="48" cy="28" r="5" fill="#DEAFB6" opacity="0.9"/>
          <circle cx="28" cy="48" r="5" fill="#DEAFB6" opacity="0.9"/>
          <path d="M 50,40 Q 64,44 68,36 Q 58,50 46,46 Z" fill="#4D7C5F" opacity="0.8"/>
          <path d="M 40,50 Q 44,64 36,68 Q 50,58 46,46 Z" fill="#4D7C5F" opacity="0.8"/>
        </g>
        <g fill="#B76E79">
          <circle cx="364" cy="36" r="9" fill="#B76E79" opacity="0.85"/>
          <circle cx="366" cy="34" r="5.5" fill="#FFF" opacity="0.35"/>
          <circle cx="352" cy="28" r="5" fill="#DEAFB6" opacity="0.9"/>
          <circle cx="372" cy="48" r="5" fill="#DEAFB6" opacity="0.9"/>
          <path d="M 350,40 Q 336,44 332,36 Q 342,50 354,46 Z" fill="#4D7C5F" opacity="0.8"/>
          <path d="M 360,50 Q 356,64 364,68 Q 350,58 354,46 Z" fill="#4D7C5F" opacity="0.8"/>
        </g>
        <g fill="#B76E79">
          <circle cx="36" cy="524" r="9" fill="#B76E79" opacity="0.85"/>
          <circle cx="34" cy="526" r="5.5" fill="#FFF" opacity="0.35"/>
          <circle cx="48" cy="532" r="5" fill="#DEAFB6" opacity="0.9"/>
          <circle cx="28" cy="512" r="5" fill="#DEAFB6" opacity="0.9"/>
        </g>
        <g fill="#B76E79">
          <circle cx="364" cy="524" r="9" fill="#B76E79" opacity="0.85"/>
          <circle cx="366" cy="526" r="5.5" fill="#FFF" opacity="0.35"/>
          <circle cx="352" cy="532" r="5" fill="#DEAFB6" opacity="0.9"/>
          <circle cx="372" cy="512" r="5" fill="#DEAFB6" opacity="0.9"/>
        </g>
      </svg>
    `,
  },
  baroque_gold: {
    id: 'baroque_gold',
    name: 'Barok Saray Yaldızı',
    badge: '👑 Asil',
    desc: 'Klasik saray motifleri, oymalar ve üst taç',
    icon: 'ribbon',
    previewBorderColor: '#C5A059',
    suggestedTheme: 'gold',
    getSvg: (border, accent) => `
      <svg width="100%" height="100%" viewBox="0 0 400 560" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="16" width="368" height="528" rx="16" fill="none" stroke="${border}" stroke-width="2.2"/>
        <rect x="24" y="24" width="352" height="512" rx="10" fill="none" stroke="${accent}" stroke-width="1" stroke-opacity="0.6"/>
        <path d="M 180,16 Q 200,4 220,16 Q 206,12 200,22 Q 194,12 180,16 Z" fill="${border}"/>
        <circle cx="200" cy="8" r="3" fill="${border}"/>
        <path d="M 180,544 Q 200,556 220,544 Q 206,548 200,538 Q 194,548 180,544 Z" fill="${border}"/>
        <circle cx="200" cy="552" r="3" fill="${border}"/>
        <path d="M 16,56 Q 32,32 56,16 Q 38,38 38,56 Z" fill="${border}" opacity="0.85"/>
        <path d="M 384,56 Q 368,32 344,16 Q 362,38 362,56 Z" fill="${border}" opacity="0.85"/>
        <path d="M 16,504 Q 32,528 56,544 Q 38,522 38,504 Z" fill="${border}" opacity="0.85"/>
        <path d="M 384,504 Q 368,528 344,544 Q 362,522 362,504 Z" fill="${border}" opacity="0.85"/>
      </svg>
    `,
  },
  art_deco: {
    id: 'art_deco',
    name: 'Art-Deco Çift Hat',
    badge: '📐 Modern',
    desc: '1920ler zarafeti, basamaklı keskin geometrik çizgiler',
    icon: 'diamond',
    previewBorderColor: '#8A6D3B',
    suggestedTheme: 'minimal',
    getSvg: (border, accent) => `
      <svg width="100%" height="100%" viewBox="0 0 400 560" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="14" width="372" height="532" rx="4" fill="none" stroke="${border}" stroke-width="2"/>
        <rect x="22" y="22" width="356" height="516" rx="2" fill="none" stroke="${accent}" stroke-width="1.2"/>
        <path d="M 14,40 L 40,40 L 40,14" fill="none" stroke="${border}" stroke-width="1.8"/>
        <path d="M 386,40 L 360,40 L 360,14" fill="none" stroke="${border}" stroke-width="1.8"/>
        <path d="M 14,520 L 40,520 L 40,546" fill="none" stroke="${border}" stroke-width="1.8"/>
        <path d="M 386,520 L 360,520 L 360,546" fill="none" stroke="${border}" stroke-width="1.8"/>
        <polygon points="200,10 203,18 211,20 203,22 200,30 197,22 189,20 197,18" fill="${border}"/>
        <polygon points="200,530 203,538 211,540 203,542 200,550 197,542 189,540 197,538" fill="${border}"/>
      </svg>
    `,
  },
  rustic_boho: {
    id: 'rustic_boho',
    name: 'Rustik Doğal Kraft',
    badge: '🌾 Samimi',
    desc: 'Doğal saman, ahşap hatlar ve pampas esintisi',
    icon: 'bonfire',
    previewBorderColor: '#8C6D4F',
    suggestedTheme: 'kraft',
    getSvg: (border, accent) => `
      <svg width="100%" height="100%" viewBox="0 0 400 560" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="14" width="372" height="532" rx="18" fill="none" stroke="${border}" stroke-width="2" stroke-dasharray="12,5"/>
        <rect x="22" y="22" width="356" height="516" rx="14" fill="none" stroke="${accent}" stroke-width="1"/>
        <circle cx="34" cy="34" r="5" fill="${border}"/>
        <circle cx="366" cy="34" r="5" fill="${border}"/>
        <circle cx="34" cy="526" r="5" fill="${border}"/>
        <circle cx="366" cy="526" r="5" fill="${border}"/>
      </svg>
    `,
  },
  none: {
    id: 'none',
    name: 'Sade / Çerçevesiz',
    badge: '⚪ Düz',
    desc: 'Süslemesiz, minimalist temiz kart',
    icon: 'square-outline',
    previewBorderColor: '#9CA3AF',
    suggestedTheme: 'minimal',
    getSvg: () => '',
  },
};

export const QRCardTemplate: React.FC<QRCardTemplateProps> = ({ event }) => {
  // Card Design Archetype
  const [cardDesign, setCardDesign] = useState<CardDesignArchetype>('classic');

  // Theme, Frame & Layout
  const [cardTheme, setCardTheme] = useState<CardThemeId>('gold');
  const [framePreset, setFramePreset] = useState<FramePresetId>('gold_geometric');
  const [cardLayout, setCardLayout] = useState<CardLayoutId>('single');
  const [cardSize, setCardSize] = useState<CardSizeId>('standard_10x15');
  const [fontFamily, setFontFamily] = useState<CardFontId>('playfair');
  const [qrColor, setQrColor] = useState<string>('#1A1817');
  const [qrIcon, setQrIcon] = useState<QRIconId>('camera');

  // Custom bride and groom names
  const [brideName, setBrideName] = useState(
    event.hosts?.brideOrPrimary || 'Şule'
  );
  const [groomName, setGroomName] = useState(
    event.hosts?.groomOrSecondary || 'Samet'
  );

  const customTitle = useMemo(() => {
    const b = brideName.trim();
    const g = groomName.trim();
    if (b && g) return `${b} & ${g}`;
    return b || g || event.title || 'Şule & Samet';
  }, [brideName, groomName, event.title]);
  const [customDateOrSub, setCustomDateOrSub] = useState(
    new Date(event.eventDate).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );
  const [actionTitle, setActionTitle] = useState('Fotoğrafları Bizimle Paylaşın');
  const [customSlogan, setCustomSlogan] = useState(
    'Kameranızı açıp QR kodu okutun, en özel kareleri bizimle paylaşın!'
  );
  const [footerText, setFooterText] = useState(`qr-la.com/${event.slug}`);

  // Table number & Batch mode
  const [showTableNumber, setShowTableNumber] = useState(false);
  const [singleTableNumber, setSingleTableNumber] = useState('1');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchFrom, setBatchFrom] = useState('1');
  const [batchTo, setBatchTo] = useState('10');
  const [badgeText, setBadgeText] = useState('FOTOĞRAF & ANI PAYLAŞIMI');

  // Steps visibility
  const [showSteps, setShowSteps] = useState(true);
  const [step1, setStep1] = useState('1. Tara');
  const [step2, setStep2] = useState('2. Yükle');
  const [step3, setStep3] = useState('3. Ekranda Gör');

  // Background Image Upload & Opacity
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.25);

  // High-Res base64 QR Code
  const [base64Qr, setBase64Qr] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(true);

  const targetUrl = `https://qr-la.com/${event.slug}`;
  const theme = THEME_CONFIGS[cardTheme];
  const selectedFont = FONT_CONFIGS[fontFamily];
  const currentFrame = FRAME_PRESETS[framePreset];

  // Load Google Fonts on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const fontLinkId = 'qr-google-fonts';
      if (!document.getElementById(fontLinkId)) {
        const link = document.createElement('link');
        link.id = fontLinkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Great+Vibes&family=Montserrat:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Inter:wght@400;600;800&display=swap';
        document.head.appendChild(link);
      }

      // Add direct page print CSS so even Ctrl+P prints cleanly
      const printStyleId = 'qr-print-page-styles';
      let styleTag = document.getElementById(printStyleId) as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = printStyleId;
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = `
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
          body, html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, header, nav, [data-no-print="true"] {
            display: none !important;
          }
        }
      `;
    }
  }, []);

  // Generate Base64 QR Code using 'qrcode' package
  useEffect(() => {
    let isCancelled = false;
    const generateQr = async () => {
      setIsGeneratingQr(true);
      try {
        const actualQrDark = qrColor;
        const actualQrLight = theme.isDark ? '#141312' : '#FFFFFF';
        const dataUrl = await QRCode.toDataURL(targetUrl, {
          width: 900,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: {
            dark: actualQrDark,
            light: actualQrLight,
          },
        });
        if (!isCancelled) {
          setBase64Qr(dataUrl);
          setIsGeneratingQr(false);
        }
      } catch (err) {
        console.error('QR code generation error:', err);
        if (!isCancelled) {
          setIsGeneratingQr(false);
        }
      }
    };

    generateQr();
    return () => {
      isCancelled = true;
    };
  }, [targetUrl, qrColor, theme.isDark]);

  // Pick Custom Background Image
  const handlePickBgImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.85,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setCustomBgUrl(res.assets[0].uri);
      }
    } catch (e) {
      console.warn('BG image pick error:', e);
      Alert.alert('Hata', 'Görsel seçilirken bir sorun oluştu.');
    }
  };

  // Generate HTML for iframe print (pure, clean, independent of page DOM)
  const buildPrintHtml = (tableList: (string | null)[]) => {
    const isDark = theme.isDark;
    const frameSvg = currentFrame ? currentFrame.getSvg(theme.border, theme.innerBorder) : '';

    const sizeConf = CARD_SIZES[cardSize] || CARD_SIZES.standard_10x15;
    let cardW = sizeConf.widthMm;
    let cardH = sizeConf.heightMm;

    if (cardLayout === 'tent') {
      cardW = Math.min(cardW, 140);
      cardH = Math.min(cardH, 130);
    } else if (cardLayout === 'double') {
      cardW = Math.min(cardW, 140);
      cardH = Math.min(cardH, 130);
    } else if (cardLayout === 'quad') {
      cardW = Math.min(cardW, 94);
      cardH = Math.min(cardH, 134);
    }

    const isLandscapeMini = cardSize === 'mini_85x55' || (cardW > cardH * 1.2 && cardH <= 75);

    // Baseline reference: 100mm x 150mm standard card
    // Responsive scale factor based on card dimensions
    const scale = isLandscapeMini
      ? 0.72
      : Math.min(1.4, Math.max(0.68, Math.min(cardW / 100, cardH / 150)));

    const qrPx = isLandscapeMini
      ? 80
      : cardDesign === 'bold_qr'
      ? Math.round(170 * scale)
      : cardDesign === 'letter'
      ? Math.round(125 * scale)
      : cardDesign === 'table_hero'
      ? Math.round(135 * scale)
      : cardDesign === 'polaroid'
      ? Math.round(140 * scale)
      : Math.round(140 * scale);

    const coupleNamePx = isLandscapeMini ? 15 : Math.max(14, Math.round(24 * scale));
    const badgeFontPx = isLandscapeMini ? 8.5 : Math.max(8.5, Math.round(11 * scale));
    const actionTitlePx = isLandscapeMini ? 11 : Math.max(10, Math.round(14 * scale));
    const sloganPx = isLandscapeMini ? 8 : Math.max(7.5, Math.round(10.5 * scale));
    const dateTagPx = isLandscapeMini ? 8 : Math.max(8, Math.round(10 * scale));
    const footerLinkPx = isLandscapeMini ? 8.5 : Math.max(8.5, Math.round(11.5 * scale));
    const stepFontPx = Math.max(7, Math.round(9 * scale));
    const stepCirclePx = Math.max(10, Math.round(14 * scale));
    const cardBoxPadMm = isLandscapeMini ? 2 : Math.max(2, Math.round(3.5 * scale));
    const innerFramePadMm = isLandscapeMini ? 3 : Math.max(3, Math.round(5.5 * scale));

    let gridStyles = '';
    let cardDimensionStyles = '';

    if (cardLayout === 'single') {
      gridStyles = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        page-break-after: always;
      `;
      cardDimensionStyles = `
        width: ${cardW}mm;
        height: ${cardH}mm;
        max-height: ${cardH}mm;
        box-sizing: border-box;
        overflow: hidden;
        margin: 0 auto;
      `;
    } else if (cardLayout === 'tent') {
      gridStyles = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        page-break-after: always;
      `;
      cardDimensionStyles = `
        width: ${cardW}mm;
        height: ${cardH}mm;
        max-height: ${cardH}mm;
        box-sizing: border-box;
        overflow: hidden;
        margin: 0 auto;
      `;
    } else if (cardLayout === 'double') {
      gridStyles = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6mm;
        min-height: 100vh;
        page-break-after: always;
      `;
      cardDimensionStyles = `
        width: ${cardW}mm;
        height: ${cardH}mm;
        max-height: ${cardH}mm;
        box-sizing: border-box;
        overflow: hidden;
        margin: 0 auto;
      `;
    } else {
      gridStyles = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 6mm;
        align-items: center;
        justify-items: center;
        min-height: 100vh;
        page-break-after: always;
      `;
      cardDimensionStyles = `
        width: ${cardW}mm;
        height: ${cardH}mm;
        max-height: ${cardH}mm;
        box-sizing: border-box;
        overflow: hidden;
        margin: 0 auto;
      `;
    }

    const renderSingleCardHtml = (currentTable: string | null, isBackSide = false) => {
      const badgeDisplay = currentTable ? `MASA ${currentTable}` : badgeText;
      const centerIconSymbol =
        qrIcon === 'camera'
          ? '📸'
          : qrIcon === 'heart'
          ? '❤️'
          : qrIcon === 'sparkles'
          ? '✨'
          : '';

      const customBgHtml = customBgUrl
        ? `<div class="custom-bg-layer" style="background-image: url('${customBgUrl}');"></div>`
        : '';

      const overlayHtml = customBgUrl && overlayOpacity > 0
        ? `<div class="bg-overlay-layer" style="background-color: ${isDark ? '#000000' : '#FFFFFF'}; opacity: ${overlayOpacity};"></div>`
        : '';

      const innerBgColor = customBgUrl
        ? isDark
          ? `rgba(20, 19, 18, ${Math.max(0.78, 1 - overlayOpacity)})`
          : `rgba(255, 255, 255, ${Math.max(0.78, 1 - overlayOpacity)})`
        : theme.cardBg;

      const frameSvgHtml = frameSvg
        ? `<div class="frame-svg-layer">${frameSvg}</div>`
        : '';

      const stepsHtml = showSteps
        ? `
        <div class="steps-row">
          <div class="step-box">
            <div class="step-circle">📱</div>
            <div class="step-text">${step1}</div>
          </div>
          <div class="step-divider"></div>
          <div class="step-box">
            <div class="step-circle">☁️</div>
            <div class="step-text">${step2}</div>
          </div>
          <div class="step-divider"></div>
          <div class="step-box">
            <div class="step-circle">📺</div>
            <div class="step-text">${step3}</div>
          </div>
        </div>
      `
        : '';

      const buildCoupleNamesHtml = (fontSize = '24px', isScript = false, maxAmpWidth = '140px') => `
        <div class="couple-names-block">
          <div class="couple-name-line bride-line" style="color: ${theme.namesColor}; font-family: ${isScript ? "'Great Vibes', cursive" : selectedFont.family}; font-size: ${fontSize};">
            ${brideName || 'Gelin'}
          </div>
          <div class="ampersand-divider" style="max-width: ${maxAmpWidth};">
            <span class="amp-line" style="background: ${theme.accentColor}55;"></span>
            <span class="ampersand-char" style="color: ${theme.accentColor};">&</span>
            <span class="amp-line" style="background: ${theme.accentColor}55;"></span>
          </div>
          <div class="couple-name-line groom-line" style="color: ${theme.namesColor}; font-family: ${isScript ? "'Great Vibes', cursive" : selectedFont.family}; font-size: ${fontSize};">
            ${groomName || 'Damat'}
          </div>
        </div>
      `;

      // SPECIAL LANDSCAPE MINI CARD LAYOUT (8.5 x 5.5 cm)
      if (isLandscapeMini) {
        return `
          <div class="card-box" style="${cardDimensionStyles}; background: ${theme.cardBg}; border-color: ${theme.border}; padding: 2.5mm;">
            ${customBgHtml}
            ${overlayHtml}
            ${frameSvgHtml}
            <div class="inner-frame" style="border-color: ${theme.innerBorder}; background-color: ${innerBgColor}; padding: 3mm 4mm; display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 3.5mm; height: 100%;">
              <!-- Left Column: Details -->
              <div style="flex: 1.15; display: flex; flex-direction: column; justify-content: center; text-align: left; overflow: hidden; height: 100%;">
                <div class="date-tag" style="color: ${isDark ? '#A1A1AA' : '#6B7280'}; font-size: 8px; margin-bottom: 2px;">
                  ${customDateOrSub}
                </div>
                <div style="color: ${theme.namesColor}; font-family: ${selectedFont.family}; font-size: 14px; font-weight: 800; line-height: 1.15; margin-bottom: 3px; word-break: break-word;">
                  ${brideName || 'Gelin'} & ${groomName || 'Damat'}
                </div>
                <div class="badge" style="background: ${theme.badgeBg}; border-color: ${theme.badgeBorder}; color: ${theme.badgeTextColor}; font-size: 8px; padding: 2px 7px; margin-bottom: 3px; display: inline-block; width: fit-content;">
                  ${badgeDisplay}
                </div>
                <div class="action-title" style="color: ${theme.primaryTextColor}; font-size: 9px; font-weight: 700; margin-bottom: 1px;">
                  ${actionTitle}
                </div>
                <div class="slogan" style="color: ${isDark ? '#D4D4D8' : '#4B5563'}; font-size: 7.5px; line-height: 1.2; margin: 0;">
                  ${customSlogan}
                </div>
              </div>
              <!-- Right Column: QR Target -->
              <div style="flex: 0.85; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <div class="qr-wrapper" style="border-color: ${theme.border}; background: ${isDark ? '#141312' : '#FFFFFF'}; margin-bottom: 2px; padding: 3px;">
                  <img src="${base64Qr}" alt="QR Kod" style="width: 78px; height: 78px; display: block;" />
                  ${centerIconSymbol ? `<div class="qr-center-icon" style="background: ${theme.accentColor}; color: #FFF; width: 18px; height: 18px; font-size: 9px;">${centerIconSymbol}</div>` : ''}
                </div>
                <div class="footer-link" style="color: ${theme.namesColor}; font-size: 7.5px;">
                  ${footerText}
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // ARCHETYPE 1: POLAROID PHOTO
      if (cardDesign === 'polaroid') {
        return `
          <div class="card-box polaroid-box" style="${cardDimensionStyles}; background: #FFF; border-color: #E5E7EB; border-width: 1px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); padding: ${Math.round(14 * scale)}px ${Math.round(14 * scale)}px ${Math.round(26 * scale)}px ${Math.round(14 * scale)}px;">
            ${customBgHtml}
            ${overlayHtml}
            <div class="polaroid-photo-frame" style="background: ${customBgUrl ? (isDark ? 'rgba(28, 25, 23, 0.92)' : 'rgba(249, 250, 251, 0.94)') : (isDark ? '#1C1917' : '#F9FAFB')}; border: 1.5px solid ${theme.border}; border-radius: 10px; padding: ${Math.round(16 * scale)}px ${Math.round(10 * scale)}px; position: relative;">
              ${currentTable ? `<div class="polaroid-table-tag" style="background: ${theme.accentColor}; color: #FFF; font-size: ${badgeFontPx}px;">MASA ${currentTable}</div>` : ''}
              <div class="qr-wrapper" style="border-color: ${theme.border}; background: #FFF; margin: 0 auto ${Math.round(8 * scale)}px auto;">
                <img src="${base64Qr}" alt="QR Kod" class="qr-img" style="width: ${qrPx}px; height: ${qrPx}px;" />
                ${centerIconSymbol ? `<div class="qr-center-icon" style="background: ${theme.accentColor}; color: #FFF;">${centerIconSymbol}</div>` : ''}
              </div>
              <div class="action-title" style="color: ${theme.primaryTextColor}; font-size: ${actionTitlePx}px; margin-top: 4px;">
                📸 ${isBackSide ? 'Anı Defterimize Not Bırakın' : actionTitle}
              </div>
            </div>
            <div class="polaroid-caption" style="margin-top: ${Math.round(8 * scale)}px; text-align: center;">
              ${buildCoupleNamesHtml(coupleNamePx + 'px', true, Math.round(130 * scale) + 'px')}
              <div class="date-tag" style="color: #6B7280; font-size: ${dateTagPx}px; margin-top: 2px;">
                ${customDateOrSub} • ${footerText}
              </div>
            </div>
          </div>
        `;
      }

      // ARCHETYPE 2: TABLE NUMBER HERO
      if (cardDesign === 'table_hero') {
        const medSize = Math.round(58 * scale);
        return `
          <div class="card-box ${isDark ? 'dark-card' : ''}" style="${cardDimensionStyles}; background: ${theme.cardBg}; border-color: ${theme.border};">
            ${customBgHtml}
            ${overlayHtml}
            ${frameSvgHtml}
            <div class="inner-frame" style="border-color: ${theme.innerBorder}; background-color: ${innerBgColor}; padding: ${innerFramePadMm}mm;">
              <!-- Giant Table Number Medallion -->
              <div class="table-hero-medallion" style="border: 2px solid ${theme.accentColor}; background: ${theme.badgeBg}; width: ${medSize}px; height: ${medSize}px; border-radius: ${Math.round(medSize / 2)}px; margin-bottom: ${Math.round(6 * scale)}px;">
                <div class="table-hero-label" style="color: ${theme.badgeTextColor}; font-size: ${Math.max(7, Math.round(8.5 * scale))}px;">MASA</div>
                <div class="table-hero-num" style="color: ${theme.namesColor}; font-family: ${selectedFont.family}; font-size: ${Math.round(24 * scale)}px;">
                  ${currentTable || '1'}
                </div>
              </div>

              ${buildCoupleNamesHtml(Math.round(coupleNamePx * 0.9) + 'px', false, Math.round(120 * scale) + 'px')}

              <div class="qr-wrapper" style="border-color: ${theme.border}; background: ${isDark ? '#141312' : '#FFFFFF'};">
                <img src="${base64Qr}" alt="QR Kod" class="qr-img" style="width: ${qrPx}px; height: ${qrPx}px;" />
                ${centerIconSymbol ? `<div class="qr-center-icon" style="background: ${theme.accentColor}; color: #FFF;">${centerIconSymbol}</div>` : ''}
              </div>

              <div class="action-title" style="color: ${theme.primaryTextColor}; font-size: ${actionTitlePx}px;">
                ${isBackSide ? 'Anı Defterine Not Bırakın' : actionTitle}
              </div>
              <div class="slogan" style="color: ${isDark ? '#D4D4D8' : '#4B5563'}; font-size: ${sloganPx}px;">
                ${customSlogan}
              </div>
              ${stepsHtml}
              <div class="footer-link" style="color: ${theme.namesColor}; font-size: ${footerLinkPx}px;">${footerText}</div>
            </div>
          </div>
        `;
      }

      // ARCHETYPE 3: BOLD QR CODE HERO
      if (cardDesign === 'bold_qr') {
        return `
          <div class="card-box ${isDark ? 'dark-card' : ''}" style="${cardDimensionStyles}; background: ${theme.cardBg}; border-color: ${theme.border};">
            ${customBgHtml}
            ${overlayHtml}
            ${frameSvgHtml}
            <div class="inner-frame" style="border-color: ${theme.innerBorder}; background-color: ${innerBgColor}; padding: ${innerFramePadMm}mm;">
              ${buildCoupleNamesHtml(Math.round(coupleNamePx * 0.85) + 'px', false, Math.round(100 * scale) + 'px')}
              <div class="date-tag" style="color: ${isDark ? '#A1A1AA' : '#6B7280'}; font-size: ${dateTagPx}px; margin-bottom: ${Math.round(6 * scale)}px;">
                ${badgeDisplay} • ${customDateOrSub}
              </div>

              <!-- Giant Scan Target -->
              <div class="bold-qr-container" style="border: 2.5px solid ${theme.border}; background: ${isDark ? '#141312' : '#FFFFFF'}; padding: ${Math.round(8 * scale)}px; border-radius: ${Math.round(16 * scale)}px;">
                <img src="${base64Qr}" alt="QR Kod" style="width: ${qrPx}px; height: ${qrPx}px; display: block;" />
                ${centerIconSymbol ? `<div class="qr-center-icon" style="background: ${theme.accentColor}; color: #FFF;">${centerIconSymbol}</div>` : ''}
              </div>

              <div class="bold-scan-banner" style="background: ${theme.badgeBg}; color: ${theme.badgeTextColor}; font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: ${Math.max(9, Math.round(11 * scale))}px; padding: ${Math.round(4 * scale)}px ${Math.round(14 * scale)}px; border-radius: 20px; margin: ${Math.round(8 * scale)}px 0 ${Math.round(4 * scale)}px 0;">
                ⚡ KAMERANI AÇ & ANINDA TARA
              </div>

              <div class="slogan" style="color: ${isDark ? '#D4D4D8' : '#4B5563'}; font-size: ${sloganPx}px; margin-bottom: ${Math.round(6 * scale)}px;">
                ${customSlogan}
              </div>
              <div class="footer-link" style="color: ${theme.namesColor}; font-size: ${footerLinkPx}px;">${footerText}</div>
            </div>
          </div>
        `;
      }

      // ARCHETYPE 4: SENTIMENTAL GUESTBOOK LETTER
      if (cardDesign === 'letter') {
        return `
          <div class="card-box ${isDark ? 'dark-card' : ''}" style="${cardDimensionStyles}; background: ${theme.cardBg}; border-color: ${theme.border};">
            ${customBgHtml}
            ${overlayHtml}
            ${frameSvgHtml}
            <div class="inner-frame" style="border-color: ${theme.innerBorder}; background-color: ${innerBgColor}; padding: ${innerFramePadMm}mm;">
              <div class="letter-stamp" style="font-size: ${Math.round(18 * scale)}px; color: ${theme.accentColor}; margin-bottom: 2px;">💌</div>
              <h2 style="font-family: 'Montserrat', sans-serif; font-size: ${Math.max(9, Math.round(12 * scale))}px; font-weight: 800; letter-spacing: 1px; color: ${theme.badgeTextColor}; text-transform: uppercase; margin: 0 0 4px 0;">
                Sevgili Misafirimiz,
              </h2>
              <div class="letter-body" style="font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: ${Math.max(8.5, Math.round(11 * scale))}px; line-height: 1.35; color: ${isDark ? '#E5E7EB' : '#374151'}; text-align: center; margin-bottom: ${Math.round(8 * scale)}px; padding: 0 6px;">
                "Bu mutlu günümüzde yanımızda olduğunuz için teşekkür ederiz. Bugün yaşadığımız mutluluğu sizin gözünüzden görmek istiyoruz."
              </div>

              <div class="qr-wrapper" style="border-color: ${theme.border}; background: ${isDark ? '#141312' : '#FFFFFF'}; margin-bottom: ${Math.round(6 * scale)}px;">
                <img src="${base64Qr}" alt="QR Kod" class="qr-img" style="width: ${qrPx}px; height: ${qrPx}px;" />
                ${centerIconSymbol ? `<div class="qr-center-icon" style="background: ${theme.accentColor}; color: #FFF;">${centerIconSymbol}</div>` : ''}
              </div>

              <div class="action-title" style="color: ${theme.primaryTextColor}; font-size: ${actionTitlePx}px;">
                ${isBackSide ? 'Anı Defterimize Not Bırakın' : actionTitle}
              </div>
              <div class="badge" style="background: ${theme.badgeBg}; border-color: ${theme.badgeBorder}; color: ${theme.badgeTextColor}; margin: ${Math.round(4 * scale)}px 0;">
                ${badgeDisplay}
              </div>
              <div style="font-family: 'Great Vibes', cursive; font-size: ${Math.round(coupleNamePx * 1.1)}px; color: ${theme.namesColor}; margin-top: 2px;">
                Sevgiyle, ${brideName || 'Gelin'} & ${groomName || 'Damat'}
              </div>
            </div>
          </div>
        `;
      }

      // ARCHETYPE 5 (DEFAULT): CLASSIC INVITATION
      return `
        <div class="card-box ${isDark ? 'dark-card' : ''}" style="${cardDimensionStyles}; background: ${theme.cardBg}; border-color: ${theme.border};">
          ${customBgHtml}
          ${overlayHtml}
          ${frameSvgHtml}

          <div class="inner-frame" style="border-color: ${theme.innerBorder}; background-color: ${innerBgColor}; padding: ${innerFramePadMm}mm;">
            <div class="top-ornament">
              <span class="sparkle" style="color: ${theme.accentColor}">✦</span>
              <span class="date-tag" style="color: ${isDark ? '#A1A1AA' : '#6B7280'}">${customDateOrSub}</span>
              <span class="sparkle" style="color: ${theme.accentColor}">✦</span>
            </div>

            ${buildCoupleNamesHtml(coupleNamePx + 'px', false, Math.round(130 * scale) + 'px')}

            <div class="badge" style="background: ${theme.badgeBg}; border-color: ${theme.badgeBorder}; color: ${theme.badgeTextColor};">
              ${badgeDisplay}
            </div>

            <div class="qr-wrapper" style="border-color: ${theme.border}; background: ${isDark ? '#141312' : '#FFFFFF'};">
              <img src="${base64Qr}" alt="QR Kod" class="qr-img" style="width: ${qrPx}px; height: ${qrPx}px;" />
              ${centerIconSymbol ? `<div class="qr-center-icon" style="background: ${theme.accentColor}; color: #FFF;">${centerIconSymbol}</div>` : ''}
            </div>

            <div class="action-title" style="color: ${theme.primaryTextColor}; font-size: ${actionTitlePx}px;">
              ${isBackSide ? 'Anı Defterimize Not Bırakın' : actionTitle}
            </div>

            <div class="slogan" style="color: ${isDark ? '#D4D4D8' : '#4B5563'}; font-size: ${sloganPx}px;">
              ${customSlogan}
            </div>

            ${stepsHtml}

            <div class="footer-link" style="color: ${theme.namesColor}; font-family: ${selectedFont.family}; font-size: ${footerLinkPx}px;">
              ${footerText}
            </div>
          </div>
        </div>
      `;
    };

    let pagesHtml = '';

    if (cardLayout === 'tent') {
      for (const tbl of tableList) {
        pagesHtml += `
          <div class="print-page" style="${gridStyles}">
            <div class="tent-container" style="max-width: ${Math.min(cardW, 140)}mm;">
              <div class="tent-card-wrapper tent-top-card">
                ${renderSingleCardHtml(tbl, true)}
              </div>
              <div class="tent-fold-line" style="width: 100%; max-width: ${Math.min(cardW, 140)}mm;">
                <span class="fold-dash"></span>
                <span class="fold-text">✂ KATLAMA ÇİZGİSİ</span>
                <span class="fold-dash"></span>
              </div>
              <div class="tent-card-wrapper tent-bottom-card">
                ${renderSingleCardHtml(tbl, false)}
              </div>
            </div>
          </div>
        `;
      }
    } else if (cardLayout === 'double') {
      for (let i = 0; i < tableList.length; i += 2) {
        const item1 = tableList[i];
        const item2 = i + 1 < tableList.length ? tableList[i + 1] : item1;
        pagesHtml += `
          <div class="print-page" style="${gridStyles}">
            <div class="print-cut-item">${renderSingleCardHtml(item1)}</div>
            <div class="print-cut-divider">
              <span class="dash-line"></span>
              <span class="fold-text">✂ SAYFAYI İKİYE KESİN</span>
              <span class="dash-line"></span>
            </div>
            <div class="print-cut-item">${renderSingleCardHtml(item2)}</div>
          </div>
        `;
      }
    } else if (cardLayout === 'quad') {
      for (let i = 0; i < tableList.length; i += 4) {
        const chunk = tableList.slice(i, i + 4);
        while (chunk.length < 4) {
          chunk.push(chunk[0]);
        }
        pagesHtml += `
          <div class="print-page" style="${gridStyles}">
            ${chunk.map((item) => `<div class="quad-card-cell">${renderSingleCardHtml(item)}</div>`).join('')}
          </div>
        `;
      }
    } else {
      for (const tbl of tableList) {
        pagesHtml += `
          <div class="print-page" style="${gridStyles}">
            ${renderSingleCardHtml(tbl)}
          </div>
        `;
      }
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Masa QR Kartları - ${customTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Great+Vibes&family=Montserrat:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: ${selectedFont.family};
            background: #FFFFFF;
            color: #1A1817;
          }
          .print-page {
            width: 100%;
            margin: 0 auto;
            padding: 4mm 0;
            page-break-after: always;
          }
          .card-box {
            position: relative;
            border: ${Math.max(2, Math.round(3.5 * scale))}px solid;
            border-radius: ${Math.round(20 * scale)}px;
            padding: ${cardBoxPadMm}mm;
            text-align: center;
            box-shadow: none;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            page-break-inside: avoid;
          }
          .custom-bg-layer {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-size: cover;
            background-position: center;
            z-index: 0;
          }
          .bg-overlay-layer {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 1;
          }
          .frame-svg-layer {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            z-index: 2;
          }
          .frame-svg-layer svg {
            width: 100%;
            height: 100%;
            display: block;
          }
          .inner-frame {
            position: relative;
            z-index: 3;
            border: ${Math.max(1, Math.round(1.5 * scale))}px solid;
            border-radius: ${Math.round(14 * scale)}px;
            padding: ${innerFramePadMm}mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          .top-ornament {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${Math.round(6 * scale)}px;
            margin-bottom: ${Math.round(4 * scale)}px;
          }
          .sparkle {
            font-size: ${Math.round(12 * scale)}px;
          }
          .date-tag {
            font-size: ${dateTagPx}px;
            font-weight: 800;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            font-family: 'Montserrat', sans-serif;
          }
          .couple-names-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: ${Math.round(2 * scale)}px 0 ${Math.round(4 * scale)}px 0;
            width: 100%;
          }
          .couple-name-line {
            font-size: ${coupleNamePx}px;
            line-height: 1.15;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-align: center;
            word-break: break-word;
          }
          .ampersand-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${Math.round(8 * scale)}px;
            width: 100%;
            max-width: ${Math.round(130 * scale)}px;
            margin: 1px 0;
          }
          .amp-line {
            flex: 1;
            height: 1px;
            opacity: 0.6;
          }
          .ampersand-char {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: ${Math.round(14 * scale)}px;
            font-style: italic;
            font-weight: 700;
            line-height: 1;
          }
          .couple-title {
            margin: ${Math.round(2 * scale)}px 0 ${Math.round(5 * scale)}px 0;
            font-size: ${coupleNamePx}px;
            line-height: 1.2;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          .badge {
            display: inline-block;
            font-family: 'Montserrat', sans-serif;
            font-size: ${badgeFontPx}px;
            font-weight: 800;
            letter-spacing: 1px;
            padding: ${Math.round(4 * scale)}px ${Math.round(12 * scale)}px;
            border-radius: ${Math.round(18 * scale)}px;
            border: 1px solid;
            margin-bottom: ${Math.round(8 * scale)}px;
          }
          .qr-wrapper {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: ${Math.max(1.5, Math.round(2 * scale))}px solid;
            border-radius: ${Math.round(14 * scale)}px;
            padding: ${Math.round(6 * scale)}px;
            margin-bottom: ${Math.round(8 * scale)}px;
          }
          .qr-img {
            display: block;
            width: ${qrPx}px;
            height: ${qrPx}px;
            object-fit: contain;
          }
          .qr-center-icon {
            position: absolute;
            width: ${Math.round(28 * scale)}px;
            height: ${Math.round(28 * scale)}px;
            border-radius: ${Math.round(14 * scale)}px;
            border: 2px solid #FFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${Math.round(13 * scale)}px;
          }
          .action-title {
            font-family: 'Montserrat', sans-serif;
            font-size: ${actionTitlePx}px;
            font-weight: 800;
            margin-bottom: ${Math.round(3 * scale)}px;
            letter-spacing: 0.3px;
          }
          .slogan {
            font-family: 'Montserrat', sans-serif;
            font-size: ${sloganPx}px;
            line-height: 1.4;
            max-width: 90%;
            margin: 0 auto ${Math.round(8 * scale)}px auto;
          }
          .steps-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${Math.round(5 * scale)}px;
            margin-bottom: ${Math.round(8 * scale)}px;
            width: 100%;
          }
          .step-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
          }
          .step-circle {
            font-size: ${stepCirclePx}px;
          }
          .step-text {
            font-size: ${stepFontPx}px;
            font-weight: 700;
            font-family: 'Montserrat', sans-serif;
            color: #6B7280;
          }
          .step-divider {
            width: ${Math.round(14 * scale)}px;
            height: 1px;
            background: #D1D5DB;
            margin-bottom: ${Math.round(6 * scale)}px;
          }
          .footer-link {
            font-size: ${footerLinkPx}px;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          /* Specialized Archetype Print Styles */
          .polaroid-box {
            border-bottom: ${Math.round(26 * scale)}px solid #FFF !important;
          }
          .polaroid-table-tag {
            position: absolute;
            top: 6px;
            right: 8px;
            font-size: ${Math.max(7, Math.round(9 * scale))}px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 6px;
            font-family: 'Montserrat', sans-serif;
          }
          .table-hero-medallion {
            width: ${Math.round(56 * scale)}px;
            height: ${Math.round(56 * scale)}px;
            border-radius: ${Math.round(28 * scale)}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0 auto ${Math.round(6 * scale)}px auto;
          }
          .table-hero-label {
            font-size: ${Math.max(7, Math.round(8.5 * scale))}px;
            font-weight: 800;
            letter-spacing: 1px;
            font-family: 'Montserrat', sans-serif;
          }
          .table-hero-num {
            font-size: ${Math.max(16, Math.round(24 * scale))}px;
            font-weight: 900;
            line-height: 1;
          }
          .tent-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            margin: 0 auto;
            gap: 0;
          }
          .tent-card-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
            margin: 0;
            padding: 0;
          }
          .tent-top-card {
            transform: rotate(180deg);
            transform-origin: center center;
            margin-bottom: 0;
          }
          .tent-top-card .card-box {
            border-top-left-radius: 2px !important;
            border-top-right-radius: 2px !important;
            border-bottom-left-radius: ${Math.round(18 * scale)}px !important;
            border-bottom-right-radius: ${Math.round(18 * scale)}px !important;
          }
          .tent-top-card .inner-frame {
            border-top-left-radius: 2px !important;
            border-top-right-radius: 2px !important;
            border-bottom-left-radius: ${Math.round(12 * scale)}px !important;
            border-bottom-right-radius: ${Math.round(12 * scale)}px !important;
          }
          .tent-bottom-card {
            margin-top: 0;
          }
          .tent-bottom-card .card-box {
            border-top-left-radius: 2px !important;
            border-top-right-radius: 2px !important;
            border-bottom-left-radius: ${Math.round(18 * scale)}px !important;
            border-bottom-right-radius: ${Math.round(18 * scale)}px !important;
          }
          .tent-bottom-card .inner-frame {
            border-top-left-radius: 2px !important;
            border-top-right-radius: 2px !important;
            border-bottom-left-radius: ${Math.round(12 * scale)}px !important;
            border-bottom-right-radius: ${Math.round(12 * scale)}px !important;
          }
          .tent-fold-line {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            margin: 0.5mm 0;
            padding: 0;
            height: 2.5mm;
            line-height: 1;
          }
          .tent-fold-line .fold-dash,
          .dash-line {
            flex: 1;
            border-top: 1px dashed #9CA3AF;
          }
          .tent-fold-line .fold-text,
          .fold-text {
            font-size: 6.5px;
            font-weight: 800;
            color: #6B7280;
            letter-spacing: 0.5px;
            font-family: 'Montserrat', sans-serif;
            text-transform: uppercase;
            padding: 0 4px;
            white-space: nowrap;
          }
          .print-cut-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            max-width: 140mm;
            margin: 3mm 0;
          }
          .print-cut-item {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .quad-card-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `;
  };

  // Execution of Print
  const handlePrint = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      Alert.alert('Baskı Alma', 'Baskı işlemi web tarayıcısında desteklenmektedir.');
      return;
    }

    if (!base64Qr) {
      Alert.alert('Lütfen Bekleyin', 'QR kod oluşturuluyor, lütfen 1-2 saniye bekleyin.');
      return;
    }

    let tableList: (string | null)[] = [];
    if (showTableNumber) {
      if (isBatchMode) {
        const fromNum = parseInt(batchFrom, 10) || 1;
        const toNum = parseInt(batchTo, 10) || 1;
        const start = Math.min(fromNum, toNum);
        const end = Math.max(fromNum, toNum);
        if (end - start > 100) {
          Alert.alert('Uyarı', 'Tek seferde en fazla 100 masa için baskı alabilirsiniz.');
          return;
        }
        for (let i = start; i <= end; i++) {
          tableList.push(String(i));
        }
      } else {
        const num = singleTableNumber || '1';
        if (cardLayout === 'quad') {
          tableList = [num, num, num, num];
        } else if (cardLayout === 'double') {
          tableList = [num, num];
        } else {
          tableList = [num];
        }
      }
    } else {
      if (cardLayout === 'quad') {
        tableList = [null, null, null, null];
      } else if (cardLayout === 'double') {
        tableList = [null, null];
      } else {
        tableList = [null];
      }
    }

    const printHtml = buildPrintHtml(tableList);

    let iframe = document.getElementById('qr-print-iframe') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'qr-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(printHtml);
    iframeDoc.close();

    setTimeout(() => {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    }, 450);
  };

  // Download High-Resolution standalone QR PNG
  const handleDownloadQrPng = () => {
    if (!base64Qr) return;
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.download = `QR-la-${event.slug}-HD.png`;
      link.href = base64Qr;
      link.click();
    }
  };

  const selectedSizeConfig = CARD_SIZES[cardSize] || CARD_SIZES.standard_10x15;
  const cardAspectRatio = selectedSizeConfig.widthMm / selectedSizeConfig.heightMm;
  const isLandscapeMini = cardSize === 'mini_85x55' || (selectedSizeConfig.widthMm > selectedSizeConfig.heightMm * 1.2 && selectedSizeConfig.heightMm <= 75);
  const baseCardWidth = 370;
  const calculatedCardMinHeight = isLandscapeMini
    ? 240
    : Math.min(620, Math.max(260, Math.round(baseCardWidth / cardAspectRatio)));

  const cardPaperDimensionStyle = {
    width: baseCardWidth,
    minHeight: calculatedCardMinHeight,
    borderColor: theme.border,
    backgroundColor: theme.cardBg,
  };

  // Render on-screen live card based on active Archetype and responsive cardSize
  const renderLiveCardContent = (tableNumToDisplay: string | null, isBackSide = false) => {
    const isDark = theme.isDark;
    const badgeContent = tableNumToDisplay ? `MASA ${tableNumToDisplay}` : badgeText;
    const frameSvgString = currentFrame ? currentFrame.getSvg(theme.border, theme.innerBorder) : '';
    const frameDataUri = frameSvgString
      ? `data:image/svg+xml;utf8,${encodeURIComponent(frameSvgString.trim())}`
      : null;

    // Responsive scaling based on cardSize (relative to 100x150 mm baseline)
    const liveScale = isLandscapeMini
      ? 0.72
      : Math.min(1.25, Math.max(0.68, Math.min(selectedSizeConfig.widthMm / 100, selectedSizeConfig.heightMm / 150)));

    const liveQrSize = isLandscapeMini
      ? 82
      : cardDesign === 'bold_qr'
      ? Math.round(180 * liveScale)
      : cardDesign === 'letter'
      ? Math.round(135 * liveScale)
      : cardDesign === 'table_hero'
      ? Math.round(140 * liveScale)
      : Math.round(152 * liveScale);

    const liveCoupleNameSize = isLandscapeMini ? 15 : Math.max(14, Math.round(23 * liveScale));
    const liveBadgeFontSize = isLandscapeMini ? 8.5 : Math.max(8.5, Math.round(11 * liveScale));
    const liveActionTitleSize = isLandscapeMini ? 11 : Math.max(10, Math.round(14.5 * liveScale));
    const liveSloganFontSize = isLandscapeMini ? 8 : Math.max(8, Math.round(10.5 * liveScale));
    const liveDateTagSize = isLandscapeMini ? 8 : Math.max(8, Math.round(10 * liveScale));
    const liveFooterFontSize = isLandscapeMini ? 8.5 : Math.max(8.5, Math.round(11.5 * liveScale));
    const liveInnerPadding = isLandscapeMini ? 10 : Math.max(10, Math.round(18 * liveScale));
    const liveSpacing = Math.max(4, Math.round(9 * liveScale));

    const qrElement = (
      <View
        style={[
          styles.qrContainer,
          {
            width: liveQrSize,
            height: liveQrSize,
            padding: Math.max(4, Math.round(6 * liveScale)),
            borderRadius: Math.round(16 * liveScale),
            marginBottom: liveSpacing,
            borderColor: theme.border,
            backgroundColor: isDark ? '#141312' : '#FFFFFF',
          },
        ]}
      >
        {isGeneratingQr || !base64Qr ? (
          <View style={styles.qrLoadingBox}>
            <Text style={{ color: '#9CA3AF', fontSize: Math.round(11 * liveScale) }}>QR Yükleniyor...</Text>
          </View>
        ) : (
          <Image source={{ uri: base64Qr }} style={styles.qrImage} resizeMode="contain" />
        )}

        {qrIcon !== 'none' && (
          <View
            style={[
              styles.qrCenterBadge,
              {
                backgroundColor: theme.accentColor,
                width: Math.round(30 * liveScale),
                height: Math.round(30 * liveScale),
                borderRadius: Math.round(15 * liveScale),
              },
            ]}
          >
            <Ionicons
              name={
                qrIcon === 'camera'
                  ? 'camera'
                  : qrIcon === 'heart'
                  ? 'heart'
                  : 'sparkles'
              }
              size={Math.max(10, Math.round(13 * liveScale))}
              color="#FFF"
            />
          </View>
        )}
      </View>
    );

    const renderCoupleNamesBlock = (fontSize = liveCoupleNameSize, isScript = false, maxWidth = Math.round(230 * liveScale)) => {
      const b = brideName.trim() || 'Gelin';
      const g = groomName.trim() || 'Damat';
      const fontFam = Platform.OS === 'web' ? (isScript ? "'Great Vibes', cursive" : selectedFont.family) : undefined;
      return (
        <View style={[styles.coupleNamesBlock, { maxWidth, marginVertical: Math.max(2, Math.round(3 * liveScale)) }]}>
          <Text
            style={[
              styles.coupleNamePrimary,
              {
                color: theme.namesColor,
                // @ts-ignore
                fontFamily: fontFam,
                fontSize,
              },
            ]}
            numberOfLines={1}
          >
            {b}
          </Text>
          <View style={[styles.ampersandWrap, { maxWidth: Math.round(130 * liveScale), marginVertical: 1 }]}>
            <View style={[styles.ampersandLine, { backgroundColor: theme.accentColor + '55' }]} />
            <Text
              style={[
                styles.ampersandText,
                {
                  color: theme.accentColor,
                  // @ts-ignore
                  fontFamily: Platform.OS === 'web' ? "'Playfair Display', Georgia, serif" : undefined,
                  fontSize: Math.round(14 * liveScale),
                  lineHeight: Math.round(16 * liveScale),
                },
              ]}
            >
              &
            </Text>
            <View style={[styles.ampersandLine, { backgroundColor: theme.accentColor + '55' }]} />
          </View>
          <Text
            style={[
              styles.coupleNameSecondary,
              {
                color: theme.namesColor,
                // @ts-ignore
                fontFamily: fontFam,
                fontSize,
              },
            ]}
            numberOfLines={1}
          >
            {g}
          </Text>
        </View>
      );
    };

    // SPECIAL 2-COLUMN LANDSCAPE LAYOUT FOR MINI (8.5 x 5.5 cm) CARDS
    if (isLandscapeMini) {
      return (
        <View
          style={[
            styles.innerBorder,
            cardLayout === 'tent' && styles.tentInnerBorder,
            {
              borderColor: theme.innerBorder,
              backgroundColor: customBgUrl
                ? isDark
                  ? `rgba(20, 19, 18, ${1 - overlayOpacity})`
                  : `rgba(255, 255, 255, ${1 - overlayOpacity})`
                : theme.cardBg,
              padding: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              height: '100%',
              minHeight: 216,
            },
          ]}
        >
          {frameDataUri && (
            <Image
              source={{ uri: frameDataUri }}
              style={styles.frameSvgOverlay}
              resizeMode="stretch"
            />
          )}

          {/* Left Column: Information & Names */}
          <View style={{ flex: 1.15, justifyContent: 'center', height: '100%', zIndex: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Text style={{ color: theme.accentColor, fontSize: 10 }}>✦</Text>
              <Text style={[styles.dateTag, { color: isDark ? '#A1A1AA' : '#6B7280', fontSize: 8.5 }]}>
                {customDateOrSub}
              </Text>
            </View>

            <Text
              style={{
                color: theme.namesColor,
                // @ts-ignore
                fontFamily: Platform.OS === 'web' ? selectedFont.family : undefined,
                fontSize: 15,
                fontWeight: '800',
                lineHeight: 18,
                marginBottom: 5,
              }}
              numberOfLines={2}
            >
              {brideName.trim() || 'Gelin'} & {groomName.trim() || 'Damat'}
            </Text>

            <View
              style={[
                styles.badgeContainer,
                {
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.badgeBorder,
                  paddingVertical: 3,
                  paddingHorizontal: 8,
                  marginBottom: 6,
                  alignSelf: 'flex-start',
                },
              ]}
            >
              <Ionicons
                name={tableNumToDisplay ? 'restaurant-outline' : 'camera-outline'}
                size={10}
                color={theme.badgeTextColor}
              />
              <Text style={[styles.badgeText, { color: theme.badgeTextColor, fontSize: 8.5 }]}>
                {badgeContent}
              </Text>
            </View>

            <Text style={[styles.actionTitle, { color: theme.primaryTextColor, fontSize: 11, marginBottom: 2, textAlign: 'left' }]}>
              {isBackSide ? 'Anı Defterine Not Bırakın' : actionTitle}
            </Text>

            <Text
              style={[
                styles.actionDesc,
                {
                  color: isDark ? '#D4D4D8' : '#4B5563',
                  fontSize: 8.5,
                  lineHeight: 12,
                  marginBottom: 0,
                  paddingHorizontal: 0,
                  textAlign: 'left',
                },
              ]}
              numberOfLines={2}
            >
              {customSlogan}
            </Text>
          </View>

          {/* Right Column: Target QR and Link */}
          <View style={{ flex: 0.85, alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 2 }}>
            <View
              style={[
                styles.qrContainer,
                {
                  width: 98,
                  height: 98,
                  padding: 5,
                  borderRadius: 12,
                  marginBottom: 6,
                  borderColor: theme.border,
                  backgroundColor: isDark ? '#141312' : '#FFFFFF',
                },
              ]}
            >
              {isGeneratingQr || !base64Qr ? (
                <View style={styles.qrLoadingBox}>
                  <Text style={{ color: '#9CA3AF', fontSize: 9 }}>QR...</Text>
                </View>
              ) : (
                <Image source={{ uri: base64Qr }} style={styles.qrImage} resizeMode="contain" />
              )}
              {qrIcon !== 'none' && (
                <View style={[styles.qrCenterBadge, { backgroundColor: theme.accentColor, width: 22, height: 22, borderRadius: 11 }]}>
                  <Ionicons
                    name={qrIcon === 'camera' ? 'camera' : qrIcon === 'heart' ? 'heart' : 'sparkles'}
                    size={10}
                    color="#FFF"
                  />
                </View>
              )}
            </View>

            <Text
              style={[
                styles.footerLink,
                {
                  color: theme.namesColor,
                  // @ts-ignore
                  fontFamily: Platform.OS === 'web' ? selectedFont.family : undefined,
                  fontSize: 8.5,
                  textAlign: 'center',
                },
              ]}
              numberOfLines={1}
            >
              {footerText}
            </Text>
          </View>
        </View>
      );
    }

    // 1. POLAROID DESIGN
    if (cardDesign === 'polaroid') {
      return (
        <View style={[styles.polaroidContainer, { paddingBottom: Math.round(20 * liveScale) }]}>
          <View
            style={[
              styles.polaroidPhotoArea,
              {
                borderColor: theme.border,
                backgroundColor: isDark ? '#1C1917' : '#F9FAFB',
                padding: Math.round(12 * liveScale),
              },
            ]}
          >
            {tableNumToDisplay && (
              <View style={[styles.polaroidTag, { backgroundColor: theme.accentColor, paddingVertical: Math.round(2 * liveScale), paddingHorizontal: Math.round(6 * liveScale) }]}>
                <Text style={[styles.polaroidTagText, { fontSize: Math.max(7.5, Math.round(9 * liveScale)) }]}>MASA {tableNumToDisplay}</Text>
              </View>
            )}
            {qrElement}
            <Text style={[styles.actionTitle, { color: theme.primaryTextColor, fontSize: liveActionTitleSize, marginBottom: 2 }]}>
              📸 {isBackSide ? 'Anı Defterimize Not Bırakın' : actionTitle}
            </Text>
          </View>

          <View style={[styles.polaroidBottomArea, { marginTop: Math.round(6 * liveScale) }]}>
            {renderCoupleNamesBlock(Math.round(26 * liveScale), true, Math.round(250 * liveScale))}
            <Text style={[styles.dateTag, { color: '#6B7280', fontSize: liveDateTagSize, marginTop: 2 }]}>
              {customDateOrSub} • {footerText}
            </Text>
          </View>
        </View>
      );
    }

    // 2. TABLE NUMBER HERO DESIGN
    if (cardDesign === 'table_hero') {
      const medSize = Math.round(58 * liveScale);
      return (
        <View
          style={[
            styles.innerBorder,
            cardLayout === 'tent' && styles.tentInnerBorder,
            {
              borderColor: theme.innerBorder,
              padding: liveInnerPadding,
              backgroundColor: customBgUrl
                ? isDark
                  ? `rgba(20, 19, 18, ${1 - overlayOpacity})`
                  : `rgba(255, 255, 255, ${1 - overlayOpacity})`
                : theme.cardBg,
            },
          ]}
        >
          {frameDataUri && (
            <Image
              source={{ uri: frameDataUri }}
              style={styles.frameSvgOverlay}
              resizeMode="stretch"
            />
          )}

          {/* Table Hero Medallion */}
          <View
            style={[
              styles.tableHeroMedallion,
              {
                borderColor: theme.accentColor,
                backgroundColor: theme.badgeBg,
                width: medSize,
                height: medSize,
                borderRadius: Math.round(medSize / 2),
                marginBottom: liveSpacing,
              },
            ]}
          >
            <Text style={[styles.tableHeroLabel, { color: theme.badgeTextColor, fontSize: Math.max(7, Math.round(8.5 * liveScale)) }]}>MASA</Text>
            <Text
              style={[
                styles.tableHeroNum,
                {
                  color: theme.namesColor,
                  // @ts-ignore
                  fontFamily: Platform.OS === 'web' ? selectedFont.family : undefined,
                  fontSize: Math.max(16, Math.round(24 * liveScale)),
                },
              ]}
            >
              {tableNumToDisplay || '1'}
            </Text>
          </View>

          {renderCoupleNamesBlock(Math.round(20 * liveScale), false, Math.round(210 * liveScale))}

          {qrElement}

          <Text style={[styles.actionTitle, { color: theme.primaryTextColor, fontSize: liveActionTitleSize, marginBottom: 2 }]}>
            {isBackSide ? 'Anı Defterine Not Bırakın' : actionTitle}
          </Text>
          <Text style={[styles.actionDesc, { color: isDark ? '#D4D4D8' : '#4B5563', fontSize: liveSloganFontSize, marginBottom: liveSpacing }]}>
            {customSlogan}
          </Text>

          <Text
            style={[
              styles.footerLink,
              {
                color: theme.namesColor,
                // @ts-ignore
                fontFamily: Platform.OS === 'web' ? selectedFont.family : undefined,
                fontSize: liveFooterFontSize,
              },
            ]}
          >
            {footerText}
          </Text>
        </View>
      );
    }

    // 3. BOLD QR HERO DESIGN
    if (cardDesign === 'bold_qr') {
      return (
        <View
          style={[
            styles.innerBorder,
            cardLayout === 'tent' && styles.tentInnerBorder,
            {
              borderColor: theme.innerBorder,
              padding: liveInnerPadding,
              backgroundColor: customBgUrl
                ? isDark
                  ? `rgba(20, 19, 18, ${1 - overlayOpacity})`
                  : `rgba(255, 255, 255, ${1 - overlayOpacity})`
                : theme.cardBg,
            },
          ]}
        >
          {frameDataUri && (
            <Image
              source={{ uri: frameDataUri }}
              style={styles.frameSvgOverlay}
              resizeMode="stretch"
            />
          )}

          {renderCoupleNamesBlock(Math.round(19 * liveScale), false, Math.round(200 * liveScale))}

          <Text style={[styles.dateTag, { color: isDark ? '#A1A1AA' : '#6B7280', fontSize: liveDateTagSize, marginBottom: liveSpacing }]}>
            {badgeContent} • {customDateOrSub}
          </Text>

          {/* Large Scan Hero */}
          <View
            style={[
              styles.boldQrWrapper,
              {
                borderColor: theme.border,
                backgroundColor: isDark ? '#141312' : '#FFFFFF',
                padding: Math.round(6 * liveScale),
                borderRadius: Math.round(16 * liveScale),
                marginBottom: liveSpacing,
              },
            ]}
          >
            {base64Qr ? (
              <Image source={{ uri: base64Qr }} style={{ width: liveQrSize, height: liveQrSize }} resizeMode="contain" />
            ) : (
              <Text style={{ color: '#9CA3AF' }}>QR Yükleniyor...</Text>
            )}
          </View>

          <View style={[styles.boldScanBadge, { backgroundColor: theme.badgeBg, paddingVertical: Math.round(3 * liveScale), paddingHorizontal: Math.round(12 * liveScale), marginBottom: liveSpacing }]}>
            <Text style={[styles.boldScanBadgeText, { color: theme.badgeTextColor, fontSize: Math.max(8.5, Math.round(11 * liveScale)) }]}>
              ⚡ KAMERANI AÇ & ANINDA TARA
            </Text>
          </View>

          <Text style={[styles.actionDesc, { color: isDark ? '#D4D4D8' : '#4B5563', fontSize: liveSloganFontSize, marginBottom: liveSpacing }]}>
            {customSlogan}
          </Text>
          <Text style={[styles.footerLink, { color: theme.namesColor, fontSize: liveFooterFontSize }]}>{footerText}</Text>
        </View>
      );
    }

    // 4. SENTIMENTAL LETTER DESIGN
    if (cardDesign === 'letter') {
      return (
        <View
          style={[
            styles.innerBorder,
            cardLayout === 'tent' && styles.tentInnerBorder,
            {
              borderColor: theme.innerBorder,
              padding: liveInnerPadding,
              backgroundColor: customBgUrl
                ? isDark
                  ? `rgba(20, 19, 18, ${1 - overlayOpacity})`
                  : `rgba(255, 255, 255, ${1 - overlayOpacity})`
                : theme.cardBg,
            },
          ]}
        >
          {frameDataUri && (
            <Image
              source={{ uri: frameDataUri }}
              style={styles.frameSvgOverlay}
              resizeMode="stretch"
            />
          )}

          <Text style={{ fontSize: Math.round(22 * liveScale), marginBottom: 2 }}>💌</Text>
          <Text style={[styles.letterHeading, { color: theme.badgeTextColor, fontSize: Math.max(9, Math.round(12 * liveScale)) }]}>
            Sevgili Misafirimiz,
          </Text>
          <Text
            style={[
              styles.letterBody,
              {
                color: isDark ? '#E5E7EB' : '#374151',
                // @ts-ignore
                fontFamily: Platform.OS === 'web' ? "'Playfair Display', Georgia, serif" : undefined,
                fontSize: Math.max(8.5, Math.round(10.5 * liveScale)),
                lineHeight: Math.round(15 * liveScale),
                marginBottom: liveSpacing,
              },
            ]}
          >
            "Bu mutlu günümüzde yanımızda olduğunuz için teşekkür ederiz. Bugün yaşadığımız mutluluğu sizin gözünüzden görmek istiyoruz."
          </Text>

          {qrElement}

          <Text style={[styles.actionTitle, { color: theme.primaryTextColor, fontSize: liveActionTitleSize, marginBottom: 2 }]}>
            {isBackSide ? 'Anı Defterimize Not Bırakın' : actionTitle}
          </Text>

          <View style={[styles.badgeContainer, { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder, paddingVertical: Math.round(3 * liveScale), paddingHorizontal: Math.round(10 * liveScale), marginVertical: liveSpacing }]}>
            <Text style={[styles.badgeText, { color: theme.badgeTextColor, fontSize: liveBadgeFontSize }]}>{badgeContent}</Text>
          </View>

          <Text
            style={[
              styles.coupleNames,
              {
                color: theme.namesColor,
                // @ts-ignore
                fontFamily: Platform.OS === 'web' ? "'Great Vibes', cursive" : undefined,
                fontSize: Math.round(24 * liveScale),
                marginTop: 2,
              },
            ]}
          >
            Sevgiyle, {brideName.trim() || 'Gelin'} & {groomName.trim() || 'Damat'}
          </Text>
        </View>
      );
    }

    // 5. CLASSIC INVITATION DESIGN (DEFAULT)
    return (
      <View
        style={[
          styles.innerBorder,
          cardLayout === 'tent' && styles.tentInnerBorder,
          {
            borderColor: theme.innerBorder,
            padding: liveInnerPadding,
            backgroundColor: customBgUrl
              ? isDark
                ? `rgba(20, 19, 18, ${1 - overlayOpacity})`
                : `rgba(255, 255, 255, ${1 - overlayOpacity})`
              : theme.cardBg,
          },
        ]}
      >
        {frameDataUri && (
          <Image
            source={{ uri: frameDataUri }}
            style={styles.frameSvgOverlay}
            resizeMode="stretch"
          />
        )}

        {/* Top Ornament */}
        <View style={[styles.ornamentRow, { marginBottom: Math.max(2, Math.round(4 * liveScale)), gap: Math.round(6 * liveScale) }]}>
          <Text style={[styles.sparkleText, { color: theme.accentColor, fontSize: Math.round(12 * liveScale) }]}>✦</Text>
          <Text style={[styles.dateTag, { color: isDark ? '#A1A1AA' : '#6B7280', fontSize: liveDateTagSize }]}>
            {customDateOrSub}
          </Text>
          <Text style={[styles.sparkleText, { color: theme.accentColor, fontSize: Math.round(12 * liveScale) }]}>✦</Text>
        </View>

        {/* Couple Names / Title */}
        {renderCoupleNamesBlock(liveCoupleNameSize, false, Math.round(230 * liveScale))}

        {/* Badge */}
        <View
          style={[
            styles.badgeContainer,
            {
              backgroundColor: theme.badgeBg,
              borderColor: theme.badgeBorder,
              paddingVertical: Math.max(3, Math.round(4 * liveScale)),
              paddingHorizontal: Math.round(12 * liveScale),
              marginBottom: liveSpacing,
            },
          ]}
        >
          <Ionicons
            name={tableNumToDisplay ? 'restaurant-outline' : 'camera-outline'}
            size={Math.max(9, Math.round(11 * liveScale))}
            color={theme.badgeTextColor}
          />
          <Text style={[styles.badgeText, { color: theme.badgeTextColor, fontSize: liveBadgeFontSize }]}>
            {badgeContent}
          </Text>
        </View>

        {qrElement}

        {/* Call to action & Slogan */}
        <Text style={[styles.actionTitle, { color: theme.primaryTextColor, fontSize: liveActionTitleSize, marginBottom: Math.max(2, Math.round(3 * liveScale)) }]}>
          {isBackSide ? 'Anı Defterimize Not Bırakın' : actionTitle}
        </Text>
        <Text style={[styles.actionDesc, { color: isDark ? '#D4D4D8' : '#4B5563', fontSize: liveSloganFontSize, marginBottom: liveSpacing }]}>
          {customSlogan}
        </Text>

        {/* 3 Step Guide */}
        {showSteps && (
          <View style={[styles.stepsRow, { marginBottom: liveSpacing, gap: Math.round(5 * liveScale) }]}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder, width: Math.round(24 * liveScale), height: Math.round(24 * liveScale) },
                ]}
              >
                <Ionicons name="scan-outline" size={Math.max(10, Math.round(12 * liveScale))} color={theme.badgeTextColor} />
              </View>
              <Text style={[styles.stepText, { color: isDark ? '#D4D4D8' : '#4B5563', fontSize: Math.max(7, Math.round(8.5 * liveScale)) }]}>
                {step1}
              </Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: theme.accentColor + '50', width: Math.round(12 * liveScale) }]} />
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder, width: Math.round(24 * liveScale), height: Math.round(24 * liveScale) },
                ]}
              >
                <Ionicons name="cloud-upload-outline" size={Math.max(10, Math.round(12 * liveScale))} color={theme.badgeTextColor} />
              </View>
              <Text style={[styles.stepText, { color: isDark ? '#D4D4D8' : '#4B5563', fontSize: Math.max(7, Math.round(8.5 * liveScale)) }]}>
                {step2}
              </Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: theme.accentColor + '50', width: Math.round(12 * liveScale) }]} />
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder, width: Math.round(24 * liveScale), height: Math.round(24 * liveScale) },
                ]}
              >
                <Ionicons name="tv-outline" size={Math.max(10, Math.round(12 * liveScale))} color={theme.badgeTextColor} />
              </View>
              <Text style={[styles.stepText, { color: isDark ? '#D4D4D8' : '#4B5563', fontSize: Math.max(7, Math.round(8.5 * liveScale)) }]}>
                {step3}
              </Text>
            </View>
          </View>
        )}

        {/* Footer Link */}
        <Text
          style={[
            styles.footerLink,
            {
              color: theme.namesColor,
              // @ts-ignore
              fontFamily: Platform.OS === 'web' ? selectedFont.family : undefined,
              fontSize: liveFooterFontSize,
            },
          ]}
        >
          {footerText}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Studio Configuration Toolbox */}
      <View style={[styles.toolboxCard, { maxWidth: 680 }]}>
        <View style={styles.toolboxHeader}>
          <View style={styles.toolboxIconCircle}>
            <Ionicons name="color-palette" size={22} color="#C5A059" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolboxTitle}>Masa QR Kartı Tasarım Stüdyosu</Text>
            <Text style={styles.toolboxSubtitle}>
              5 farklı kart düzeni, hazır çerçeve şablonları, özel görsel yükleme ve A4 baskı motoru.
            </Text>
          </View>
        </View>

        {/* SECTION 0: KART TASARIM KONSEPTİ (NEW 5 DIFFERENT ARCHETYPES) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderLabel}>1. KART TASARIM KONSEPTİ (5 FARKLI DÜZEN):</Text>
          <Text style={styles.dragHintText}>↔ Sürükleyin veya kaydırın</Text>
        </View>
        <DraggableScrollView
          contentContainerStyle={styles.cardDesignsRow}
        >
          {(Object.keys(CARD_DESIGNS) as CardDesignArchetype[]).map((dId) => {
            const dConf = CARD_DESIGNS[dId];
            const isSelected = cardDesign === dId;
            return (
              <TouchableOpacity
                key={dId}
                style={[styles.cardDesignTile, isSelected && styles.cardDesignTileActive]}
                onPress={() => setCardDesign(dId)}
                activeOpacity={0.8}
              >
                <View style={styles.cardDesignTopRow}>
                  <Ionicons
                    name={dConf.icon as any}
                    size={20}
                    color={isSelected ? '#8A6D3B' : '#6B7280'}
                  />
                  <Text style={[styles.cardDesignBadge, isSelected && styles.cardDesignBadgeActive]}>
                    {dConf.badge}
                  </Text>
                </View>
                <Text style={[styles.cardDesignTitle, isSelected && styles.cardDesignTitleActive]}>
                  {dConf.name}
                </Text>
                <Text style={styles.cardDesignDesc}>{dConf.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </DraggableScrollView>

        {/* SECTION 1: Çerçeve & Arka Plan Seçimi */}
        <View style={styles.sectionDivider} />
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderLabel}>2. ÇERÇEVE & ARKA PLAN RESMİ:</Text>
          <Text style={styles.dragHintText}>↔ Sürükleyin veya kaydırın</Text>
        </View>
        
        {/* Frame Presets Carousel */}
        <DraggableScrollView
          contentContainerStyle={styles.framePresetsRow}
        >
          {(Object.keys(FRAME_PRESETS) as FramePresetId[]).map((fId) => {
            const fConf = FRAME_PRESETS[fId];
            const isSelected = framePreset === fId;
            return (
              <TouchableOpacity
                key={fId}
                style={[styles.framePresetCard, isSelected && styles.framePresetCardActive]}
                onPress={() => {
                  setFramePreset(fId);
                  if (fConf.suggestedTheme && !customBgUrl) {
                    setCardTheme(fConf.suggestedTheme);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.frameIconRow}>
                  <Ionicons name={fConf.icon as any} size={18} color={fConf.previewBorderColor} />
                  <Text style={[styles.frameBadgeText, { color: fConf.previewBorderColor }]}>
                    {fConf.badge}
                  </Text>
                </View>
                <Text style={[styles.framePresetName, isSelected && styles.framePresetNameActive]}>
                  {fConf.name}
                </Text>
                <Text style={styles.framePresetDesc}>{fConf.desc.split('&')[0]}</Text>
              </TouchableOpacity>
            );
          })}
        </DraggableScrollView>

        {/* Custom Background Image Upload Card */}
        <View style={styles.uploadBoxContainer}>
          <View style={styles.uploadBoxHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadBoxTitle}>Ekstra Kendi Resmini / Çerçeveni Yükle</Text>
              <Text style={styles.uploadBoxSub}>
                Davetiyenizin arka planını, matbaa çerçevenizi veya salon fotoğrafını yükleyin
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.customBgBtn, customBgUrl ? styles.customBgBtnActive : null]}
              onPress={handlePickBgImage}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-upload" size={16} color="#8A6D3B" />
              <Text style={styles.customBgBtnText}>
                {customBgUrl ? 'Resmi Değiştir' : 'Resim Seç / Yükle'}
              </Text>
            </TouchableOpacity>
          </View>

          {customBgUrl && (
            <View style={styles.uploadedImagePreviewRow}>
              <Image source={{ uri: customBgUrl }} style={styles.uploadedThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadedSuccessText}>✓ Özel Resim Yüklendi ve Uygulandı</Text>
                <Text style={styles.uploadedHintText}>
                  Yazıların ve QR kodun rahat okunması için örtü saydamlığını ayarlayabilirsiniz:
                </Text>
                <View style={styles.opacityPillsRow}>
                  {[
                    { label: '%0 Net', val: 0 },
                    { label: '%25 Hafif', val: 0.25 },
                    { label: '%45 Dengeli', val: 0.45 },
                    { label: '%65 Belirgin', val: 0.65 },
                  ].map((op) => (
                    <TouchableOpacity
                      key={op.label}
                      style={[
                        styles.opacityPill,
                        overlayOpacity === op.val && styles.opacityPillActive,
                      ]}
                      onPress={() => setOverlayOpacity(op.val)}
                    >
                      <Text
                        style={[
                          styles.opacityPillText,
                          overlayOpacity === op.val && styles.opacityPillTextActive,
                        ]}
                      >
                        {op.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeBgBtn}
                onPress={() => setCustomBgUrl(null)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.removeBgBtnText}>Kaldır</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SECTION 2: Renk & Tema Paleti */}
        <View style={styles.sectionDivider} />
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderLabel}>3. RENK TEMASI PALETİ:</Text>
          <Text style={styles.dragHintText}>↔ Sürükleyin veya kaydırın</Text>
        </View>
        <DraggableScrollView
          contentContainerStyle={styles.themePillsRow}
        >
          {(Object.keys(THEME_CONFIGS) as CardThemeId[]).map((tId) => {
            const conf = THEME_CONFIGS[tId];
            const isSelected = cardTheme === tId;
            return (
              <TouchableOpacity
                key={tId}
                style={[styles.themePill, isSelected && styles.themePillActive]}
                onPress={() => setCardTheme(tId)}
                activeOpacity={0.8}
              >
                <View style={[styles.themeDot, { backgroundColor: conf.border }]} />
                <View>
                  <Text style={[styles.themePillText, isSelected && styles.themePillTextActive]}>
                    {conf.name}
                  </Text>
                  <Text style={styles.themePillSub}>{conf.desc.split('&')[0]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </DraggableScrollView>

        {/* SECTION 3: Typography & Font Selector */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeaderLabel}>4. YAZI TİPİ (FONT SEÇENEKLERİ):</Text>
        <View style={styles.fontGrid}>
          {(Object.keys(FONT_CONFIGS) as CardFontId[]).map((fId) => {
            const fontConf = FONT_CONFIGS[fId];
            const isSelected = fontFamily === fId;
            return (
              <TouchableOpacity
                key={fId}
                style={[styles.fontCard, isSelected && styles.fontCardActive]}
                onPress={() => setFontFamily(fId)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.fontCardPreview,
                    {
                      color: isSelected ? '#8A6D3B' : '#1A1817',
                      // @ts-ignore
                      fontFamily: Platform.OS === 'web' ? fontConf.family : undefined,
                    },
                  ]}
                >
                  {customTitle}
                </Text>
                <Text style={[styles.fontCardName, isSelected && styles.fontCardNameActive]}>
                  {fontConf.name} ({fontConf.styleName})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SECTION 4: Text Customization */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeaderLabel}>5. KART YAZILARI & METİNLER:</Text>
        <View style={styles.inputGrid}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>👰 Gelin İsmi:</Text>
            <TextInput
              style={styles.textInputFull}
              value={brideName}
              onChangeText={setBrideName}
              placeholder="Örn: Şule"
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>🤵 Damat İsmi:</Text>
            <TextInput
              style={styles.textInputFull}
              value={groomName}
              onChangeText={setGroomName}
              placeholder="Örn: Samet"
            />
          </View>
        </View>

        <View style={styles.inputGrid}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Üst Tarih / Slogan:</Text>
            <TextInput
              style={styles.textInputFull}
              value={customDateOrSub}
              onChangeText={setCustomDateOrSub}
              placeholder="Örn: 08 Ekim 2026 veya #SuleSamet"
            />
          </View>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Ana Çağrı Metni:</Text>
            <TextInput
              style={styles.textInputFull}
              value={actionTitle}
              onChangeText={setActionTitle}
              placeholder="Örn: Fotoğrafları Bizimle Paylaşın"
            />
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={styles.inputLabel}>Alt Link / Hashtag:</Text>
          <TextInput
            style={styles.textInputFull}
            value={footerText}
            onChangeText={setFooterText}
            placeholder={`qr-la.com/${event.slug}`}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={styles.inputLabel}>Açıklama / Slogan:</Text>
          <TextInput
            style={[styles.textInputFull, { minHeight: 44 }]}
            value={customSlogan}
            onChangeText={setCustomSlogan}
            multiline
            placeholder="Kart üzerindeki yönlendirme sloganı..."
          />
          <View style={styles.quickSlogansRow}>
            <TouchableOpacity
              style={styles.quickSloganChip}
              onPress={() =>
                setCustomSlogan('Kameranızı açıp QR kodu okutun, en özel kareleri bizimle paylaşın!')
              }
            >
              <Text style={styles.quickSloganChipText}>✨ Standart Anı Paylaşımı</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSloganChip}
              onPress={() =>
                setCustomSlogan('Çektiğiniz fotoğraf ve videolar anında dev projeksiyon ekranına yansısın!')
              }
            >
              <Text style={styles.quickSloganChipText}>📺 Canlı Projeksiyon Vurgusu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSloganChip}
              onPress={() =>
                setCustomSlogan('Fotoğraflarınızı yükleyin ve anı defterimize sevgi dolu bir not bırakın.')
              }
            >
              <Text style={styles.quickSloganChipText}>📖 Anı Defteri Mesajı</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3 Step Guide Toggle & Inputs */}
        <View style={[styles.controlRow, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>3 Adımlı Yönlendirme Rehberi Gösterilsin mi?</Text>
            <Text style={styles.settingDesc}>
              {showSteps ? 'Etkin (1. Tara • 2. Yükle • 3. Ekranda Gör)' : 'Kapalı (Daha sade görünüm)'}
            </Text>
          </View>
          <Switch
            value={showSteps}
            onValueChange={setShowSteps}
            trackColor={{ false: '#E5E7EB', true: '#C5A059' }}
            thumbColor="#FFF"
          />
        </View>

        {showSteps && (
          <View style={styles.inputGrid}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>1. Adım Metni:</Text>
              <TextInput style={styles.textInputFull} value={step1} onChangeText={setStep1} />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>2. Adım Metni:</Text>
              <TextInput style={styles.textInputFull} value={step2} onChangeText={setStep2} />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>3. Adım Metni:</Text>
              <TextInput style={styles.textInputFull} value={step3} onChangeText={setStep3} />
            </View>
          </View>
        )}

        {/* SECTION 5: Masa Numarası & Toplu Seri Baskı */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeaderLabel}>6. MASA NUMARASI & TOPLU SERİ BASKI:</Text>

        <View style={styles.controlRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Masa Numarası Etkinleştirilsin mi?</Text>
            <Text style={styles.settingDesc}>
              {showTableNumber
                ? 'Masa numaralı kartlar hazırlanacak'
                : 'Masa numarasız genel kart (Örn: "FOTOĞRAF PAYLAŞIMI")'}
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
          <View style={styles.tableConfigBox}>
            <View style={styles.controlRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Toplu Seri Numaralandırma (Çoklu Masa):</Text>
                <Text style={styles.settingDesc}>
                  Tüm masalar için tek tıkla otomatik kart serisi üretin (Örn: Masa 1'den Masa 15'e)
                </Text>
              </View>
              <Switch
                value={isBatchMode}
                onValueChange={setIsBatchMode}
                trackColor={{ false: '#E5E7EB', true: '#C5A059' }}
                thumbColor="#FFF"
              />
            </View>

            {isBatchMode ? (
              <View style={styles.batchRow}>
                <View style={styles.batchInputCol}>
                  <Text style={styles.inputLabel}>Başlangıç Masası:</Text>
                  <TextInput
                    style={styles.tableTextInput}
                    value={batchFrom}
                    onChangeText={setBatchFrom}
                    keyboardType="number-pad"
                  />
                </View>
                <Ionicons name="arrow-forward" size={18} color="#C5A059" style={{ marginTop: 22 }} />
                <View style={styles.batchInputCol}>
                  <Text style={styles.inputLabel}>Bitiş Masası:</Text>
                  <TextInput
                    style={styles.tableTextInput}
                    value={batchTo}
                    onChangeText={setBatchTo}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', marginTop: 12 }}>
                  <Text style={styles.batchCountInfo}>
                    Toplam {Math.max(0, (parseInt(batchTo, 10) || 1) - (parseInt(batchFrom, 10) || 1) + 1)} masa kartı üretilecek
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.singleTableInputRow}>
                <Text style={styles.inputLabel}>Masa Numarası:</Text>
                <TextInput
                  style={styles.tableTextInput}
                  value={singleTableNumber}
                  onChangeText={setSingleTableNumber}
                  keyboardType="number-pad"
                  placeholder="1"
                />
              </View>
            )}
          </View>
        ) : (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.inputLabel}>Rozet Başlığı Metni:</Text>
            <TextInput
              style={styles.textInputFull}
              value={badgeText}
              onChangeText={setBadgeText}
              placeholder="FOTOĞRAF & ANI PAYLAŞIMI"
            />
          </View>
        )}

        {/* SECTION 6: QR Kod Rengi & Orta İkon */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeaderLabel}>7. QR KOD RENGİ & ORTA İKON:</Text>
        <View style={styles.qrSettingsRow}>
          <View style={styles.qrColorCol}>
            <Text style={styles.inputLabel}>QR Rengi:</Text>
            <View style={styles.colorPillsRow}>
              {[
                { label: 'Siyah', color: '#1A1817' },
                { label: 'Altın', color: '#8A6D3B' },
                { label: 'Zümrüt', color: '#2D5A43' },
                { label: 'Bordo', color: '#9B4D58' },
                { label: 'Lacivert', color: '#1E3A8A' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.color}
                  style={[
                    styles.colorPill,
                    { backgroundColor: c.color },
                    qrColor === c.color && styles.colorPillActive,
                  ]}
                  onPress={() => setQrColor(c.color)}
                  activeOpacity={0.8}
                />
              ))}
            </View>
          </View>

          <View style={styles.qrIconCol}>
            <Text style={styles.inputLabel}>QR Ortası İkonu:</Text>
            <View style={styles.iconButtonsRow}>
              {[
                { id: 'camera', label: 'Kamera', icon: 'camera' },
                { id: 'heart', label: 'Kalp', icon: 'heart' },
                { id: 'sparkles', label: 'Işıltı', icon: 'sparkles' },
                { id: 'none', label: 'Yok', icon: 'close-circle' },
              ].map((ic) => (
                <TouchableOpacity
                  key={ic.id}
                  style={[styles.iconChoiceBtn, qrIcon === ic.id && styles.iconChoiceBtnActive]}
                  onPress={() => setQrIcon(ic.id as QRIconId)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={ic.icon as any}
                    size={14}
                    color={qrIcon === ic.id ? '#C5A059' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.iconChoiceLabel,
                      qrIcon === ic.id && styles.iconChoiceLabelActive,
                    ]}
                  >
                    {ic.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION 8: Kart Boyutu (Ebat Seçenekleri) */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeaderLabel}>8. KART BOYUTU (EBAT SEÇENEKLERİ):</Text>
        <View style={styles.sizeSelectorGrid}>
          {(Object.keys(CARD_SIZES) as CardSizeId[]).map((sId) => {
            const sConf = CARD_SIZES[sId];
            const isSelected = cardSize === sId;
            return (
              <TouchableOpacity
                key={sId}
                style={[styles.sizeCard, isSelected && styles.sizeCardActive]}
                onPress={() => setCardSize(sId)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={sConf.icon as any}
                  size={20}
                  color={isSelected ? '#8A6D3B' : '#6B7280'}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.sizeCardTitleRow}>
                    <Text style={[styles.sizeCardTitle, isSelected && styles.sizeCardTitleActive]}>
                      {sConf.name}
                    </Text>
                    <View style={[styles.sizeBadge, isSelected && styles.sizeBadgeActive]}>
                      <Text style={[styles.sizeBadgeText, isSelected && styles.sizeBadgeTextActive]}>
                        {sConf.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sizeCardDesc}>{sConf.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SECTION 9: Baskı Formatı / A4 Kağıt Düzeni */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeaderLabel}>9. A4 SAYFA DÜZENİ / BASKI FORMATI:</Text>
        <View style={styles.layoutSelectorGrid}>
          <TouchableOpacity
            style={[styles.layoutCard, cardLayout === 'single' && styles.layoutCardActive]}
            onPress={() => setCardLayout('single')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="document-outline"
              size={20}
              color={cardLayout === 'single' ? '#C5A059' : '#6B7280'}
            />
            <View>
              <Text style={[styles.layoutCardTitle, cardLayout === 'single' && styles.layoutCardTitleActive]}>
                Tekli Büyük Kart (A5/A4)
              </Text>
              <Text style={styles.layoutCardDesc}>Şövale veya masa çerçeveleri için tekli büyük baskı</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.layoutCard, cardLayout === 'tent' && styles.layoutCardActive]}
            onPress={() => setCardLayout('tent')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="triangle-outline"
              size={20}
              color={cardLayout === 'tent' ? '#C5A059' : '#6B7280'}
            />
            <View>
              <Text style={[styles.layoutCardTitle, cardLayout === 'tent' && styles.layoutCardTitleActive]}>
                Üçgen Masa Standı (Katlamalı)
              </Text>
              <Text style={styles.layoutCardDesc}>Ön + 180° ters arka yüz (katlanınca iki taraf düz)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.layoutCard, cardLayout === 'double' && styles.layoutCardActive]}
            onPress={() => setCardLayout('double')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="copy-outline"
              size={20}
              color={cardLayout === 'double' ? '#C5A059' : '#6B7280'}
            />
            <View>
              <Text style={[styles.layoutCardTitle, cardLayout === 'double' && styles.layoutCardTitleActive]}>
                A4'te 2 Kart (A6 / Yarım Sayfa)
              </Text>
              <Text style={styles.layoutCardDesc}>Sayfayı ortadan ikiye kesmek için 2 adet kart</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.layoutCard, cardLayout === 'quad' && styles.layoutCardActive]}
            onPress={() => setCardLayout('quad')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="grid-outline"
              size={20}
              color={cardLayout === 'quad' ? '#C5A059' : '#6B7280'}
            />
            <View>
              <Text style={[styles.layoutCardTitle, cardLayout === 'quad' && styles.layoutCardTitleActive]}>
                A4'te 4 Kart (2x2 Izgara)
              </Text>
              <Text style={styles.layoutCardDesc}>1 sayfaya 4 adet kart, kesim çizgili en ekonomik düzen</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons: Print & Download QR */}
        <View style={styles.actionsRow}>
          {Platform.OS === 'web' && (
            <TouchableOpacity style={styles.printActionBtn} onPress={handlePrint} activeOpacity={0.85}>
              <Ionicons name="print" size={20} color="#FFF" />
              <View>
                <Text style={styles.printActionBtnText}>
                  {showTableNumber && isBatchMode
                    ? `Toplu Baskı Al (${Math.max(1, (parseInt(batchTo, 10) || 1) - (parseInt(batchFrom, 10) || 1) + 1)} Masa)`
                    : 'Baskı Al / PDF Kaydet'}
                </Text>
                <Text style={styles.printActionBtnSub}>Sadece kartlar yazdırılır (A4 Hazır)</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.downloadQrBtn} onPress={handleDownloadQrPng} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={20} color="#8A6D3B" />
            <View>
              <Text style={styles.downloadQrBtnText}>QR Kodunu İndir (HD PNG)</Text>
              <Text style={styles.downloadQrBtnSub}>Grafiker veya matbaalar için</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Preview Section */}
      <View style={styles.previewContainer} id="qr-card-printable-area">
        <View style={styles.previewHeader}>
          <Ionicons name="sparkles" size={16} color="#C5A059" />
          <Text style={styles.previewHeaderText}>
            CANLI BASKI ÖNİZLEMESİ ({CARD_DESIGNS[cardDesign].name} • {selectedSizeConfig.label} • {cardLayout === 'tent' ? 'Üçgen Stand' : cardLayout === 'double' ? 'A4 2 Kart' : cardLayout === 'quad' ? 'A4 4 Kart' : 'Tekli Kart'})
          </Text>
        </View>

        {cardLayout === 'tent' ? (
          <View style={styles.tentWrapper}>
            {/* TOP CARD: ROTATED 180 DEG (UPSIDE DOWN) */}
            <View
              style={[
                styles.cardPaper,
                cardPaperDimensionStyle,
                styles.tentTopCard,
              ]}
            >
              {customBgUrl && (
                <Image
                  source={{ uri: customBgUrl }}
                  style={styles.cardBgImageAbsolute}
                  resizeMode="cover"
                />
              )}
              <View style={[styles.tentSideTag, { backgroundColor: '#8A6D3B' }]}>
                <Text style={styles.tentSideTagText}>🔄 180° BAŞ AŞAĞI (KATLANDIĞINDA DÜZ GÖRÜNÜR)</Text>
              </View>
              {renderLiveCardContent(showTableNumber ? singleTableNumber : null, true)}
            </View>

            <View style={styles.foldLineContainer}>
              <View style={styles.foldDash} />
              <View style={styles.foldBadge}>
                <Ionicons name="cut-outline" size={12} color="#6B7280" />
                <Text style={styles.foldBadgeText}>✂ KATLAMA ÇİZGİSİ (180° KATLAYIN)</Text>
              </View>
              <View style={styles.foldDash} />
            </View>

            {/* BOTTOM CARD: NORMAL (0 DEG) */}
            <View
              style={[
                styles.cardPaper,
                cardPaperDimensionStyle,
                styles.tentBottomCard,
              ]}
            >
              {customBgUrl && (
                <Image
                  source={{ uri: customBgUrl }}
                  style={styles.cardBgImageAbsolute}
                  resizeMode="cover"
                />
              )}
              <View style={styles.tentSideTag}>
                <Text style={styles.tentSideTagText}>ÖN YÜZ (DÜZ)</Text>
              </View>
              {renderLiveCardContent(showTableNumber ? singleTableNumber : null, false)}
            </View>
          </View>
        ) : cardLayout === 'double' ? (
          <View style={styles.a4DoubleWrapper}>
            <View style={styles.a4PreviewBadge}>
              <Ionicons name="copy-outline" size={13} color="#8A6D3B" />
              <Text style={styles.a4PreviewBadgeText}>📄 A4 SAYFADA 2 KART BASKI DÜZENİ</Text>
            </View>
            <View style={styles.doubleCardSlot}>
              <View style={[styles.cardPaper, cardPaperDimensionStyle, styles.doubleSlotCard]}>
                {customBgUrl && <Image source={{ uri: customBgUrl }} style={styles.cardBgImageAbsolute} resizeMode="cover" />}
                {renderLiveCardContent(showTableNumber ? singleTableNumber : null, false)}
              </View>
            </View>

            <View style={styles.foldLineContainer}>
              <View style={styles.foldDash} />
              <View style={styles.foldBadge}>
                <Ionicons name="cut-outline" size={12} color="#6B7280" />
                <Text style={styles.foldBadgeText}>✂ SAYFAYI İKİYE KESİN</Text>
              </View>
              <View style={styles.foldDash} />
            </View>

            <View style={styles.doubleCardSlot}>
              <View style={[styles.cardPaper, cardPaperDimensionStyle, styles.doubleSlotCard]}>
                {customBgUrl && <Image source={{ uri: customBgUrl }} style={styles.cardBgImageAbsolute} resizeMode="cover" />}
                {renderLiveCardContent(showTableNumber && isBatchMode ? String((parseInt(singleTableNumber, 10) || 1) + 1) : (showTableNumber ? singleTableNumber : null), false)}
              </View>
            </View>
          </View>
        ) : cardLayout === 'quad' ? (
          <View style={styles.quadPreviewWrapper}>
            <View style={styles.a4PreviewBadge}>
              <Ionicons name="grid-outline" size={13} color="#8A6D3B" />
              <Text style={styles.a4PreviewBadgeText}>📄 A4 SAYFADA 4 KART (2x2 KESİM DÜZENİ)</Text>
            </View>
            <View style={styles.quadGrid2x2}>
              <View style={styles.quadGridRow}>
                <View style={styles.quadSlot}>
                  <View style={[styles.cardPaper, cardPaperDimensionStyle, styles.quadSlotScaledCard]}>
                    {customBgUrl && <Image source={{ uri: customBgUrl }} style={styles.cardBgImageAbsolute} resizeMode="cover" />}
                    {renderLiveCardContent(showTableNumber ? singleTableNumber : null, false)}
                  </View>
                </View>
                <View style={styles.quadSlot}>
                  <View style={[styles.cardPaper, cardPaperDimensionStyle, styles.quadSlotScaledCard]}>
                    {customBgUrl && <Image source={{ uri: customBgUrl }} style={styles.cardBgImageAbsolute} resizeMode="cover" />}
                    {renderLiveCardContent(showTableNumber && isBatchMode ? String((parseInt(singleTableNumber, 10) || 1) + 1) : (showTableNumber ? singleTableNumber : null), false)}
                  </View>
                </View>
              </View>

              <View style={styles.foldLineContainer}>
                <View style={styles.foldDash} />
                <View style={styles.foldBadge}>
                  <Ionicons name="cut-outline" size={12} color="#6B7280" />
                  <Text style={styles.foldBadgeText}>✂ YATAY VE DİKEY KESİM ÇİZGİSİ</Text>
                </View>
                <View style={styles.foldDash} />
              </View>

              <View style={styles.quadGridRow}>
                <View style={styles.quadSlot}>
                  <View style={[styles.cardPaper, cardPaperDimensionStyle, styles.quadSlotScaledCard]}>
                    {customBgUrl && <Image source={{ uri: customBgUrl }} style={styles.cardBgImageAbsolute} resizeMode="cover" />}
                    {renderLiveCardContent(showTableNumber && isBatchMode ? String((parseInt(singleTableNumber, 10) || 1) + 2) : (showTableNumber ? singleTableNumber : null), false)}
                  </View>
                </View>
                <View style={styles.quadSlot}>
                  <View style={[styles.cardPaper, cardPaperDimensionStyle, styles.quadSlotScaledCard]}>
                    {customBgUrl && <Image source={{ uri: customBgUrl }} style={styles.cardBgImageAbsolute} resizeMode="cover" />}
                    {renderLiveCardContent(showTableNumber && isBatchMode ? String((parseInt(singleTableNumber, 10) || 1) + 3) : (showTableNumber ? singleTableNumber : null), false)}
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.cardPaper,
              cardPaperDimensionStyle,
            ]}
          >
            {customBgUrl && (
              <Image
                source={{ uri: customBgUrl }}
                style={styles.cardBgImageAbsolute}
                resizeMode="cover"
              />
            )}
            {renderLiveCardContent(showTableNumber ? singleTableNumber : null, false)}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  toolboxCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    shadowColor: '#C5A059',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  toolboxHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 18,
  },
  toolboxIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolboxTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  toolboxSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 2,
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8A6D3B',
    letterSpacing: 0.8,
  },
  dragHintText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F3EFE6',
    marginVertical: 16,
  },

  // Card Design Archetypes Carousel Styles
  cardDesignsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 8,
  },
  cardDesignTile: {
    width: 145,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    // @ts-ignore
    userSelect: Platform.OS === 'web' ? 'none' : undefined,
  },
  cardDesignTileActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
    transform: [{ scale: 1.02 }],
  },
  cardDesignTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardDesignBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  cardDesignBadgeActive: {
    color: '#8A6D3B',
  },
  cardDesignTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 2,
  },
  cardDesignTitleActive: {
    color: '#8A6D3B',
  },
  cardDesignDesc: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 13,
  },

  // Frame Presets Carousel Styles
  framePresetsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 8,
  },
  framePresetCard: {
    width: 135,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    // @ts-ignore
    userSelect: Platform.OS === 'web' ? 'none' : undefined,
  },
  framePresetCardActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
    transform: [{ scale: 1.02 }],
  },
  frameIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  frameBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  framePresetName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 2,
  },
  framePresetNameActive: {
    color: '#8A6D3B',
  },
  framePresetDesc: {
    fontSize: 10,
    color: '#9CA3AF',
    lineHeight: 13,
  },

  // Upload Custom Image Box
  uploadBoxContainer: {
    backgroundColor: '#FDFBF7',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#EAD7BB',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  uploadBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  uploadBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 2,
  },
  uploadBoxSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  customBgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: '#C5A059',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  customBgBtnActive: {
    backgroundColor: '#F5E7C8',
  },
  customBgBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A6D3B',
  },
  uploadedImagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0E7D8',
  },
  uploadedThumb: {
    width: 60,
    height: 75,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C5A059',
  },
  uploadedSuccessText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 2,
  },
  uploadedHintText: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 6,
  },
  opacityPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  opacityPill: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  opacityPillActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
  },
  opacityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  opacityPillTextActive: {
    color: '#8A6D3B',
    fontWeight: '800',
  },
  removeBgBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: 6,
  },
  removeBgBtnText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '700',
  },

  themePillsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 6,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    // @ts-ignore
    userSelect: Platform.OS === 'web' ? 'none' : undefined,
  },
  themePillActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
  },
  themeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
  },
  themePillTextActive: {
    color: '#8A6D3B',
  },
  themePillSub: {
    fontSize: 10,
    color: '#9CA3AF',
  },

  fontGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fontCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  fontCardActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
  },
  fontCardPreview: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  fontCardName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  fontCardNameActive: {
    color: '#8A6D3B',
    fontWeight: '800',
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  inputCol: {
    flex: 1,
    minWidth: 200,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 4,
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
  tableConfigBox: {
    backgroundColor: '#FBF9F4',
    borderWidth: 1,
    borderColor: '#EAD7BB',
    padding: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  batchInputCol: {
    width: 90,
  },
  batchCountInfo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  singleTableInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  tableTextInput: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#EAD7BB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1817',
    textAlign: 'center',
    width: 80,
  },
  qrSettingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  qrColorCol: {
    flex: 1,
    minWidth: 180,
  },
  qrIconCol: {
    flex: 1,
    minWidth: 200,
  },
  colorPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  colorPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  colorPillActive: {
    borderColor: '#C5A059',
    transform: [{ scale: 1.15 }],
  },
  iconButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  iconChoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  iconChoiceBtnActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
  },
  iconChoiceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  iconChoiceLabelActive: {
    color: '#8A6D3B',
    fontWeight: '800',
  },
  sizeSelectorGrid: {
    gap: 8,
  },
  sizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    padding: 12,
    borderRadius: 14,
  },
  sizeCardActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
  },
  sizeCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  sizeCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
  },
  sizeCardTitleActive: {
    color: '#8A6D3B',
  },
  sizeBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sizeBadgeActive: {
    backgroundColor: '#C5A059',
  },
  sizeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  sizeBadgeTextActive: {
    color: '#FFF',
  },
  sizeCardDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  layoutSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  layoutCard: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    padding: 12,
    borderRadius: 12,
  },
  layoutCardActive: {
    borderColor: '#C5A059',
    backgroundColor: '#FAF5EA',
  },
  layoutCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4B5563',
  },
  layoutCardTitleActive: {
    color: '#8A6D3B',
  },
  layoutCardDesc: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 22,
  },
  printActionBtn: {
    flex: 1.2,
    minWidth: 220,
    backgroundColor: '#1A1817',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  printActionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  printActionBtnSub: {
    color: '#D4D4D8',
    fontSize: 10,
  },
  downloadQrBtn: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: '#EAD7BB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  downloadQrBtnText: {
    color: '#8A6D3B',
    fontSize: 13,
    fontWeight: '800',
  },
  downloadQrBtnSub: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  previewHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.8,
  },
  cardPaper: {
    width: 370,
    maxWidth: '100%',
    borderRadius: 24,
    padding: 12,
    borderWidth: 3.5,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardBgImageAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  innerBorder: {
    position: 'relative',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    zIndex: 2,
    overflow: 'hidden',
  },
  frameSvgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    zIndex: 2,
  },
  sparkleText: {
    fontSize: 13,
    fontWeight: '900',
  },
  dateTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  coupleNames: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginVertical: 6,
    zIndex: 2,
  },
  coupleNamesBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    zIndex: 2,
    width: '100%',
  },
  coupleNamePrimary: {
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  coupleNameSecondary: {
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  ampersandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    maxWidth: 140,
    marginVertical: 2,
  },
  ampersandLine: {
    flex: 1,
    height: 1,
    opacity: 0.6,
  },
  ampersandText: {
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
    marginHorizontal: 8,
    lineHeight: 17,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    zIndex: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  qrContainer: {
    width: 175,
    height: 175,
    padding: 8,
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
    zIndex: 2,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrLoadingBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCenterBadge: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
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
    zIndex: 2,
  },
  actionDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
    paddingHorizontal: 6,
    zIndex: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
    width: '100%',
    zIndex: 2,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 9,
    fontWeight: '700',
  },
  stepLine: {
    width: 22,
    height: 1.5,
    marginBottom: 14,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    zIndex: 2,
  },
  tentWrapper: {
    gap: 3,
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
    gap: 6,
    width: 370,
    maxWidth: '100%',
    paddingVertical: 2,
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
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  foldBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  tentTopCard: {
    transform: [{ rotate: '180deg' }],
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  tentBottomCard: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  tentInnerBorder: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  a4DoubleWrapper: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FAF8F5',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    padding: 12,
    alignItems: 'center',
  },
  a4PreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5EA',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAD7BB',
  },
  a4PreviewBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A6D3B',
  },
  doubleCardSlot: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  doubleSlotCard: {
    transform: [{ scale: 0.85 }],
    marginVertical: -25,
  },
  quadPreviewWrapper: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FAF8F5',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    padding: 12,
    alignItems: 'center',
  },
  quadGrid2x2: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  quadGridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  quadSlot: {
    width: 175,
    height: 250,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quadSlotScaledCard: {
    transform: [{ scale: 0.46 }],
  },

  // Archetype Specific Screen Styles
  polaroidContainer: {
    width: '100%',
    padding: 14,
    backgroundColor: '#FFF',
    borderRadius: 18,
    alignItems: 'center',
  },
  polaroidPhotoArea: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  polaroidTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 10,
  },
  polaroidTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  polaroidBottomArea: {
    marginTop: 12,
    alignItems: 'center',
  },

  tableHeroMedallion: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 2,
  },
  tableHeroLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tableHeroNum: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },

  boldQrWrapper: {
    borderWidth: 3,
    borderRadius: 22,
    padding: 10,
    marginVertical: 10,
    zIndex: 2,
  },
  boldScanBadge: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
    zIndex: 2,
  },
  boldScanBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  letterHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    zIndex: 2,
  },
  letterBody: {
    fontStyle: 'italic',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    zIndex: 2,
  },
});
