import { describe, it, expect, beforeEach } from 'vitest';
// @ts-ignore
import { initializeGame, processCommand } from '../../src/engine/core';
// @ts-ignore
import { useGameStore } from '../../src/store/gameStore';

describe('Game Engine Core', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should initialize the game state', () => {
    initializeGame();
    const state = useGameStore.getState();
    expect(state.currentLocation).toBe('LOC_START');
    expect(state.history.length).toBeGreaterThan(0);
  });

  it('should have a processCommand function', () => {
    initializeGame();
    processCommand('LOOK');
    const state = useGameStore.getState();
    // For now, just check if it doesn't crash and maybe adds something to history
    expect(state.history.length).toBeGreaterThan(1);
  });
});
