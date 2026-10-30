import { eventService } from '@/services/eventService';

describe('eventService Unit Tests', () => {
  it('should get demo event by slug', async () => {
    const event = await eventService.getEvent('demo-panel');
    expect(event).toBeDefined();
    expect(event?.title).toBeDefined();
    expect(event?.slug).toBe('demo-panel');
  });

  it('should validate event slug availability check', async () => {
    const check = await eventService.checkSlugAvailability('unique-brand-new-slug-2026');
    expect(check).toBeDefined();
    expect(typeof check.available).toBe('boolean');
  });
});
