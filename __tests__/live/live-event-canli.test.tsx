import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LiveScreen from '@/app/[slug]/canli';
import { eventService } from '@/services/eventService';

describe('Live Customer Screen: LiveScreen (/[slug]/canli)', () => {
  it('renders live projection wall when event exists', async () => {
    jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce({
      id: 'event-1',
      slug: 'test-slug',
      title: 'Canlı Projeksiyon Yayını',
      eventType: 'dugun',
      eventDate: '2026-08-20',
      coverPhotoUrl: '',
      hosts: { brideOrPrimary: 'Ali', groomOrSecondary: 'Ayşe' },
      venue: { name: 'Saray', address: 'Boğaz', mapUrl: '' },
      theme: { primaryColor: '#C5A059', backgroundColor: '#FFF' },
      settings: {
        isPrivate: false,
        enableCompression: true,
        allowGuestDownloads: true,
        isLiveFeedActive: true,
        allowGuestbook: true,
        autoApprovePhotos: true,
      },
      storage: {
        quotaBytes: 100000,
        usedBytes: 100,
        photoCount: 0,
        tier: 'free',
        expiresAt: '2026-12-31',
      },
      schedule: [],
      createdAt: '2026-01-01',
    });
    jest.spyOn(eventService, 'getPhotos').mockResolvedValueOnce([]);
    jest.spyOn(eventService, 'subscribePhotos').mockReturnValueOnce(() => {});

    const screen = await render(<LiveScreen />);

    await waitFor(() => {
      expect(screen.getByText('MASANDAN FOTOĞRAF GÖNDER')).toBeTruthy();
      expect(screen.getByText(/Kameranı açıp QR kodu tara/i)).toBeTruthy();
    });
  });
});
