import React from 'react';
import { render } from '@testing-library/react-native';
import PetPanelScreen from '@/app/panel/pati';

describe('PetPanelScreen (/panel/pati) Panel Test', () => {
  it('renders pet tag management and Petguru sync status', async () => {
    const screen = await render(<PetPanelScreen />);
    expect(screen.getByText('Petguru x QR-la')).toBeTruthy();
    expect(screen.getByText('🐾 Akıllı Tasma Künyesi & Kayıp Takibi')).toBeTruthy();
  });
});
