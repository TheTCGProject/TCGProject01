import create from 'zustand';
import { Deck, Card } from '../types';

interface DeckState {
  decks: Deck[];
  addDeck: (deck: Deck) => void;
  removeDeck: (deckId: string) => void;
  updateDeck: (deck: Deck) => void;
  setDecks: (decks: Deck[]) => void;
  clearDecks: () => void;
  addCardToDeck: (deckId: string, card: Card) => void;
}

export const useDeckStore = create<DeckState>(set => ({
  decks: [],
  addDeck: deck => set(state => ({ decks: [...state.decks, deck] })),
  removeDeck: deckId =>
    set(state => ({
      decks: state.decks.filter(d => d.id !== deckId),
    })),
  updateDeck: updated =>
    set(state => ({
      decks: state.decks.map(d => (d.id === updated.id ? updated : d)),
    })),
  setDecks: decks => set(() => ({ decks })),
  clearDecks: () => set(() => ({ decks: [] })),
  addCardToDeck: (deckId, card) =>
    set(state => ({
      decks: state.decks.map(deck =>
        deck.id === deckId
          ? { ...deck, cards: [...deck.cards, { cardId: card.id, card, quantity: 1 }] }
          : deck
      ),
    })),
}));
