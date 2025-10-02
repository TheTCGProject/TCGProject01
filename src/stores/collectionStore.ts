import create from 'zustand';
import { Card } from '../types';

export interface CollectionEntry {
  setId: string;
  cardId: string;
  variant: string;
  quantity: number;
}

export interface CollectionState {
  collection: CollectionEntry[];
  addToCollection: (setId: string, card: Card, variant: string, quantity: number) => void;
  removeFromCollection: (setId: string, cardId: string, variant: string, quantity: number) => void;
  updateCardQuantity: (setId: string, cardId: string, variant: string, quantity: number) => void;
  getCardQuantity: (setId: string, cardId: string, variant: string) => number;
  getCardVariants: (setId: string, cardId: string) => Record<string, number>;
  setCollection: (entries: CollectionEntry[]) => void;
  clearCollection: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collection: [],

  addToCollection: (
    setId: string,
    card: Card,
    variant: string,
    quantity: number
  ): void => {
    set(state => {
      const idx = state.collection.findIndex(
        (c: CollectionEntry) =>
          c.setId === setId && c.cardId === card.id && c.variant === variant
      );
      const newEntry: CollectionEntry = {
        setId,
        cardId: card.id,
        variant,
        quantity,
      };
      const newCollection = [...state.collection];
      if (idx === -1) {
        newCollection.push(newEntry);
      }
      return { collection: newCollection };
    });
  },

  removeFromCollection: (
    setId: string,
    cardId: string,
    variant: string,
    quantity: number
  ): void => {
    set(state => ({
      collection: state.collection.filter(
        (c: CollectionEntry) =>
          !(
            c.setId === setId &&
            c.cardId === cardId &&
            c.variant === variant &&
            c.quantity === quantity
          )
      ),
    }));
  },

  updateCardQuantity: (
    setId: string,
    cardId: string,
    variant: string,
    quantity: number
  ): void => {
    set(state => ({
      collection: state.collection.map((c: CollectionEntry) =>
        c.setId === setId && c.cardId === cardId && c.variant === variant
          ? { ...c, quantity }
          : c
      ),
    }));
  },

  getCardQuantity: (
    setId: string,
    cardId: string,
    variant: string
  ): number => {
    const entry: CollectionEntry | undefined = get().collection.find(
      (c: CollectionEntry) =>
        c.setId === setId && c.cardId === cardId && c.variant === variant
    );
    return entry ? entry.quantity : 0;
  },

  getCardVariants: (
    setId: string,
    cardId: string
  ): Record<string, number> => {
    const variants: Record<string, number> = {};
    get()
      .collection.filter(
        (c: CollectionEntry) => c.setId === setId && c.cardId === cardId
      )
      .forEach((c: CollectionEntry) => {
        variants[c.variant] = c.quantity;
      });
    return variants;
  },

  setCollection: (entries: CollectionEntry[]): void =>
    set(() => ({ collection: entries })),

  clearCollection: (): void =>
    set(() => ({ collection: [] })),
}));
