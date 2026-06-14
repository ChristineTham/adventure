import { describe, it, expect } from 'vitest';
// @ts-ignore
import { useGameStore } from '../../src/store/gameStore';

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
});
