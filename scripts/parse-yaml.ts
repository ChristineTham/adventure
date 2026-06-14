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

  // Build vocabulary map (word -> key)
  const vocabulary: Record<string, string> = {};
  
  // From motions
  for (const [key, motion] of Object.entries(data.motions)) {
    const m = motion as any;
    vocabulary[key.toUpperCase()] = key;
    if (m.words) {
      m.words.forEach((w: string) => {
        vocabulary[w.toUpperCase()] = key;
      });
    } else {
      m.words = [key];
    }
  }

  // From actions
  for (const [key, action] of Object.entries(data.actions)) {
    const a = action as any;
    vocabulary[key.toUpperCase()] = key;
    if (a.words) {
      a.words.forEach((w: string) => {
        vocabulary[w.toUpperCase()] = key;
      });
    } else {
      a.words = [key];
    }
  }

  // From objects
  for (const [key, obj] of Object.entries(data.objects)) {
    const o = obj as any;
    vocabulary[key.toUpperCase()] = key;
    if (o.words) {
      o.words.forEach((w: string) => {
        vocabulary[w.toUpperCase()] = key;
      });
    } else {
      o.words = [key];
    }

    // Normalize locations to array
    if (o.locations) {
      if (typeof o.locations === 'string') {
        o.locations = [o.locations];
      }
    } else {
      o.locations = [];
    }
  }

  // Normalize travel rule verbs
  for (const loc of Object.values(data.locations)) {
    const l = loc as any;
    if (l.travel) {
      l.travel.forEach((rule: any) => {
        if (rule.verbs) {
          rule.verbs = rule.verbs.map((v: string) => {
            const key = vocabulary[v.toUpperCase()];
            if (!key) {
              console.warn(`Warning: Verb ${v} not found in vocabulary`);
              return v;
            }
            return key;
          });
        }
      });
    }
  }

  data.vocabulary = vocabulary;
  return data;
}

export function generateGameData() {
  const data = parseAdventureYaml();
  const outputPath = path.resolve(process.cwd(), 'data/game-data.json');
  
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
  console.log('Game data generated successfully to data/game-data.json');
}
