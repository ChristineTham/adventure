import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
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

  it('should generate game-data.json and copy images', () => {
    // Ensure test directories exist
    const srcDir = path.resolve(process.cwd(), 'data/images');
    const destDir = path.resolve(process.cwd(), 'public/locations');
    
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
    const testFile = path.join(srcDir, 'TEST_IMAGE.jpg');
    fs.writeFileSync(testFile, 'test');

    generateGameData();
    
    expect(fs.existsSync(outputPath)).toBe(true);
    expect(fs.existsSync(path.join(destDir, 'TEST_IMAGE.jpg'))).toBe(true);

    // Cleanup
    fs.unlinkSync(testFile);
    if (fs.existsSync(path.join(destDir, 'TEST_IMAGE.jpg'))) {
      fs.unlinkSync(path.join(destDir, 'TEST_IMAGE.jpg'));
    }
  });
});
