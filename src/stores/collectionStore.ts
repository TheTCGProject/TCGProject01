import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PokemonCard } from '../types';
import { getCardPrice } from '../services/api';

/**
 * Collection store state interface
 * Manages user's Pokemon card collection across different sets
 */
interface CollectionState {
  /** Collection organized by set ID */
  collection: Record<string, CollectionCard[]>;
  /** Currently favorited card ID */
  favoriteCardId: string | null;
  /** Cached total cards count across all sets */
  totalCardsCount: number;
  /** Cached total collection value across all sets */
  totalCollectionValue: number;
  /** Cached unique cards count across all sets */
  uniqueCardsCount: number;
  
  // Collection management actions
  addToCollection: (setId: string, card: PokemonCard, variant?: string, quantity?: number) => void;
  removeFromCollection: (setId: string, cardId: string, variant?: string, quantity?: number) => void;
  updateCardQuantity: (setId: string, cardId: string, variant: string, quantity: number) => void;
  
  // Query methods
  getCardQuantity: (setId: string, cardId: string, variant: string) => number;
  getCardVariants: (setId: string, cardId: string) => Record<string, number>;
  getSetProgress: (setId: string, totalCards: number) => number;
  getSetValue: (setId: string) => number;
  
  // Utility methods
  clearAllCollections: () => void;
  getTotalStats: () => CollectionStats;
  getRecentlyAddedCards: (days?: number) => CollectionCard[];
  getTopValueCards: (limit?: number) => ValueCard[];
  getFavoriteCard: () => CollectionCard | null;
  setFavoriteCard: (setId: string, cardId: string, variant: string) => void;
  
  // Internal helper methods
  _recalculateAggregates: () => void;
}

/**
 * Individual card in collection with metadata
 */
interface CollectionCard {
  cardId: string;
  card: PokemonCard;
  variant: string;
  quantity: number;
  dateAdded: string;
  setId: string;
}

/**
 * Collection statistics summary
 */
interface CollectionStats {
  totalCards: number;
  totalValue: number;
  setsCompleted: number;
  uniqueCards: number;
}

/**
 * Card with calculated value information
 */
interface ValueCard {
  card: PokemonCard;
  variant: string;
  quantity: number;
  totalValue: number;
}

/**
 * Helper function to check if a card ID exists in a set collection (any variant)
 */
const isCardIdInSet = (setCollection: CollectionCard[], cardId: string): boolean => {
  return setCollection.some(c => c.cardId === cardId);
};

/**
 * Collection store implementation
 * Persisted to localStorage for data persistence
 * Optimized with cached aggregates for better performance
 */
