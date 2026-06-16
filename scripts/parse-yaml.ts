import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { GameData, ObjectData, GameLocation, PlayerClass, Motion, Action, TravelCondition, Hint } from '../types/game';

interface RawObjectData extends Partial<ObjectData> {
  words?: string[];
}

interface RawTravelRule {
  verbs?: string[];
  action?: [string, string | number];
  condition?: TravelCondition;
}

interface RawLocation extends Partial<Omit<GameLocation, 'travel'>> {
  travel?: RawTravelRule[];
}

interface RawGameData {
  motions: Record<string, Motion>;
  locations: Record<string, RawLocation>;
  actions: Record<string, Action>;
  objects: Record<string, RawObjectData>;
  arbitrary_messages: Record<string, string | string[]>;
  turn_thresholds: Record<string, string>;
  hints: Hint[];
  dwarflocs: string[];
  classes: (PlayerClass | Record<string, string>)[];
  obituaries: string[];
}

export function parseAdventureYaml(): GameData {
  const yamlPath: string = path.resolve(process.cwd(), 'open-adventure/adventure.yaml');
  const fileContents: string = fs.readFileSync(yamlPath, 'utf8');
  const rawData: RawGameData = yaml.load(fileContents) as RawGameData;

  // Flatten !!omap arrays into objects
  const omapKeys = ['motions', 'locations', 'actions', 'objects', 'arbitrary_messages', 'turn_thresholds'] as const;
  for (const key of omapKeys) {
    const value: unknown = rawData[key];
    if (Array.isArray(value)) {
      const flattened: Record<string, unknown> = value.reduce((acc: Record<string, unknown>, item: unknown) => {
        const itemObj: Record<string, unknown> = item as Record<string, unknown>;
        const itemKey: string = Object.keys(itemObj)[0];
        acc[itemKey] = itemObj[itemKey];
        return acc;
      }, {});
      
      // Use a type-safe way to update rawData
      (rawData as unknown as Record<string, unknown>)[key] = flattened;
    }
  }

  // Build vocabulary map (word -> key)
  const vocabulary: Record<string, string> = {};
  
  // From motions
  const motions: Record<string, Motion> = rawData.motions;
  for (const [key, motion] of Object.entries(motions)) {
    vocabulary[key.toUpperCase()] = key;
    if (Array.isArray(motion.words)) {
      motion.words.forEach((w: string) => {
        vocabulary[w.toUpperCase()] = key;
      });
    } else {
      motion.words = [key];
    }
  }

  // From actions
  const actions: Record<string, Action> = rawData.actions;
  for (const [key, action] of Object.entries(actions)) {
    vocabulary[key.toUpperCase()] = key;
    if (Array.isArray(action.words)) {
      action.words.forEach((w: string) => {
        vocabulary[w.toUpperCase()] = key;
      });
    } else {
      action.words = [key];
    }
  }

  // From objects
  const objects: Record<string, RawObjectData> = rawData.objects;
  for (const [key, obj] of Object.entries(objects)) {
    vocabulary[key.toUpperCase()] = key;
    if (Array.isArray(obj.words)) {
      obj.words.forEach((w: string) => {
        vocabulary[w.toUpperCase()] = key;
      });
    } else {
      obj.words = [key];
    }

    // Normalize locations to array
    if (obj.locations) {
      if (typeof obj.locations === 'string') {
        obj.locations = [obj.locations];
      }
    } else {
      obj.locations = [];
    }
  }

  // Normalize travel rule verbs
  const locations: Record<string, RawLocation> = rawData.locations;
  for (const loc of Object.values(locations)) {
    const travel: RawTravelRule[] | undefined = loc.travel;
    if (Array.isArray(travel)) {
      travel.forEach((rule: RawTravelRule) => {
        if (Array.isArray(rule.verbs)) {
          rule.verbs = rule.verbs.map((v: string) => {
            const vocabularyKey: string | undefined = vocabulary[v.toUpperCase()];
            if (!vocabularyKey) {
              console.warn(`Warning: Verb ${v} not found in vocabulary`);
              return v;
            }
            return vocabularyKey;
          });
        }
      });
    }
  }

  // Normalize classes (flattens if it was an omap, though classes usually isn't)
  const playerClasses: PlayerClass[] = [];
  if (Array.isArray(rawData.classes)) {
    rawData.classes.forEach((c: PlayerClass | Record<string, string>) => {
      if (typeof c === 'object' && c !== null && !('threshold' in c)) {
        const thresholdStr: string = Object.keys(c)[0];
        const threshold: number = parseInt(thresholdStr);
        const message: string = Object.values(c)[0];
        playerClasses.push({ threshold, message });
      } else {
        playerClasses.push(c as PlayerClass);
      }
    });
  }

  const data: GameData = {
    motions: rawData.motions,
    actions: rawData.actions,
    hints: rawData.hints,
    locations: rawData.locations as Record<string, GameLocation>,
    objects: rawData.objects as Record<string, ObjectData>,
    arbitrary_messages: rawData.arbitrary_messages,
    dwarflocs: rawData.dwarflocs,
    classes: playerClasses,
    turn_thresholds: rawData.turn_thresholds,
    obituaries: rawData.obituaries,
    vocabulary: vocabulary
  };

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
