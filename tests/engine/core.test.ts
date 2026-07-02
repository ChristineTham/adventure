import { describe, it, expect, beforeEach } from 'vitest';
import { initializeGame, processCommand } from '../../engine/core';
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
    processCommand('NO');
    processCommand('LOOK');
    const state = useGameStore.getState();
    expect(state.history.length).toBeGreaterThan(2);
  });

  it('should handle movement commands (e.g., WEST)', () => {
    initializeGame();
    processCommand('NO');
    processCommand('WEST');
    const state = useGameStore.getState();
    expect(state.currentLocation).toBe('LOC_HILL');
    expect(state.history.at(-1)).toContain('hill');
  });

  it('should handle movement synonyms (e.g., ROAD)', () => {
    initializeGame();
    processCommand('NO');
    processCommand('ROAD');
    const state = useGameStore.getState();
    expect(state.currentLocation).toBe('LOC_HILL');
  });

  it('should handle cardinal directions', () => {
    initializeGame();
    processCommand('NO');
    processCommand('SOUTH');
    expect(useGameStore.getState().currentLocation).toBe('LOC_VALLEY');
    
    processCommand('NORTH');
    expect(useGameStore.getState().currentLocation).toBe('LOC_START');
  });

  it('should handle TAKE and INVENTORY', () => {
    initializeGame();
    processCommand('NO');
    processCommand('EAST');
    expect(useGameStore.getState().currentLocation).toBe('LOC_BUILDING');
    
    processCommand('TAKE KEYS');
    expect(useGameStore.getState().inventory).toContain('KEYS');
    expect(useGameStore.getState().history).toContain('OK');
    
    processCommand('INVENTORY');
    expect(useGameStore.getState().history.join('\n')).toContain('Set of keys');
  });

  it('should handle DROP', () => {
    initializeGame();
    processCommand('NO');
    processCommand('EAST');
    processCommand('TAKE KEYS');
    processCommand('WEST');
    
    processCommand('DROP KEYS');
    expect(useGameStore.getState().inventory).not.toContain('KEYS');
    expect(useGameStore.getState().objectLocations['KEYS']).toBe('LOC_START');
    
    processCommand('LOOK');
    expect(useGameStore.getState().history.at(-1)).toContain('keys');
  });

  it('should handle FILL', () => {
    initializeGame();
    processCommand('NO');
    processCommand('EAST');
    processCommand('TAKE BOTTLE');
    expect(useGameStore.getState().inventory).toContain('BOTTLE');
    
    processCommand('FILL BOTTLE');
    expect(useGameStore.getState().history.join('\n')).toContain('water');
    expect(useGameStore.getState().objectStates['BOTTLE']).toBe(0);
  });

  it('should handle ATTACK', () => {
    initializeGame();
    processCommand('NO');
    processCommand('ATTACK BEAR');
    expect(useGameStore.getState().history.join('\n')).toContain('I see no BEAR here.');
  });
});
