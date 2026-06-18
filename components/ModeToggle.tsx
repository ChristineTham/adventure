'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ModeToggle({ showLabel = false, className }: { showLabel?: boolean, className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" className={cn("border-border bg-card text-muted-foreground h-12 rounded-xl", showLabel ? "px-3 gap-2" : "w-12 px-0", className)}>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <Button 
      variant="outline" 
      onClick={cycleTheme}
      className={cn(
        "border-border bg-card hover:bg-accent text-muted-foreground font-bold h-12 transition-all rounded-xl shadow-sm",
        showLabel ? "px-3 gap-2 w-full" : "w-12 px-0",
        className
      )}
      title={`Current theme: ${theme}`}
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun className="size-5" />}
      {theme === 'dark' && <Moon className="size-5" />}
      {theme === 'system' && <Laptop className="size-5" />}
      {showLabel && <span className="text-xs tracking-widest uppercase">Theme</span>}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
