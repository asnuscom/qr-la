import React from 'react';
import { render } from '@testing-library/react-native';
import SuperAdminDashboard from '@/app/admin/index';

describe('SuperAdminDashboard (/admin) Panel Test', () => {
  it('renders admin security unlock screen when not authenticated', async () => {
    const screen = await render(<SuperAdminDashboard />);
    expect(screen.getByText('Platform Süper Admin')).toBeTruthy();
    expect(screen.getByText('Firebase İle Giriş Yap')).toBeTruthy();
  });
});
