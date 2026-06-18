# Open Adventure Project Overview

Open Adventure is a modern, strictly typed TypeScript forward-port of the classic Crowther/Woods Colossal Cave Adventure 2.5. It aims to preserve the original gameplay integrity while modernising the implementation into a web-based interactive fiction game built with Next.js and React.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript (Strict Mode)
- **State Management:** Zustand
- **Styling:** Vanilla CSS & Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Build System & Package Manager:** pnpm
- **Tools:** tsx (for YAML parsing)
- **Testing:** Vitest

## Core Architecture
The project uses a data-driven design where the game world is defined in `data/adventure.yaml`.
- **`data/adventure.yaml`**: The definitive source of truth containing all locations, objects, motions, actions, and messages.
- **`scripts/parse-yaml.ts`**: Compiles `data/adventure.yaml` into a structured JSON payload (`data/game-data.json`) during the build process.
- **`engine/core.ts`**: The core game engine implementing the state machine for movement, action processing, and object manipulation.
- **`store/gameStore.ts`**: Zustand-based central store managing the game's reactive state (current location, inventory, world state, and message history).
- **`components/GameClient.tsx`**: A polished, responsive terminal-style interface for player interaction.

## Building and Running
- **Install dependencies:** `pnpm install`
- **Generate Game Data:** `pnpm prebuild`
- **Run Development Server:** `pnpm dev`
- **Test:** `pnpm test` (Runs Vitest regression suite in `tests/`)
- **Build for Production:** `pnpm build` (Static export to `out/`)

## Development Conventions
- **Preserve Gameplay:** By policy, do not change original gameplay logic unless fixing a verified bug.
- **Surgical Changes:** Only modify code necessary for the current task.
- **Explicit Types:** Avoid typecasts; always declare explicit types for parameters, variables, and return values. No `any` or `unknown` types in core logic.
- **Verification:** Never settle for unverified changes. Always run `pnpm lint` and `pnpm test` before finalising tasks.
- **Language:** Adherence to Australian English spelling (e.g., 'normalise', 'optimise') throughout the codebase and documentation.
- **Testing:** The project maintains a high standard for test coverage (effectively 100%). Always run `pnpm test` after modifications.

## Key Files
- `data/adventure.yaml`: The definitive source for game data.
- `data/game-data.json`: The compiled structured data used by the web engine.
- `engine/core.ts`: Where most command and movement logic lives.
- `store/gameStore.ts`: Global reactive game state.
- `components/GameClient.tsx`: The main user interface component.
- `tests/`: Regression test suites for engine, store, and scripts.
