'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GameTerminalProps {
  history: string[];
  className?: string;
}

export function GameTerminal({ 
  history, 
  className
}: GameTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  return (
    <div className={cn('flex-1 flex flex-col min-h-0', className)}>
      {/* Scroll container */}
      <div className="flex-1 flex flex-col min-h-0 relative">

        {/* Top wooden roller */}
        <div className="relative flex items-center shrink-0 z-10" style={{ height: '18px' }}>
          {/* Left knob */}
          <div
            className="absolute left-0 z-20 rounded-full border border-amber-950/60 shadow-md"
            style={{
              width: '22px',
              height: '22px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'radial-gradient(circle at 35% 35%, #a16207, #78350f 60%, #451a03)',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(0,0,0,0.4)',
            }}
          />
          {/* Rod */}
          <div
            className="absolute inset-y-0 left-[11px] right-[11px] rounded-sm"
            style={{
              background: 'linear-gradient(to bottom, #92400e, #d97706 30%, #fbbf24 48%, #d97706 65%, #78350f)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,220,100,0.3)',
            }}
          />
          {/* Right knob */}
          <div
            className="absolute right-0 z-20 rounded-full border border-amber-950/60 shadow-md"
            style={{
              width: '22px',
              height: '22px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'radial-gradient(circle at 35% 35%, #a16207, #78350f 60%, #451a03)',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(0,0,0,0.4)',
            }}
          />
        </div>

        {/* Scroll paper body */}
        <div className="scroll-paper flex-1 min-h-0 overflow-y-auto mx-2 font-serif selection:bg-amber-500/30">
          <div className="p-4 space-y-3" style={{ minHeight: '100%' }}>
            {history.length === 0 && (
              <p className="text-center italic text-amber-800/50 dark:text-amber-400/30 text-base pt-4">
                Your adventure begins here…
              </p>
            )}
            {history.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.startsWith('>')
                    ? 'text-amber-900 dark:text-amber-400 font-bold border-l-2 border-amber-600/40 pl-3 py-0.5 my-1 bg-amber-500/5 rounded-r text-xs font-mono'
                    : 'text-stone-800 dark:text-stone-300 leading-relaxed whitespace-pre-wrap text-base'
                }
              >
                {msg}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Bottom wooden roller */}
        <div className="relative flex items-center shrink-0 z-10" style={{ height: '18px' }}>
          {/* Left knob */}
          <div
            className="absolute left-0 z-20 rounded-full border border-amber-950/60 shadow-md"
            style={{
              width: '22px',
              height: '22px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'radial-gradient(circle at 35% 35%, #a16207, #78350f 60%, #451a03)',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(0,0,0,0.4)',
            }}
          />
          {/* Rod */}
          <div
            className="absolute inset-y-0 left-[11px] right-[11px] rounded-sm"
            style={{
              background: 'linear-gradient(to bottom, #92400e, #d97706 30%, #fbbf24 48%, #d97706 65%, #78350f)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,220,100,0.3)',
            }}
          />
          {/* Right knob */}
          <div
            className="absolute right-0 z-20 rounded-full border border-amber-950/60 shadow-md"
            style={{
              width: '22px',
              height: '22px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'radial-gradient(circle at 35% 35%, #a16207, #78350f 60%, #451a03)',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(0,0,0,0.4)',
            }}
          />
        </div>

      </div>
    </div>
  );
}
