import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PokemonCard, WishlistCard } from '../types';

/**
 * Wishlist store state interface
 * Manages user's wishlist of desired cards
 */
interface WishlistState {
  /** Array of cards in the wishlist */
  wishlist: WishlistCard[];
  
  // Wishlist management actions
  addToWishlist: (card: PokemonCard) => void;
  removeFromWishlist: (cardId: string) => void;
  isCardInWishlist: (cardId: string) => boolean;
  clearWishlist: () => void;
  getWishlistBySet: () => Record<string, WishlistCard[]>;
  getRecentWishlistCards: (days?: number) => WishlistCard[];
}

/**
 * Wishlist store implementation
 * Persisted to localStorage for data persistence across sessions
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],

      /**
       * Add a card to the wishlist
       * Prevents duplicates by checking if card already exists
       * @param card - Pokemon card to add to wishlist
       */
      addToWishlist: (card) => {
        set((state) => {
          // Check if card is already in wishlist
          const isAlreadyInWishlist = state.wishlist.some(
            (wishlistCard) => wishlistCard.cardId === card.id
          );

          if (isAlreadyInWishlist) {
            return state; // Don't add duplicates
          }

          // Add new card to wishlist
          return {
            wishlist: [
              ...state.wishlist,
              {
                cardId: card.id,
                card,
                dateAdded: new Date().toISOString(),
              },
            ],
          };
        });
      },

      /**
       * Remove a card from the wishlist
       * @param cardId - ID of the card to remove
       */
      removeFromWishlist: (cardId) => {
        set((state) => ({
          wishlist: state.wishlist.filter(
            (wishlistCard) => wishlistCard.cardId !== cardId
          ),
        }));
      },

      /**
       * Check if a card is in the wishlist
       * @param cardId - ID of the card to check
       * @returns True if card is in wishlist, false otherwise
       */
      isCardInWishlist: (cardId) => {
        const state = get();
        return state.wishlist.some(
          (wishlistCard) => wishlistCard.cardId === cardId
        );
      },

      /**
       * Clear all cards from the wishlist
       * Used for settings/account management
       */
      clearWishlist: () => {
        set({ wishlist: [] });
      },

      /**
       * Get wishlist cards organized by set
       * @returns Object with set IDs as keys and arrays of wishlist cards as values
       */
      getWishlistBySet: () => {
        const state = get();
        return state.wishlist.reduce((acc, wishlistCard) => {
          const setId = wishlistCard.card.set.id;
          if (!acc[setId]) {
            acc[setId] = [];
          }
          acc[setId].push(wishlistCard);
          return acc;
        }, {} as Record<string, WishlistCard[]>);
      },

      /**
       * Get recently added wishlist cards
       * @param days - Number of days to look back (default: 7)
       * @returns Array of recently added wishlist cards
       */
      getRecentWishlistCards: (days = 7) => {
        const state = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return state.wishlist
          .filter((wishlistCard) => new Date(wishlistCard.dateAdded) >= cutoffDate)
          .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      },
    }),
    {
      name: 'pokemon-tcg-wishlist',
    }
  )
);