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

  // Skeleton for command processing
  if (command === 'LOOK' || command === 'L') {
    const loc = gameData.locations[store.currentLocation];
    if (loc && loc.description.long) {
      store.addMessage(loc.description.long);
    }
  } else {
    store.addMessage("I don't know how to do that yet.");
  }
}
