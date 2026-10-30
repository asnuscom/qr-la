import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import PetTagRouteScreen from '@/app/p/[id]';
import { petService } from '@/services/petService';

describe('Live Customer Screen: PetTagRouteScreen (/p/[id])', () => {
  it('renders pet tag details when pet exists', async () => {
    jest.spyOn(petService, 'getPetBySlug').mockResolvedValueOnce({
      id: 'pet-1',
      slug: 'duman',
      userId: 'user-1',
      name: 'Duman',
      species: 'cat',
      breed: 'British Shorthair',
      gender: 'male',
      age: '2 Yaşında',
      photoUrl: '',
      ownerName: 'Zeynep Kaya',
      ownerPhone: '05559876543',
      viewCount: 10,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      vaccines: [],
      scanLogs: [],
      isClaimed: true,
      lostInfo: {
        isLost: false,
      },
    });

    const screen = await render(<PetTagRouteScreen />);

    await waitFor(() => {
      expect(screen.getByText('Duman')).toBeTruthy();
      expect(screen.getByText(/British Shorthair/i)).toBeTruthy();
    });
  });

  it('renders not found state when pet does not exist', async () => {
    jest.spyOn(petService, 'getPetBySlug').mockResolvedValueOnce(null);

    const screen = await render(<PetTagRouteScreen />);

    await waitFor(() => {
      expect(screen.getByText('Pati Künyesi Bulunamadı')).toBeTruthy();
    });
  });
});
