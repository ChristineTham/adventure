'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import gameDataRaw from '@/data/game-data.json';
import { GameData } from '@/types/game';

const gameData = gameDataRaw as unknown as GameData;

/** Return the `inventory` display name for an object id, fallback to the id itself. */
export function getItemName(objId: string): string {
  const obj = (gameData.objects as Record<string, { inventory?: string | null }>)[objId];
  if (obj?.inventory && !obj.inventory.startsWith('*')) return obj.inventory;
  // Strip leading * for fixed objects shown in inventory anyway
  if (obj?.inventory) return obj.inventory.replace(/^\*/, '');
  return objId;
}

interface GameControlsProps {
  inventory: string[];
  isDirectionValid: (dir: string) => boolean;
  onAction: (cmd: string) => void;
}

// ── Compass rose ────────────────────────────────────────────────────────────

// Positions are on a circle of radius ~34 centred at (50,50).
// angle: degrees clockwise from North (0 = up = negative-y in SVG).
const DIRS = [
  { id: 'N',  label: 'N',  angle:   0, cx: 50,   cy: 16   },
  { id: 'NE', label: 'NE', angle:  45, cx: 74,   cy: 26   },
  { id: 'E',  label: 'E',  angle:  90, cx: 84,   cy: 50   },
  { id: 'SE', label: 'SE', angle: 135, cx: 74,   cy: 74   },
  { id: 'S',  label: 'S',  angle: 180, cx: 50,   cy: 84   },
  { id: 'SW', label: 'SW', angle: 225, cx: 26,   cy: 74   },
  { id: 'W',  label: 'W',  angle: 270, cx: 16,   cy: 50   },
  { id: 'NW', label: 'NW', angle: 315, cx: 26,   cy: 26   },
] as const;

// Arrow defined pointing UP (negative-y), centred at (0,0).
// Width ±3.5, tip at y=-7, shaft down to y=+4.
const ARROW_D = 'M0,-7 L3.5,0 L1.5,0 L1.5,5 L-1.5,5 L-1.5,0 L-3.5,0 Z';

interface CompassRoseProps {
  isDirectionValid: (dir: string) => boolean;
  onAction: (cmd: string) => void;
}

