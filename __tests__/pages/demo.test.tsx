import React from 'react';
import { render } from '@testing-library/react-native';
import DemoRedirectScreen from '@/app/demo';

describe('DemoRedirectScreen (/demo) Page Test', () => {
  it('renders redirect correctly', async () => {
    const screen = await render(<DemoRedirectScreen />);
    expect(screen).toBeDefined();
  });
});
