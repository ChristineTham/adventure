'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { initializeGame, processCommand } from '@/engine/core';
import gameDataRaw from '@/data/game-data.json';
import { GameData, GameLocation, TravelRule } from '@/types/game';
import { GameMap } from './GameMap';
import { GameHeader } from './GameHeader';
import { GameTerminal } from './GameTerminal';
import { GameControls } from './GameControls';
import { LocationImage } from './LocationImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Eye, X } from 'lucide-react';

const gameData = gameDataRaw as unknown as GameData;

export function GameClient() {
  const { history, currentLocation, objectLocations, score, inventory } = useGameStore();
  const [showMap, setShowMap] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [inputValue, setInputValue] = useState('');

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
    <div className="flex flex-col h-screen max-h-screen p-3 bg-background text-foreground font-sans gap-3 overflow-hidden">
      <GameHeader onShowMap={() => setShowMap(true)} currentLocation={currentLocation} />
      
      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-3 overflow-hidden h-full">
        {/* Left Column: Location Image, Input Panel, and Objects Panel */}
        <div className="flex flex-col justify-center items-center h-auto md:h-full md:flex-1 overflow-hidden col-span-12 md:col-span-7 lg:col-span-8 bg-zinc-950/5 dark:bg-black/10 rounded-xl p-3 border border-border/40 shrink-0 gap-3 w-full">
          <LocationImage 
            key={currentLocation} 
            locationId={currentLocation} 
            className="w-full flex-1 max-h-[66vh] max-w-[99vh] mx-auto" 
          />
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim()) {
                handleAction(inputValue);
                setInputValue('');
              }
            }}
            className="flex w-full gap-3 max-w-[99vh] mx-auto bg-card border border-border p-2.5 rounded-xl shadow-sm shrink-0"
          >
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-3 text-blue-500 font-bold text-base select-none pointer-events-none">{'>'}</span>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What should we do?"
                className="flex-1 bg-background border-border text-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-10 text-sm pl-8 rounded-lg transition-all shadow-inner w-full"
                autoFocus
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-4 rounded-lg shadow-md transition-transform active:scale-95 text-sm shrink-0">
              Enter
            </Button>
          </form>

          {/* Horizontal Objects Panel */}
          {visibleObjects.length > 0 && (
            <div className="flex flex-row items-center gap-3 w-full max-w-[99vh] mx-auto bg-card border border-border p-2 rounded-xl shadow-sm shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500 flex items-center gap-1.5 shrink-0 border-r border-border/60 pr-3">
                <Eye className="size-3.5" /> Objects
              </span>
              <div className="flex flex-row flex-wrap gap-2 overflow-x-auto py-0.5">
                {visibleObjects.map(([objId]) => (
                  <Button 
                    key={objId} 
                    variant="outline" 
                    className="text-xs border-border hover:bg-accent h-7 rounded-lg px-2.5 flex items-center gap-1.5 group shrink-0"
                    onClick={() => handleAction(`TAKE ${objId}`)}
                    aria-label={`Take ${objId}`}
                  >
                    <span>TAKE {objId}</span>
                    <Package className="size-3 text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Terminal (50% height) and compact Controls stacked */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4 flex flex-col gap-3 flex-1 md:h-full overflow-hidden w-full">
          <GameTerminal 
            history={history} 
            currentLocation={currentLocation} 
            onShowMap={() => setShowMap(true)} 
            score={score}
            inventoryCount={inventory.length}
            onShowInventory={() => setShowInventory(true)}
            className="flex-1 min-h-0"
          />
          
          <GameControls 
            inventory={inventory}
            isDirectionValid={isDirectionValid} 
            onAction={handleAction} 
          />
        </div>
      </div>

      {showMap && (
        <GameMap 
          gameData={gameData} 
          currentLocation={currentLocation} 
          onClose={() => setShowMap(false)} 
        />
      )}

      {/* Mobile Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm border-border bg-card shadow-2xl rounded-xl overflow-hidden border-t-2 border-t-green-500/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 bg-muted/20">
              <CardTitle className="text-xs font-bold tracking-widest flex items-center gap-2 text-green-500 uppercase">
                <Package className="size-3.5" /> Inventory
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-foreground" 
                onClick={() => setShowInventory(false)}
                aria-label="Close Inventory"
              >
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 max-h-[60vh] overflow-auto">
              {inventory.length === 0 ? (
                <div className="text-xs text-muted-foreground italic text-center py-4">Empty-handed</div>
              ) : (
                <div className="space-y-2">
                  {inventory.map(objId => (
                    <div key={objId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50">
                      <span className="text-xs font-medium">{objId}</span>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-7 text-xs px-3 font-bold hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleAction(`DROP ${objId}`)}
                      >
                        DROP
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
