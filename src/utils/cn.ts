/**
 * Utility function for combining and merging CSS class names
 * Uses clsx for conditional classes and tailwind-merge for Tailwind CSS conflicts
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with proper Tailwind CSS conflict resolution
 * @param inputs - Class values to combine (strings, objects, arrays)
 * @returns Merged class string with conflicts resolved
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-2 is overridden)
 * cn('text-red-500', { 'text-blue-500': isBlue }) // Conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}