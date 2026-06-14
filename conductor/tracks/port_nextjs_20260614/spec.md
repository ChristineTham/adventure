# Specification: Port Open Adventure to NextJS

## Overview
This track handles the complete port of the original C99 Open Adventure game logic into a modern NextJS (App Router) web application. The game state will be managed by Zustand, and the UI will use shadcn/ui and Tailwind v4 to provide a modern hybrid text-adventure interface.

## Functional Requirements
1.  **Build-Time Data Generation**: Create a Node.js/TS script that parses `open-adventure/adventure.yaml` and outputs static JSON or TypeScript definitions.
2.  **State Management**: Implement a Zustand store representing the core game state (inventory, location, flags, scores).
3.  **Game Engine Logic**: Port the core logic from `main.c`, `actions.c`, and `init.c` into a functional TypeScript engine that interacts with the Zustand store.
4.  **UI/UX**: 
    - Implement a scrollable terminal-like history view for game text.
    - Implement a text input field for classic commands.
    - Implement clickable UI components (buttons) for contextual actions (e.g., movement, inventory interaction).
5.  **Game Loop**: Wire the UI input (text or clicks) to the game engine, which updates the Zustand state, triggering a UI re-render.

## Non-Functional Requirements
-   **Type Safety**: Ensure strict TypeScript typing, especially for the parsed YAML data and game state.
-   **Testability**: Write unit tests for the core engine logic (movement, actions, state changes) using Vitest.

## Out of Scope
-   Backend persistence/saving (initially). Game state lives in browser memory or local storage.