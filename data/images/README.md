# Location Image Prompt Strategy

## Tool
Nano Banana 2 (via Google AI Pro)

## Style
Studio Ghibli, hand-painted, lush colours, whimsical, detailed background, soft natural lighting.

## Format
- **Aspect Ratio:** 3:2 (Postcard size)
- **File Format:** JPG or PNG (as output by the tool)

## Prompt Template
"A Studio Ghibli style hand-painted postcard of [DESCRIPTION]. [EXIT_DESCRIPTION]. Lush colours, whimsical atmosphere, highly detailed, soft natural lighting, 3:2 aspect ratio."

### Components
- **[DESCRIPTION]:** Based on the `long` description in `adventure.yaml`.
- **[EXIT_DESCRIPTION]:** Based on available `travel` rules. For example:
  - If North is an exit: "A visible path leads to the north."
  - If a building is an entrance to the East: "A door on the east side of the building is open."
  - If there is a gully to the South: "A gully leads down to the south."

## Sample Prompts

### LOC_START
**Description:** "You are standing at the end of a road before a small brick building. Around you is a forest. A small stream flows out of the building and down a gully."
**Exits:** West (Road/Hill), East (Building), South (Valley/Gully), North (Forest).
**Prompt:** "A Studio Ghibli style hand-painted postcard of a small brick building at the end of a road in a lush forest. A small stream flows out of the building. A road leads west up a hill, and a gully leads south into a valley. Paths are visible leading north into the woods and east into the building. Whimsical atmosphere, highly detailed, soft natural lighting, 3:2 aspect ratio."

### LOC_VALLEY
**Description:** "You are in a valley in the forest beside a stream tumbling along a rocky bed."
**Exits:** North (Building), East (Forest), West (Forest), South (Slit/Down).
**Prompt:** "A Studio Ghibli style hand-painted postcard of a valley in a forest beside a stream tumbling along a rocky bed. Lush greenery. Paths lead north back towards a building, east and west into the forest, and south further down the valley. Whimsical atmosphere, highly detailed, soft natural lighting, 3:2 aspect ratio."
