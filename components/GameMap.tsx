'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { GameData } from '@/types/game';
import { getGraphData, GraphNode } from '@/lib/graph';
import { Button } from './ui/button';
import { X, Maximize2, Layers, ZoomIn, ZoomOut } from 'lucide-react';

interface GameMapProps {
  gameData: GameData;
  currentLocation: string;
  onClose: () => void;
}

interface D3Node extends GraphNode, d3.SimulationNodeDatum {}
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  label: string;
  direction?: string;
  targetDirection?: string;
}

export function GameMap({ gameData, currentLocation, onClose }: GameMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showFullMap, setShowFullMap] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const graphData = useMemo(() => {
    return getGraphData(gameData, currentLocation, showFullMap ? null : 2);
  }, [gameData, currentLocation, showFullMap]);

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!zoomRef.current || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = window.innerWidth * 0.8;
    const height = window.innerHeight * 0.8;

    if (direction === 'reset') {
      const initialScale = showFullMap ? 0.2 : 1;
      svg.transition().duration(500).call(
        zoomRef.current.transform, 
        d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale)
      );
    } else {
      const factor = direction === 'in' ? 1.5 : 1 / 1.5;
      svg.transition().duration(300).call(zoomRef.current.scaleBy, factor);
    }
  };

  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const width = window.innerWidth * 0.8;
    const height = window.innerHeight * 0.8;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.01, 8]) // Much wider range for full map
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Force simulation
    const simulation = d3.forceSimulation<D3Node>(graphData.nodes as D3Node[])
      .force('link', d3.forceLink<D3Node, D3Link>(graphData.links as D3Link[])
        .id(d => d.id)
        .distance(showFullMap ? 100 : 250) // More space for lines
        .strength(showFullMap ? 0.1 : 0.6))
      .force('charge', d3.forceManyBody().strength(showFullMap ? -300 : -2500)) // Stronger repulsion
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(showFullMap ? 60 : 150)); // Larger collision zone

    // Grid-snapping force for cleaner Manhattan paths
    simulation.force('grid', (alpha) => {
      const strength = 0.4 * alpha;
      const gridSize = 40;
      graphData.nodes.forEach(d => {
        const node = d as D3Node;
        node.vx! += (Math.round((node.x || 0) / gridSize) * gridSize - (node.x || 0)) * strength;
        node.vy! += (Math.round((node.y || 0) / gridSize) * gridSize - (node.y || 0)) * strength;
      });
    });

    // Map directions to unit vectors
    const dirVectors: Record<string, { x: number, y: number }> = {
      'NORTH': { x: 0, y: -1 },
      'SOUTH': { x: 0, y: 1 },
      'EAST':  { x: 1, y: 0 },
      'WEST':  { x: -1, y: 0 },
      'NE':    { x: 1, y: -1 },
      'NW':    { x: -1, y: -1 },
      'SE':    { x: 1, y: 1 },
      'SW':    { x: -1, y: 1 },
      'UP':    { x: 0.5, y: -0.5 },
      'DOWN':  { x: -0.5, y: 0.5 }
    };

    // Helper to get anchor point on node edge
    const getAnchor = (node: D3Node, dir?: string) => {
      const w = 80;
      const h = 30;
      if (!dir || !dirVectors[dir]) return { x: node.x || 0, y: node.y || 0 };
      const vec = dirVectors[dir];
      return {
        x: (node.x || 0) + vec.x * (w / 2),
        y: (node.y || 0) + vec.y * (h / 2)
      };
    };

    // Moderated directional force
    simulation.force('direction', (alpha) => {
      const baseStrength = showFullMap ? 0.4 : 1.2;
      const strength = baseStrength * alpha;
      
      graphData.links.forEach(l => {
        const source = (l.source as unknown as D3Node);
        const target = (l.target as unknown as D3Node);
        if (!source || !target || !l.direction) return;

        const vec = dirVectors[l.direction];
        if (!vec) return;

        const dist = showFullMap ? 100 : 160;
        const targetX = (source.x || 0) + vec.x * dist;
        const targetY = (source.y || 0) + vec.y * dist;

        target.vx! += (targetX - (target.x || 0)) * strength;
        target.vy! += (targetY - (target.y || 0)) * strength;
      });
    });

    // Add arrowheads
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10) 
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#60a5fa');

    // Draw links
    const link = g.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(graphData.links)
      .enter().append('path')
      .attr('stroke', '#3f3f46')
      .attr('stroke-opacity', showFullMap ? 0.3 : 0.8)
      .attr('stroke-width', showFullMap ? 1 : 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes as D3Node[])
      .enter().append('g')
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Node rectangles
    node.append('rect')
      .attr('x', -40)
      .attr('y', -15)
      .attr('width', 80)
      .attr('height', 30)
      .attr('rx', 4)
      .attr('fill', d => d.isCurrent ? '#1e3a8a' : '#18181b')
      .attr('stroke', d => d.isCurrent ? '#60a5fa' : '#3f3f46')
      .attr('stroke-width', 2);

    // Node labels
    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#e4e4e7')
      .attr('font-size', showFullMap ? '8px' : '10px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace')
      .style('pointer-events', 'none');
