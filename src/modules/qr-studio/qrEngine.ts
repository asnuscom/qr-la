import QRCode from 'qrcode';
import { QRStudioConfig } from './types';

/**
 * Verilen QRStudioConfig ile saf, kristal netliğinde ve ölçeklenebilir SVG çıktısı üretir.
 */
export function generateCustomQRSvg(config: QRStudioConfig, targetSize = 600): string {
  if (!config.text || config.text.trim() === '') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${targetSize}" height="${targetSize}"></svg>`;
  }

  // 1. QR Matrisini 'H' (High - %30 hata düzeltme toleransı) ile hesapla
  let qr: QRCode.QRCode;
  try {
    qr = QRCode.create(config.text, {
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.warn('QR matrisi oluşturulamadı, geri çekiliniyor:', err);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${targetSize}" height="${targetSize}"></svg>`;
  }

  const { modules } = qr;
  const matrixSize = modules.size; // örn: 29, 33 vb.
  const marginCells = Math.max(1, Math.min(6, config.margin || 2));
  const totalGridSize = matrixSize + marginCells * 2;
  const cellSize = targetSize / totalGridSize;
  const marginPx = marginCells * cellSize;

  // Çerçeve (Frame / Badge) hesaplamaları
  const hasBottomBadge = config.frameStyle === 'bottom_badge' && config.frameText?.trim().length > 0;
  const hasTopBanner = config.frameStyle === 'top_banner' && config.frameText?.trim().length > 0;
  const badgeHeight = 72;
  const svgWidth = targetSize;
  const svgHeight = targetSize + (hasBottomBadge || hasTopBanner ? badgeHeight : 0);
  const qrOffsetY = hasTopBanner ? badgeHeight : 0;

  // 2. Köşe Göz (Eye) Alanı Tespiti (7x7)
  const isEyeArea = (r: number, c: number): boolean => {
    // Sol Üst
    if (r < 7 && c < 7) return true;
    // Sağ Üst
    if (r < 7 && c >= matrixSize - 7) return true;
    // Sol Alt
    if (r >= matrixSize - 7 && c < 7) return true;
    return false;
  };

  // 3. Logo Alanı Rezervasyonu (Merkez %18-24)
  const hasLogo = config.logoType !== 'none' && (config.logoEmoji || config.logoUrl);
  let minLogoRow = -1;
  let maxLogoRow = -1;
  let minLogoCol = -1;
  let maxLogoCol = -1;

  if (hasLogo) {
    const rawSpan = Math.round(matrixSize * (config.logoSizePercent / 100));
    // Simetriyi korumak için span tek/çift eşleşmesi
    const reservedCells = Math.max(5, Math.min(Math.floor(matrixSize * 0.32), rawSpan % 2 === matrixSize % 2 ? rawSpan : rawSpan + 1));
    const center = (matrixSize - 1) / 2;
    const halfSpan = (reservedCells - 1) / 2;
    minLogoRow = center - halfSpan;
    maxLogoRow = center + halfSpan;
    minLogoCol = center - halfSpan;
    maxLogoCol = center + halfSpan;
  }

  const isLogoArea = (r: number, c: number): boolean => {
    if (!hasLogo) return false;
    return r >= minLogoRow && r <= maxLogoRow && c >= minLogoCol && c <= maxLogoCol;
  };

  // 4. Renk & Gradyan Tanımlamaları
  const gradId = `qrGrad_${Math.random().toString(36).substring(2, 9)}`;
  let gradDefs = '';
  let fillPaint = config.primaryColor;
  let eyePaint = config.eyeColor || config.primaryColor;

  if (config.colorMode === 'gradient') {
    let x1 = '0%', y1 = '0%', x2 = '100%', y2 = '100%';
    if (config.gradientType === 'linear_vert') {
      x1 = '0%'; y1 = '0%'; x2 = '0%'; y2 = '100%';
    } else if (config.gradientType === 'linear_horiz') {
      x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '0%';
    }
    gradDefs = `
      <defs>
        <linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
          <stop offset="0%" stop-color="${config.primaryColor}" />
          <stop offset="100%" stop-color="${config.gradientSecondaryColor}" />
        </linearGradient>
      </defs>
    `;
    fillPaint = `url(#${gradId})`;
    if (!config.eyeColor) {
      eyePaint = `url(#${gradId})`;
    }
  }

  // 5. Arka Plan
  let bgElement = '';
  if (config.backgroundColor && config.backgroundColor.toLowerCase() !== 'transparent') {
    bgElement = `<rect width="${svgWidth}" height="${svgHeight}" rx="24" fill="${config.backgroundColor}" />`;
  }

  // 6. Veri Noktaları (Data Modules)
  const dotElements: string[] = [];
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // 1 olan siyah modüller
      if (modules.get(r, c) === 1) {
        if (isEyeArea(r, c) || isLogoArea(r, c)) {
          continue; // Göz ve logo alanlarını atla
        }

        const x = marginPx + c * cellSize;
        const y = qrOffsetY + marginPx + r * cellSize;

        if (config.dotStyle === 'dots') {
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          const rRadius = (cellSize * 0.44).toFixed(2);
          dotElements.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${rRadius}" fill="${fillPaint}" />`);
        } else if (config.dotStyle === 'rounded') {
          const rx = (cellSize * 0.35).toFixed(2);
          dotElements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${rx}" ry="${rx}" fill="${fillPaint}" />`);
        } else if (config.dotStyle === 'diamond') {
          const half = cellSize / 2;
          const p1 = `${(x + half).toFixed(2)},${y.toFixed(2)}`;
          const p2 = `${(x + cellSize).toFixed(2)},${(y + half).toFixed(2)}`;
          const p3 = `${(x + half).toFixed(2)},${(y + cellSize).toFixed(2)}`;
          const p4 = `${x.toFixed(2)},${(y + half).toFixed(2)}`;
          dotElements.push(`<polygon points="${p1} ${p2} ${p3} ${p4}" fill="${fillPaint}" />`);
        } else {
          // Standard square
          dotElements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${fillPaint}" />`);
        }
      }
    }
  }

  // 7. Özel 3 Köşe Göz (Eye Finder Patterns) Çizimi
  const eyeCoords = [
    { ox: marginPx, oy: qrOffsetY + marginPx }, // Sol Üst
    { ox: marginPx + (matrixSize - 7) * cellSize, oy: qrOffsetY + marginPx }, // Sağ Üst
    { ox: marginPx, oy: qrOffsetY + marginPx + (matrixSize - 7) * cellSize }, // Sol Alt
  ];

  const eyeElements: string[] = [];
  eyeCoords.forEach(({ ox, oy }) => {
    const centerPupilX = ox + 3.5 * cellSize;
    const centerPupilY = oy + 3.5 * cellSize;

    // Dış Çerçeve (Outer Frame)
    if (config.eyeFrameStyle === 'circle') {
      const radius = 3 * cellSize;
      eyeElements.push(`
        <circle cx="${centerPupilX.toFixed(2)}" cy="${centerPupilY.toFixed(2)}" r="${radius.toFixed(2)}" fill="none" stroke="${eyePaint}" stroke-width="${cellSize.toFixed(2)}" />
      `);
    } else if (config.eyeFrameStyle === 'rounded') {
      const frameX = ox + cellSize / 2;
      const frameY = oy + cellSize / 2;
      const frameDim = 6 * cellSize;
      const cornerR = (1.8 * cellSize).toFixed(2);
      eyeElements.push(`
        <rect x="${frameX.toFixed(2)}" y="${frameY.toFixed(2)}" width="${frameDim.toFixed(2)}" height="${frameDim.toFixed(2)}" rx="${cornerR}" fill="none" stroke="${eyePaint}" stroke-width="${cellSize.toFixed(2)}" />
      `);
    } else {
      // Square frame
      const frameX = ox + cellSize / 2;
      const frameY = oy + cellSize / 2;
      const frameDim = 6 * cellSize;
      eyeElements.push(`
        <rect x="${frameX.toFixed(2)}" y="${frameY.toFixed(2)}" width="${frameDim.toFixed(2)}" height="${frameDim.toFixed(2)}" fill="none" stroke="${eyePaint}" stroke-width="${cellSize.toFixed(2)}" />
      `);
    }

    // İç Göz Bebeği (Pupil)
    if (config.eyePupilStyle === 'circle') {
      const pupilR = (1.5 * cellSize).toFixed(2);
      eyeElements.push(`
        <circle cx="${centerPupilX.toFixed(2)}" cy="${centerPupilY.toFixed(2)}" r="${pupilR}" fill="${eyePaint}" />
      `);
    } else if (config.eyePupilStyle === 'diamond') {
      const pTop = `${centerPupilX.toFixed(2)},${(oy + 2 * cellSize).toFixed(2)}`;
      const pRight = `${(ox + 5 * cellSize).toFixed(2)},${centerPupilY.toFixed(2)}`;
      const pBottom = `${centerPupilX.toFixed(2)},${(oy + 5 * cellSize).toFixed(2)}`;
      const pLeft = `${(ox + 2 * cellSize).toFixed(2)},${centerPupilY.toFixed(2)}`;
      eyeElements.push(`
        <polygon points="${pTop} ${pRight} ${pBottom} ${pLeft}" fill="${eyePaint}" />
      `);
    } else if (config.eyePupilStyle === 'rounded') {
      const px = ox + 2 * cellSize;
      const py = oy + 2 * cellSize;
      const pDim = 3 * cellSize;
      const pr = (0.8 * cellSize).toFixed(2);
      eyeElements.push(`
        <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${pDim.toFixed(2)}" height="${pDim.toFixed(2)}" rx="${pr}" fill="${eyePaint}" />
      `);
    } else {
      // Square pupil
      const px = ox + 2 * cellSize;
      const py = oy + 2 * cellSize;
      const pDim = 3 * cellSize;
      eyeElements.push(`
        <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${pDim.toFixed(2)}" height="${pDim.toFixed(2)}" fill="${eyePaint}" />
      `);
    }
  });

  // 8. Merkez Logo / İkon Rozeti
  const logoElements: string[] = [];
  if (hasLogo && minLogoRow >= 0) {
    const logoX = marginPx + minLogoCol * cellSize;
    const logoY = qrOffsetY + marginPx + minLogoRow * cellSize;
    const logoAreaWidth = (maxLogoCol - minLogoCol + 1) * cellSize;
    const logoAreaHeight = (maxLogoRow - minLogoRow + 1) * cellSize;
    const logoCenterX = logoX + logoAreaWidth / 2;
    const logoCenterY = logoY + logoAreaHeight / 2;
    const badgeR = (logoAreaWidth / 2).toFixed(2);

    // Koruyucu Rozet Arka Planı (Beyaz veya Koyu daire)
    const badgeBg = config.logoBgColor || '#FFFFFF';
    logoElements.push(`
      <circle cx="${logoCenterX.toFixed(2)}" cy="${logoCenterY.toFixed(2)}" r="${badgeR}" fill="${badgeBg}" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.18))" />
      <circle cx="${logoCenterX.toFixed(2)}" cy="${logoCenterY.toFixed(2)}" r="${badgeR}" fill="none" stroke="${config.primaryColor}" stroke-width="2.5" opacity="0.3" />
    `);

    if (config.logoType === 'emoji' && config.logoEmoji) {
      const fontSize = Math.round(logoAreaWidth * 0.58);
      logoElements.push(`
        <text x="${logoCenterX.toFixed(2)}" y="${(logoCenterY + fontSize * 0.08).toFixed(2)}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, sans-serif">${config.logoEmoji}</text>
      `);
    } else if (config.logoType === 'url' && config.logoUrl) {
      const imgDim = logoAreaWidth * 0.72;
      const imgX = logoCenterX - imgDim / 2;
      const imgY = logoCenterY - imgDim / 2;
      logoElements.push(`
        <clipPath id="logoClip_${gradId}">
          <circle cx="${logoCenterX.toFixed(2)}" cy="${logoCenterY.toFixed(2)}" r="${(imgDim / 2).toFixed(2)}" />
        </clipPath>
        <image href="${config.logoUrl}" x="${imgX.toFixed(2)}" y="${imgY.toFixed(2)}" width="${imgDim.toFixed(2)}" height="${imgDim.toFixed(2)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#logoClip_${gradId})" />
      `);
    }
  }

  // 9. Çerçeve / CTA Rozeti
  const frameElements: string[] = [];
  if (hasBottomBadge) {
    const badgeW = svgWidth - 48;
    const badgeH = 50;
    const badgeX = 24;
    const badgeY = targetSize + 6;
    const bColor = config.frameColor || config.primaryColor;
    const tColor = config.frameTextColor || '#FFFFFF';

    frameElements.push(`
      <g>
        <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="25" fill="${bColor}" filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.12))" />
        <text x="${svgWidth / 2}" y="${badgeY + badgeH / 2 + 1}" font-size="16" font-weight="bold" letter-spacing="1.5" text-anchor="middle" dominant-baseline="central" fill="${tColor}" font-family="system-ui, -apple-system, sans-serif">
          ${escapeXml(config.frameText.toUpperCase())}
        </text>
      </g>
    `);
  } else if (hasTopBanner) {
    const bannerW = svgWidth - 48;
    const bannerH = 50;
    const bannerX = 24;
    const bannerY = 12;
    const bColor = config.frameColor || config.primaryColor;
    const tColor = config.frameTextColor || '#FFFFFF';

    frameElements.push(`
      <g>
        <rect x="${bannerX}" y="${bannerY}" width="${bannerW}" height="${bannerH}" rx="25" fill="${bColor}" filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.12))" />
        <text x="${svgWidth / 2}" y="${bannerY + bannerH / 2 + 1}" font-size="16" font-weight="bold" letter-spacing="1.5" text-anchor="middle" dominant-baseline="central" fill="${tColor}" font-family="system-ui, -apple-system, sans-serif">
          ${escapeXml(config.frameText.toUpperCase())}
        </text>
      </g>
    `);
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
      ${gradDefs}
      ${bgElement}
      <g id="qr-dots">
        ${dotElements.join('\n')}
      </g>
      <g id="qr-eyes">
        ${eyeElements.join('\n')}
      </g>
      ${logoElements.join('\n')}
      ${frameElements.join('\n')}
    </svg>
  `.trim();
}

/**
 * SVG çıktısını web üzerinde doğrudan indirir (.svg dosyası).
 */
export function downloadSvgFile(svgString: string, filename = 'qr-kod.svg') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * SVG'yi yüksek çözünürlüklü PNG'ye (1024x1024 veya 2048x2048) dönüştürüp indirir.
 */
export function downloadHighResPng(
  svgString: string,
  resolution = 2048,
  filename = 'qr-kod-hd.png'
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return reject(new Error('Yalnızca tarayıcı ortamında desteklenir'));
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (!svgEl) return reject(new Error('Geçersiz SVG formatı'));

      const viewBox = svgEl.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 600, 600];
      const viewW = viewBox[2] || 600;
      const viewH = viewBox[3] || 600;

      const targetW = resolution;
      const targetH = Math.round(resolution * (viewH / viewW));

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(blobUrl);
            return reject(new Error('Canvas context alınamadı'));
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetW, targetH);
          URL.revokeObjectURL(blobUrl);

          canvas.toBlob((pngBlob) => {
            if (!pngBlob) return reject(new Error('PNG oluşturulamadı'));
            const pngUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
            resolve();
          }, 'image/png');
        } catch (canvasErr) {
          URL.revokeObjectURL(blobUrl);
          reject(canvasErr);
        }
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(blobUrl);
        reject(e);
      };

      img.src = blobUrl;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * XML / SVG güvenliği için string kaçırma
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
