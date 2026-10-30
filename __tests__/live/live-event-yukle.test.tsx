import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import UploadScreen from '@/app/[slug]/yukle';
import { eventService } from '@/services/eventService';

describe('Live Customer Screen: UploadScreen (/[slug]/yukle)', () => {
  it('renders upload screen when event exists', async () => {
    jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce({
      id: 'event-1',
      slug: 'test-slug',
      title: 'Düğün Fotoğrafı Paylaş',
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

    const screen = await render(<UploadScreen />);

    await waitFor(() => {
      expect(screen.getByText('Fotoğraf Yükleme Alanı')).toBeTruthy();
      expect(screen.getByText('Düğün Fotoğrafı Paylaş')).toBeTruthy();
    });
  });
});
