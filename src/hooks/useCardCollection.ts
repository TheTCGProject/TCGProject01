import { useCollectionStore } from '../stores/collectionStore';
import { getCardPrice } from '../services/api';

// Import the one true, consolidated PokemonCard type!
import type { PokemonCard } from '../types/index';

// Variant IDs as per official API
export const VARIANT_IDS = [
  'normal',
  'reverseHolofoil',
  'holofoil',
  'firstEditionNormal',
  'firstEditionHolofoil',
] as const;

export type VariantId = typeof VARIANT_IDS[number];

export interface Variant {
  id: VariantId;
  name: string;
}

export interface CardCollectionProgress {
  owned: number;
  total: number;
  percentage: number;
}

/**
 * Custom hook for collection actions using API rules and shared types.
 */
export const useCardCollection = (setId?: string) => {
  const {
    collection,
    addToCollection,
    removeFromCollection,
    updateCardQuantity,
    getCardQuantity,
    getCardVariants,
    getSetProgress,
    getSetValue,
    getTotalStats,
    getRecentlyAddedCards,
    getTopValueCards,
    getFavoriteCard
  } = useCollectionStore();

  /**
   * Return available variants for a card (API-aligned).
   */
  const getAvailableVariants = (card: PokemonCard): Variant[] => {
    if (!card.variants) return [];
    return [
      card.variants.normal && { id: 'normal', name: 'Normal' },
      card.variants.reverseHolofoil && { id: 'reverseHolofoil', name: 'Reverse Holo' },
      card.variants.holofoil && { id: 'holofoil', name: 'Holofoil' },
      card.variants.firstEditionNormal && { id: 'firstEditionNormal', name: 'First Edition Normal' },
      card.variants.firstEditionHolofoil && { id: 'firstEditionHolofoil', name: 'First Edition Holofoil' },
    ].filter(Boolean) as Variant[];
  };

  /**
   * Calculate collection progress for a card using available variants.
   */
  const getCardCollectionProgress = (
    cardId: string,
    availableVariants: Variant[]
  ): CardCollectionProgress => {
    if (!setId) return { owned: 0, total: 0, percentage: 0 };
    const cardVariants = getCardVariants(setId, cardId) ?? {};
    const ownedVariants = Object.values(cardVariants).filter(qty => qty > 0).length;
    const totalVariants = availableVariants.length;

    return {
      owned: ownedVariants,
      total: totalVariants,
      percentage: totalVariants > 0 ? (ownedVariants / totalVariants) * 100 : 0,
    };
  };

  /**
   * Calculate total collection value for a card.
   */
  const getCardCollectionValue = (card: PokemonCard, cardId: string): number => {
    if (!setId) return 0;

    const cardVariants = getCardVariants(setId, cardId) ?? {};
    return Object.entries(cardVariants).reduce((total, [variant, quantity]) => {
      const price = getCardPrice(card, variant); // API-compliant key
      return total + (price * quantity);
    }, 0);
  };

  /**
   * Handle quantity changes robustly.
   */
  const handleQuantityChange = (
    cardId: string,
    card: PokemonCard,
    variantId: VariantId,
    newQuantity: number
  ) => {
    if (!setId) return;
    if (newQuantity <= 0) {
      removeFromCollection(setId, cardId, variantId, getCardQuantity(setId, cardId, variantId));
    } else {
      const currentQuantity = getCardQuantity(setId, cardId, variantId);
      if (currentQuantity === 0) {
        addToCollection(setId, card, variantId, newQuantity);
      } else {
        updateCardQuantity(setId, cardId, variantId, newQuantity);
      }
    }
  };

  /**
   * Type-safe check for card presence in collection.
   */
  const isCardInCollection = (cardId: string): boolean => {
    if (!setId) return false;
    const setCollection = collection[setId] ?? [];
    return setCollection.some((c: { cardId: string }) => c.cardId === cardId);
  };

  return {
    // Store methods
    collection,
    addToCollection,
    removeFromCollection,
    updateCardQuantity,
    getCardQuantity,
    getCardVariants,
    getSetProgress,
    getSetValue,
    getTotalStats,
    getRecentlyAddedCards,
    getTopValueCards,
    getFavoriteCard,

    // Helpers
    getAvailableVariants,
    getCardCollectionProgress,
    getCardCollectionValue,
    handleQuantityChange,
    isCardInCollection,
  };
};