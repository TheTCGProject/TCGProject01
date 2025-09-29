import React from 'react';
import { cn } from '../../utils/cn';
import { DollarSign, Plus, Minus, Check, Heart } from 'lucide-react';
import { useCollectionStore } from '../../stores/collectionStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useToast } from './Toast';
import { FALLBACK_IMAGE } from '../../services/api';

/**
 * Card component props interface
 */
interface CardProps {
  /** Pokemon card data */
  card: any;
  /** Additional CSS classes */
  className?: string;
  /** Whether the card is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Enable hover animations */
  hoverEffect?: boolean;
  /** Show quantity badge */
  showQuantity?: boolean;
  /** Quantity to display */
  quantity?: number;
  /** Show detailed card information */
  showDetails?: boolean;
  /** Set ID for collection tracking */
  collectionSetId?: string;
  /** Show hover controls for collection management */
  showHoverControls?: boolean;
  /** Show wishlist controls */
  showWishlistControls?: boolean;
  /** Show deck controls for deck builder */
  showDeckControls?: boolean;
  /** Deck action handler */
  onDeckAction?: (card: any, action: 'add' | 'remove', quantity?: number) => void;
}

/**
 * Modern Pokemon Card component with CSS-based animations
 */
const Card = ({ 
  card, 
  className, 
  isSelected, 
  onClick, 
  hoverEffect = true,
  showQuantity = false,
  quantity = 1,
  showDetails = false,
  collectionSetId,
  showHoverControls = false,
  showWishlistControls = false,
  showDeckControls = false,
  onDeckAction
}: CardProps) => {
  // Collection management hooks
  const { collection, addToCollection, removeFromCollection } = useCollectionStore();
  const { addToWishlist, removeFromWishlist, isCardInWishlist } = useWishlistStore();
  const { collectionMode } = useSettingsStore();
  const { showToast } = useToast();
  
  // Image error handling state
  const [imageError, setImageError] = React.useState(false);
  
  // Check if card is in user's collection
  const isInCollection = collectionSetId && 
    collection[collectionSetId]?.some(c => c.cardId === card.id);

  // Check if card is in wishlist
  const isInWishlist = isCardInWishlist(card.id);

  /**
   * Get total quantity of this card in collection across all variants
   */
  const getCardQuantity = () => {
    if (!collectionSetId) return 0;
    const setCollection = collection[collectionSetId] || [];
    return setCollection.reduce((total, c) => {
      if (c.cardId === card.id) {
        return total + c.quantity;
      }
      return total;
    }, 0);
  };

  const currentQuantity = getCardQuantity();

  /**
   * Handle collection add/remove actions
   */
  const handleCollectionClick = (e: React.MouseEvent, action: 'add' | 'remove') => {
    e.stopPropagation();
    if (!collectionSetId) return;

    if (action === 'add') {
      addToCollection(collectionSetId, card);
      showToast(`Added "${card.name}" to collection`, 'success', { duration: 2000 });
    } else if (currentQuantity > 0) {
      removeFromCollection(collectionSetId, card.id);
      showToast(`Removed "${card.name}" from collection`, 'info', { duration: 2000 });
    }
  };

  /**
   * Handle wishlist toggle
   */
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isInWishlist) {
      removeFromWishlist(card.id);
      showToast(`Removed "${card.name}" from wishlist`, 'info', { duration: 2000 });
    } else {
      addToWishlist(card);
      showToast(`Added "${card.name}" to wishlist`, 'success', { duration: 2000 });
    }
  };

  /**
   * Handle deck actions for deck builder
   */
  const handleDeckAction = (e: React.MouseEvent, action: 'add' | 'remove', qty: number = 1) => {
    e.stopPropagation();
    if (onDeckAction) {
      onDeckAction(card, action, qty);
      
      // Show toast notification for deck actions
      if (action === 'add') {
        showToast(`Added "${card.name}" to deck`, 'success', { duration: 2000 });
      } else {
        showToast(`Removed "${card.name}" from deck`, 'info', { duration: 2000 });
      }
    }
  };

  /**
   * Handle image loading errors with fallback
   */
  const handleImageError = () => {
    setImageError(true);
  };

  // Apply grayscale effect based on collection mode and ownership
  const shouldApplyGrayscale = collectionMode && collectionSetId && !isInCollection;

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-gray-800 shadow-card border border-gray-100 dark:border-gray-700",
        hoverEffect && "hover:-translate-y-1 hover:shadow-card-hover cursor-pointer hover:scale-[1.02]",
        hoverEffect && "hover:border-gray-200 dark:hover:border-gray-600",
        isSelected && "ring-2 ring-secondary-500 ring-offset-2 dark:ring-offset-gray-900",
        isInCollection && "ring-2 ring-success-400 ring-offset-2 dark:ring-offset-gray-900",
        className
      )}
      onClick={onClick}
    >
      {/* Collection status indicator */}
      {isInCollection && !showDeckControls && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Wishlist indicator */}
      {isInWishlist && !isInCollection && !showDeckControls && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-error-500 rounded-full flex items-center justify-center shadow-lg">
          <Heart className="w-3.5 h-3.5 text-white fill-current" />
        </div>
      )}

      {/* Card image container */}
      <div className="aspect-[2.5/3.5] relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        {card.images?.small && (
          <img 
            src={imageError ? FALLBACK_IMAGE : card.images.small}
            alt={card.name} 
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              shouldApplyGrayscale && "filter grayscale",
              hoverEffect && "group-hover:scale-105"
            )}
            loading="lazy"
            onError={handleImageError}
          />
        )}
        
        {/* Quantity badge */}
        {showQuantity && quantity > 1 && (
          <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg">
            {quantity}
          </div>
        )}
        
        {/* Selection overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-secondary-500/20 backdrop-blur-[1px] pointer-events-none" />
        )}

        {/* Collection mode overlay for unowned cards */}
        {shouldApplyGrayscale && (
          <div className="absolute inset-0 bg-gray-900/10 pointer-events-none" />
        )}

        {/* Deck controls for deck builder */}
        {showDeckControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={(e) => handleDeckAction(e, 'remove')}
                className="w-8 h-8 rounded-full bg-error-500 hover:bg-error-600 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                aria-label="Remove from deck"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="min-w-[2.5rem] text-center font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-sm shadow-sm">
                {quantity}
              </span>
              
              <button
                onClick={(e) => handleDeckAction(e, 'add')}
                className="w-8 h-8 rounded-full bg-success-500 hover:bg-success-600 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                aria-label="Add to deck"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Hover controls for collection management */}
        {showHoverControls && collectionSetId && !showDeckControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 rounded-b-2xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={(e) => handleCollectionClick(e, 'remove')}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-95",
                currentQuantity > 0
                  ? "bg-error-500 hover:bg-error-600 text-white"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed"
              )}
              disabled={currentQuantity === 0}
              aria-label="Remove from collection"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <span className="min-w-[2.5rem] text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              {currentQuantity}
            </span>
            
            <button
              onClick={(e) => handleCollectionClick(e, 'add')}
              className="w-8 h-8 rounded-full bg-success-500 hover:bg-success-600 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              aria-label="Add to collection"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Wishlist controls */}
        {showWishlistControls && !showDeckControls && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleWishlistClick}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95",
                isInWishlist
                  ? "bg-error-500 hover:bg-error-600 text-white"
                  : "bg-white/90 hover:bg-white text-error-500 hover:text-error-600 backdrop-blur-sm"
              )}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
            </button>
          </div>
        )}
      </div>

      {/* Card details section */}
      {showDetails && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate text-sm">
                {card.name}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">#{card.number}</span>
                {card.rarity && (
                  <span className="px-2 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full text-xs font-medium">
                    {card.rarity}
                  </span>
                )}
              </div>
            </div>
            
            {/* Collection controls (when not using hover controls) */}
            {!showHoverControls && !showDeckControls && collectionSetId && (
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={(e) => handleCollectionClick(e, 'remove')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-200 active:scale-95",
                    isInCollection ? "text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20" : "text-gray-300 dark:text-gray-600"
                  )}
                  disabled={!isInCollection}
                  aria-label="Remove from collection"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleCollectionClick(e, 'add')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-200 active:scale-95",
                    !isInCollection ? "text-success-500 hover:text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20" : "text-gray-300 dark:text-gray-600"
                  )}
                  disabled={isInCollection}
                  aria-label="Add to collection"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Wishlist controls (when not using hover controls) */}
            {!showWishlistControls && !showDeckControls && (
              <button
                onClick={handleWishlistClick}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 ml-1 active:scale-95",
                  isInWishlist 
                    ? "text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20" 
                    : "text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20"
                )}
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
              </button>
            )}
          </div>
          
          {/* Price display */}
          {card.tcgplayer?.prices && (
            <div className="flex items-center text-success-600 dark:text-success-400 font-semibold mt-2 text-sm">
              <DollarSign className="w-3.5 h-3.5 mr-0.5" />
              {Object.values(card.tcgplayer.prices)[0].market?.toFixed(2) || '—'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;