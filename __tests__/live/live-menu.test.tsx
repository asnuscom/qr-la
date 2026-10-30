import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import RestaurantMenuRouteScreen from '@/app/m/[slug]';
import { menuService } from '@/services/menuService';

describe('Live Customer Screen: RestaurantMenuRouteScreen (/m/[slug])', () => {
  it('renders restaurant menu when slug exists', async () => {
    jest.spyOn(menuService, 'getRestaurantBySlug').mockResolvedValueOnce({
      id: 'test-menu-1',
      slug: 'test-slug',
      userId: 'user-1',
      name: 'Gusto Bistro & Lounge',
      cuisine: 'Akdeniz',
      logoUrl: '',
      coverUrl: '',
      description: 'Akdeniz lezzetleri',
      currency: '₺',
      phone: '05551234567',
      address: 'Kadıköy, İstanbul',
      wifiSsid: 'Gusto_Guest',
      wifiPassword: 'gusto',
      theme: 'bistro_dark',
      categories: [
        {
          id: 'cat-1',
          name: 'Başlangıçlar',
          order: 1,
        },
      ],
      items: [
        {
          id: 'item-1',
          categoryId: 'cat-1',
          name: 'Bruschetta Trio',
          description: 'Domates ve fesleğenli ekmek dilimleri',
          price: 180,
          isAvailable: true,
        },
      ],
      tableCount: 10,
      enableWaiterCall: true,
      enableBillRequest: true,
      viewCount: 15,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    });
    jest.spyOn(menuService, 'recordView').mockResolvedValueOnce();

    const screen = await render(<RestaurantMenuRouteScreen />);

    await waitFor(() => {
      expect(screen.getByText('Gusto Bistro & Lounge')).toBeTruthy();
      expect(screen.getByText('Başlangıçlar')).toBeTruthy();
      expect(screen.getByText('Bruschetta Trio')).toBeTruthy();
    });
  });

  it('renders not found state when restaurant does not exist', async () => {
    jest.spyOn(menuService, 'getRestaurantBySlug').mockResolvedValueOnce(null);

    const screen = await render(<RestaurantMenuRouteScreen />);

    await waitFor(() => {
      expect(screen.getByText('Menü Bulunamadı')).toBeTruthy();
    });
  });
});
