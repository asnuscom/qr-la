import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import GalleryScreen from '@/app/[slug]/galeri';
import { eventService } from '@/services/eventService';

describe('Live Customer Screen: GalleryScreen (/[slug]/galeri)', () => {
  it('renders gallery screen when event is public', async () => {
    jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce({
      id: 'event-1',
      slug: 'test-slug',
      title: 'Düğün Galerisi',
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
    jest.spyOn(eventService, 'getAlbums').mockResolvedValueOnce([]);
    jest.spyOn(eventService, 'getPhotos').mockResolvedValueOnce([]);

    const screen = await render(<GalleryScreen />);

    await waitFor(() => {
      expect(screen.getByText('Fotoğraf Galerisi')).toBeTruthy();
      expect(screen.getByText(/Anı Paylaşıldı/i)).toBeTruthy();
    });
  });

  it('renders PIN prompt when event is private and not unlocked', async () => {
    jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce({
      id: 'event-1',
      slug: 'test-slug',
      title: 'Gizli Düğün',
      eventType: 'dugun',
      eventDate: '2026-08-20',
      coverPhotoUrl: '',
      hosts: { brideOrPrimary: 'Ali', groomOrSecondary: 'Ayşe' },
      venue: { name: 'Saray', address: 'Boğaz', mapUrl: '' },
      theme: { primaryColor: '#C5A059', backgroundColor: '#FFF' },
      settings: {
        isPrivate: true,
        pinCode: '1234',
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
    jest.spyOn(eventService, 'getAlbums').mockResolvedValueOnce([]);
    jest.spyOn(eventService, 'getPhotos').mockResolvedValueOnce([]);

    const screen = await render(<GalleryScreen />);

    await waitFor(() => {
      expect(screen.getByText('Fotoğraf Galerisi Korumalı')).toBeTruthy();
      expect(screen.getByText('Galeriyi Aç')).toBeTruthy();
    });
  });
});
