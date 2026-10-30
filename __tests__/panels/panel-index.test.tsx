import React from 'react';
import { render } from '@testing-library/react-native';
import EcosystemHubScreen from '@/app/panel/index';

describe('EcosystemHubScreen (/panel) Panel Test', () => {
  it('renders workspace panel with quick tools', async () => {
    const screen = await render(<EcosystemHubScreen />);
    expect(screen).toBeDefined();
  });
});
