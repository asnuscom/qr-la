import React from 'react';
import { render } from '@testing-library/react-native';
import ScanAnalyticsScreen from '@/app/panel/analitik';

describe('ScanAnalyticsScreen (/panel/analitik) Panel Test', () => {
  it('renders analytics title and metrics', async () => {
    const screen = await render(<ScanAnalyticsScreen />);
    expect(screen.getByText('Dinamik QR Analitiği')).toBeTruthy();
  });
});
