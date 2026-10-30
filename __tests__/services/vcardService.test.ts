import { vcardService, cleanVCardSlug, DEMO_VCARDS } from '@/services/vcardService';

describe('vcardService Unit Tests', () => {
  it('should clean vcard slug correctly', () => {
    expect(cleanVCardSlug('Samet Sunman')).toBe('sametsunman');
    expect(cleanVCardSlug('dr-selin-yilmaz')).toBe('dr-selin-yilmaz');
    expect(cleanVCardSlug('')).toBe('');
  });

  it('should have demo vcards available', () => {
    expect(DEMO_VCARDS['samet-sunman']).toBeDefined();
    expect(DEMO_VCARDS['samet-sunman'].fullName).toBe('Samet Sunman');
  });

  it('should fetch vcard by slug', async () => {
    const card = await vcardService.getCardBySlug('samet-sunman');
    expect(card).toBeDefined();
    expect(card?.fullName).toBe('Samet Sunman');
  });
});
