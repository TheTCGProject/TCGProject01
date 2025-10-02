import create from 'zustand';
import { WishlistCard, Card } from '../types';

interface WishlistState {
  wishlist: WishlistCard[];
  addToWishlist: (card: Card) => void;
  removeFromWishlist: (cardId: string) => void;
  setWishlist: (wishlist: WishlistCard[]) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>(set => ({
  wishlist: [],
  addToWishlist: card =>
    set(state => {
      if (state.wishlist.find(w => w.cardId === card.id)) return state;
      const newItem: WishlistCard = {
        cardId: card.id,
        card,
        dateAdded: new Date().toISOString(),
      };
      return { wishlist: [...state.wishlist, newItem] };
    }),
  removeFromWishlist: cardId =>
    set(state => ({
      wishlist: state.wishlist.filter(w => w.cardId !== cardId),
    })),
  setWishlist: wishlist => set(() => ({ wishlist })),
  clearWishlist: () => set(() => ({ wishlist: [] })),
}));
