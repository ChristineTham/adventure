import { describe, it, expect } from 'vitest';
import { parseAdventureYaml } from '../../scripts/parse-yaml';
import { GameData } from '../../types/game';

describe('Game Data Types', () => {
  it('should be compatible with the parsed YAML', () => {
    const data = parseAdventureYaml() as unknown as GameData;

    expect(data.motions).toBeDefined();
    expect(data.actions).toBeDefined();
    expect(data.locations).toBeDefined();
    expect(data.objects).toBeDefined();

    // Check a specific location
    const start = data.locations['LOC_START'];
    expect(start).toBeDefined();
    expect(start.description.long).toContain('small brick building');
    expect(Array.isArray(start.travel)).toBe(true);
  });
});
