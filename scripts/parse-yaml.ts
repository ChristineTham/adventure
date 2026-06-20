import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { GameData, ObjectData, GameLocation, PlayerClass, Motion, Action, TravelCondition, Hint, StaticMapNode, StaticMapLink } from '../types/game';

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

// Opposites & directions for map pregeneration
const DIRECTION_KEYS = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'NE', 'SE', 'SW', 'NW', 'UP', 'DOWN'];

function getOppositeDirection(dir?: string): string | undefined {
  if (!dir) return undefined;
  const opposites: Record<string, string> = {
    'NORTH': 'SOUTH', 'SOUTH': 'NORTH',
    'EAST': 'WEST', 'WEST': 'EAST',
    'NE': 'SW', 'SW': 'NE',
    'NW': 'SE', 'SE': 'NW',
    'UP': 'DOWN', 'DOWN': 'UP'
  };
  return opposites[dir];
}

function getPrimaryDirection(verbs: string[]): string | undefined {
  return DIRECTION_KEYS.find(dir => verbs.includes(dir));
}

function isForwarder(locId: string, locations: Record<string, GameLocation>): boolean {
  const loc = locations[locId];
  if (!loc) return false;
  return loc.travel.length === 1 && loc.travel[0].verbs.length === 0;
}

function resolveForwarder(locId: string, locations: Record<string, GameLocation>): string {
  let current = locId;
  const visited = new Set<string>();
  
  while (isForwarder(current, locations) && !visited.has(current)) {
    visited.add(current);
    const rule = locations[current].travel[0];
    if (rule.action[0] === 'goto') {
      current = rule.action[1] as string;
    } else {
      break;
    }
  }
  return current;
}

function formatLocationId(id: string): string {
  if (!id) return '';
  return id
    .replace(/^LOC_/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function buildStaticMapData(locations: Record<string, GameLocation>): { nodes: StaticMapNode[], links: StaticMapLink[] } {
  const nodesMap = new Map<string, StaticMapNode>();
  const linksMap = new Map<string, StaticMapLink>();
  const discovered = new Set<string>();

  const startLoc = 'LOC_START';
  if (locations[startLoc]) {
    const queue: [string, number][] = [[startLoc, 0]];
    discovered.add(startLoc);
    
    let head = 0;
    while (head < queue.length) {
      const [currentId, dist] = queue[head++];
      const loc = locations[currentId];
      if (!loc || !loc.travel) continue;
      
      for (const rule of loc.travel) {
        if (rule.action && rule.action[0] === 'goto') {
          const destId = resolveForwarder(rule.action[1] as string, locations);
          if (destId && destId !== 'LOC_NOWHERE' && !discovered.has(destId)) {
            discovered.add(destId);
            queue.push([destId, dist + 1]);
          }
        }
      }
    }
  }

  discovered.forEach(locId => {
    const loc = locations[locId];
    if (!loc) return;

    nodesMap.set(locId, {
      id: locId,
      label: formatLocationId(locId)
    });

    if (loc.travel) {
      for (const rule of loc.travel) {
        if (rule.action && rule.action[0] === 'goto') {
          const destId = resolveForwarder(rule.action[1] as string, locations);
          
          if (destId && destId !== 'LOC_NOWHERE' && discovered.has(destId)) {
            const dir = getPrimaryDirection(rule.verbs);
            const linkKey = `${locId}->${destId}:${dir || 'NONE'}`;
            if (linksMap.has(linkKey)) continue;

            let targetDir = getOppositeDirection(dir);
            const targetLoc = locations[destId];
            if (targetLoc && targetLoc.travel) {
              const backLink = targetLoc.travel.find(r => 
                r.action && r.action[0] === 'goto' && resolveForwarder(r.action[1] as string, locations) === locId
              );
              if (backLink) {
                targetDir = getPrimaryDirection(backLink.verbs);
              }
            }

            linksMap.set(linkKey, {
              source: locId,
              target: destId,
              label: rule.verbs.join(', '),
              direction: dir,
              targetDirection: targetDir
            });
          }
        }
      }
    }
  });

  return {
    nodes: Array.from(nodesMap.values()),
    links: Array.from(linksMap.values())
  };
}

export function parseAdventureYaml(): GameData {
  const yamlPath: string = path.resolve(process.cwd(), 'data/adventure.yaml');
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

  const locationsMap = rawData.locations as Record<string, GameLocation>;
  const mapData = buildStaticMapData(locationsMap);

  const data: GameData = {
    motions: rawData.motions,
    actions: rawData.actions,
    hints: rawData.hints,
    locations: locationsMap,
    objects: rawData.objects as Record<string, ObjectData>,
    arbitrary_messages: rawData.arbitrary_messages,
    dwarflocs: rawData.dwarflocs,
    classes: playerClasses,
    turn_thresholds: rawData.turn_thresholds,
    obituaries: rawData.obituaries,
    vocabulary: vocabulary,
    mapData: mapData
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

  // Copy images
  const srcDir = path.resolve(process.cwd(), 'data/images');
  const destDir = path.resolve(process.cwd(), 'public/locations');

  if (fs.existsSync(srcDir)) {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
      if (file.match(/\.(webp|jpg|jpeg|png)$/i)) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
      }
    });
    console.log(`Copied ${files.length} images to public/locations/`);
  }
}

// If run directly
if (require.main === module) {
  generateGameData();
  console.log('Game data generated successfully to data/game-data.json');
}
