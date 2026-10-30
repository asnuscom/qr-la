import React from 'react';
import { render } from '@testing-library/react-native';
import LandingScreen from '@/app/index';

describe('LandingScreen (Homepage /) Page Test', () => {
  it('renders correctly and displays key sections and modules', async () => {
    const screen = await render(<LandingScreen />);
    
    // Core marketing sections
    expect(screen.getByText('5 GÜÇLÜ MODÜL • TEK EKOSİSTEM')).toBeTruthy();
    expect(screen.getByText('NASIL ÇALIŞIR?')).toBeTruthy();
    expect(screen.getByText('SIKÇA SORULAN SORULAR')).toBeTruthy();

    // Module titles in Bento Cards
    expect(screen.getAllByText('Numaranızı Gizleyin, Araç Camından Güvenle Ulaşılsın').length).toBeGreaterThan(0);
  });
});
