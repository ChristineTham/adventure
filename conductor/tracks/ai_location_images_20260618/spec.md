# Specification: AI Location Images

## Overview
Evaluate approaches and implement the display of pre-generated, Studio Ghibli-style, postcard-sized (3:2 aspect ratio) images for each game location. Images will be generated offline using Nano Banana 2 (via Google AI Pro) and stored within the repository.

## Functional Requirements
- **Storage:** Pre-generated images must be stored in the `data/images/` directory within the repository.
- **Mapping:** Image files must be mapped to their corresponding locations using the location ID from `data/adventure.yaml` as the filename (e.g., `LOC_BUILDING.webp` or `LOC_BUILDING.jpg`).
- **UI Display:** The image for the current location must be displayed in a dedicated UI panel (distinct from the main terminal output).
- **Build Process:** The build process (`scripts/parse-yaml.ts` or similar) may need to verify or copy these images from `data/images/` to the `public/` directory for Next.js to serve them statically.

## Non-Functional Requirements
- **Aspect Ratio:** All images must strictly adhere to a 3:2 aspect ratio.
- **Aesthetic:** Images must consistently follow a Studio Ghibli art style.
- **Visual Presentation:** 
  - Images must scale responsively for mobile and desktop views.
  - A subtle fade-in animation should be applied when a new image loads.
  - Images should be styled with a subtle border to resemble a physical postcard.
- **Performance:** Images should be optimized for web delivery (e.g., WebP format).

## Out of Scope
- Real-time/runtime image generation via API.
- Altering the original game text or logic.
- Images for individual objects or inventory items (locations only).