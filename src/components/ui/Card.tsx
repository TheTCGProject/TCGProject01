import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Plus, Minus, Check, Heart } from 'lucide-react';
import { useCollectionStore } from '../../stores/collectionStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useToast } from './Toast';
import { FALLBACK_IMAGE } from '../../services/api';
import { PokemonCard } from '../../types';

interface CardProps {
  card: PokemonCard;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
  hoverEffect?: boolean;
  showQuantity?: boolean;
  quantity?: number;
  showDetails?: boolean;
  collectionSetId?: string;
  showHoverControls?: boolean;
  showWishlistControls?: boolean;
  showDeckControls?: boolean;
  onDeckAction?: (card: PokemonCard, action: 'add' | 'remove', quantity?: number) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  className,
  isSelected,
  onClick,
  hoverEffect = true,
  showQuantity = false,
  quantity = 0,
  showDetails = false,
  collectionSetId,
  showHoverControls = false,
  showWishlistControls = false,
  showDeckControls = false,
  onDeckAction,
}) => {
  // States
  const [imageError, setImageError] = useState(false);

  // Hooks
  const { addToCollection, removeFromCollection, getCardQuantity } = useCollectionStore();
  const { addToWishlist, removeFromWishlist, isCardInWishlist } = useWishlistStore();
  const { showToast } = useToast();

  // Check if card is in collection
  const isInCollection = collectionSetId ? getCardQuantity(collectionSetId, card.id, 'regular') > 0 : false;
  const isInWishlist = isCardInWishlist?.(card.id) || false;

  // Handlers
  const handleAddToCollection = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!collectionSetId) return;

    addToCollection(collectionSetId, card);
    showToast(`${card.name} has been added to your collection.`, "success");
  };

  const handleRemoveFromCollection = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!collectionSetId) return;

    removeFromCollection(collectionSetId, card.id);
    showToast(`${card.name} has been removed from your collection.`, "error");
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-gray-800 shadow-card border border-gray-100 dark:border-gray-700 flex flex-col",
        hoverEffect && "hover:-translate-y-1 hover:shadow-card-hover cursor-pointer hover:scale-[1.02]",
        hoverEffect && "hover:border-gray-200 dark:hover:border-gray-600",
        isSelected && "ring-2 ring-secondary-500 ring-offset-2 dark:ring-offset-gray-900",
        isInCollection && "ring-2 ring-success-400 ring-offset-2 dark:ring-offset-gray-900",
        className
      )}
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

      {/* Card image and details (top clickable area) */}
      <div
        className="flex-1 flex flex-col cursor-pointer"
        onClick={onClick}
        style={{ minHeight: 0 }}
      >
        <div className="aspect-[2.5/3.5] relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          {card.images?.small && (
            <img
              src={imageError ? FALLBACK_IMAGE : card.images.small}
              alt={card.name}
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                isInCollection && "filter brightness-90",
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
        </div>
        {showDetails && (
          <div className="p-3 border-t border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {card.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              #{card.number} · {card.rarity}
            </p>
          </div>
        )}
      </div>

      {/* Bottom controls bar */}
      {showHoverControls && collectionSetId && (
        <div className="w-full flex items-center justify-center gap-2 p-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={handleRemoveFromCollection}
            className="bg-error-500 hover:bg-error-600 text-white rounded-full p-2 transition-colors duration-200 disabled:opacity-50"
            disabled={!isInCollection}
            tabIndex={0}
            aria-label="Remove from collection"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="font-semibold text-base w-6 text-center select-none">
            {collectionSetId ? getCardQuantity(collectionSetId, card.id, 'regular') : 0}
          </span>
          <button
            onClick={handleAddToCollection}
            className="bg-success-500 hover:bg-success-600 text-white rounded-full p-2 transition-colors duration-200"
            tabIndex={0}
            aria-label="Add to collection"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Card;