import { GameData, GameLocation } from '@/types/game';
import { formatLocationId } from './utils';

export interface GraphNode {
  id: string;
  label: string;
  isCurrent: boolean;
  type: 'room' | 'forwarder';
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
  direction?: string; // Exit direction from source
  targetDirection?: string; // Entry direction into target (if known)
}

/**
 * Maps common compass directions to a canonical list
 */
const DIRECTION_KEYS = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'NE', 'SE', 'SW', 'NW', 'UP', 'DOWN'];

/**
 * Returns the opposite direction
 */
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

/**
 * Extracts the primary direction from a list of verbs
 */
function getPrimaryDirection(verbs: string[]): string | undefined {
  return DIRECTION_KEYS.find(dir => verbs.includes(dir));
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Checks if a location is a forwarder (automatic transition without stopping)
 */
function isForwarder(locId: string, locations: Record<string, GameLocation>): boolean {
  const loc = locations[locId];
  if (!loc) return false;
  // A forwarder has a single travel rule with no verbs
  return loc.travel.length === 1 && loc.travel[0].verbs.length === 0;
}

/**
 * Chases a location through forwarder links to the final destination
 */
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

/**
 * Gets a friendly label for a location (matches the UI Location panel)
 */
function getRoomLabel(locId: string): string {
  return formatLocationId(locId);
}

/**
 * Generates graph data from game data, optionally filtering by radius from a center location
 */
export function getGraphData(
  gameData: GameData,
  centerLoc: string,
  radius: number | null = null
): GraphData {
  const locations = gameData.locations;
  if (!locations) return { nodes: [], links: [] };

  const nodesMap = new Map<string, GraphNode>();
  const discovered = new Set<string>();

  // Use BFS for both local and full map (full map just has a very large radius)
  // this ensures we only show reachable nodes and avoids disconnected internal data
  const maxRadius = radius === null ? 500 : radius; // Increased for full cave
  const startLoc = (centerLoc && locations[centerLoc]) ? centerLoc : 'LOC_START';

  if (locations[startLoc]) {
    const queue: [string, number][] = [[startLoc, 0]];
    discovered.add(startLoc);
    
    let head = 0;
    while (head < queue.length) {
      const [currentId, dist] = queue[head++];
      
      if (dist >= maxRadius) continue;
      
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

  // Build nodes and links for discovered locations
  const linksMap = new Map<string, GraphLink>();

  discovered.forEach(locId => {
    const loc = locations[locId];
    if (!loc) return;

    // Add node
    nodesMap.set(locId, {
      id: locId,
      label: getRoomLabel(locId),
      isCurrent: locId === centerLoc,
      type: 'room'
    });

    // Add outgoing links
    if (loc.travel) {
      for (const rule of loc.travel) {
        if (rule.action && rule.action[0] === 'goto') {
          const destId = resolveForwarder(rule.action[1] as string, locations);
          
          if (destId && destId !== 'LOC_NOWHERE' && discovered.has(destId)) {
            const dir = getPrimaryDirection(rule.verbs);
            
            // Deduplicate: only one link per source-target-direction combination
            const linkKey = `${locId}->${destId}:${dir || 'NONE'}`;
            if (linksMap.has(linkKey)) continue;

            // Look for a reverse link to determine targetDirection
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
