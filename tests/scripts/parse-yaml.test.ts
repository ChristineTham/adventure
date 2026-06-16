import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
// @ts-expect-error: module resolution issue in tests
import { parseAdventureYaml, generateGameData } from '../../scripts/parse-yaml';

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

describe('generateGameData', () => {
  const outputPath = path.resolve(process.cwd(), 'data/game-data.json');

  beforeEach(() => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });

  it('should generate game-data.json', () => {
    generateGameData();
    expect(fs.existsSync(outputPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(data).toHaveProperty('locations');
  });
});
