/**
 * Card legality utilities for Pokemon TCG Standard format
 * Handles regulation marks and set-based legality checking
 */

/**
 * Currently legal regulation marks for Standard format (2025)
 * Updated as of April 2025 rotation
 */
const LEGAL_REGULATION_MARKS = ['G', 'H'];

/**
 * Set ID to regulation mark mapping
 * Based on known Pokemon TCG set releases and their regulation marks
 */
const SET_REGULATION_MARKS: Record<string, string> = {
  // Scarlet & Violet Series (G regulation mark)
  'sv1': 'G',
  'sv2': 'G', 
  'sv3': 'G',
  'sv3pt5': 'G',
  'sv4': 'G',
  'sv4pt5': 'G',
  'sv5': 'G',
  'sv6': 'H',
  'sv7': 'H',
  'sv8': 'H',
  
  // Promo sets with G/H marks
  'svp': 'G', // Most SV promos are G, but this varies
  'sve': 'G', // SV Energies
  
  // Sword & Shield Series (F regulation mark - ROTATED OUT)
  'swsh1': 'F',
  'swsh2': 'F',
  'swsh3': 'F',
  'swsh35': 'F',
  'swsh4': 'F',
  'swsh45': 'F',
  'swsh5': 'F',
  'swsh6': 'F',
  'swsh7': 'F',
  'swsh8': 'F',
  'swsh9': 'F',
  'swsh10': 'F',
  'swsh11': 'F',
  'swsh12': 'F',
  'swsh12pt5': 'F',
  'swshp': 'F',
  
  // Sun & Moon and earlier (E regulation mark and older - ROTATED OUT)
  'sm1': 'E',
  'sm2': 'E',
  'sm3': 'E',
  'sm35': 'E',
  'sm4': 'E',
  'sm5': 'E',
  'sm6': 'E',
  'sm7': 'E',
  'sm75': 'E',
  'sm8': 'E',
  'sm9': 'E',
  'sm10': 'E',
  'sm11': 'E',
  'sm115': 'E',
  'sm12': 'E',
};

/**
 * Cutoff date for Standard legality based on set release dates
 * Cards released before this date are likely rotated out
 * This is a fallback when regulation mark data is unavailable
 */
const STANDARD_CUTOFF_DATE = new Date('2023-03-31'); // Scarlet & Violet base set release

/**
 * Check if a card is legal in Standard format based on regulation mark
 * @param card - Pokemon card to check
 * @returns boolean indicating Standard legality
 */
export const isStandardLegal = (card: any): boolean => {
  if (!card || !card.set) return false;
  
  // First, try to determine regulation mark from set ID
  const setId = card.set.id;
  const regulationMark = SET_REGULATION_MARKS[setId];
  
  if (regulationMark) {
    return LEGAL_REGULATION_MARKS.includes(regulationMark);
  }
  
  // Fallback: Check set release date
  // Cards from sets released after the cutoff date are likely legal
  if (card.set.releaseDate) {
    const releaseDate = new Date(card.set.releaseDate);
    return releaseDate >= STANDARD_CUTOFF_DATE;
  }
  
  // Final fallback: Use API legality data with caution
  // This may be outdated but better than nothing
  return card.legalities?.standard === 'Legal';
};

/**
 * Check if a card is legal in Expanded format
 * Expanded includes more sets than Standard
 * @param card - Pokemon card to check
 * @returns boolean indicating Expanded legality
 */
export const isExpandedLegal = (card: any): boolean => {
  if (!card || !card.set) return false;
  
  // Expanded format is more permissive
  // Generally includes Black & White series and newer
  const expandedCutoffDate = new Date('2011-04-25'); // Black & White base set
  
  if (card.set.releaseDate) {
    const releaseDate = new Date(card.set.releaseDate);
    return releaseDate >= expandedCutoffDate;
  }
  
  // Fallback to API data
  return card.legalities?.expanded === 'Legal';
};

/**
 * Get the regulation mark for a given set ID
 * @param setId - Set identifier
 * @returns regulation mark or null if unknown
 */
const getSetRegulationMark = (setId: string): string | null => {
  return SET_REGULATION_MARKS[setId] || null;
};

/**
 * Check if a regulation mark is currently legal in Standard
 * @param regulationMark - Regulation mark to check
 * @returns boolean indicating if the mark is legal
 */
const isRegulationMarkLegal = (regulationMark: string): boolean => {
  return LEGAL_REGULATION_MARKS.includes(regulationMark);
};

/**
 * Get a human-readable explanation of why a card might not be Standard legal
 * @param card - Pokemon card to check
 * @returns explanation string or null if card is legal
 */
export const getStandardLegalityExplanation = (card: any): string | null => {
  if (isStandardLegal(card)) return null;
  
  const setId = card.set?.id;
  const regulationMark = SET_REGULATION_MARKS[setId];
  
  if (regulationMark && !LEGAL_REGULATION_MARKS.includes(regulationMark)) {
    return `This card has regulation mark "${regulationMark}" which rotated out of Standard format. Only cards with regulation marks ${LEGAL_REGULATION_MARKS.join(', ')} are currently legal.`;
  }
  
  if (card.set?.releaseDate) {
    const releaseDate = new Date(card.set.releaseDate);
    if (releaseDate < STANDARD_CUTOFF_DATE) {
      return `This card is from ${card.set.name} (released ${releaseDate.toLocaleDateString()}), which has rotated out of Standard format.`;
    }
  }
  
  return 'This card is not currently legal in Standard format due to rotation.';
};