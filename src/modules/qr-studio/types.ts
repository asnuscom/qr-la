export type QRDotStyle = 'square' | 'dots' | 'rounded' | 'diamond';
export type QREyeFrameStyle = 'square' | 'rounded' | 'circle';
export type QREyePupilStyle = 'square' | 'circle' | 'rounded' | 'diamond';
export type QRColorMode = 'solid' | 'gradient';
export type QRGradientType = 'linear_diag' | 'linear_vert' | 'linear_horiz' | 'radial';
export type QRFrameStyle = 'none' | 'bottom_badge' | 'top_banner' | 'card_bubble';

export interface QRStudioConfig {
  text: string;
  dotStyle: QRDotStyle;
  eyeFrameStyle: QREyeFrameStyle;
  eyePupilStyle: QREyePupilStyle;
  
  // Renkler
  colorMode: QRColorMode;
  primaryColor: string;
  gradientSecondaryColor: string;
  gradientType: QRGradientType;
  eyeColor?: string; // Boşsa primaryColor ile aynı
  eyeFrameColor?: string; // İsteğe bağlı bağımsız dış çerçeve rengi
  eyePupilColor?: string; // İsteğe bağlı bağımsız iç göz bebeği rengi
  backgroundColor: string; // '#FFFFFF', '#0F172A', 'transparent', vb.
  
  // Logo & İkon
  logoType: 'none' | 'emoji' | 'url';
  logoEmoji?: string;
  logoUrl?: string;
  logoSizePercent: number; // örn: 22 (yüzde 22)
  logoBgColor: string;     // logo arkasındaki rozet rengi (#FFFFFF veya #0F172A)
  
  // Çerçeve / CTA
  frameStyle: QRFrameStyle;
  frameText: string;
  frameColor: string;
  frameTextColor: string;
  
  // Çıktı / Margin
  margin: number; // QR kenar boşluğu (1-4)
}

export interface QRPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  config: Partial<QRStudioConfig>;
}
