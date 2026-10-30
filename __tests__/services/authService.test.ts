import { authService } from '@/services/authService';

describe('authService Unit Tests', () => {
  it('should initialize with initial auth state', () => {
    const state = authService.getState();
    expect(state).toBeDefined();
    expect(typeof state.isLoading).toBe('boolean');
    expect(typeof state.isAuthenticated).toBe('boolean');
  });

  it('should support subscribing to auth state changes', () => {
    const mockListener = jest.fn();
    const unsub = authService.subscribe(mockListener);
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('should signOut cleanly without crashing', async () => {
    await expect(authService.signOut()).resolves.not.toThrow();
  });
});
