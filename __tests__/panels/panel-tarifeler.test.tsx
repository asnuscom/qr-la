import React from 'react';
import { render } from '@testing-library/react-native';
import PricingTiersScreen from '@/app/panel/tarifeler';

describe('PricingTiersScreen (/panel/tarifeler) Panel Test', () => {
  it('renders pricing tiers screen correctly', async () => {
    const screen = await render(<PricingTiersScreen />);
    expect(screen).toBeDefined();
  });
});
