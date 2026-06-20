import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface LocationImageProps {
  locationId: string;
  className?: string;
}

export function LocationImage({ locationId, className }: LocationImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!locationId || error) {
    return null;
  }

  // Use base path from next config (usually /adventure)
  // In a real app we might use process.env.NEXT_PUBLIC_BASE_PATH, but hardcoding for this test per next.config.ts
  const basePath = '/adventure';
  const src = `${basePath}/locations/${locationId}.jpg`;

  return (
    <div 
      className={cn(
        "relative w-full aspect-[3/2] overflow-hidden rounded-md bg-muted",
        "border-4 border-white dark:border-zinc-900 shadow-md", // Postcard styling
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Location image for ${locationId}`}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
      
      {/* Loading state placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
