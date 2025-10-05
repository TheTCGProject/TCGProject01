export interface Attack {
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string;
  text: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Resistance {
  type: string;
  value: string;
}

export interface Set {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
  legalities: {
    standard?: string;
    expanded?: string;
    unlimited?: string;
  };
}

export interface Card {
  // Core card information
  id: string;
  name: string;
  number: string;
  supertype: string;
  subtypes: string[];
  
  // Card text and flavor
  flavorText?: string;
  rules?: string[];
  
  // Pokemon-specific attributes
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  attacks?: Attack[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  nationalPokedexNumbers?: number[];
  
  // Card abilities
  abilities?: Array<{
    name: string;
    text: string;
    type: string;
  }>;

  // Collection and printing details
  artist?: string;
  rarity?: string;
  images: CardImages;
  set: {
    id: string;
    name: string;
    releaseDate: string;
    printedTotal: number;
    total: number;
    images: {
      symbol: string;
      logo: string;
    };
  };
  
  // Market information
  tcgplayer?: TcgPlayer;
}

// Alias for compatibility
export type PokemonCard = Card;

export interface SetDetails extends Set {
  cards: Card[];
}

/**
 * Format legality information
 */
export interface Legalities {
  unlimited?: string;
  standard?: string;
  expanded?: string;
}

/**
 * Card image URLs
 */
export interface CardImages {
  /** Small image URL */
  small: string;
  /** Large/high-res image URL */
  large: string;
}

/**
 * Set image URLs
 */
export interface SetImages {
  /** Set symbol URL */
  symbol: string;
  /** Set logo URL */
  logo: string;
}

/**
 * TCGPlayer pricing information
 */
export interface TcgPlayer {
  /** TCGPlayer product URL */
  url: string;
  /** Last price update */
  updatedAt: string;
  /** Price data by variant */
  prices: {
    [key: string]: {
      low: number;
      mid: number;
      high: number;
      market: number;
      directLow: number;
    };
  };
}

// Deck Types

/**
 * User deck information
 */
export interface Deck {
  /** Unique deck identifier */
  id: string;
  /** Deck name */
  name: string;
  /** Deck description */
  description: string;
  /** Tournament format */
  format: 'standard' | 'expanded' | 'unlimited' | 'custom';
  /** Cards in the deck */
  cards: DeckCard[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Deck author ID */
  authorId?: string;
  /** Deck author name */
  authorName?: string;
  /** Whether deck is publicly visible */
  isPublic: boolean;
}

/**
 * Card within a deck
 */
interface DeckCard {
  /** Reference to card ID */
  cardId: string;
  /** Full card data */
  card: PokemonCard;
  /** Number of copies in deck */
  quantity: number;
}

// Wishlist Types

/**
 * Card in user's wishlist
 */
export interface WishlistCard {
  /** Reference to card ID */
  cardId: string;
  /** Full card data */
  card: PokemonCard;
  /** Date when card was added to wishlist */
  dateAdded: string;
}

// Badge System Types

/**
 * Achievement badge interface
 */
export interface Badge {
  /** Unique badge identifier */
  id: string;
  /** Badge display name */
  name: string;
  /** Badge description */
  description: string;
  /** Badge icon component */
  icon: React.ReactNode;
  /** Badge category for organization */
  category: 'standard' | 'special';
  /** Function to check if badge requirements are met */
  requirement: (stats: any) => boolean;
  /** Background color class for badge display */
  color: string;
  /** Optional function to get progress towards badge (0-100) */
  getRequirementProgress?: (stats: any) => number;
  /** Optional function to format progress text */
  progressTextFormatter?: (stats: any) => string;
  /** Optional rarity level for special badges */
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  /** Optional unlock date for tracking */
  unlockedAt?: string;
}

/**
 * Badge progress information
 */
export interface BadgeProgress {
  /** Badge reference */
  badge: Badge;
  /** Current progress percentage (0-100) */
  progress: number;
  /** Whether badge is unlocked */
  isUnlocked: boolean;
  /** Formatted progress text */
  progressText: string;
}

// API Response Types

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Current page (for paginated responses) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Items in current page */
  count?: number;
  /** Total items across all pages */
  totalCount?: number;
}