import { menuService, cleanMenuSlug, DEMO_RESTAURANTS } from '@/services/menuService';

describe('menuService Unit Tests', () => {
  it('should clean restaurant menu slug correctly', () => {
    expect(cleanMenuSlug('Lucca Bistrot & Bar')).toBe('luccabistrotbar');
    expect(cleanMenuSlug('cafe-paris')).toBe('cafe-paris');
    expect(cleanMenuSlug('')).toBe('');
  });

  it('should provide demo restaurants and menu categories', () => {
    expect(DEMO_RESTAURANTS['lucca-bistrot']).toBeDefined();
    expect(DEMO_RESTAURANTS['lucca-bistrot'].name).toContain('Lucca');
    expect(DEMO_RESTAURANTS['lucca-bistrot'].categories.length).toBeGreaterThan(0);
  });

  it('should fetch restaurant by slug', async () => {
    const rest = await menuService.getRestaurantBySlug('lucca-bistrot');
    expect(rest).toBeDefined();
    expect(rest?.name).toContain('Lucca');
  });

  it('should return null for non-existent restaurant', async () => {
    const rest = await menuService.getRestaurantBySlug('unknown-restaurant-999');
    expect(rest).toBeNull();
  });
});
