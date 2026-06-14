# Implementation Plan: Port Open Adventure to NextJS

## Phase 1: Build-Time Data Generation
- [~] Task: Set up build scripts
    - [ ] Create `scripts/parse-yaml.ts` to read `open-adventure/adventure.yaml`.
    - [ ] Add `js-yaml` or similar dependency.
- [ ] Task: Define TypeScript types for game data
    - [ ] Create interfaces for Locations, Objects, Motions, Actions, and Messages based on the YAML structure.
- [ ] Task: Implement generation logic
    - [ ] Parse the YAML and generate a `src/data/game-data.json` or `.ts` file.
    - [ ] Hook this script into the NextJS build process (e.g., `prebuild` in `package.json`).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Build-Time Data Generation' (Protocol in workflow.md)

## Phase 2: Game State & Engine Skeleton
- [ ] Task: Define Zustand Store
    - [ ] Create `src/store/gameStore.ts`.
    - [ ] Define the initial state structure (current location, inventory array, flags, history of messages).
- [ ] Task: Create Engine Core
    - [ ] Port `init.c` logic to initialize the game state.
    - [ ] Create a `processCommand(input: string)` function skeleton.
- [ ] Task: Write initial tests
    - [ ] Set up Vitest.
    - [ ] Write a test verifying initial state setup.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Game State & Engine Skeleton' (Protocol in workflow.md)

## Phase 3: Core Game Logic (The Big Port)
- [ ] Task: Port Movement & Navigation
    - [ ] Translate logic for moving between rooms based on `motions`.
    - [ ] Add tests for movement commands (N, S, E, W).
- [ ] Task: Port Object Interaction
    - [ ] Translate logic for taking, dropping, and examining objects.
    - [ ] Add tests for inventory commands.
- [ ] Task: Port Special Actions
    - [ ] Translate complex verbs from `actions.c` (e.g., ATTACK, FILL, THROW).
    - [ ] Add tests for special actions.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Core Game Logic (The Big Port)' (Protocol in workflow.md)

## Phase 4: User Interface (Modern Hybrid)
- [ ] Task: Main Layout
    - [ ] Set up the main page layout with Tailwind CSS.
    - [ ] Create a retro-styled but modern typography theme.
- [ ] Task: History & Input
    - [ ] Create a component to render the game history (messages).
    - [ ] Create a text input component for classic commands.
- [ ] Task: Interactive Elements
    - [ ] Add shadcn/ui buttons for contextual actions (e.g., compass directions, visible objects).
- [ ] Task: Wire UI to Engine
    - [ ] Connect the input and buttons to `processCommand`.
    - [ ] Connect the history component to the Zustand store.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: User Interface (Modern Hybrid)' (Protocol in workflow.md)