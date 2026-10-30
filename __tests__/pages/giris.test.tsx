import React from 'react';
import { render } from '@testing-library/react-native';
import AuthScreen from '@/app/giris';

describe('AuthScreen (/giris) Page Test', () => {
  it('renders login and register options with demo host button', async () => {
    const screen = await render(<AuthScreen />);
    expect(screen.getByText('1 Tıkla Demo Ev Sahibi Girişi')).toBeTruthy();
    expect(screen.getByText('VEYA E-POSTA İLE')).toBeTruthy();
  });
});
