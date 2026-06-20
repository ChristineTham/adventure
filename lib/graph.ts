import { GameData } from '@/types/game';

export interface GraphNode {
  id: string;
  label: string;
  isCurrent: boolean;
  isVisited?: boolean;
  type: 'room' | 'forwarder';
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
  direction?: string; // Exit direction from source
  targetDirection?: string; // Entry direction into target (if known)
  isVisited?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Gets a simplified connectivity graph for display, filtering by distance (radius) at runtime if requested
 */
export function getGraphData(
  gameData: GameData,
  centerLoc: string,
  radius: number | null = null,
  visitedRooms: string[] = []
): GraphData {
  if (!gameData.mapData) {
    return { nodes: [], links: [] };
  }

  const { nodes: staticNodes, links: staticLinks } = gameData.mapData;
  const visitedSet = new Set(visitedRooms);

  // If radius is null (full map), return all nodes and links immediately decorated with visited/current state
  if (radius === null) {
    return {
      nodes: staticNodes.map(node => ({
        id: node.id,
        label: node.label,
        isCurrent: node.id === centerLoc,
        isVisited: visitedSet.has(node.id),
        type: 'room'
      })),
      links: staticLinks.map(link => ({
        source: link.source,
        target: link.target,
        label: link.label,
        direction: link.direction,
        targetDirection: link.targetDirection,
        isVisited: visitedSet.has(link.source) && visitedSet.has(link.target)
      }))
    };
  }

  // If a radius is specified, run a fast BFS starting at centerLoc using the precomputed static links
  const discovered = new Set<string>();
  const startLoc = centerLoc || 'LOC_START';
  discovered.add(startLoc);

  // Pre-group static links by source for fast BFS step lookups
  const adjacencyList = new Map<string, string[]>();
  staticLinks.forEach(link => {
    if (!adjacencyList.has(link.source)) {
      adjacencyList.set(link.source, []);
    }
    adjacencyList.get(link.source)!.push(link.target);
  });

  const queue: [string, number][] = [[startLoc, 0]];
  let head = 0;
  while (head < queue.length) {
    const [currentId, dist] = queue[head++];
    if (dist >= radius) continue;

    const neighbors = adjacencyList.get(currentId) || [];
    for (const neighborId of neighbors) {
      if (!discovered.has(neighborId)) {
        discovered.add(neighborId);
        queue.push([neighborId, dist + 1]);
      }
    }
  }

  // Filter nodes and links to only those discovered in the radius
  const nodes: GraphNode[] = staticNodes
    .filter(node => discovered.has(node.id))
    .map(node => ({
      id: node.id,
      label: node.label,
      isCurrent: node.id === centerLoc,
      isVisited: visitedSet.has(node.id),
      type: 'room'
    }));

  const links: GraphLink[] = staticLinks
    .filter(link => discovered.has(link.source) && discovered.has(link.target))
    .map(link => ({
      source: link.source,
      target: link.target,
      label: link.label,
      direction: link.direction,
      targetDirection: link.targetDirection,
      isVisited: visitedSet.has(link.source) && visitedSet.has(link.target)
    }));

  return { nodes, links };
}
