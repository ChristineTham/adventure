'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, 
  Compass, Eye, Package
} from 'lucide-react';

interface GameControlsProps {
  visibleObjects: [string, string][];
  isDirectionValid: (dir: string) => boolean;
  onAction: (cmd: string) => void;
}

export function GameControls({ visibleObjects, isDirectionValid, onAction }: GameControlsProps) {
  return (
    <>
      <div className="hidden md:flex md:col-span-6 lg:col-span-1 flex-col gap-4 overflow-hidden">
        <Card className="border-border bg-card shadow-sm rounded-xl border-t-2 border-t-orange-500/50">
          <CardHeader className="pb-3 pt-4 px-4 bg-muted/20">
            <CardTitle className="text-xs font-bold tracking-widest flex items-center gap-2 text-orange-500 uppercase">
              <Compass className="size-3.5" /> Compass
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 justify-items-center p-4">
            <Button variant="outline" size="icon" disabled={!isDirectionValid('NW')} className="size-10 border-border hover:bg-accent disabled:opacity-20 rounded-lg transition-all" onClick={() => onAction('NW')} aria-label="North West"><ArrowUpLeft className="size-5"/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('N')} className="size-10 border-border hover:bg-accent disabled:opacity-20 rounded-lg transition-all" onClick={() => onAction('N')} aria-label="North"><ArrowUp className="size-5"/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('NE')} className="size-10 border-border hover:bg-accent disabled:opacity-20 rounded-lg transition-all" onClick={() => onAction('NE')} aria-label="North East"><ArrowUpRight className="size-5"/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('W')} className="size-10 border-border hover:bg-accent disabled:opacity-20 rounded-lg transition-all" onClick={() => onAction('W')} aria-label="West"><ArrowLeft className="size-5"/></Button>
            <Button variant="secondary" size="icon" className="size-10 bg-muted border-border hover:bg-muted/80 rounded-lg font-bold" onClick={() => onAction('LOOK')} aria-label="Look around">L</Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('E')} className="size-10 border-border hover:bg-accent disabled:opacity-20 rounded-lg transition-all" onClick={() => onAction('E')} aria-label="East"><ArrowRight className="size-5"/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('SW')} className="size-10 border-border hover:bg-accent disabled:opacity-20 rounded-lg transition-all" onClick={() => onAction('SW')} aria-label="South West"><ArrowDownLeft className="size-5"/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('S')} className="size-10 border-border hover:bg-accent disabled:opacity-20 rounded-lg transition-all" onClick={() => onAction('S')} aria-label="South"><ArrowDown className="size-5"/></Button>
            <Button variant="outline" size="icon" disabled={!isDirectionValid('SE')} className="size-10 border-border hover:bg-accent disabled:opacity-20 rounded-lg transition-all" onClick={() => onAction('SE')} aria-label="South East"><ArrowDownRight className="size-5"/></Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-xl border-t-2 border-t-purple-500/50">
          <CardHeader className="pb-3 pt-4 px-4 bg-muted/20">
            <CardTitle className="text-xs font-bold tracking-widest flex items-center gap-2 text-purple-500 uppercase">
              <Eye className="size-3.5" /> Visible Objects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {visibleObjects.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center italic py-2">Nothing interesting here</div>
            ) : (
              <div className="space-y-2">
                {visibleObjects.map(([objId]) => (
                  <Button 
                    key={objId} 
                    variant="outline" 
                    className="w-full justify-between text-xs border-border hover:bg-accent h-10 rounded-lg px-3 group"
                    onClick={() => onAction(`TAKE ${objId}`)}
                    aria-label={`Take ${objId}`}
                  >
                    <span>TAKE {objId}</span>
                    <Package className="size-3 text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile controls bar (Only visible on mobile) */}
      <div className="md:hidden grid grid-cols-2 gap-2 mt-auto">
        <Card className="border-border bg-card shadow-sm rounded-xl flex items-center justify-center p-2">
          <div className="grid grid-cols-3 gap-1">
             <Button variant="ghost" size="icon" className="size-8" onClick={() => onAction('W')} aria-label="West"><ArrowLeft className="size-4"/></Button>
             <div className="flex flex-col gap-1">
               <Button variant="ghost" size="icon" className="size-8" onClick={() => onAction('N')} aria-label="North"><ArrowUp className="size-4"/></Button>
               <Button variant="ghost" size="icon" className="size-8" onClick={() => onAction('S')} aria-label="South"><ArrowDown className="size-4"/></Button>
             </div>
             <Button variant="ghost" size="icon" className="size-8" onClick={() => onAction('E')} aria-label="East"><ArrowRight className="size-4"/></Button>
          </div>
        </Card>
        <Button variant="secondary" className="h-full rounded-xl font-bold gap-2" onClick={() => onAction('LOOK')}>
          <Eye className="size-4" /> LOOK
        </Button>
      </div>
    </>
  );
}
