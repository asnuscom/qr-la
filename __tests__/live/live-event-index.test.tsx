import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SmartQRDispatcherScreen from '@/app/[slug]/index';
import { eventService } from '@/services/eventService';
import { vehicleService } from '@/services/vehicleService';
import { petService } from '@/services/petService';
import { vcardService } from '@/services/vcardService';
import { menuService } from '@/services/menuService';

describe('Live Customer Screen: SmartQRDispatcherScreen (/[slug]/index)', () => {
  beforeEach(() => {
    jest.spyOn(vehicleService, 'getVehicleBySlug').mockResolvedValue(null);
    jest.spyOn(petService, 'getPetBySlug').mockResolvedValue(null);
    jest.spyOn(vcardService, 'getCardBySlug').mockResolvedValue(null);
    jest.spyOn(menuService, 'getRestaurantBySlug').mockResolvedValue(null);
  });

  it('renders event screen when slug matches an event', async () => {
    jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce({
      id: 'event-1',
      slug: 'test-slug',
      title: 'Selin & Can Evleniyor',
      eventType: 'dugun',
      eventDate: '2026-08-20',
      coverPhotoUrl: '',
      hosts: {
        brideOrPrimary: 'Selin',
        groomOrSecondary: 'Can',
      },
      venue: {
        name: 'Sait Halim Paşa Yalısı',
        address: 'Yeniköy, İstanbul',
        mapUrl: 'https://maps.google.com',
      },
      theme: {
        primaryColor: '#C5A059',
        backgroundColor: '#0F172A',
      },
      settings: {
        isPrivate: false,
        enableCompression: true,
        allowGuestDownloads: true,
        isLiveFeedActive: true,
        allowGuestbook: true,
        autoApprovePhotos: true,
      },
      storage: {
        quotaBytes: 1000000,
        usedBytes: 1000,
        photoCount: 5,
        tier: 'premium',
        expiresAt: '2026-12-31',
      },
      schedule: [],
      createdAt: '2026-01-01',
    });
    jest.spyOn(eventService, 'recordView').mockResolvedValueOnce();
    jest.spyOn(eventService, 'getPhotos').mockResolvedValueOnce([]);

    const screen = await render(<SmartQRDispatcherScreen />);

    await waitFor(() => {
      expect(screen.getAllByText('Sait Halim Paşa Yalısı').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Anılarını Paylaşmaya Hazır mısın?')).toBeTruthy();
      expect(screen.getByText('Hemen Yükle')).toBeTruthy();
    });
  });

  it('renders not found screen when slug matches nothing', async () => {
    jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce(null as any);

    const screen = await render(<SmartQRDispatcherScreen />);

    await waitFor(() => {
      expect(screen.getByText('Karekod Bulunamadı')).toBeTruthy();
    });
  });
});
