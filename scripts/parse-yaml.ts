import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export function parseAdventureYaml() {
  const yamlPath = path.resolve(process.cwd(), 'open-adventure/adventure.yaml');
  const fileContents = fs.readFileSync(yamlPath, 'utf8');
  const data = yaml.load(fileContents) as any;

  // Flatten !!omap arrays into objects
  const omapKeys = ['motions', 'locations', 'actions', 'objects', 'arbitrary_messages', 'turn_thresholds'];
  for (const key of omapKeys) {
    if (Array.isArray(data[key])) {
      data[key] = data[key].reduce((acc: any, item: any) => {
        const itemKey = Object.keys(item)[0];
        acc[itemKey] = item[itemKey];
        return acc;
      }, {});
    }
  }

  return data;
}

export function generateGameData() {
  const data = parseAdventureYaml();
  const outputPath = path.resolve(process.cwd(), 'src/data/game-data.json');
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
}

// If run directly
if (require.main === module) {
  generateGameData();
  console.log('Game data generated successfully to src/data/game-data.json');
}
