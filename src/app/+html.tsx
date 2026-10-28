import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML template for Expo Router Web export and SSR/Static generation.
 * Enriched with rich SEO tags, OpenGraph, Twitter Cards, and Schema.org JSON-LD.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* Primary SEO Meta Tags */}
        <title>QR-la | Yeni Nesil Dinamik QR Kod &amp; Akıllı Etiket Platformu</title>
        <meta name="title" content="QR-la | Yeni Nesil Dinamik QR Kod &amp; Akıllı Etiket Platformu" />
        <meta
          name="description"
          content="Düğünde masadan canlı fotoğraf toplama, araç camında numara gizleyen akıllı park tagı, Petguru GPS pati künyesi, NFC dijital kartvizit ve restoran QR menü. Tek dinamik ekosistem."
        />
        <meta
          name="keywords"
          content="qr-la, karekod fotoğraf toplama, düğün karekod fotoğraf, araç camı qr kod, park sticker qr, gizli numara araç qr, petguru evcil hayvan künye, dijital kartvizit vcard nfc, restoran menü qr, dinamik karekod platformu, akıllı etiket"
        />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Turkish" />
        <meta name="author" content="QR-la" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://qr-la.com/" />
        <meta property="og:site_name" content="QR-la" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content="QR-la | Yeni Nesil Dinamik QR Kod &amp; Akıllı Etiket Platformu" />
        <meta
          property="og:description"
          content="Düğünde masadan canlı fotoğraf toplama, araç camında numara gizleyen akıllı park tagı, Petguru GPS pati künyesi, NFC dijital kartvizit ve restoran QR menü."
        />
        <meta property="og:image" content="https://qr-la.com/og-banner.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://qr-la.com/" />
        <meta name="twitter:title" content="QR-la | Yeni Nesil Dinamik QR Kod &amp; Akıllı Etiket Platformu" />
        <meta
          name="twitter:description"
          content="Düğünde masadan canlı fotoğraf toplama, araç camında numara gizleyen akıllı park tagı, Petguru GPS pati künyesi, NFC dijital kartvizit ve restoran QR menü."
        />
        <meta name="twitter:image" content="https://qr-la.com/og-banner.png" />

        {/* Favicons & Icons */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="theme-color" content="#C5A059" />

        {/* Structured Data (Schema.org JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://qr-la.com/#website',
                  'url': 'https://qr-la.com/',
                  'name': 'QR-la',
                  'description': 'Yeni nesil dinamik QR kod ve akıllı phygital etiket ekosistemi',
                  'inLanguage': 'tr-TR',
                },
                {
                  '@type': 'SoftwareApplication',
                  'name': 'QR-la',
                  'applicationCategory': 'BusinessApplication',
                  'operatingSystem': 'Web, iOS, Android',
                  'offers': {
                    '@type': 'Offer',
                    'price': '0',
                    'priceCurrency': 'TRY',
                  },
                  'aggregateRating': {
                    '@type': 'AggregateRating',
                    'ratingValue': '4.9',
                    'reviewCount': '1480',
                  },
                },
                {
                  '@type': 'FAQPage',
                  'mainEntity': [
                    {
                      '@type': 'Question',
                      'name': 'QR-la nedir ve hangi modülleri kapsar?',
                      'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'QR-la; düğün ve etkinliklerde canlı misafir fotoğrafı toplama, araç camında telefon numaranızı gizleyerek güvenli arama/WhatsApp mesajı sağlayan akıllı park stickerı, Petguru entegrasyonlu GPS pati künyesi, NFC dijital kartvizit ve temassız restoran QR menüyü tek bir platformda birleştiren yeni nesil dinamik QR kod ekosistemidir.',
                      },
                    },
                    {
                      '@type': 'Question',
                      'name': 'Düğünde misafirlerin fotoğraf yüklemesi için uygulama indirmesi gerekir mi?',
                      'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Hayır! QR-la tamamen web tarayıcısı üzerinden çalışır. Misafirler masalardaki QR kodu okutarak uygulama indirmeden saniyeler içinde yüksek çözünürlüklü fotoğraflarını ve tebrik mesajlarını yükleyebilir.',
                      },
                    },
                    {
                      '@type': 'Question',
                      'name': 'Araç camı QR kodunda telefon numaram herkese açık mı görünür?',
                      'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Hayır. QR-la akıllı araç etiketinde numaranız tamamen gizli kalır. Karekodu okutan sürücüler QR-la güvenli köprüsü üzerinden numaranızı görmeden arama yapabilir veya hazır şablonlu WhatsApp mesajı gönderebilir.',
                      },
                    },
                    {
                      '@type': 'Question',
                      'name': 'Pati künyesi Petguru ile nasıl çalışır?',
                      'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'QR-la akıllı pati künyesi tarandığında, tarayan kişinin onaylı GPS konumu anında Petguru altyapısına iletilir, evcil hayvan sahibine anlık bildirim gider ve acil durum tıbbi profili görüntülenir.',
                      },
                    },
                    {
                      '@type': 'Question',
                      'name': 'Dinamik QR kodlar basıldıktan sonra içeriği değiştirilebilir mi?',
                      'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Evet! QR-la dinamik altyapısı sayesinde fiziksel olarak bastırdığınız sticker veya stanttaki QR kodun hedef sayfasını ve bilgilerini yönetim panelinizden dilediğiniz an güncelleyebilirsiniz.',
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
