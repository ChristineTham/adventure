import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export function parseAdventureYaml() {
  const yamlPath = path.resolve(process.cwd(), 'open-adventure/adventure.yaml');
  const fileContents = fs.readFileSync(yamlPath, 'utf8');
  return yaml.load(fileContents);
}

// If run directly
if (require.main === module) {
  const data = parseAdventureYaml();
  console.log(JSON.stringify(data, null, 2));
}
