'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Info, Trophy, Package } from 'lucide-react';
import { ModeToggle } from './ModeToggle';
import { useGameStore } from '@/store/gameStore';

import { processCommand } from '@/engine/core';

interface GameSidebarProps {
  onShowMap: () => void;
}

export function GameSidebar({ onShowMap }: GameSidebarProps) {
  const { inventory, score } = useGameStore();

  const handleAction = (cmd: string): void => {
    processCommand(cmd);
  };

  return (
    <div className="hidden md:flex md:col-span-2 lg:col-span-1 flex-col gap-4 overflow-hidden">
      <div className="grid grid-cols-3 gap-2">
        <Button 
          onClick={onShowMap}
          variant="outline"
          className="w-full border-border bg-card hover:bg-accent text-muted-foreground font-bold h-12 gap-2 px-1 rounded-xl shadow-sm flex-col lg:flex-row xl:px-3"
          aria-label="Show Map"
        >
          <Map className="size-4 text-blue-500 lg:size-5" /> 
          <span className="text-xs tracking-tight uppercase">Map</span>
        </Button>
        <Link href="/about" className="w-full">
          <Button 
            variant="outline"
            className="w-full border-border bg-card hover:bg-accent text-muted-foreground font-bold h-12 gap-2 px-1 rounded-xl shadow-sm flex-col lg:flex-row xl:px-3"
            aria-label="About"
          >
            <Info className="size-4 text-orange-500 lg:size-5" /> 
            <span className="text-xs tracking-tight uppercase">About</span>
          </Button>
        </Link>
        <ModeToggle showLabel className="flex-col lg:flex-row px-1 xl:px-3" />
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl shadow-sm border-t-2 border-t-blue-500/50">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-blue-500 uppercase">
          <Trophy className="size-3.5" /> Score
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black tabular-nums text-foreground">{score}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">pts</span>
        </div>
      </div>

      <Card className="flex-1 border-border bg-card shadow-sm rounded-xl overflow-hidden flex flex-col border-t-2 border-t-green-500/50">
        <CardHeader className="pb-3 pt-4 px-4 bg-muted/20">
          <CardTitle className="text-xs font-bold tracking-widest flex items-center gap-2 text-green-500 uppercase">
            <Package className="size-3.5" /> Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4">
          {inventory.length === 0 ? (
            <div className="text-xs text-muted-foreground italic text-center py-4">Empty-handed</div>
          ) : (
            <div className="space-y-2">
              {inventory.map(objId => (
                <div key={objId} className="group flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50">
                  <span className="text-xs font-medium">{objId}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-12 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleAction(`DROP ${objId}`)}
                    aria-label={`Drop ${objId}`}
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
  );
}
