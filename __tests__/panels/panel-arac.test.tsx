import React from 'react';
import { render } from '@testing-library/react-native';
import VehiclePanelScreen from '@/app/panel/arac';

describe('VehiclePanelScreen (/panel/arac) Panel Test', () => {
  it('renders vehicle management header and options', async () => {
    const screen = await render(<VehiclePanelScreen />);
    expect(screen.getByText('Araç & Park Tagı')).toBeTruthy();
    expect(screen.getByText('Ön Cam İletişim & Güvenlik Kartı')).toBeTruthy();
  });
});
