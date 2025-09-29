import React from 'react';
import Card from './Card';
import { PokemonCard } from '../../types';

/**
 * CardGrid component props interface
 */
interface CardGridProps {
  /** Array of Pokemon cards to display */
  cards: PokemonCard[];
  /** Card click handler */
  onCardClick?: (card: PokemonCard) => void;
  /** Array of selected card IDs */
  selectedCardIds?: string[];
  /** Additional CSS classes */
  className?: string;
  /** Show quantity badges on cards */
  showQuantity?: boolean;
  /** Card quantities for display */
  cardQuantities?: Record<string, number>;
  /** Show detailed card information */
  showDetails?: boolean;
  /** Show collection hover controls */
  showHoverControls?: boolean;
  /** Show wishlist controls */
  showWishlistControls?: boolean;
  /** Set ID for collection context */
  collectionSetId?: string;
  /** Deck action handler for deck builder */
  onDeckAction?: (card: PokemonCard, action: 'add' | 'remove', quantity?: number) => void;
  /** Show deck controls in deck builder */
  showDeckControls?: boolean;
}

/**
 * CardGrid Component
 * Displays a responsive grid of Pokemon cards with CSS-based animations
 */
const CardGrid = ({
  cards,
  onCardClick,
  selectedCardIds = [],
  className = '',
  showQuantity = false,
  cardQuantities = {},
  showDetails = false,
  showHoverControls = false,
  showWishlistControls = false,
  collectionSetId,
  onDeckAction,
  showDeckControls = false
}: CardGridProps) => {
  
  // Handle empty state
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400">No cards found</h3>
        <p className="text-slate-500 dark:text-slate-500 mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}>
      {cards.map((card, index) => (
        <div 
          key={card.id} 
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <Card
            card={card}
            onClick={() => onCardClick && onCardClick(card)}
            isSelected={selectedCardIds.includes(card.id)}
            showQuantity={showQuantity}
            quantity={cardQuantities[card.id] || 1}
            showDetails={showDetails}
            showHoverControls={showHoverControls}
            showWishlistControls={showWishlistControls}
            collectionSetId={collectionSetId}
            showDeckControls={showDeckControls}
            onDeckAction={onDeckAction}
          />
        </div>
      ))}
    </div>
  );
};

export default CardGrid;