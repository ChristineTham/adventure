# Open Adventure (Next.js Port)

A modern, strictly typed TypeScript port of the classic Crowther/Woods Colossal Cave Adventure 2.5, built with Next.js 16 and React 19.

## 🇦🇺 Project Mission

The primary goal is to forward-port the "Open Adventure" game logic into a modern web environment while preserving the original gameplay integrity. This project emphasises **technical excellence**, **strict type safety**, and ** Australian English** standards.

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript (Strict Mode)
- **State Management:** Zustand
- **Styling:** Vanilla CSS & Tailwind CSS v4
- **Build Tools:** pnpm, tsx (for YAML parsing)
- **Testing:** Vitest

## 🏗 Core Architecture

The project uses a data-driven design where the game world is sourced from the original `adventure.yaml`.

- **YAML Parser (`scripts/parse-yaml.ts`)**: A custom-built, type-safe parser that transforms the original `adventure.yaml` into a structured JSON format suitable for the web engine. It handles complex YAML structures like `!!omap` and normalises vocabulary synonyms.
- **Game Engine Core (`engine/core.ts`)**: Implements the state machine for movement, action processing, and object manipulation.
- **Game Store (`store/gameStore.ts`)**: A Zustand-based central store managing the game's reactive state (current location, inventory, world state, and message history).
- **UI Component (`components/GameClient.tsx`)**: A polished, responsive terminal-style interface featuring:
  - Auto-scrolling message history.
  - Context-aware movement controls (Compass).
  - Dynamic inventory and object interaction panels.

## ✅ Implemented to Date

- [x] **Strict Type System**: 100% strict type coverage across all project files. No `any` or `unknown` types in the core logic.
- [x] **YAML Data Pipeline**: Automated conversion of `open-adventure/adventure.yaml` to `data/game-data.json`.
- [x] **Location & Movement**: Support for cardinal directions, synonyms, and context-aware descriptions.
- [x] **Object Interaction**: Implementation of `TAKE`, `DROP`, `FILL`, and `INVENTORY` commands.
- [x] **Autoscroll Terminal**: A modern UI that keeps the player focused on the latest game output.
- [x] **澳洲 English Lexicon**: Adherence to Australian spelling (e.g., 'normalise', 'optimise') throughout the codebase and documentation.
- [x] **Rigorous Testing**: Comprehensive unit tests for the parser, engine, and store with 100% pass rate.
- [x] **Clean Linting**: ESLint configuration tuned for high signal, ignoring non-project directories like `.agents/`.

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Generate game data**:
   ```bash
   pnpm prebuild
   ```

3. **Run the development server**:
   ```bash
   pnpm dev
   ```

4. **Run tests**:
   ```bash
   pnpm test
   ```

## 🌐 Deployment

This project is configured for deployment to **GitHub Pages** with a base path of `/adventure/`.

- **Configuration**: Managed in `next.config.ts` (`basePath`, `output: 'export'`).
- **CI/CD**: Automated via GitHub Actions in `.github/workflows/deploy.yml`.
- **Manual Export**: Run `pnpm build` to generate static files in the `out/` directory.

## 📖 Development Standards

- **Surgical Changes**: Only modify code necessary for the current task.
- **Explicit Types**: Avoid typecasts; always declare explicit types for parameters, variables, and return values.
- **Verification**: Never settle for unverified changes. Always run `pnpm lint` and `pnpm test` before finalising tasks.
