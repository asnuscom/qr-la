import { petService, cleanPetSlug, DEMO_PETS } from '@/services/petService';

describe('petService Unit Tests', () => {
  it('should clean pet slug format correctly', () => {
    expect(cleanPetSlug('Pati Duman 2026')).toBe('patiduman2026');
    expect(cleanPetSlug('duman')).toBe('duman');
    expect(cleanPetSlug('')).toBe('');
  });

  it('should have demo pets registered', () => {
    expect(DEMO_PETS['duman']).toBeDefined();
    expect(DEMO_PETS['duman'].name).toBe('Duman');
    expect(DEMO_PETS['duman'].breed).toBe('Golden Retriever');
  });

  it('should get pet by slug', async () => {
    const pet = await petService.getPetBySlug('duman');
    expect(pet).toBeDefined();
    expect(pet?.name).toBe('Duman');
  });

  it('should return null for non-existent pet', async () => {
    const pet = await petService.getPetBySlug('nonexistent-pet-slug-999');
    expect(pet).toBeNull();
  });
});
