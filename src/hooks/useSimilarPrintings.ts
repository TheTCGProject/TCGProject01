import { useQuery } from '@tanstack/react-query';
import { PokemonCard } from '../types';
import { loadSets, loadCardSet } from '../utils/dataLoader';

/**
 * Check if two cards ar      gcTime: 1000 * 60 * 60, // 1 hour true reprints (functionally identical)
 */
const areCardsIdenticalReprints = (card1: PokemonCard, card2: PokemonCard): boolean => {
  // Must have the same name
  if (card1.name !== card2.name) return false;
  
  // Must have the same supertype
  if (card1.supertype !== card2.supertype) return false;
  
  // For Pokémon cards, check game mechanics
  if (card1.supertype === 'Pokémon') {
    // HP must match
    if (card1.hp !== card2.hp) return false;
    
    // Types must match (order doesn't matter)
    const types1 = (card1.types || []).sort();
    const types2 = (card2.types || []).sort();
    if (JSON.stringify(types1) !== JSON.stringify(types2)) return false;
    
    // Retreat cost must match
    if (card1.convertedRetreatCost !== card2.convertedRetreatCost) return false;
    
    // Attacks must be functionally identical
    const attacks1 = card1.attacks || [];
    const attacks2 = card2.attacks || [];
    
    if (attacks1.length !== attacks2.length) return false;
    
    for (let i = 0; i < attacks1.length; i++) {
      const attack1 = attacks1[i];
      const attack2 = attacks2[i];
      
      if (attack1.name !== attack2.name) return false;
      if (attack1.damage !== attack2.damage) return false;
      if (attack1.convertedEnergyCost !== attack2.convertedEnergyCost) return false;
      
      // Compare energy cost arrays (order matters for attacks)
      const cost1 = attack1.cost || [];
      const cost2 = attack2.cost || [];
      if (JSON.stringify(cost1) !== JSON.stringify(cost2)) return false;
      
      // Compare attack text (normalize whitespace)
      const text1 = (attack1.text || '').replace(/\s+/g, ' ').trim();
      const text2 = (attack2.text || '').replace(/\s+/g, ' ').trim();
      if (text1 !== text2) return false;
    }
    
    // Abilities must be functionally identical
    const abilities1 = card1.abilities || [];
    const abilities2 = card2.abilities || [];
    
    if (abilities1.length !== abilities2.length) return false;
    
    for (let i = 0; i < abilities1.length; i++) {
      const ability1 = abilities1[i];
      const ability2 = abilities2[i];
      
      if (ability1.name !== ability2.name) return false;
      if (ability1.type !== ability2.type) return false;
      
      // Compare ability text (normalize whitespace)
      const text1 = (ability1.text || '').replace(/\s+/g, ' ').trim();
      const text2 = (ability2.text || '').replace(/\s+/g, ' ').trim();
      if (text1 !== text2) return false;
    }
    
    // Weaknesses must match
    const weaknesses1 = (card1.weaknesses || []).sort((a, b) => a.type.localeCompare(b.type));
    const weaknesses2 = (card2.weaknesses || []).sort((a, b) => a.type.localeCompare(b.type));
    if (JSON.stringify(weaknesses1) !== JSON.stringify(weaknesses2)) return false;
    
    // Resistances must match
    const resistances1 = (card1.resistances || []).sort((a, b) => a.type.localeCompare(b.type));
    const resistances2 = (card2.resistances || []).sort((a, b) => a.type.localeCompare(b.type));
    if (JSON.stringify(resistances1) !== JSON.stringify(resistances2)) return false;
    
    // Evolution requirements must match
    if (card1.evolvesFrom !== card2.evolvesFrom) return false;
    
    // Subtypes must match (order doesn't matter)
    const subtypes1 = (card1.subtypes || []).sort();
    const subtypes2 = (card2.subtypes || []).sort();
    if (JSON.stringify(subtypes1) !== JSON.stringify(subtypes2)) return false;
  }
  
  // For Trainer cards, check card text and subtypes
  if (card1.supertype === 'Trainer') {
    // Subtypes must match
    const subtypes1 = (card1.subtypes || []).sort();
    const subtypes2 = (card2.subtypes || []).sort();
    if (JSON.stringify(subtypes1) !== JSON.stringify(subtypes2)) return false;
    
    // Rules text must match (this contains the card's effect)
    const rules1 = (card1.rules || []).map(rule => rule.replace(/\s+/g, ' ').trim()).sort();
    const rules2 = (card2.rules || []).map(rule => rule.replace(/\s+/g, ' ').trim()).sort();
    if (JSON.stringify(rules1) !== JSON.stringify(rules2)) return false;
  }
  
  // For Energy cards, check subtypes and rules
  if (card1.supertype === 'Energy') {
    // Subtypes must match
    const subtypes1 = (card1.subtypes || []).sort();
    const subtypes2 = (card2.subtypes || []).sort();
    if (JSON.stringify(subtypes1) !== JSON.stringify(subtypes2)) return false;
    
    // Rules text must match
    const rules1 = (card1.rules || []).map(rule => rule.replace(/\s+/g, ' ').trim()).sort();
    const rules2 = (card2.rules || []).map(rule => rule.replace(/\s+/g, ' ').trim()).sort();
    if (JSON.stringify(rules1) !== JSON.stringify(rules2)) return false;
  }
  
  // Artist matching (optional - some reprints may have different artists)
  // We'll be lenient here and not require artist matching as some legitimate reprints
  // may have different artists or updated artwork
  
  return true;
};

/**
 * Hook for fetching true reprints of a card
 * Returns cards that are functionally identical but from different sets
 */
export const useSimilarPrintings = (
  cardName: string,
  currentCardId: string,
  currentSetId: string,
  currentCard?: PokemonCard
) => {
  return useQuery({
    queryKey: ['trueReprints', cardName, currentCardId, currentSetId],
    queryFn: async (): Promise<PokemonCard[]> => {
      if (!cardName || !currentCardId || !currentSetId || !currentCard) {
        return [];
      }

      try {
        // Load all sets first
        const sets = await loadSets();
        let allCards: PokemonCard[] = [];

        // Load cards from each set and find matching ones
        for (const set of sets) {
          const setCards = await loadCardSet(set.id);
          const matchingCards = setCards.filter(card => card.name === cardName);
          allCards = [...allCards, ...matchingCards];
        }

        // Filter to only include true reprints
        const trueReprints = allCards.filter((card: PokemonCard) => {
          // Exclude the current card
          if (card.id === currentCardId) return false;
          
          // Exclude cards from the same set
          if (card.set.id === currentSetId) return false;
          
          // Check if this is a true reprint
          return currentCard ? areCardsIdenticalReprints(currentCard, card) : true;
        });

        // Sort by release date (newest first) and then by set name
        return trueReprints.sort((a: PokemonCard, b: PokemonCard) => {
          const dateA = new Date(a.set.releaseDate);
          const dateB = new Date(b.set.releaseDate);
          
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB.getTime() - dateA.getTime(); // Newest first
          }
          
          return a.set.name.localeCompare(b.set.name);
        });
      } catch (error) {
        console.error('Error fetching true reprints:', error);
        return [];
      }
    },
    enabled: !!(cardName && currentCardId && currentSetId && currentCard),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 // 1 hour
  });
};