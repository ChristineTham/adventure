# Technology Stack: Open Adventure Web

## Core Technologies
- **Framework:** NextJS (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Base primitives) - always use shadcn cli to add components, never add components manually

## Game Engine & State
- **State Management:** Zustand
- **Architecture:** A modern refactoring of the original C logic into TypeScript, decoupling the core engine logic from the React UI layer.

## Data and Configuration
- **Source of Truth:** `open-adventure/adventure.yaml`
- **Processing:** Build-time scripts (Node.js/TypeScript) to parse the YAML and generate static JSON or TypeScript modules for the game engine to consume.

## Testing and Tooling
- **Linting/Formatting:** ESLint and Prettier
- **Testing:** Vitest for engine logic; React Testing Library for components.
- **Package Manager:** pnpm
