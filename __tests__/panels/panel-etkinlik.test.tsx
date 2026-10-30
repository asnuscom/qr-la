import React from 'react';
import { render } from '@testing-library/react-native';
import EventHostDashboard from '@/app/panel/etkinlik';

describe('EventHostDashboard (/panel/etkinlik) Panel Test', () => {
  it('renders event host dashboard correctly', async () => {
    const screen = await render(<EventHostDashboard />);
    expect(screen).toBeDefined();
  });
});
