# Implementation Plan

## Phase 1: Setup & Evaluation [checkpoint: da79c5d]
- [x] Task: Evaluate and define Nano Banana 2 prompt templates to generate 3:2 Studio Ghibli style images. Generate a small sample set (e.g., `LOC_BUILDING`, `LOC_VALLEY`).
- [x] Task: Create the `data/images/` directory and add the sample images.
- [x] Task: Update the build script (`scripts/parse-yaml.ts`) to automatically copy images from `data/images/` to a serving directory like `public/locations/` during the `prebuild` step.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Setup & Evaluation' (Protocol in workflow.md)

## Phase 2: UI Implementation [checkpoint: 13105d2]
- [x] Task: Write failing unit tests for a new `LocationImage` component.
- [x] Task: Implement the `LocationImage` component (Green Phase). It should include responsive 3:2 scaling, postcard border styling, and a fade-in animation using Tailwind CSS / Framer Motion (if available) or standard CSS transitions.
- [x] Task: Update `GameClient.tsx` (or an appropriate layout component) to conditionally render the `LocationImage` in a dedicated panel, subscribing to `currentLocation` from the Zustand store.
- [x] Task: Conductor - User Manual Verification 'Phase 2: UI Implementation' (Protocol in workflow.md)

## Phase 3: Full Asset Generation (Batch Process)
- [x] Task: Generate the remaining images for all locations defined in `adventure.yaml` using the established prompts.
- [x] Task: Optimize and save all generated images to `data/images/`.
- [x] Task: Playtest to ensure images load correctly upon entering each room and fallback gracefully if an image is missing.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Full Asset Generation' (Protocol in workflow.md)