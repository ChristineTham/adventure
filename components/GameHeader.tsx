'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './ModeToggle';
import { useGameStore } from '@/store/gameStore';
import { Map, Info, Trophy, Terminal, MapPin, Compass, Package } from 'lucide-react';
import { formatLocationId } from '@/lib/utils';

interface GameHeaderProps {
  onShowMap: () => void;
  onShowCompass: () => void;
  onShowInventory: () => void;
  inventoryCount: number;
  currentLocation: string;
}

export function GameHeader({ 
  onShowMap, 
  onShowCompass, 
  onShowInventory, 
  inventoryCount, 
  currentLocation 
}: GameHeaderProps) {
  const { score } = useGameStore();

  return (
    <header className="w-full flex flex-col px-3 py-1.5 bg-card border border-border rounded-xl shadow-sm border-b-2 border-b-blue-500/20 shrink-0">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Terminal className="size-4 text-blue-500" />
            <span className="text-lg font-black tracking-wider uppercase text-foreground">Adventure</span>
          </div>
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
            <MapPin className="size-3 text-blue-600" />
            <span className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 whitespace-nowrap">
              {formatLocationId(currentLocation)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Score Pill (Desktop Only) */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-muted/50 border border-border rounded-lg text-[10px] font-bold text-foreground">
            <Trophy className="size-3 text-blue-500" />
            <span className="tabular-nums text-base">{score}</span>
            <span className="text-sm text-muted-foreground uppercase">pts</span>
          </div>

          {/* Map Button */}
          <Button 
            onClick={onShowMap}
            variant="outline"
            className="h-8 w-8 px-0 md:w-auto md:px-2.5 gap-1.5 border-border bg-card hover:bg-accent text-muted-foreground font-bold rounded-lg shadow-sm text-sm flex items-center justify-center"
            aria-label="Show Map"
          >
            <Map className="size-3.5 text-blue-500" />
            <span className="hidden md:inline tracking-tight uppercase">Map</span>
          </Button>

          {/* Compass Button (Mobile Only) */}
          <Button 
            onClick={onShowCompass}
            variant="outline"
            className="md:hidden h-8 w-8 p-0 border-border bg-card hover:bg-accent text-muted-foreground font-bold rounded-lg shadow-sm flex items-center justify-center"
            aria-label="Show Compass"
          >
            <Compass className="size-4 text-orange-500" />
          </Button>

          {/* Inventory Button (Mobile Only) */}
          <Button 
            onClick={onShowInventory}
            variant="outline"
            className="relative md:hidden h-8 w-8 p-0 border-border bg-card hover:bg-accent text-muted-foreground font-bold rounded-lg shadow-sm flex items-center justify-center"
            aria-label="Show Inventory"
          >
            <Package className="size-4 text-green-500" />
            {inventoryCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[8px] font-bold text-white leading-none">
                {inventoryCount}
              </span>
            )}
          </Button>

          {/* About Button */}
          <Link href="/about">
            <Button 
              variant="outline"
              className="h-8 w-8 px-0 md:w-auto md:px-2.5 gap-1.5 border-border bg-card hover:bg-accent text-muted-foreground font-bold rounded-lg shadow-sm text-sm flex items-center justify-center"
              aria-label="About"
            >
              <Info className="size-3.5 text-orange-500" />
              <span className="hidden md:inline tracking-tight uppercase">About</span>
            </Button>
          </Link>

          {/* Theme Switcher */}
          <ModeToggle className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* Mobile only: badges row below the header buttons */}
      <div className="md:hidden flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40 w-full">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 max-w-[65%] overflow-hidden">
          <MapPin className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 truncate">
            {formatLocationId(currentLocation)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 shrink-0">
          <Trophy className="size-3.5 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 whitespace-nowrap">
            {score} pts
          </span>
        </div>
      </div>
    </header>
  );
}
