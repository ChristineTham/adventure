import { describe, it, expect } from 'vitest';
// @ts-ignore
import { parseAdventureYaml } from '../../scripts/parse-yaml';

describe('parseAdventureYaml', () => {
  it('should exist', () => {
    expect(parseAdventureYaml).toBeDefined();
  });

  it('should parse adventure.yaml', () => {
    const data = parseAdventureYaml();
    expect(data).toBeDefined();
    expect(data).toHaveProperty('locations');
  });
});
