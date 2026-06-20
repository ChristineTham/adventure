'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './ModeToggle';
import { useGameStore } from '@/store/gameStore';
import { Map, Info, Trophy, Terminal, MapPin } from 'lucide-react';
import { formatLocationId } from '@/lib/utils';

interface GameHeaderProps {
  onShowMap: () => void;
  currentLocation: string;
}

export function GameHeader({ onShowMap, currentLocation }: GameHeaderProps) {
  const { score } = useGameStore();

  return (
    <header className="w-full flex items-center justify-between px-3 py-1.5 bg-card border border-border rounded-xl shadow-sm border-b-2 border-b-blue-500/20 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <Terminal className="size-4 text-blue-500" />
          <span className="text-base font-black tracking-wider uppercase text-foreground">Adventure</span>
        </div>
        <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
          <MapPin className="size-3 text-blue-600" />
          <span className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 whitespace-nowrap">
            {formatLocationId(currentLocation)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Score Pill */}
        <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 border border-border rounded-lg text-[10px] font-bold text-foreground">
          <Trophy className="size-3 text-blue-500" />
          <span className="tabular-nums">{score}</span>
          <span className="text-sm text-muted-foreground uppercase">pts</span>
        </div>

        {/* Map Button */}
        <Button 
          onClick={onShowMap}
          variant="outline"
          className="h-8 px-2.5 gap-1.5 border-border bg-card hover:bg-accent text-muted-foreground font-bold rounded-lg shadow-sm text-sm"
          aria-label="Show Map"
        >
          <Map className="size-3.5 text-blue-500" />
          <span className="hidden sm:inline tracking-tight uppercase">Map</span>
        </Button>

        {/* About Button */}
        <Link href="/about">
          <Button 
            variant="outline"
            className="h-8 px-2.5 gap-1.5 border-border bg-card hover:bg-accent text-muted-foreground font-bold rounded-lg shadow-sm text-sm"
            aria-label="About"
          >
            <Info className="size-3.5 text-orange-500" />
            <span className="hidden sm:inline tracking-tight uppercase">About</span>
          </Button>
        </Link>

        {/* Theme Switcher */}
        <ModeToggle className="h-8 w-8 rounded-lg" />
      </div>
    </header>
  );
}
