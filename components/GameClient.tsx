'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { initializeGame, processCommand } from '@/engine/core';
import gameDataRaw from '@/data/game-data.json';
import { GameData, GameLocation, TravelRule } from '@/types/game';
import { GameMap } from './GameMap';
import { GameSidebar } from './GameSidebar';
import { GameTerminal } from './GameTerminal';
import { GameControls } from './GameControls';

const gameData = gameDataRaw as unknown as GameData;

export function GameClient() {
  const { history, currentLocation, objectLocations } = useGameStore();
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const handleAction = (cmd: string): void => {
    processCommand(cmd);
  };

  const visibleObjects: [string, string][] = Object.entries(objectLocations)
    .filter(([, locId]) => locId === currentLocation);

  const isDirectionValid = (dir: string): boolean => {
    const loc: GameLocation | undefined = gameData.locations[currentLocation];
    if (!loc) return false;
    const resolvedKey: string | undefined = gameData.vocabulary[dir];
    if (!resolvedKey) return false;
    return loc.travel.some((rule: TravelRule) => rule.verbs.includes(resolvedKey));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-4 h-screen max-h-screen p-4 bg-background text-foreground font-sans gap-4 overflow-hidden">
      <GameSidebar onShowMap={() => setShowMap(true)} />
      
      <GameTerminal 
        history={history} 
        currentLocation={currentLocation} 
        onAction={handleAction} 
        onShowMap={() => setShowMap(true)} 
      />

      <GameControls 
        visibleObjects={visibleObjects} 
        isDirectionValid={isDirectionValid} 
        onAction={handleAction} 
      />

      {showMap && (
        <GameMap 
          gameData={gameData} 
          currentLocation={currentLocation} 
          onClose={() => setShowMap(false)} 
        />
      )}
    </div>
  );
}
