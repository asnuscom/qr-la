import { vehicleService, cleanPlate, formatPlate, DEMO_VEHICLES } from '@/services/vehicleService';

describe('vehicleService Unit Tests', () => {
  it('should clean vehicle plate formatting correctly', () => {
    expect(cleanPlate('34 ABC 123')).toBe('34abc123');
    expect(cleanPlate(' 06-ank-06 ')).toBe('06ank06');
    expect(cleanPlate('')).toBe('');
  });

  it('should format plate number to standard Turkish format', () => {
    expect(formatPlate('34ABC123')).toBe('34 ABC 123');
    expect(formatPlate('06ANK06')).toBe('06 ANK 06');
    expect(formatPlate('')).toBe('');
  });

  it('should have predefined demo vehicles for testing', () => {
    expect(DEMO_VEHICLES['34abc123']).toBeDefined();
    expect(DEMO_VEHICLES['34abc123'].plateNumber).toBe('34 ABC 123');
    expect(DEMO_VEHICLES['34abc123'].bloodType).toBe('A Rh+');
    expect(DEMO_VEHICLES['06ank06']).toBeDefined();
  });

  it('should get vehicle by slug from demo data or memory', async () => {
    const veh = await vehicleService.getVehicleBySlug('34abc123');
    expect(veh).toBeDefined();
    expect(veh?.plateNumber).toBe('34 ABC 123');
  });

  it('should return null for non-existent vehicle slug', async () => {
    const veh = await vehicleService.getVehicleBySlug('99zzz999nonexistent');
    expect(veh).toBeNull();
  });
});
