import { useCollectionStore } from '../stores/collectionStore';
import { getCardPrice } from '../services/api';

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

  // Get available variants based on card rarity and type
  const getAvailableVariants = (card: any) => {
    return [
      { id: 'regular', name: 'Normal' },
      { id: 'reverse-holo', name: 'Reverse Holo' },
      { id: 'holo', name: 'Holo' },
      { id: 'full-art', name: 'Full Art' },
      { id: 'alt-art', name: 'Alt Art' },
      { id: 'rainbow', name: 'Rainbow Rare' },
      { id: 'gold', name: 'Gold Rare' },
      { id: 'secret', name: 'Secret Rare' }
    ].filter(variant => {
      if (!card?.rarity) return false;
      
      if (card.rarity === 'Common' || card.rarity === 'Uncommon') {
        return ['regular', 'reverse-holo'].includes(variant.id);
      }
      
      if (card.rarity === 'Rare') {
        return ['regular', 'reverse-holo', 'holo'].includes(variant.id);
      }

      if (card.rarity === 'Illustration Rare' || card.rarity === 'Special Illustration Rare') {
        return ['holo'].includes(variant.id);
      }
      
      return variant.id !== 'reverse-holo';
    });
  };

  // Calculate collection progress for a specific card
  const getCardCollectionProgress = (cardId: string, availableVariants: any[]) => {
    if (!setId) return { owned: 0, total: 0, percentage: 0 };
    
    const cardVariants = getCardVariants(setId, cardId);
    const ownedVariants = Object.values(cardVariants).filter(quantity => quantity > 0).length;
    const totalVariants = availableVariants.length;
    
    return {
      owned: ownedVariants,
      total: totalVariants,
      percentage: totalVariants > 0 ? (ownedVariants / totalVariants) * 100 : 0
    };
  };

  // Calculate total collection value for a specific card
  const getCardCollectionValue = (card: any, cardId: string) => {
    if (!setId) return 0;
    
    const cardVariants = getCardVariants(setId, cardId);
    return Object.entries(cardVariants).reduce((total, [variant, quantity]) => {
      const price = getCardPrice(card, variant);
      return total + (price * quantity);
    }, 0);
  };

  // Handle quantity changes with validation
  const handleQuantityChange = (cardId: string, card: any, variantId: string, newQuantity: number) => {
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

  // Check if a card is in collection
  const isCardInCollection = (cardId: string) => {
    if (!setId) return false;
    const setCollection = collection[setId] || [];
    return setCollection.some(c => c.cardId === cardId);
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
    
    // Helper methods
    getAvailableVariants,
    getCardCollectionProgress,
    getCardCollectionValue,
    handleQuantityChange,
    isCardInCollection,
  };
};