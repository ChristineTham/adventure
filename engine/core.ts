import { useGameStore } from '../store/gameStore';
import gameDataRaw from '../data/game-data.json';
import { GameData, GameLocation, ObjectData, TravelRule } from '../types/game';

const gameData: GameData = gameDataRaw as unknown as GameData;

export function initializeGame(): void {
  const store = useGameStore.getState();
  store.reset();
  
  // Initial location as per Open Adventure LOC_START
  store.setLocation('LOC_START');

  // Initialize object locations and states
  for (const [key, obj] of Object.entries(gameData.objects)) {
    const objectKey: string = key;
    const objectData: ObjectData = obj;
    store.setObjectState(objectKey, 0);
    if (objectData.locations && objectData.locations.length > 0) {
      // For now, take the first location. 
      // Open Adventure objects can have up to 2 locations (e.g. grate)
      store.setObjectLocation(objectKey, objectData.locations[0]);
    }
  }
  
  // Add initial long description
  const startLoc: GameLocation | undefined = gameData.locations['LOC_START'];
  if (startLoc && startLoc.description.long) {
    store.addMessage(startLoc.description.long);
  }
}

function updateScore(): void {
  const store = useGameStore.getState();
  let currentScore = 0;

  // Current implementation is O(N) where N is number of objects. 
  // For a faithful port, this is acceptable, but consider event-driven score updates 
  // if the object list grows significantly.
  // Points for treasures
  for (const [objId, locId] of Object.entries(store.objectLocations)) {
    const obj = gameData.objects[objId];
    if (obj?.treasure) {
      if (locId === 'IN_INVENTORY') {
        currentScore += 10;
      } else if (locId === 'LOC_START') {
        // Full credit for bringing it back to the building
        currentScore += 25;
      }
    }
  }

  store.setScore(currentScore);
}

export function processCommand(input: string): void {
  const store = useGameStore.getState();
  const rawInput: string = input.trim().toUpperCase();
  if (!rawInput) return;

  const parts: string[] = rawInput.split(/\s+/);
  const command: string = parts[0];
  const objName: string | undefined = parts[1]; // Handle simple two-word commands

  store.addMessage(`> ${input}`);

  // 1. Resolve command to a motion or action key using vocabulary
  const resolvedKey: string | undefined = gameData.vocabulary[command];

  // 2. Handle LOOK
  if (command === 'LOOK' || command === 'L' || resolvedKey === 'LOOK') {
    const loc: GameLocation | undefined = gameData.locations[store.currentLocation];
    if (loc && loc.description.long) {
      store.addMessage(loc.description.long);
      
      // List visible objects
      const visibleObjects: [string, string][] = Object.entries(store.objectLocations)
        .filter(([, locId]) => locId === store.currentLocation);
      
      visibleObjects.forEach(([objId]) => {
        const obj: ObjectData | undefined = gameData.objects[objId];
        const state: number = store.objectStates[objId] || 0;
        if (obj && obj.descriptions && obj.descriptions[state]) {
          store.addMessage(obj.descriptions[state]);
        }
      });
    }
    return;
  }

  // 3. Handle TAKE / GET
  if (resolvedKey === 'CARRY' || command === 'TAKE' || command === 'GET') {
    if (!objName) {
      store.addMessage("What do you want to take?");
      return;
    }

    const resolvedObjId: string | undefined = gameData.vocabulary[objName];
    if (!resolvedObjId || !gameData.objects[resolvedObjId]) {
      store.addMessage("I see no such thing here.");
      return;
    }

    if (store.objectLocations[resolvedObjId] === store.currentLocation) {
      store.addToInventory(resolvedObjId);
      store.setObjectLocation(resolvedObjId, 'IN_INVENTORY'); // Use special ID or just logic
      store.addMessage("OK");
      updateScore();
    } else if (store.inventory.includes(resolvedObjId)) {
      store.addMessage("You are already carrying it!");
    } else {
      store.addMessage("I see no such thing here.");
    }
    return;
  }

  // 4. Handle DROP
  if (resolvedKey === 'DROP') {
    if (!objName) {
      store.addMessage("What do you want to drop?");
      return;
    }

    const resolvedObjId: string | undefined = gameData.vocabulary[objName];
    if (!resolvedObjId || !store.inventory.includes(resolvedObjId)) {
      store.addMessage("You aren't carrying that!");
      return;
    }

    store.removeFromInventory(resolvedObjId);
    store.setObjectLocation(resolvedObjId, store.currentLocation);
    store.addMessage("OK");
    updateScore();
    return;
  }

  // 5. Handle INVENTORY
  if (command === 'INVENTORY' || command === 'I') {
    if (store.inventory.length === 0) {
      store.addMessage("You are empty-handed.");
    } else {
      store.addMessage("You are currently holding the following:");
      store.inventory.forEach(objId => {
        const obj: ObjectData | undefined = gameData.objects[objId];
        if (obj) {
          store.addMessage(` - ${obj.inventory}`);
        }
      });
    }
    return;
  }

  // 6. Handle FILL
  if (resolvedKey === 'FILL') {
    if (!store.inventory.includes('BOTTLE')) {
      store.addMessage("You have nothing in which to carry it.");
      return;
    }
    
    const loc: GameLocation | undefined = gameData.locations[store.currentLocation];
    if (loc?.conditions['FLUID']) {
      const isOily: boolean | number = loc.conditions['OILY'];
      store.setObjectState('BOTTLE', isOily ? 2 : 0); // 2: Oil, 0: Water
      store.addMessage("Your bottle is now full of " + (isOily ? "oil." : "water."));
    } else {
      store.addMessage("There is nothing here with which to fill the bottle.");
    }
    return;
  }

  // 7. Handle ATTACK
  if (resolvedKey === 'ATTACK') {
    if (!objName) {
      store.addMessage("What do you want to attack?");
      return;
    }
    store.addMessage("Attacking things doesn't seem to help much here.");
    return;
  }

  // 8. Handle Movement
  const currentLocation: GameLocation | undefined = gameData.locations[store.currentLocation];
  if (currentLocation && resolvedKey) {
    // Find a rule where one of the verbs matches our resolvedKey
    const travelRule: TravelRule | undefined = currentLocation.travel.find((rule) => 
      rule.verbs.includes(resolvedKey)
    );

    if (travelRule) {
      const [actionType, target] = travelRule.action;
      if (actionType === 'goto') {
        const nextLocId: string = target as string;
        store.setLocation(nextLocId);
        const nextLoc: GameLocation | undefined = gameData.locations[nextLocId];
        if (nextLoc && nextLoc.description.long) {
          store.addMessage(nextLoc.description.long);
        }
        return;
      } else if (actionType === 'speak') {
        const msg: string | string[] | undefined = gameData.arbitrary_messages[target as string];
        if (msg) {
          store.addMessage(Array.isArray(msg) ? msg[0] : msg);
        }
        return;
      }
    }
  }

  store.addMessage("I don't know how to do that yet.");
}
