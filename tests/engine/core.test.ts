import { describe, it, expect, beforeEach } from 'vitest';
// @ts-expect-error: module resolution issue in tests
import { initializeGame, processCommand } from '../../engine/core';
// @ts-expect-error: module resolution issue in tests
import { useGameStore } from '../../store/gameStore';

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

  it('should handle movement commands (e.g., WEST)', () => {
    initializeGame();
    processCommand('WEST');
    const state = useGameStore.getState();
    // From LOC_START, WEST goes to LOC_HILL
    expect(state.currentLocation).toBe('LOC_HILL');
    expect(state.history.at(-1)).toContain('hill');
  });

  it('should handle movement synonyms (e.g., ROAD)', () => {
    initializeGame();
    processCommand('ROAD');
    const state = useGameStore.getState();
    // From LOC_START, ROAD/HILL/WEST/UPWAR all lead to LOC_HILL
    expect(state.currentLocation).toBe('LOC_HILL');
  });

  it('should handle cardinal directions', () => {
    initializeGame();
    // From LOC_START, SOUTH goes to LOC_VALLEY
    processCommand('SOUTH');
    expect(useGameStore.getState().currentLocation).toBe('LOC_VALLEY');
    
    // From LOC_VALLEY, NORTH goes back to LOC_START
    processCommand('NORTH');
    expect(useGameStore.getState().currentLocation).toBe('LOC_START');
  });

  it('should handle TAKE and INVENTORY', () => {
    initializeGame();
    // From LOC_START, the building is EAST
    processCommand('EAST');
    expect(useGameStore.getState().currentLocation).toBe('LOC_BUILDING');
    
    // There are keys in the building
    processCommand('TAKE KEYS');
    expect(useGameStore.getState().inventory).toContain('KEYS');
    expect(useGameStore.getState().history.at(-1)).toBe('OK');
    
    processCommand('INVENTORY');
    expect(useGameStore.getState().history.at(-1)).toContain('Set of keys');
  });

  it('should handle DROP', () => {
    initializeGame();
    processCommand('EAST');
    processCommand('TAKE KEYS');
    processCommand('WEST'); // Back to LOC_START
    
    processCommand('DROP KEYS');
    expect(useGameStore.getState().inventory).not.toContain('KEYS');
    expect(useGameStore.getState().objectLocations['KEYS']).toBe('LOC_START');
    
    processCommand('LOOK');
    expect(useGameStore.getState().history.at(-1)).toContain('keys');
  });

  it('should handle FILL', () => {
    initializeGame();
    // From START to BUILDING
    processCommand('EAST');
    // There is a BOTTLE in the building
    processCommand('TAKE BOTTLE');
    expect(useGameStore.getState().inventory).toContain('BOTTLE');
    
    // There is a stream in the building (FLUID condition)
    processCommand('FILL BOTTLE');
    expect(useGameStore.getState().history.at(-1)).toContain('water');
    expect(useGameStore.getState().objectStates['BOTTLE']).toBe(0); // 0: Water
  });

  it('should handle ATTACK', () => {
    initializeGame();
    processCommand('ATTACK BEAR');
    expect(useGameStore.getState().history.at(-1)).toContain('Attacking');
  });
});
