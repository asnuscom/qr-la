import React from 'react';
import { render } from '@testing-library/react-native';
import EcosystemShopScreen from '@/app/panel/magaza';

describe('EcosystemShopScreen (/panel/magaza) Panel Test', () => {
  it('renders physical store with print products', async () => {
    const screen = await render(<EcosystemShopScreen />);
    expect(screen.getByText('Phygital Baskı & Matbaa Mağazası')).toBeTruthy();
  });
});
