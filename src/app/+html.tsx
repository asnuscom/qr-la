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
        <title>QR-la | Düğünde & Nikahta Karekodla Fotoğraf Yüklemesi - Davetiye Etkinlik Albümü</title>
        <meta name="title" content="QR-la | Düğünde & Nikahta Karekodla Fotoğraf Yüklemesi - Davetiye Etkinlik Albümü" />
        <meta
          name="description"
          content="Düğün, nikah, nişan ve özel davetiye etkinliklerinizde masalardaki karekodla misafirlerinizden anında yüksek çözünürlüklü fotoğraf toplayın. Uygulama indirmeden karekodla fotoğraf yüklemesi, canlı TV/projeksiyon yayını ve tek tıkla ZIP arşiv indirme."
        />
        <meta
          name="keywords"
          content="davetiye etkinlik, düğünde nikahta karekodla fotoğraf yüklemesi, düğün karekod fotoğraf, nikah karekod fotoğraf, karekodla fotoğraf toplama, masada qr kod fotoğraf, dijital davetiye etkinlik fotoğraf albümü, etkinlik karekod galeri, düğün masa kartı qr kod, kına gecesi karekod, sünnet karekod fotoğrafı, canlı projeksiyon düğün slayt"
        />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Turkish" />
        <meta name="author" content="QR-la" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://qr-la.com/" />
        <meta property="og:site_name" content="QR-la" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content="QR-la | Düğünde & Nikahta Karekodla Fotoğraf Yüklemesi" />
        <meta
          property="og:description"
          content="Düğün, nikah ve davetiye etkinliklerinizde masalardaki karekodla misafirlerinizden fotoğraf toplayın. Uygulama indirmeden saniyeler içinde fotoğraflar dev ekrana yansısın!"
        />
        <meta property="og:image" content="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://qr-la.com/" />
        <meta name="twitter:title" content="QR-la | Düğünde & Nikahta Karekodla Fotoğraf Yüklemesi" />
        <meta
          name="twitter:description"
          content="Düğün ve etkinliklerinizde misafirlerinizin çektiği anıları masadaki karekodla toplayın. Uygulamasız, hızlı ve canlı projeksiyon destekli."
        />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80" />

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
                  'description': 'Düğün, nikah ve etkinliklerde karekodla fotoğraf yükleme ve canlı paylaşım platformu',
                  'inLanguage': 'tr-TR',
                },
                {
                  '@type': 'SoftwareApplication',
                  'name': 'QR-la',
                  'applicationCategory': 'MultimediaApplication',
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
                      'name': 'Düğünde ve nikahta karekodla fotoğraf yüklemesi nasıl yapılır?',
                      'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Misafirler masalarındaki zarif masa kartlarında bulunan karekodu telefon kameralarıyla okutur. Herhangi bir uygulama indirmelerine gerek kalmadan anında açılan web sayfasından çektikleri fotoğraf ve videoları tek tıkla yükleyebilirler.',
                      },
                    },
                    {
                      '@type': 'Question',
                      'name': 'Davetiye ve etkinliklerde QR kod kullanmanın avantajı nedir?',
                      'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'WhatsApp gibi platformlarda fotoğrafların kalitesi düşer ve toplamak günler sürer. QR-la ile tüm davetiye etkinliklerinizde yüksek çözünürlüklü fotoğraflar tek bir dijital albümde toplanır, salondaki dev ekrana canlı yansıtılır ve gece bitiminde tek tıkla ZIP arşivi olarak indirilir.',
                      },
                    },
                    {
                      '@type': 'Question',
                      'name': 'Misafirlerin uygulama indirmesi veya kayıt olması gerekir mi?',
                      'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Hayır! QR-la tamamen tarayıcı üzerinden çalışır. Misafirler uygulama indirmeden, şifre girmeden sadece karekodu okutarak doğrudan fotoğraf yükleyebilir.',
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
