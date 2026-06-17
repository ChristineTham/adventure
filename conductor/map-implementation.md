# Map Implementation Plan

## Background & Motivation
Colossal Cave Adventure has a complex, non-Euclidean layout that makes navigation challenging. Historically, mappers used Graphviz (`make_graph.py`) to generate static diagrams from the game's travel data. To modernize the player experience, we will integrate a dynamic, interactive map directly into the React UI.

## Scope & Impact
- Add a "Show Map" button to the game interface.
- Implement an interactive D3.js force-directed graph overlay (modal or dedicated view).
- The map defaults to showing the local neighborhood (e.g., radius of 2 edges around the player) but can toggle to show the full discovered/available map.
- The underlying `game-data.json` remains the single source of truth; the map computes nodes and links dynamically on the client side.

## Proposed Solution
We will use **D3.js** for its powerful force-directed graph capabilities, which naturally untangle non-Euclidean networks without requiring strict manual positioning.

1. **Graph Construction Logic**: Parse `gameData.locations` to extract nodes (locations) and links (travel edges, filtered for valid user-navigable directions).
2. **Local vs. Full Rendering**: Implement a Breadth-First Search (BFS) algorithm to compute the localized subgraph centered on `currentLocation`. Provide a toggle state to render the full graph.
3. **UI Integration**: 
   - Add `d3` to dependencies.
   - Create a `components/GameMap.tsx` component that mounts the D3 SVG.
   - Add a button (e.g., in the Sidebar or Terminal header) to open the map overlay.
4. **Visuals**: Nodes will be styled with text labels. The current location node will be highlighted prominently.

## Alternatives Considered
- **React Flow**: Highly interactive but requires manual layout computations or external engines (like ElkJS) to auto-layout complex non-Euclidean structures. D3's physics engine solves this organically.
- **Vis.js**: Simpler than D3, but D3 offers much more granular control over React integration and visual styling in a modern stack.

## Phased Implementation Plan
1. **Setup & Dependencies**: `pnpm install d3 @types/d3`
2. **Graph Data Extraction**: Write utility functions in `lib/graph.ts` to convert `game-data.json` travel paths into a `nodes` and `links` structure, including the BFS neighborhood filter.
3. **D3 Component Component**: Implement `GameMap.tsx` with D3 force-simulation logic, pan/zoom behavior, and dynamic data binding based on props.
4. **UI Hooks**: Introduce the "Show Map" button and state toggle (Local vs. Full) inside `GameClient.tsx`.
5. **Styling & Polish**: Ensure dark mode compatibility and clear visual hierarchy (highlighting the current location and discovered paths).

## Verification
- Test that the map accurately reflects the current location.
- Verify that non-Euclidean connections (e.g., going East to a room, but West does not take you back) are accurately represented as directed edges.
- Ensure the D3 physics engine stabilizes the layout efficiently without lagging the UI.
