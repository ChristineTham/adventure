'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Terminal, Info, Map, MapPin } from 'lucide-react';
import { ModeToggle } from './ModeToggle';
import { formatLocationId } from '@/lib/utils';

interface GameTerminalProps {
  history: string[];
  currentLocation: string;
  onAction: (cmd: string) => void;
  onShowMap: () => void;
}

export function GameTerminal({ history, currentLocation, onAction, onShowMap }: GameTerminalProps) {
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleSubmit = (e?: React.FormEvent): void => {
    e?.preventDefault();
    if (input.trim()) {
      onAction(input);
      setInput('');
    }
  };

  return (
    <Card className="md:col-span-4 lg:col-span-2 flex flex-col border-border bg-card overflow-hidden shadow-xl rounded-xl border-t-2 border-t-zinc-500/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-muted/30">
        <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
           <Terminal className="size-4 text-zinc-500 lg:size-5" />
           ADVENTURE
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="md:hidden flex items-center gap-1.5">
              <ModeToggle className="size-9 rounded-lg" />
              <Link href="/about">
                <Button variant="outline" size="icon" className="size-9 border-border bg-card text-muted-foreground rounded-lg" aria-label="About">
                  <Info className="size-4" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onShowMap} 
                className="size-9 border-border bg-card text-muted-foreground rounded-lg"
                aria-label="Map"
              >
                <Map className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-sm">
              <MapPin className="size-3 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500 whitespace-nowrap">
                {formatLocationId(currentLocation)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-border/50" />
      <CardContent className="flex-1 overflow-hidden p-0 relative bg-zinc-950/5 dark:bg-black/20">
        <ScrollArea className="h-full p-6 font-mono selection:bg-blue-500/30">
          <div className="space-y-4 max-w-2xl mx-auto">
            {history.map((msg, i) => (
              <div key={i} className={msg.startsWith('>') ? 'text-blue-500 font-bold border-l-2 border-blue-400/30 pl-4 py-1 my-2 bg-blue-500/5 rounded-r-md' : 'text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base'}>
                {msg}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <Separator className="bg-border/50" />
      <CardFooter className="p-4 bg-muted/30">
        <form onSubmit={handleSubmit} className="flex w-full gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1 flex items-center">
            <span className="absolute left-4 text-blue-500 font-bold text-lg select-none pointer-events-none">{'>'}</span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What should we do?"
              className="flex-1 bg-background border-border text-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-12 text-lg pl-10 rounded-xl transition-all shadow-inner"
              autoFocus
            />
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-6 rounded-xl shadow-lg transition-transform active:scale-95">
            Enter
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
