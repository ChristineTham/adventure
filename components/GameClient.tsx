'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { initializeGame, processCommand } from '@/engine/core';
import gameDataRaw from '@/data/game-data.json';
import { GameData, GameLocation, TravelRule } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, Compass, Package, MapPin } from 'lucide-react';

const gameData = gameDataRaw as unknown as GameData;

export function GameClient() {
  const { history, currentLocation, objectLocations, inventory } = useGameStore();
  const [input, setInput] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleSubmit = (e?: React.FormEvent): void => {
    e?.preventDefault();
    if (input.trim()) {
      processCommand(input);
      setInput('');
    }
  };

  const handleAction = (cmd: string): void => {
    processCommand(cmd);
  };

  const visibleObjects: [string, string][] = Object.entries(objectLocations)
    .filter(([, locId]) => locId === currentLocation);

  // Helper to check if a direction is valid for the current location
  const isDirectionValid = (dir: string): boolean => {
    const loc: GameLocation | undefined = gameData.locations[currentLocation];
    if (!loc) return false;
    const resolvedKey: string | undefined = gameData.vocabulary[dir];
    if (!resolvedKey) return false;
    return loc.travel.some((rule: TravelRule) => rule.verbs.includes(resolvedKey));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 h-screen max-h-screen p-4 bg-zinc-950 text-zinc-100 font-mono gap-4">
      {/* Sidebar - Location & Inventory */}
      <div className="hidden lg:flex flex-col gap-4">
        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-400">
              <MapPin size={16} /> LOCATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">{currentLocation}</div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-400">
              <Package size={16} /> INVENTORY
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {inventory.length === 0 ? (
              <div className="text-xs text-zinc-500 italic">Empty-handed</div>
            ) : (
              <div className="space-y-2">
                {inventory.map(objId => (
                  <div key={objId} className="group flex items-center justify-between p-2 rounded bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                    <span className="text-xs font-medium">{objId}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-12 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Main Terminal */}
      <Card className="lg:col-span-2 flex flex-col border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
             ADVENTURE
          </CardTitle>
          <div className="lg:hidden text-xs text-zinc-400">
            {currentLocation}
          </div>
        </CardHeader>
        <Separator className="bg-zinc-800" />
        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full p-6">
            <div className="space-y-4">
              {history.map((msg, i) => (
                <div key={i} className={msg.startsWith('>') ? 'text-blue-400 font-bold border-l-2 border-blue-400/30 pl-3' : 'text-zinc-300 leading-relaxed whitespace-pre-wrap'}>
                  {msg}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <Separator className="bg-zinc-800" />
        <CardFooter className="p-4 bg-zinc-900/50">
          <form onSubmit={handleSubmit} className="flex w-full gap-3">
            <span className="text-blue-400 font-bold self-center text-lg">{'>'}</span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What should we do?"
              className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-blue-500 focus:border-blue-500 h-12 text-lg"
              autoFocus
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-6">
              Enter
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* Modern Controls with Dynamic Disabling */}
      <div className="flex flex-col gap-4">
        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-bold flex items-center justify-center gap-2 text-orange-400">
              <Compass size={16} /> COMPASS
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 justify-items-center pb-6">
            <Button variant="outline" size="icon" disabled={!isDirectionValid('NW')} className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-20" onClick={() => handleAction('NW')}><ArrowUpLeft size={18}/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('N')} className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-20" onClick={() => handleAction('N')}><ArrowUp size={18}/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('NE')} className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-20" onClick={() => handleAction('NE')}><ArrowUpRight size={18}/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('W')} className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-20" onClick={() => handleAction('W')}><ArrowLeft size={18}/></Button>
            <Button variant="secondary" size="icon" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700" onClick={() => handleAction('LOOK')}>L</Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('E')} className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-20" onClick={() => handleAction('E')}><ArrowRight size={18}/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('SW')} className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-20" onClick={() => handleAction('SW')}><ArrowDownLeft size={18}/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('S')} className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-20" onClick={() => handleAction('S')}><ArrowDown size={18}/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('SE')} className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-20" onClick={() => handleAction('SE')}><ArrowDownRight size={18}/></Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-center text-purple-400">VISIBLE OBJECTS</CardTitle>
          </CardHeader>
          <CardContent>
            {visibleObjects.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center italic">Nothing interesting here</div>
            ) : (
              <div className="space-y-2">
                {visibleObjects.map(([objId]) => (
                  <Button 
                    key={objId} 
                    variant="outline" 
                    className="w-full justify-start text-xs border-zinc-700 hover:bg-zinc-800 h-9"
                    onClick={() => handleAction(`TAKE ${objId}`)}
                  >
                    TAKE {objId}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
