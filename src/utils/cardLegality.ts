import { Card } from '../types';

export type Format = 'standard' | 'expanded' | 'unlimited';

export function isLegal(card: Card, format: Format): boolean {
  // Standard and Expanded are determined by set.legal flags
  if (format === 'standard') {
    return !!card.set.legal?.standard;
  }
  if (format === 'expanded') {
    return !!card.set.legal?.expanded;
  }
  // Unlimited: all cards are always legal
  return true;
}