export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collection: {},
      favoriteCardId: null,
      totalCardsCount: 0,
      totalCollectionValue: 0,
      uniqueCardsCount: 0,

      /**
       * Add a card to the collection
       * If card already exists, increases quantity
       * Updates cached aggregates incrementally
       */
      addToCollection: (setId, card, variant = 'regular', quantity = 1) => {
        set((state) => {
          const setCollection = state.collection[setId] || [];
          const wasCardIdPresent = isCardIdInSet(setCollection, card.id);
          
          const existingCardIndex = setCollection.findIndex(
            c => c.cardId === card.id && c.variant === variant
          );
          
          const price = getCardPrice(card, variant);
          let updatedCollection: CollectionCard[];
          
          if (existingCardIndex >= 0) {
            // Update existing card quantity
            updatedCollection = [...setCollection];
            updatedCollection[existingCardIndex].quantity += quantity;
          } else {
            // Add new card to collection
            updatedCollection = [
              ...setCollection,
              {
                cardId: card.id,
                card,
                variant,
                quantity,
                dateAdded: new Date().toISOString(),
                setId,
              },
            ];
          }
          
          const newCollection = {
            ...state.collection,
            [setId]: updatedCollection,
          };
          
          const isCardIdNowPresent = isCardIdInSet(updatedCollection, card.id);
          
          // Update cached aggregates
          const newTotalCardsCount = state.totalCardsCount + quantity;
          const newTotalCollectionValue = state.totalCollectionValue + (price * quantity);
          const newUniqueCardsCount = state.uniqueCardsCount + 
            (!wasCardIdPresent && isCardIdNowPresent ? 1 : 0);
          
          return {
            collection: newCollection,
            totalCardsCount: newTotalCardsCount,
            totalCollectionValue: newTotalCollectionValue,
            uniqueCardsCount: newUniqueCardsCount,
          };
        });
      },

      /**
       * Remove a card from the collection
       * Reduces quantity or removes entirely if quantity reaches zero
       * Updates cached aggregates incrementally
       */
      removeFromCollection: (setId, cardId, variant = 'regular', quantity = 1) => {
        set((state) => {
          const setCollection = state.collection[setId] || [];
          const wasCardIdPresent = isCardIdInSet(setCollection, cardId);
          
          const existingCardIndex = setCollection.findIndex(
            c => c.cardId === cardId && c.variant === variant
          );
          
          if (existingCardIndex === -1) {
            return state; // Card not found, no changes
          }
          
          const existingCard = setCollection[existingCardIndex];
          const price = getCardPrice(existingCard.card, variant);
          const currentQuantity = existingCard.quantity;
          const actualQuantityToRemove = Math.min(quantity, currentQuantity);
          
          let updatedCollection: CollectionCard[];
          
          if (currentQuantity <= quantity) {
            // Remove card entirely
            updatedCollection = [...setCollection];
            updatedCollection.splice(existingCardIndex, 1);
          } else {
            // Reduce quantity
            updatedCollection = [...setCollection];
            updatedCollection[existingCardIndex] = {
              ...existingCard,
              quantity: currentQuantity - quantity
            };
          }
          
          const newCollection = {
            ...state.collection,
            [setId]: updatedCollection,
          };
          
          const isCardIdNowPresent = isCardIdInSet(updatedCollection, cardId);
          
          // Update cached aggregates
          const newTotalCardsCount = state.totalCardsCount - actualQuantityToRemove;
          const newTotalCollectionValue = state.totalCollectionValue - (price * actualQuantityToRemove);
          const newUniqueCardsCount = state.uniqueCardsCount - 
            (wasCardIdPresent && !isCardIdNowPresent ? 1 : 0);
          
          return {
            collection: newCollection,
            totalCardsCount: newTotalCardsCount,
            totalCollectionValue: newTotalCollectionValue,
            uniqueCardsCount: newUniqueCardsCount,
          };
        });
      },

      /**
       * Update card quantity directly
       * Removes card if quantity is set to zero or below
       * Updates cached aggregates incrementally
       */
      updateCardQuantity: (setId, cardId, variant, quantity) => {
        set((state) => {
          const setCollection = state.collection[setId] || [];
          const wasCardIdPresent = isCardIdInSet(setCollection, cardId);
          
          const existingCardIndex = setCollection.findIndex(
            c => c.cardId === cardId && c.variant === variant
          );
          
          if (existingCardIndex === -1) {
            return state; // Card not found, no changes
          }
          
          const existingCard = setCollection[existingCardIndex];
          const oldQuantity = existingCard.quantity;
          const quantityChange = quantity - oldQuantity;
          const price = getCardPrice(existingCard.card, variant);
          
          let updatedCollection: CollectionCard[];
          
          if (quantity <= 0) {
            // Remove card if quantity is zero or negative
            updatedCollection = [...setCollection];
            updatedCollection.splice(existingCardIndex, 1);
          } else {
            // Update existing card quantity
            updatedCollection = [...setCollection];
            updatedCollection[existingCardIndex] = {
              ...existingCard,
              quantity
            };
          }
          
          const newCollection = {
            ...state.collection,
            [setId]: updatedCollection,
          };
          
          const isCardIdNowPresent = isCardIdInSet(updatedCollection, cardId);
          
          // Update cached aggregates
          const newTotalCardsCount = state.totalCardsCount + quantityChange;
          const newTotalCollectionValue = state.totalCollectionValue + (price * quantityChange);
          const newUniqueCardsCount = state.uniqueCardsCount + 
            (!wasCardIdPresent && isCardIdNowPresent ? 1 : 0) -
            (wasCardIdPresent && !isCardIdNowPresent ? 1 : 0);
          
          return {
            collection: newCollection,
            totalCardsCount: newTotalCardsCount,
            totalCollectionValue: newTotalCollectionValue,
            uniqueCardsCount: newUniqueCardsCount,
          };
        });
      },

      /**
       * Get quantity of a specific card variant in collection
       */
      getCardQuantity: (setId, cardId, variant) => {
        const collection = get().collection[setId] || [];
        const card = collection.find(c => c.cardId === cardId && c.variant === variant);
        return card?.quantity || 0;
      },

      /**
       * Get all variants of a card with their quantities
       */
      getCardVariants: (setId, cardId) => {
        const collection = get().collection[setId] || [];
        const cardVariants = collection.filter(card => card.cardId === cardId);
        
        return cardVariants.reduce((acc, card) => {
          acc[card.variant] = card.quantity;
          return acc;
        }, {} as Record<string, number>);
      },

      /**
       * Calculate collection progress for a set as percentage
       */
      getSetProgress: (setId, totalCards) => {
        const collection = get().collection[setId] || [];
        const uniqueCards = new Set(collection.map(card => card.cardId));
        return totalCards > 0 ? (uniqueCards.size / totalCards) * 100 : 0;
      },

      /**
       * Calculate total value of cards in a set
       */
      getSetValue: (setId) => {
        const collection = get().collection[setId] || [];
        return collection.reduce((total, { card, variant, quantity }) => {
          const price = getCardPrice(card, variant);
          return total + (price * quantity);
        }, 0);
      },

      /**
       * Clear all collections (used in settings)
       * Resets all cached aggregates
       */
      clearAllCollections: () => {
        set({ 
          collection: {}, 
          favoriteCardId: null,
          totalCardsCount: 0,
          totalCollectionValue: 0,
          uniqueCardsCount: 0,
        });
      },

      /**
       * Get overall collection statistics
       * Now uses cached aggregates for optimal performance
       */
      getTotalStats: () => {
        const state = get();
        
        return {
          totalCards: state.totalCardsCount,
          totalValue: state.totalCollectionValue,
          setsCompleted: 0, // Still calculated externally in components with set data
          uniqueCards: state.uniqueCardsCount,
        };
      },

      /**
       * Get recently added cards within specified days
       */
      getRecentlyAddedCards: (days = 7) => {
        const state = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const allCards: CollectionCard[] = [];
        Object.values(state.collection).forEach(setCards => {
          allCards.push(...setCards);
        });
        
        return allCards
          .filter(card => new Date(card.dateAdded) >= cutoffDate)
          .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      },

      /**
       * Get top value cards by total worth (price × quantity)
       */
      getTopValueCards: (limit = 5) => {
        const state = get();
        const allCards: ValueCard[] = [];
        
        Object.values(state.collection).forEach(setCards => {
          setCards.forEach(collectionCard => {
            const price = getCardPrice(collectionCard.card, collectionCard.variant);
            allCards.push({
              card: collectionCard.card,
              variant: collectionCard.variant,
              quantity: collectionCard.quantity,
              totalValue: price * collectionCard.quantity,
            });
          });
        });
        
        return allCards
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, limit);
      },

      /**
       * Get the user's favorite card
       */
      getFavoriteCard: () => {
        const state = get();
        if (!state.favoriteCardId) return null;
        
        // Search through all sets for the favorite card
        for (const setCards of Object.values(state.collection)) {
          const card = setCards.find(c => c.cardId === state.favoriteCardId);
          if (card) return card;
        }
        
        return null;
      },

      /**
       * Set a card as the user's favorite
       */
      setFavoriteCard: (setId, cardId, variant) => {
        set({ favoriteCardId: cardId });
      },

      /**
       * Internal method to recalculate all aggregates from scratch
       * Used for data migration or when cached values become inconsistent
       */
      _recalculateAggregates: () => {
        set((state) => {
          let totalCards = 0;
          let totalValue = 0;
          const uniqueCardIds = new Set<string>();
          
          Object.values(state.collection).forEach(setCards => {
            setCards.forEach(collectionCard => {
              totalCards += collectionCard.quantity;
              uniqueCardIds.add(collectionCard.cardId);
              
              const price = getCardPrice(collectionCard.card, collectionCard.variant);
              totalValue += price * collectionCard.quantity;
            });
          });
          
          return {
            totalCardsCount: totalCards,
            totalCollectionValue: totalValue,
            uniqueCardsCount: uniqueCardIds.size,
          };
        });
      },
    }),
    {
      name: 'pokemon-tcg-collection',
      // Add version to handle data migration if needed
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // If migrating from version 0 (no cached aggregates), recalculate them
        if (version === 0) {
          const state = persistedState as CollectionState;
          
          let totalCards = 0;
          let totalValue = 0;
          const uniqueCardIds = new Set<string>();
          
          Object.values(state.collection || {}).forEach(setCards => {
            setCards.forEach(collectionCard => {
              totalCards += collectionCard.quantity;
              uniqueCardIds.add(collectionCard.cardId);
              
              const price = getCardPrice(collectionCard.card, collectionCard.variant);
              totalValue += price * collectionCard.quantity;
            });
          });
          
          return {
            ...state,
            totalCardsCount: totalCards,
            totalCollectionValue: totalValue,
            uniqueCardsCount: uniqueCardIds.size,
          };
        }
        
        return persistedState;
      },
    }
  )
);