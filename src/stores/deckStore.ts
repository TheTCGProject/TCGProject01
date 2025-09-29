import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Deck, PokemonCard } from '../types';

/**
 * Deck store state interface
 * Manages user's deck collection and deck building functionality
 */
interface DeckState {
  /** Array of user's decks */
  decks: Deck[];
  /** Currently active/selected deck ID */
  activeDeckId: string | null;
  
  // Deck management actions
  createDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDeck: (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteDeck: (id: string) => void;
  setActiveDeck: (id: string | null) => void;
  
  // Card operations within decks
  addCardToDeck: (deckId: string, card: PokemonCard, quantity?: number) => void;
  removeCardFromDeck: (deckId: string, cardId: string, quantity?: number) => void;
  updateCardQuantity: (deckId: string, cardId: string, quantity: number) => void;
}

/**
 * Deck store implementation
 * Persisted to localStorage for data persistence across sessions
 */
export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      decks: [],
      activeDeckId: null,
      
      /**
       * Create a new deck
       * @param deck - Deck data without ID and timestamps
       * @returns Generated deck ID
       */
      createDeck: (deck) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        
        set((state) => ({
          decks: [
            ...state.decks,
            {
              ...deck,
              id,
              createdAt: now,
              updatedAt: now,
              cards: [],
            },
          ],
          activeDeckId: id,
        }));
        
        return id;
      },
      
      /**
       * Update an existing deck's metadata
       * @param id - Deck ID to update
       * @param updates - Partial deck data to update
       */
      updateDeck: (id, updates) => {
        set((state) => ({
          decks: state.decks.map((deck) => 
            deck.id === id
              ? { ...deck, ...updates, updatedAt: new Date().toISOString() }
              : deck
          ),
        }));
      },
      
      /**
       * Delete a deck permanently
       * @param id - Deck ID to delete
       */
      deleteDeck: (id) => {
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== id),
          activeDeckId: state.activeDeckId === id ? null : state.activeDeckId,
        }));
      },
      
      /**
       * Set the currently active deck
       * @param id - Deck ID to set as active, or null to clear
       */
      setActiveDeck: (id) => {
        set({ activeDeckId: id });
      },
      
      /**
       * Add a card to a deck
       * If card already exists, increases quantity
       * @param deckId - Target deck ID
       * @param card - Pokemon card to add
       * @param quantity - Number of copies to add (default: 1)
       */
      addCardToDeck: (deckId, card, quantity = 1) => {
        set((state) => {
          const decks = [...state.decks];
          const deckIndex = decks.findIndex((deck) => deck.id === deckId);
          
          if (deckIndex === -1) return state;
          
          const deck = { ...decks[deckIndex] };
          const cardIndex = deck.cards.findIndex((c) => c.cardId === card.id);
          
          if (cardIndex === -1) {
            // Add new card to deck
            deck.cards.push({
              cardId: card.id,
              card,
              quantity,
            });
          } else {
            // Increase quantity of existing card
            deck.cards[cardIndex].quantity += quantity;
          }
          
          deck.updatedAt = new Date().toISOString();
          decks[deckIndex] = deck;
          
          return { decks };
        });
      },
      
      /**
       * Remove a card from a deck
       * @param deckId - Target deck ID
       * @param cardId - Card ID to remove
       * @param quantity - Number of copies to remove (optional, removes all if not specified)
       */
      removeCardFromDeck: (deckId, cardId, quantity) => {
        set((state) => {
          const decks = [...state.decks];
          const deckIndex = decks.findIndex((deck) => deck.id === deckId);
          
          if (deckIndex === -1) return state;
          
          const deck = { ...decks[deckIndex] };
          const cardIndex = deck.cards.findIndex((c) => c.cardId === cardId);
          
          if (cardIndex === -1) return state;
          
          if (quantity && deck.cards[cardIndex].quantity > quantity) {
            // Reduce quantity
            deck.cards[cardIndex].quantity -= quantity;
          } else {
            // Remove card entirely
            deck.cards.splice(cardIndex, 1);
          }
          
          deck.updatedAt = new Date().toISOString();
          decks[deckIndex] = deck;
          
          return { decks };
        });
      },
      
      /**
       * Update the quantity of a card in a deck
       * @param deckId - Target deck ID
       * @param cardId - Card ID to update
       * @param quantity - New quantity (removes card if 0 or negative)
       */
      updateCardQuantity: (deckId, cardId, quantity) => {
        set((state) => {
          const decks = [...state.decks];
          const deckIndex = decks.findIndex((deck) => deck.id === deckId);
          
          if (deckIndex === -1) return state;
          
          const deck = { ...decks[deckIndex] };
          const cardIndex = deck.cards.findIndex((c) => c.cardId === cardId);
          
          if (cardIndex === -1) return state;
          
          if (quantity <= 0) {
            // Remove card if quantity is zero or negative
            deck.cards.splice(cardIndex, 1);
          } else {
            // Update quantity
            deck.cards[cardIndex].quantity = quantity;
          }
          
          deck.updatedAt = new Date().toISOString();
          decks[deckIndex] = deck;
          
          return { decks };
        });
      },
    }),
    {
      name: 'pokemon-tcg-decks',
    }
  )
);