import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import SuperAdminDashboard from '@/app/admin/index';
import { adminService } from '@/services/adminService';

describe('SuperAdminDashboard (/admin) Panel Test', () => {
  it('renders admin security unlock screen when not authenticated', async () => {
    jest.spyOn(adminService, 'checkAdminAuth').mockResolvedValueOnce(false);
    const screen = await render(<SuperAdminDashboard />);
    expect(screen.getByText('Platform Süper Admin')).toBeTruthy();
    expect(screen.getByText('Firebase İle Giriş Yap')).toBeTruthy();
  });

  it('renders users tab and opens add admin modal when authorized', async () => {
    jest.spyOn(adminService, 'checkAdminAuth').mockResolvedValueOnce(true);
    const screen = await render(<SuperAdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/SÜPER ADMİN/i)).toBeTruthy();
    });

    // Switch to Users tab
    const usersTab = screen.getByText(/Kullanıcılar/i);
    fireEvent.press(usersTab);

    // Check '+ Yönetici Yetkilendir' button
    await waitFor(() => {
      expect(screen.getByText('+ Yönetici Yetkilendir')).toBeTruthy();
    });

    // Click '+ Yönetici Yetkilendir' and verify modal opens
    fireEvent.press(screen.getByText('+ Yönetici Yetkilendir'));
    await waitFor(() => {
      expect(screen.getByText('Yeni Yönetici Yetkilendir')).toBeTruthy();
      expect(screen.getByText('Yetkilendir ve Kaydet')).toBeTruthy();
    });
  });
});
