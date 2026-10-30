import React from 'react';
import { render } from '@testing-library/react-native';
import EditEventScreen from '@/app/panel/duzenle';

describe('EditEventScreen (/panel/duzenle) Panel Test', () => {
  it('renders edit event screen correctly', async () => {
    const screen = await render(<EditEventScreen />);
    expect(screen).toBeDefined();
  });
});
