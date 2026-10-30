import React from 'react';
import { render } from '@testing-library/react-native';
import RestaurantMenuPanelScreen from '@/app/panel/menu';

describe('RestaurantMenuPanelScreen (/panel/menu) Panel Test', () => {
  it('renders restaurant menu panel without crashing', async () => {
    const screen = await render(<RestaurantMenuPanelScreen />);
    expect(screen).toBeDefined();
  });
});
