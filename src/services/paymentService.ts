import { appStorage } from './storage';
import { StorageTier } from '@/types';
import { eventService } from './eventService';

export interface PaymentItem {
  id: string;
  title: string;
  category: 'event_tier' | 'module_package' | 'suite_license' | 'shop_product';
  price: number;
  originalPrice?: number;
  period?: 'tek_seferlik' | 'aylik' | 'yillik';
  targetSlug?: string;
  tier?: StorageTier;
  retentionDays?: number;
  quotaMB?: number;
  badge?: string;
  description: string;
  features: string[];
}

export interface CreditCardData {
  cardNumber: string;
  cardHolder: string;
  expireMonth: string;
  expireYear: string;
  cvv: string;
  installments: number; // 1, 3, 6
}

export interface TransactionRecord {
  id: string;
  invoiceNo: string;
  itemTitle: string;
  category: string;
  amount: number;
  discountAmount: number;
  paymentMethod: 'credit_card' | 'bank_transfer';
  cardMask?: string;
  cardBrand?: string;
  installments?: number;
  status: 'completed' | 'processing' | 'refunded';
  customerName: string;
  customerEmail: string;
  targetSlug?: string;
  createdAt: string;
}

const STORAGE_KEY_TRANSACTIONS = 'qr_la_transactions_history';

