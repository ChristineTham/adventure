import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a location ID for display (e.g., "LOC_START" -> "Start", "LOC_FOREST20" -> "Forest")
 */
export function formatLocationId(id: string): string {
  if (!id) return '';
  return id
    .replace(/^LOC_/, '')      // Remove LOC_ prefix
    .replace(/\d+$/, '')      // Remove trailing numbers
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
}
