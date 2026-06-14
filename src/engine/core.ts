import { useGameStore } from '../store/gameStore';
import gameDataRaw from '../data/game-data.json';
import { GameData } from '../types/game';

const gameData = gameDataRaw as unknown as GameData;

export function initializeGame() {
  const store = useGameStore.getState();
  store.reset();
  
  // Initial location as per Open Adventure LOC_START
  store.setLocation('LOC_START');

  // Initialize object locations
  for (const [key, obj] of Object.entries(gameData.objects)) {
    if (obj.locations && obj.locations.length > 0) {
      // For now, take the first location. 
      // Open Adventure objects can have up to 2 locations (e.g. grate)
      store.setObjectLocation(key, obj.locations[0]);
    }
  }
  
  // Add initial long description
  const startLoc = gameData.locations['LOC_START'];
  if (startLoc && startLoc.description.long) {
    store.addMessage(startLoc.description.long);
  }
}

export function processCommand(input: string) {
  const store = useGameStore.getState();
  const rawInput = input.trim().toUpperCase();
  if (!rawInput) return;

  const parts = rawInput.split(/\s+/);
  const command = parts[0];
  const objName = parts[1]; // Handle simple two-word commands

  store.addMessage(`> ${input}`);

  // 1. Resolve command to a motion or action key using vocabulary
  const resolvedKey = gameData.vocabulary[command];

  // 2. Handle LOOK
  if (command === 'LOOK' || command === 'L' || resolvedKey === 'LOOK') {
    const loc = gameData.locations[store.currentLocation];
    if (loc && loc.description.long) {
      store.addMessage(loc.description.long);
      
      // List visible objects
      const visibleObjects = Object.entries(store.objectLocations)
        .filter(([_, locId]) => locId === store.currentLocation)
        .map(([objId, _]) => gameData.objects[objId]);
      
      visibleObjects.forEach(obj => {
        if (obj.descriptions && obj.descriptions.length > 0) {
          // For now, use the first description (state 0)
          store.addMessage(obj.descriptions[0]);
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

    const resolvedObjId = gameData.vocabulary[objName];
    if (!resolvedObjId || !gameData.objects[resolvedObjId]) {
      store.addMessage("I see no such thing here.");
      return;
    }

    if (store.objectLocations[resolvedObjId] === store.currentLocation) {
      store.addToInventory(resolvedObjId);
      store.setObjectLocation(resolvedObjId, 'IN_INVENTORY'); // Use special ID or just logic
      store.addMessage("OK");
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

    const resolvedObjId = gameData.vocabulary[objName];
    if (!resolvedObjId || !store.inventory.includes(resolvedObjId)) {
      store.addMessage("You aren't carrying that!");
      return;
    }

    store.removeFromInventory(resolvedObjId);
    store.setObjectLocation(resolvedObjId, store.currentLocation);
    store.addMessage("OK");
    return;
  }

  // 5. Handle INVENTORY
  if (command === 'INVENTORY' || command === 'I') {
    if (store.inventory.length === 0) {
      store.addMessage("You are empty-handed.");
    } else {
      store.addMessage("You are currently holding the following:");
      store.inventory.forEach(objId => {
        const obj = gameData.objects[objId];
        store.addMessage(` - ${obj.inventory}`);
      });
    }
    return;
  }

  // 6. Handle Movement
  const currentLocation = gameData.locations[store.currentLocation];
  if (currentLocation && resolvedKey) {
    // Find a rule where one of the verbs matches our resolvedKey
    const travelRule = currentLocation.travel.find((rule) => 
      rule.verbs.includes(resolvedKey)
    );

    if (travelRule) {
      const [actionType, target] = travelRule.action;
      if (actionType === 'goto') {
        const nextLocId = target as string;
        store.setLocation(nextLocId);
        const nextLoc = gameData.locations[nextLocId];
        if (nextLoc && nextLoc.description.long) {
          store.addMessage(nextLoc.description.long);
        }
        return;
      } else if (actionType === 'speak') {
        const msg = gameData.arbitrary_messages[target as string];
        if (msg) {
          store.addMessage(Array.isArray(msg) ? msg[0] : msg);
        }
        return;
      }
    }
  }

  store.addMessage("I don't know how to do that yet.");
}