export const paymentService = {
  /**
   * Sistemdeki kayıtlı ödeme geçmişini getirir
   */
  getTransactions(): TransactionRecord[] {
    try {
      const raw = appStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (raw) return JSON.parse(raw);
    } catch {}

    // Varsayılan zengin geçmiş kayıtları
    return [
      {
        id: 'TRX-2026-8912',
        invoiceNo: 'QRLA-2026-00142',
        itemTitle: 'Premium Düğün Paketi (5 GB Bulut + Canlı Projeksiyon)',
        category: 'event_tier',
        amount: 3990,
        discountAmount: 0,
        paymentMethod: 'credit_card',
        cardMask: '5428 •••• •••• 9166',
        cardBrand: 'Mastercard',
        installments: 1,
        status: 'completed',
        customerName: 'Samet Sunman',
        customerEmail: 'samet@qr-la.com',
        targetSlug: 'samet-ve-sule',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ];
  },

  /**
   * Kart markasını numara ön ekine göre otomatik tespit eder
   */
  detectCardBrand(num: string): 'Visa' | 'Mastercard' | 'Troy' | 'Amex' | 'Bilinmeyen' {
    const clean = (num || '').replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
    if (/^(9792|65|68)/.test(clean)) return 'Troy';
    if (/^3[47]/.test(clean)) return 'Amex';
    return 'Bilinmeyen';
  },

  /**
   * Kupon kodunu kontrol eder ve indirim tutarını hesaplar
   */
  checkCoupon(code: string, basePrice: number): { valid: boolean; discountPercent: number; discountTL: number; message: string } {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) return { valid: false, discountPercent: 0, discountTL: 0, message: '' };

    if (clean === 'ASNUSVIP' || clean === 'VIP100') {
      return { valid: true, discountPercent: 100, discountTL: basePrice, message: 'VIP %100 Ücretsiz Yükseltme Kuponu!' };
    }
    if (clean === 'ASNUSPREMIUM' || clean === 'BAHAR50') {
      const discount = Math.round(basePrice * 0.5);
      return { valid: true, discountPercent: 50, discountTL: discount, message: '%50 Özel Bahar İndirimi uygulandı!' };
    }
    if (clean === 'YUZDE20' || clean === 'QRLA20') {
      const discount = Math.round(basePrice * 0.2);
      return { valid: true, discountPercent: 20, discountTL: discount, message: '%20 Lansman İndirimi uygulandı!' };
    }
    if (clean === 'HOSGELDIN' || clean === 'ILK10') {
      const discount = Math.round(basePrice * 0.1);
      return { valid: true, discountPercent: 10, discountTL: discount, message: '%10 Hoş Geldin İndirimi uygulandı!' };
    }

    return { valid: false, discountPercent: 0, discountTL: 0, message: 'Geçersiz kupon kodu.' };
  },

  /**
   * Ödemeyi işler, etkinliği veya siparişi günceller, faturayı kaydeder
   */
  async processPayment(params: {
    item: PaymentItem;
    paymentMethod: 'credit_card' | 'bank_transfer';
    cardData?: CreditCardData;
    couponCode?: string;
    customerName: string;
    customerEmail: string;
  }): Promise<{ success: boolean; transaction: TransactionRecord; error?: string }> {
    const { item, paymentMethod, cardData, couponCode, customerName, customerEmail } = params;

    // Basit Validasyon
    if (paymentMethod === 'credit_card') {
      if (!cardData) return { success: false, transaction: null as any, error: 'Kart bilgileri eksik' };
      const cleanCard = cardData.cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15) {
        return { success: false, transaction: null as any, error: 'Lütfen geçerli 16 haneli bir kart numarası giriniz.' };
      }
      if (!cardData.cardHolder || cardData.cardHolder.trim().length < 3) {
        return { success: false, transaction: null as any, error: 'Kart üzerindeki isim gereklidir.' };
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        return { success: false, transaction: null as any, error: 'CVV güvenlik kodu en az 3 haneli olmalıdır.' };
      }
    }

    // İndirim hesaplama
    let discount = 0;
    if (couponCode) {
      const couponRes = this.checkCoupon(couponCode, item.price);
      if (couponRes.valid) {
        discount = couponRes.discountTL;
      }
    }
    const finalAmount = Math.max(0, item.price - discount);

    // İşlem Kaydı Oluştur
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `QRLA-${new Date().getFullYear()}-${String(randomId).padStart(5, '0')}`;
    const transactionId = `TRX-${Date.now().toString().slice(-6)}-${randomId}`;

    const cleanCard = cardData?.cardNumber.replace(/\s+/g, '') || '';
    const cardMask = cleanCard
      ? `${cleanCard.slice(0, 4)} •••• •••• ${cleanCard.slice(-4)}`
      : undefined;
    const cardBrand = cleanCard ? this.detectCardBrand(cleanCard) : undefined;

    const transaction: TransactionRecord = {
      id: transactionId,
      invoiceNo,
      itemTitle: item.title,
      category: item.category,
      amount: finalAmount,
      discountAmount: discount,
      paymentMethod,
      cardMask,
      cardBrand,
      installments: cardData?.installments || 1,
      status: 'completed',
      customerName: customerName || 'Değerli Müşterimiz',
      customerEmail: customerEmail || 'musteri@qr-la.com',
      targetSlug: item.targetSlug,
      createdAt: new Date().toISOString(),
    };

    // Eğer etkinlik depolama yükseltmesiyse -> eventService'i hemen güncelle
    if (item.category === 'event_tier' && item.tier && item.targetSlug) {
      try {
        await eventService.upgradeStorageTier(
          item.targetSlug,
          item.tier,
          item.retentionDays || 180,
          item.quotaMB || 5120
        );
      } catch (tierErr) {
        console.warn('Otomatik kota yükseltme hatası (arka plan):', tierErr);
      }
    }

    // İşlemi geçmişe kaydet
    const history = this.getTransactions();
    history.unshift(transaction);
    try {
      appStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(history));
    } catch {}

    return {
      success: true,
      transaction,
    };
  },

  /**
   * e-Arşiv Fatura / Makbuz HTML çıktısı oluşturur ve yazdırır
   */
  printReceipt(trx: TransactionRecord) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const dateStr = new Date(trx.createdAt).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const kdvRate = 0.20;
    const matrah = Math.round((trx.amount / (1 + kdvRate)) * 100) / 100;
    const kdv = Math.round((trx.amount - matrah) * 100) / 100;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>e-Arşiv Fatura | ${trx.invoiceNo}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 40px;
              color: #0F172A;
              max-width: 680px;
              margin: 0 auto;
              background: #FFF;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #E2E8F0;
              padding-bottom: 20px;
            }
            .brand {
              font-size: 26px;
              font-weight: 800;
              color: #D4AF37;
              letter-spacing: 1px;
            }
            .brand-sub {
              font-size: 12px;
              color: #64748B;
              margin-top: 4px;
            }
            .inv-meta {
              text-align: right;
            }
            .inv-num {
              font-size: 16px;
              font-weight: 700;
              color: #0F172A;
            }
            .inv-date {
              font-size: 13px;
              color: #64748B;
              margin-top: 4px;
            }
            .section {
              margin: 24px 0;
            }
            .box {
              background: #F8FAFC;
              padding: 16px;
              border-radius: 10px;
              font-size: 13px;
              line-height: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th {
              text-align: left;
              background: #F1F5F9;
              padding: 12px;
              font-size: 12px;
              text-transform: uppercase;
              color: #475569;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #E2E8F0;
              font-size: 13px;
            }
            .totals {
              margin-top: 20px;
              margin-left: auto;
              width: 260px;
              font-size: 14px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
            }
            .total-final {
              font-size: 18px;
              font-weight: 800;
              color: #0F172A;
              border-top: 2px solid #0F172A;
              padding-top: 10px;
              margin-top: 6px;
            }
            .badge {
              display: inline-block;
              background: #DCFCE7;
              color: #166534;
              font-size: 11px;
              font-weight: 700;
              padding: 4px 8px;
              border-radius: 6px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #94A3B8;
              border-top: 1px solid #E2E8F0;
              padding-top: 20px;
            }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">QR-la</div>
              <div class="brand-sub">Asnus Teknoloji & Dijital Mikro-SaaS A.Ş.</div>
              <div class="brand-sub">Kadıköy / İstanbul • info@qr-la.com</div>
            </div>
            <div class="inv-meta">
              <div class="inv-num">${trx.invoiceNo}</div>
              <div class="inv-date">${dateStr}</div>
              <div style="margin-top: 6px;"><span class="badge">ÖDENDİ</span></div>
            </div>
          </div>

          <div class="section">
            <div class="box">
              <strong>Müşteri Bilgileri:</strong><br />
              <strong>Ad Soyad:</strong> ${trx.customerName}<br />
              <strong>E-posta:</strong> ${trx.customerEmail}<br />
              <strong>Ödeme Yöntemi:</strong> ${trx.paymentMethod === 'credit_card' ? `Kredi Kartı (${trx.cardBrand || 'Banka'} •••• ${trx.cardMask?.slice(-4) || ''})` : 'Banka Havalesi / FAST'}<br />
              <strong>Referans No:</strong> ${trx.id}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Hizmet / Paket Tanımı</th>
                <th>Kategori</th>
                <th style="text-align: right;">Birim Fiyat</th>
                <th style="text-align: right;">Tutar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${trx.itemTitle}</strong></td>
                <td>${trx.category}</td>
                <td style="text-align: right;">${trx.amount + trx.discountAmount} ₺</td>
                <td style="text-align: right;">${trx.amount + trx.discountAmount} ₺</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            ${trx.discountAmount > 0 ? `
              <div class="totals-row" style="color: #10B981;">
                <span>Kupon İndirimi:</span>
                <span>-${trx.discountAmount} ₺</span>
              </div>
            ` : ''}
            <div class="totals-row">
              <span>KDV Hariç Matrah (%20):</span>
              <span>${matrah} ₺</span>
            </div>
            <div class="totals-row">
              <span>Hesaplanan KDV:</span>
              <span>${kdv} ₺</span>
            </div>
            <div class="totals-row total-final">
              <span>Genel Toplam:</span>
              <span>${trx.amount} ₺</span>
            </div>
          </div>

          <div class="footer">
            Bu belge 213 sayılı V.U.K. hükümlerine göre elektronik ortamda düzenlenmiştir.<br />
            QR-la Platformu © 2026 • Tüm hakları saklıdır.
          </div>

          <script>
            setTimeout(() => {
              window.print();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  },
};
