import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import GuestbookScreen from '@/app/[slug]/ani-defteri';
import { eventService } from '@/services/eventService';

describe('Live Customer Screen: GuestbookScreen (/[slug]/ani-defteri)', () => {
  it('renders guestbook list and header when event exists', async () => {
    jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce({
      id: 'event-1',
      slug: 'test-slug',
      title: 'Dijital Anı Defteri',
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
    jest.spyOn(eventService, 'getGuestbook').mockResolvedValueOnce([
      {
        id: 'entry-1',
        eventSlug: 'test-slug',
        authorName: 'Mehmet Demir',
        message: 'Bir ömür boyu mutluluklar dilerim!',
        createdAt: '2026-08-20T20:00:00Z',
      },
    ]);

    const screen = await render(<GuestbookScreen />);

    await waitFor(() => {
      expect(screen.getAllByText('Ziyaretçi Anı Defteri').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/1 Tebrik Notu/i)).toBeTruthy();
      expect(screen.getByText('Mehmet Demir')).toBeTruthy();
      expect(screen.getByText(/Bir ömür boyu mutluluklar dilerim!/i)).toBeTruthy();
    });
  });
});
