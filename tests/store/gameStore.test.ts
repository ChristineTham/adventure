import { describe, it, expect } from 'vitest';
// @ts-expect-error: module resolution issue in tests
import { useGameStore } from '../../store/gameStore';

describe('gameStore', () => {
  it('should have a default initial state', () => {
    const state = useGameStore.getState();
    expect(state.currentLocation).toBe('');
    expect(state.inventory).toEqual([]);
    expect(state.history).toEqual([]);
  });

  it('should allow updating the current location', () => {
    useGameStore.getState().setLocation('LOC_START');
    expect(useGameStore.getState().currentLocation).toBe('LOC_START');
  });

  it('should allow adding messages to history', () => {
    useGameStore.getState().addMessage('Welcome to Adventure!');
    expect(useGameStore.getState().history).toEqual(['Welcome to Adventure!']);
  });

  it('should allow adding to and removing from inventory', () => {
    useGameStore.getState().addToInventory('LAMP');
    expect(useGameStore.getState().inventory).toContain('LAMP');
    useGameStore.getState().removeFromInventory('LAMP');
    expect(useGameStore.getState().inventory).not.toContain('LAMP');
  });

  it('should allow setting and getting flags', () => {
    useGameStore.getState().setFlag('LIT', true);
    expect(useGameStore.getState().flags['LIT']).toBe(true);
    useGameStore.getState().setFlag('TRIES', 5);
    expect(useGameStore.getState().flags['TRIES']).toBe(5);
  });
});
