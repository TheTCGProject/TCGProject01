// src/types/index.ts

// Types for legal and series info
export interface SetLegal {
  standard?: boolean;
  expanded?: boolean;
}

export interface SerieBrief {
  id: string;
  name: string;
}

export interface SetBrief {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  serie?: SerieBrief;
  cardCount?: {
    total?: number;
    official?: number;
    reverse?: number;
    holo?: number;
    firstEd?: number;
  };
  tcgOnline?: string;
  releaseDate?: string;
  legal?: SetLegal;
}

/** TCGplayer price structure for card variants */
export interface TCGPlayerPriceVariant {
  lowPrice?: number;
  midPrice?: number;
  highPrice?: number;
  marketPrice?: number;
  directLowPrice?: number;
}

/** Cardmarket price structure */
export interface CardMarketPriceVariant {
  avg?: number;
  low?: number;
  trend?: number;
  avg1?: number;
  avg7?: number;
  avg30?: number;
  avg_holo?: number;
  low_holo?: number;
  trend_holo?: number;
  avg1_holo?: number;
  avg7_holo?: number;
  avg30_holo?: number;
}

/** All pricing info attached to a card */
export interface Pricing {
  tcgplayer?: {
    updated: number;
    unit: number;
    normal?: TCGPlayerPriceVariant;
    holofoil?: TCGPlayerPriceVariant;
    'reverse-holofoil'?: TCGPlayerPriceVariant;
    '1st-edition'?: TCGPlayerPriceVariant;
    '1st-edition-holofoil'?: TCGPlayerPriceVariant;
    unlimited?: TCGPlayerPriceVariant;
    'unlimited-holofoil'?: TCGPlayerPriceVariant;
  };
  cardmarket?: {
    updated?: number;
    unit?: number;
    avg?: number;
    low?: number;
    trend?: number;
    avg1?: number;
    avg7?: number;
    avg30?: number;
    avg_holo?: number;
    low_holo?: number;
    trend_holo?: number;
    avg1_holo?: number;
    avg7_holo?: number;
    avg30_holo?: number;
  };
}

/** Card variants (normal, holo, reverse, 1st edition) */
export interface Variants {
  normal: boolean;
  reverse: boolean;
  holo: boolean;
  firstEdition: boolean;
}

/** Booster pack object */
export interface Booster {
  id: string;
  name: string;
  logo?: string;
  artwork_front?: string;
  artwork_back?: string;
}

/** Universal Card object for tcgdex.dev */
export interface Card {
  id: string;                 // global card ID, e.g. "swsh3-136"
  localId: string | number;   // number within set
  name: string;
  image?: string;
  category: 'Pokemon' | 'Trainer' | 'Energy';
  illustrator?: string;
  rarity?: string;
  set: SetBrief;
  variants: Variants;
  boosters?: Booster[];
  pricing?: Pricing;
  updated: string; // ISO date string

  // Pokémon-specific fields
  dexId?: number[];           // National Dex numbers
  hp?: number;
  types?: string[];
  evolveFrom?: string;
  description?: string;
  level?: string;
  stage?: string;
  suffix?: string;
  item?: {
    name: string;
    effect: string;
  };
  abilities?: Ability[];
  attacks?: Attack[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
  retreat?: number;

  // Trainer/Energy-specific fields
  effect?: string;
  trainerType?: string;
  energyType?: string;
}

/** Pokémon attack */
export interface Attack {
  name: string;
  cost: string[];
  damage: string;
  effect?: string;
}

/** Pokémon ability */
export interface Ability {
  name: string;
  effect: string;
  type: string;
}

/** Weakness */
export interface Weakness {
  type: string;
  value: string;
}

/** Resistance */
export interface Resistance {
  type: string;
  value: string;
}

/** Wishlist item */
export interface WishlistCard {
  cardId: string;
  card: Card;
  dateAdded: string;
}

/** Deck structure (if used in your app) */
export interface Deck {
  id: string;
  name: string;
  description: string;
  format: 'standard' | 'expanded' | 'unlimited' | 'custom';
  cards: DeckCard[];
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  authorName?: string;
  isPublic: boolean;
}

export interface DeckCard {
  cardId: string;
  card: Card;
  quantity: number;
}

/** Badge/achievement types */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'standard' | 'special';
  requirement: (stats: any) => boolean;
  color: string;
  getRequirementProgress?: (stats: any) => number;
  progressTextFormatter?: (stats: any) => string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface BadgeProgress {
  badge: Badge;
  progress: number;
  isUnlocked: boolean;
  progressText: string;
}

/** Generic paged API response */
export interface ApiResponse<T> {
  data: T;
  page?: number;
  pageSize?: number;
  count?: number;
  totalCount?: number;
}
