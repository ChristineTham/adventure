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

// If run directly
if (require.main === module) {
  const data = parseAdventureYaml();
  console.log(JSON.stringify(data, null, 2));
}
