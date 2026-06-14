import { useGameStore } from '../store/gameStore';
import gameDataRaw from '../data/game-data.json';
import { GameData } from '../types/game';

const gameData = gameDataRaw as unknown as GameData;

export function initializeGame() {
  const store = useGameStore.getState();
  store.reset();
  
  // Initial location as per Open Adventure LOC_START
  store.setLocation('LOC_START');
  
  // Add initial long description
  const startLoc = gameData.locations['LOC_START'];
  if (startLoc && startLoc.description.long) {
    store.addMessage(startLoc.description.long);
  }
}

export function processCommand(input: string) {
  const store = useGameStore.getState();
  const command = input.trim().toUpperCase();
  
  if (!command) return;

  store.addMessage(`> ${input}`);

  // 1. Resolve command to a motion or action key using vocabulary
  const resolvedKey = gameData.vocabulary[command];

  // 2. Handle LOOK separately (as it can be an action OR just the word)
  if (command === 'LOOK' || command === 'L' || resolvedKey === 'LOOK') {
    const loc = gameData.locations[store.currentLocation];
    if (loc && loc.description.long) {
      store.addMessage(loc.description.long);
    }
    return;
  }

  // 3. Handle Movement
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
