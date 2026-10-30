import { adminService, ROOT_ADMIN_EMAILS } from '@/services/adminService';

describe('adminService Unit Tests', () => {
  it('should include root admins in getAdminEmails', async () => {
    const emails = await adminService.getAdminEmails();
    expect(emails).toContain('casska@asnus.com');
    expect(emails).toContain('casska@msn.com');
  });

  it('should return system settings with default values', async () => {
    const settings = await adminService.getSettings();
    expect(settings).toBeDefined();
    expect(settings.allowRegistrations).toBe(true);
    expect(settings.defaultFreeStorageMB).toBe(500);
  });

  it('should calculate platform KPIs accurately', async () => {
    const kpis = await adminService.getPlatformKPIs();
    expect(kpis).toHaveProperty('totalUsers');
    expect(kpis).toHaveProperty('totalAssets');
    expect(kpis).toHaveProperty('totalScans');
    expect(kpis).toHaveProperty('totalRevenue');
    expect(typeof kpis.totalUsers).toBe('number');
  });

  it('should return module controls with all five platform modules', async () => {
    const controls = await adminService.getModuleControls();
    expect(controls).toHaveProperty('wedding');
    expect(controls).toHaveProperty('vehicle');
    expect(controls).toHaveProperty('pet');
    expect(controls).toHaveProperty('vcard');
    expect(controls).toHaveProperty('menu');
    expect(controls.vehicle.isEnabled).toBe(true);
  });
});
