import React from 'react';
import { render } from '@testing-library/react-native';
import AllAssetsScreen from '@/app/panel/varliklar';

describe('AllAssetsScreen (/panel/varliklar) Panel Test', () => {
  it('renders assets screen correctly', async () => {
    const screen = await render(<AllAssetsScreen />);
    expect(screen).toBeDefined();
  });
});
