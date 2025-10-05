import { Card, Set, SetDetails } from '../types'

// Cache implementation
const cardSetCache: Record<string, Card[]> = {}
const setsCache: Set[] | null = null
const setDetailsCache: Record<string, SetDetails> = {}

/**
 * Load a specific card set by its ID
 * @param setId The ID of the set to load (e.g., 'base1', 'base2', etc.)
 * @returns Promise containing the cards from the specified set
 */
export const loadCardSet = async (setId: string): Promise<Card[]> => {
  // Return cached data if available
  if (cardSetCache[setId]) {
    return cardSetCache[setId]
  }

  try {
    const cardSet = await import(`../data/cards/en/${setId}.json`)
    cardSetCache[setId] = cardSet.default
    return cardSet.default
  } catch (error) {
    console.error(`Error loading card set ${setId}:`, error)
    return []
  }
}

/**
 * Load all available sets
 * @returns Promise containing all sets data
 */
export const loadSets = async (): Promise<Set[]> => {
  if (setsCache) {
    return setsCache
  }

  try {
    const sets = await import('../data/sets/en.json')
    return sets.default
  } catch (error) {
    console.error('Error loading sets:', error)
    return []
  }
}

/**
 * Load detailed information for a specific set
 * @param setId The ID of the set to load
 * @returns Promise containing the set details and its cards
 */
export const loadSetDetails = async (setId: string): Promise<SetDetails | null> => {
  // Check cache first
  if (setDetailsCache[setId]) {
    return setDetailsCache[setId];
  }

  try {
    // Load the set basic information
    const allSets = await loadSets();
    const setInfo = allSets.find(set => set.id === setId);
    
    if (!setInfo) {
      throw new Error(`Set ${setId} not found`);
    }

    // Load the cards for this set
    const cards = await loadCardSet(setId);

    // Combine the information
    const setDetails: SetDetails = {
      ...setInfo,
      cards: cards.sort((a, b) => {
        // Sort by number if both cards have valid numbers
        if (a.number && b.number) {
          const numA = parseInt(a.number);
          const numB = parseInt(b.number);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
        }
        // If numbers can't be compared, sort by name
        return a.name.localeCompare(b.name);
      })
    };

    // Cache the results
    setDetailsCache[setId] = setDetails;

    return setDetails;
  } catch (error) {
    console.error(`Error loading set details for ${setId}:`, error);
    return null;
  }
};

/**
 * Load multiple card sets at once
 * @param setIds Array of set IDs to load
 * @returns Promise containing a map of setId to cards
 */
export const loadMultipleCardSets = async (setIds: string[]): Promise<Record<string, Card[]>> => {
  const results: Record<string, Card[]> = {}
  
  await Promise.all(
    setIds.map(async (setId) => {
      results[setId] = await loadCardSet(setId)
    })
  )

  return results
}

/**
 * Load cards from a specific set that match certain criteria
 * @param setId The ID of the set to search
 * @param filterFn Function to filter the cards
 * @returns Promise containing filtered cards
 */
export const loadFilteredCards = async (
  setId: string,
  filterFn: (card: Card) => boolean
): Promise<Card[]> => {
  const cards = await loadCardSet(setId)
  return cards.filter(filterFn)
}

/**
 * Search for cards across all loaded sets
 * @param searchFn Function to determine if a card matches the search criteria
 * @returns Promise containing matching cards
 */
export const searchAcrossLoadedSets = (searchFn: (card: Card) => boolean): Card[] => {
  const allLoadedCards = Object.values(cardSetCache).flat()
  return allLoadedCards.filter(searchFn)
}