import { ecosystemService, SHOP_PRODUCTS } from '@/services/ecosystemService';

describe('ecosystemService Unit Tests', () => {
  it('should have physical shop products defined for all modules', () => {
    expect(SHOP_PRODUCTS.length).toBeGreaterThan(0);
    const categories = SHOP_PRODUCTS.map((p) => p.category);
    expect(categories).toContain('vehicle');
    expect(categories).toContain('pet');
    expect(categories).toContain('vcard');
  });

  it('should retrieve all user assets without crashing', async () => {
    const assets = await ecosystemService.getAllUserAssets('demo-user');
    expect(Array.isArray(assets)).toBe(true);
  });

  it('should calculate scan analytics data structure correctly', async () => {
    const analytics = await ecosystemService.getScanAnalytics('demo-user');
    expect(analytics).toBeDefined();
    expect(analytics).toHaveProperty('totalScans');
    expect(analytics).toHaveProperty('uniqueScans');
    expect(analytics).toHaveProperty('todayScans');
    expect(Array.isArray(analytics.moduleBreakdown)).toBe(true);
  });
});
