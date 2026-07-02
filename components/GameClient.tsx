'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { initializeGame, processCommand, C } from '@/engine/core';
import gameDataRaw from '@/data/game-data.json';
import { GameData, GameLocation, TravelRule } from '@/types/game';
import { GameMap } from './GameMap';
import { GameHeader } from './GameHeader';
import { GameTerminal } from './GameTerminal';
import { GameControls, CompassRose, getItemName } from './GameControls';
import { LocationImage } from './LocationImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Eye, X } from 'lucide-react';

const gameData = gameDataRaw as unknown as GameData;

export function GameClient() {
  const { history, currentLocation, objectLocations, inventory } = useGameStore();
  const [showMap, setShowMap] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showCompass, setShowCompass] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    initializeGame();
  }, []);

  const handleAction = (cmd: string): void => {
    try {
      processCommand(cmd);
    } catch (error) {
      // The engine throws GAME_TERMINATED when the game ends; the final
      // score has already been written to the history, so just stop here.
      if (!(error instanceof Error && error.message === 'GAME_TERMINATED')) {
        throw error;
      }
    }
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

  const EXTRA_DIRS = ['UP', 'DOWN', 'IN', 'OUT', 'ENTER', 'CRAWL', 'CAVE', 'XYZZY', 'PLUGH', 'PLOVER'];
  const validExtraDirs = EXTRA_DIRS.filter(dir => isDirectionValid(dir));

  const getContextualActions = (): string[] => {
    const actions: string[] = ['LOOK', 'INVENTORY'];
    
    const hasLamp = inventory.includes('LAMP') || objectLocations['LAMP'] === currentLocation;
    const hasBottle = inventory.includes('BOTTLE');
    const hasFood = inventory.includes('FOOD');
    const hasKeys = inventory.includes('KEYS');
    const hasRod = inventory.includes('ROD') || inventory.includes('ROD2');
    
    const objects = useGameStore.getState().objects;
    const lampState = objects[C.LAMP]?.prop;
    if (hasLamp) {
      if (lampState === 1) { // LAMP_BRIGHT
        actions.push('EXTINGUISH');
      } else {
        actions.push('LIGHT');
      }
    }
    
    const isNearFluid = isDirectionValid('STREAM') || isDirectionValid('WATER') || isDirectionValid('OIL') || currentLocation === 'LOC_BUILDING' || currentLocation === 'LOC_VALLEY';
    if (hasBottle) {
      if (isNearFluid) {
        actions.push('FILL BOTTLE');
      }
      const bottleState = objects[C.BOTTLE]?.prop;
      if (bottleState === 0) { // WATER_BOTTLE
        actions.push('DRINK WATER');
      }
    }
    
    if (hasFood) {
      actions.push('EAT FOOD');
    }
    
    if (hasRod) {
      actions.push('WAVE');
    }
    
    const isNearGrate = objectLocations['GRATE'] === currentLocation;
    const isNearDoor = objectLocations['DOOR'] === currentLocation;
    if (hasKeys && (isNearGrate || isNearDoor)) {
      actions.push('UNLOCK');
      actions.push('LOCK');
    }
    
    const isNearBear = objectLocations['BEAR'] === currentLocation;
    if (isNearBear) {
      if (hasFood) {
        actions.push('FEED BEAR');
      }
      actions.push('ATTACK BEAR');
    }
    
    const isNearOgre = objectLocations['OGRE'] === currentLocation;
    if (isNearOgre) {
      actions.push('ATTACK OGRE');
    }
    
    const isNearDragon = objectLocations['DRAGON'] === currentLocation;
    if (isNearDragon) {
      actions.push('ATTACK DRAGON');
    }
    
    const isNearSnake = objectLocations['SNAKE'] === currentLocation;
    if (isNearSnake) {
      actions.push('ATTACK SNAKE');
    }
    
    return actions;
  };

  return (
    <div className="flex flex-col h-screen max-h-screen p-3 bg-background text-foreground font-sans gap-3 overflow-hidden">
      <GameHeader 
        onShowMap={() => setShowMap(true)} 
        onShowCompass={() => setShowCompass(true)}
        onShowInventory={() => setShowInventory(true)}
        inventoryCount={inventory.length}
        currentLocation={currentLocation} 
      />
      
      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-3 overflow-hidden h-full min-h-0">
        {/* Left Column / Container */}
        <div className="contents md:flex md:flex-col md:justify-between md:items-center md:h-full md:flex-1 md:overflow-hidden md:col-span-7 md:lg:col-span-8 md:bg-zinc-950/5 md:dark:bg-black/10 md:rounded-xl md:p-3 md:border md:border-border/40 md:gap-3 md:w-full md:shrink-0">
          <div className="order-1 w-full shrink-0 md:order-none md:flex-1 md:min-h-0 relative max-w-[99vh] mx-auto">
            <LocationImage 
              key={currentLocation} 
              locationId={currentLocation} 
              className="w-full aspect-[3/2] md:aspect-auto md:h-full md:flex-1 md:max-h-[66vh] md:max-w-[99vh] mx-auto object-cover rounded-xl border border-border/40 md:border-none shadow-sm" 
            />
            {/* Contextual Exits Overlay on Mobile */}
            {validExtraDirs.length > 0 && (
              <div className="absolute top-2 left-2 md:hidden flex flex-row flex-wrap items-center gap-1.5 p-1 bg-black/60 backdrop-blur-sm border border-white/15 rounded-lg shadow-lg max-w-[calc(100%-40px)] overflow-x-auto">
                {validExtraDirs.map((dir) => (
                  <Button
                    key={dir}
                    variant="secondary"
                    className="text-[10px] bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/30 text-orange-200 h-7 rounded-md px-2 flex items-center gap-1 shrink-0 font-bold"
                    onClick={() => handleAction(dir)}
                  >
                    {dir}
                  </Button>
                ))}
              </div>
            )}
            {/* Objects Overlay on Mobile */}
            {visibleObjects.length > 0 && (
              <div className="absolute bottom-2 left-2 md:hidden flex flex-row items-center gap-1.5 p-1 bg-black/60 backdrop-blur-sm border border-white/15 rounded-lg shadow-lg max-w-[calc(100%-110px)] overflow-x-auto">
                {visibleObjects.map(([objId]) => (
                  <Button 
                    key={objId} 
                    variant="secondary" 
                    className="text-[10px] bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 h-7 rounded-md px-2 flex items-center gap-1 shrink-0 font-bold"
                    onClick={() => handleAction(`TAKE ${objId}`)}
                    aria-label={`Take ${objId}`}
                  >
                    <span>TAKE {objId}</span>
                    <Package className="size-3 text-purple-400" />
                  </Button>
                ))}
              </div>
            )}
            {/* Mini HUD Compass Overlay on Mobile */}
            <div className="absolute bottom-2 right-2 md:hidden w-24 h-24 bg-black/60 backdrop-blur-sm border border-white/15 rounded-full p-0.5 shadow-lg flex items-center justify-center">
              <CompassRose 
                isDirectionValid={isDirectionValid} 
                onAction={handleAction} 
              />
            </div>
          </div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim()) {
                handleAction(inputValue);
                setInputValue('');
              }
            }}
            className="order-4 flex w-full gap-3 max-w-[99vh] mx-auto bg-card border border-border p-2.5 rounded-xl shadow-sm shrink-0 md:order-none"
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

          {/* Contextual Action Buttons Panel */}
          <div className="order-5 flex flex-row flex-wrap items-center justify-center gap-1.5 w-full max-w-[99vh] mx-auto bg-card/60 border border-border/40 p-2 rounded-xl shadow-sm shrink-0 md:order-none">
            {getContextualActions().map((act) => (
              <Button
                key={act}
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-bold tracking-wider hover:bg-zinc-100 hover:dark:bg-zinc-900 border-border/60 rounded-lg px-2.5"
                onClick={() => handleAction(act)}
              >
                {act}
              </Button>
            ))}
          </div>

          {/* Horizontal Objects Panel (Desktop Only) */}
          {visibleObjects.length > 0 && (
            <div className="order-3 hidden md:flex flex-row items-center gap-3 w-full max-w-[99vh] mx-auto bg-card border border-border p-2 rounded-xl shadow-sm shrink-0 md:order-none">
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

        {/* Right Sidebar / Container */}
        <div className="contents md:flex md:flex-col md:gap-3 md:flex-1 md:h-full md:overflow-hidden md:w-full md:col-span-5 md:lg:col-span-4">
          <GameTerminal 
            history={history} 
            className="order-2 flex-1 min-h-0 md:order-none"
          />
          
          <div className="hidden md:block">
            <GameControls 
              inventory={inventory}
              isDirectionValid={isDirectionValid} 
              onAction={handleAction} 
            />
          </div>
        </div>
      </div>

      {showMap && (
        <GameMap 
          gameData={gameData} 
          currentLocation={currentLocation} 
          onClose={() => setShowMap(false)} 
        />
      )}

      {/* Mobile Directions Modal */}
      {showCompass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm border-border bg-card shadow-2xl rounded-xl overflow-hidden border-t-2 border-t-orange-700/50 flex flex-col">
            <CardHeader className="py-2.5 px-4 bg-muted/20 shrink-0 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold tracking-wider flex items-center gap-1 text-orange-700 dark:text-orange-400 uppercase">
                <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden fill="currentColor">
                  <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <polygon points="8,2 9.2,7 8,6.5 6.8,7" fill="currentColor" />
                  <polygon points="8,14 9.2,9 8,9.5 6.8,9" fill="currentColor" className="opacity-40" />
                </svg>
                Directions
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-foreground" 
                onClick={() => setShowCompass(false)}
                aria-label="Close Directions"
              >
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 flex items-center justify-center min-h-[220px]">
              <CompassRose 
                isDirectionValid={isDirectionValid} 
                onAction={(cmd) => {
                  handleAction(cmd);
                  setShowCompass(false);
                }} 
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card
            className="w-full max-w-sm border-border shadow-2xl rounded-xl overflow-hidden flex flex-col border-t-2 border-t-amber-700/60"
            style={{
              background: 'linear-gradient(160deg, #3d1f0a 0%, #2a1405 100%)',
              borderColor: '#6b3a1f',
            }}
          >
            <CardHeader className="py-2.5 px-4 shrink-0 flex flex-row items-center justify-between" style={{ background: 'rgba(0,0,0,0.25)' }}>
              <CardTitle className="text-sm font-bold tracking-wider flex items-center gap-1.5 text-amber-400 uppercase">
                <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden fill="currentColor">
                  <rect x="3" y="5" width="10" height="9" rx="1.5" />
                  <path d="M5 5 Q5 2 8 2 Q11 2 11 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="6" y="1.5" width="4" height="1.5" rx="0.5" />
                  <rect x="6" y="8" width="4" height="1.2" rx="0.4" fill="rgba(0,0,0,0.3)" />
                </svg>
                Inventory
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-amber-400 hover:text-amber-200 hover:bg-amber-900/40" 
                onClick={() => setShowInventory(false)}
                aria-label="Close Inventory"
              >
                <X className="size-4" />
              </Button>
            </CardHeader>

            <CardContent
              className="flex-1 overflow-y-auto p-4 m-1.5 max-h-[60vh]"
              style={{
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '6px',
                outline: '1.5px dashed rgba(180,110,50,0.35)',
              }}
            >
              {inventory.length === 0 ? (
                <div className="text-sm text-amber-50 italic text-center py-4 font-serif">
                  Empty — go find some treasure!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {inventory.map(objId => (
                    <div
                      key={objId}
                      className="group flex items-center justify-between px-3 py-1.5 rounded-md transition-colors"
                      style={{
                        background: 'rgba(180, 100, 30, 0.12)',
                        border: '1px solid rgba(180, 100, 30, 0.25)',
                      }}
                    >
                      <span
                        className="text-sm font-medium truncate text-amber-200/90 flex-1 font-serif"
                        title={getItemName(objId)}
                      >
                        {getItemName(objId)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-amber-400 hover:bg-amber-900/40 hover:text-amber-200 shrink-0 font-bold"
                        onClick={() => handleAction(`DROP ${objId}`)}
                        aria-label={`Drop ${getItemName(objId)}`}
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
