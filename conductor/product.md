# Product Guide: Open Adventure Web

## Project Goal
A modern web-based port of the classic Crowther/Woods Colossal Cave Adventure 2.5 game, transitioning from the original C99 terminal implementation to a NextJS TypeScript web application.

## Target Audience
- **Retro Gamers** seeking the classic text adventure experience in the browser.
- **Modern Players** who appreciate classic games but prefer modern UI conveniences (clickable verbs, inventory management).

## Key Features
- **Modern Hybrid UI:** Blends the classic text output with a modern interface utilizing Tailwind CSS and shadcn/ui components for ease of play.
- **Client-Side Engine:** The entire game engine runs in the browser, powered by a modern refactoring of the original C logic into functional/object-oriented TypeScript.
- **Build-Time Content Generation:** Game data is sourced from the original `adventure.yaml` and compiled into static TypeScript assets during the build step.
- **State Management:** Uses Zustand for lightweight, robust game state handling within the React component tree.

## Future Focus
- Ensure complete parity with the original game's logic while adopting a clean TypeScript architecture.
- Expand accessibility through standard web practices.