simulation.on('tick', () => {
  link.attr('d', d => {
    const source = d.source as unknown as D3Node;
    const target = d.target as unknown as D3Node;

    // 1. Handle Self-Loops (Circular Path)
    if (source.id === target.id) {
      const r = 15;
      const x = source.x || 0;
      const y = (source.y || 0) - 15; // Anchor to top
      return `M ${x},${y} a ${r},${r} 0 1,1 0,-0.1 Z`;
    }

    // 2. Orthogonal Manhattan Routing
    const exitVecRaw = d.direction ? dirVectors[d.direction] : { x: 0, y: 0 };
    const entryVecRaw = d.targetDirection ? dirVectors[d.targetDirection] : { x: -exitVecRaw.x, y: -exitVecRaw.y };

    const snap = (v: { x: number, y: number }) => {
      if (Math.abs(v.x) > Math.abs(v.y)) return { x: Math.sign(v.x), y: 0 };
      if (Math.abs(v.y) > Math.abs(v.x)) return { x: 0, y: Math.sign(v.y) };
      return v;
    };

    const exitVec = snap(exitVecRaw);
    const entryVec = snap(entryVecRaw);

    const start = getAnchor(source, d.direction);
    const end = getAnchor(target, d.targetDirection);

    // Dynamic stub based on distance to prevent room penetration
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const stub = Math.min(dist * 0.25, showFullMap ? 15 : 40);

    const p1x = start.x + exitVec.x * stub;
    const p1y = start.y + exitVec.y * stub;

    const p2x = end.x + entryVec.x * stub;
    const p2y = end.y + entryVec.y * stub;

    let cornerX, cornerY;
    if (exitVec.x !== 0) {
      cornerX = p2x;
      cornerY = p1y;
    } else {
      cornerX = p1x;
      cornerY = p2y;
    }

    return `M${start.x},${start.y} L${p1x},${p1y} L${cornerX},${cornerY} L${p2x},${p2y} L${end.x},${end.y}`;
  });

  node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
});


    // Initial positioning to prevent (0,0) clumping
    graphData.nodes.forEach((d) => {
      const node = d as D3Node;
      if (node.x === undefined) {
        node.x = (Math.random() - 0.5) * width;
        node.y = (Math.random() - 0.5) * height;
      }
    });

    // Set initial transform
    const initialScale = showFullMap ? 0.1 : 1;
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale));

    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [graphData, showFullMap]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 lg:p-8">
      <div className="relative w-full h-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Maximize2 size={20} className="text-blue-400" />
              MAP: {showFullMap ? 'FULL DUNGEON' : 'LOCAL SURROUNDINGS'}
            </h2>
            <div className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
              Zoom: {Math.round(zoomLevel * 100)}% | Nodes: {graphData.nodes.length}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFullMap(!showFullMap)}
              className="gap-2 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 h-9"
            >
              <Layers size={16} />
              {showFullMap ? 'Show Local' : 'Show Full Map'}
            </Button>

            <div className="flex items-center border border-zinc-700 rounded-md bg-zinc-800 overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleZoom('out')}
                className="h-9 w-9 rounded-none hover:bg-zinc-700 text-zinc-300"
              >
                <ZoomOut size={16} />
              </Button>
              <div className="w-px h-4 bg-zinc-700" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleZoom('reset')}
                className="h-9 px-2 rounded-none hover:bg-zinc-700 text-[10px] font-bold text-zinc-400"
              >
                Reset
              </Button>
              <div className="w-px h-4 bg-zinc-700" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleZoom('in')}
                className="h-9 w-9 rounded-none hover:bg-zinc-700 text-zinc-300"
              >
                <ZoomIn size={16} />
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 w-9"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative cursor-grab active:cursor-grabbing">
          <svg 
            ref={svgRef} 
            className="w-full h-full"
          />
          
          {/* Legend/Controls Overlay */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg shadow-xl text-[10px] space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-zinc-300">CURRENT LOCATION</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-600" />
                <span className="text-zinc-300">DISCOVERED ROOM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/50 text-[10px] text-zinc-500 text-center">
          DRAG TO PAN • SCROLL TO ZOOM • DRAG NODES TO REORGANIZE
        </div>
      </div>
    </div>
  );
}
