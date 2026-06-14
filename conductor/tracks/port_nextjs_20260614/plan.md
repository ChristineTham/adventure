# Implementation Plan: Port Open Adventure to NextJS

## Phase 1: Build-Time Data Generation [checkpoint: f48e99b]
- [x] Task: Set up build scripts 6204446
    - [ ] Create `scripts/parse-yaml.ts` to read `open-adventure/adventure.yaml`.
    - [ ] Add `js-yaml` or similar dependency.
- [x] Task: Define TypeScript types for game data 474e929
    - [ ] Create interfaces for Locations, Objects, Motions, Actions, and Messages based on the YAML structure.
- [x] Task: Implement generation logic 8cb87d7
    - [ ] Parse the YAML and generate a `src/data/game-data.json` or `.ts` file.
    - [ ] Hook this script into the NextJS build process (e.g., `prebuild` in `package.json`).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Build-Time Data Generation' (Protocol in workflow.md) f48e99b

## Phase 2: Game State & Engine Skeleton [checkpoint: 64b0d0c]
- [x] Task: Define Zustand Store ed54055
    - [ ] Create `src/store/gameStore.ts`.
    - [ ] Define the initial state structure (current location, inventory array, flags, history of messages).
- [x] Task: Create Engine Core 95b721a
    - [ ] Port `init.c` logic to initialize the game state.
    - [ ] Create a `processCommand(input: string)` function skeleton.
- [x] Task: Write initial tests abb6537
    - [ ] Set up Vitest.
    - [ ] Write a test verifying initial state setup.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Game State & Engine Skeleton' (Protocol in workflow.md) 64b0d0c

## Phase 3: Core Game Logic (The Big Port)

## Phase 3: Core Game Logic (The Big Port) [checkpoint: c1c7236]
- [x] Task: Port Movement & Navigation ddc9ffb
    - [ ] Translate logic for moving between rooms based on `motions`.
    - [ ] Add tests for movement commands (N, S, E, W).
- [x] Task: Port Object Interaction e366994
    - [ ] Translate logic for taking, dropping, and examining objects.
    - [ ] Add tests for inventory commands.
- [x] Task: Port Special Actions f89763c
    - [ ] Translate complex verbs from `actions.c` (e.g., ATTACK, FILL, THROW).
    - [ ] Add tests for special actions.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Core Game Logic (The Big Port)' (Protocol in workflow.md) c1c7236

## Phase 4: User Interface (Modern Hybrid) [checkpoint: 31f9a17]
- [x] Task: Main Layout 996160d
    - [ ] Set up the main page layout with Tailwind CSS.
    - [ ] Create a retro-styled but modern typography theme.
- [x] Task: History & Input 996160d
    - [ ] Create a component to render the game history (messages).
    - [ ] Create a text input component for classic commands.
- [x] Task: Interactive Elements 996160d
    - [ ] Add shadcn/ui buttons for contextual actions (e.g., compass directions, visible objects).
- [x] Task: Wire UI to Engine 996160d
    - [ ] Connect the input and buttons to `processCommand`.
    - [ ] Connect the history component to the Zustand store.
- [x] Task: Conductor - User Manual Verification 'Phase 4: User Interface (Modern Hybrid)' (Protocol in workflow.md) 31f9a17