export function CompassRose({ isDirectionValid, onAction }: CompassRoseProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full max-w-[180px] max-h-[180px] drop-shadow-sm"
        aria-label="Compass rose"
      >
        {/* Outer ring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/60" />
        {/* Inner ring */}
        <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/40" />
        {/* Centre dot */}
        <circle cx="50" cy="50" r="3"
          className="fill-orange-400/80"
        />

        {/* Direction arrows */}
        {DIRS.map(({ id, label, angle, cx, cy }) => {
          const valid = isDirectionValid(id);
          const isCardinal = id.length === 1;
          return (
            <g key={id} style={{ cursor: valid ? 'pointer' : 'default' }} onClick={() => valid && onAction(id)}>
              {/* Click/hover target circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isCardinal ? 9 : 7}
                className={
                  valid
                    ? 'fill-orange-400/15 hover:fill-orange-400/30 transition-colors stroke-orange-400/60'
                    : 'fill-transparent stroke-border/20'
                }
                strokeWidth="0.5"
              />
              {/* Arrow: translate to position, then rotate to point outward */}
              <path
                d={ARROW_D}
                transform={`translate(${cx},${cy}) rotate(${angle})`}
                className={
                  valid
                    ? 'fill-orange-400 opacity-90'
                    : 'fill-muted-foreground opacity-20'
                }
                style={{ filter: valid ? 'drop-shadow(0 0 2px rgba(251,146,60,0.6))' : 'none', pointerEvents: 'none' }}
              />
              {/* Label */}
              <text
                x={cx}
                y={cy + (isCardinal ? 1 : 0.5)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isCardinal ? '5.5' : '4.5'}
                fontWeight="700"
                className={valid ? 'fill-orange-300' : 'fill-muted-foreground/30'}
                style={{ fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em', pointerEvents: 'none' }}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* LOOK centre button */}
        <g style={{ cursor: 'pointer' }} onClick={() => onAction('LOOK')}>
          <circle cx="50" cy="50" r="10"
            className="fill-muted/80 hover:fill-muted stroke-border/60 transition-colors"
            strokeWidth="0.6"
          />
          <text
            x="50" y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="5"
            fontWeight="800"
            className="fill-foreground/70"
            style={{ fontFamily: 'ui-monospace, monospace', pointerEvents: 'none' }}
          >
            LOOK
          </text>
        </g>
      </svg>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function GameControls({ inventory, isDirectionValid, onAction }: GameControlsProps) {
  return (
    <>
      <div className="hidden md:grid lg:grid-cols-2 grid-cols-1 gap-2.5 w-full shrink-0">

        {/* ── Compass card ── */}
        <Card className="border-border bg-card shadow-sm rounded-xl border-t-2 border-t-orange-700/50 flex flex-col" style={{ minHeight: '200px' }}>
          <CardHeader className="py-1.5 px-3 bg-muted/20 shrink-0">
            <CardTitle className="text-base font-bold tracking-wider flex items-center gap-1 text-orange-700 dark:text-orange-400 uppercase">
              {/* Mini compass SVG icon */}
              <svg viewBox="0 0 16 16" className="size-3 shrink-0" aria-hidden>
                <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <polygon points="8,2 9.2,7 8,6.5 6.8,7" fill="currentColor" />
                <polygon points="8,14 9.2,9 8,9.5 6.8,9" fill="currentColor" className="opacity-40" />
              </svg>
              Directions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-2 flex items-center justify-center min-h-0">
            <CompassRose isDirectionValid={isDirectionValid} onAction={onAction} />
          </CardContent>
        </Card>

        {/* ── Rucksack / Inventory card ── */}
        <Card
          className="border-border shadow-sm rounded-xl overflow-hidden flex flex-col border-t-2 border-t-amber-700/60 min-h-0"
          style={{
            minHeight: '200px',
            background: 'linear-gradient(160deg, #3d1f0a 0%, #2a1405 100%)',
            borderColor: '#6b3a1f',
          }}
        >
          <CardHeader className="py-1.5 px-3 shrink-0" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <CardTitle className="text-base font-bold tracking-wider flex items-center gap-1.5 text-amber-400 uppercase">
              {/* Rucksack SVG icon */}
              <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden fill="currentColor">
                <rect x="3" y="5" width="10" height="9" rx="1.5" />
                <path d="M5 5 Q5 2 8 2 Q11 2 11 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <rect x="6" y="1.5" width="4" height="1.5" rx="0.5" />
                <rect x="6" y="8" width="4" height="1.2" rx="0.4" fill="rgba(0,0,0,0.3)" />
              </svg>
              Inventory
            </CardTitle>
          </CardHeader>

          {/* Stitched border inner panel */}
          <CardContent
            className="flex-1 overflow-y-auto p-2 min-h-0"
            style={{
              background: 'rgba(0,0,0,0.15)',
              margin: '4px',
              borderRadius: '6px',
              outline: '1.5px dashed rgba(180,110,50,0.35)',
            }}
          >
            {inventory.length === 0 ? (
              <div className="text-sm text-amber-50 italic text-center py-3 font-serif">
                Empty — go find some treasure!
              </div>
            ) : (
              <div className="space-y-1">
                {inventory.map(objId => (
                  <div
                    key={objId}
                    className="group flex items-center justify-between px-2 py-1 rounded-md transition-colors"
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
                      className="h-5 px-1.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-amber-400 hover:bg-amber-900/40 hover:text-amber-200 shrink-0 font-bold"
                      onClick={() => onAction(`DROP ${objId}`)}
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
    </>
  );
}
