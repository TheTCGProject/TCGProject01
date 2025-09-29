import { useState, useMemo } from 'react';
import { buildQuery } from '../services/api';
import { isStandardLegal, isExpandedLegal } from '../utils/cardLegality';

interface FilterState {
  types: string[];
  subtypes: string[];
  rarity: string;
  set: string;
  format: '' | 'standard' | 'expanded';
  hp: { min?: number; max?: number };
  retreatCost: { min?: number; max?: number };
}

export const useCardFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    subtypes: [],
    rarity: '',
    set: '',
    format: '',
    hp: {},
    retreatCost: {},
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Available filter options
  const pokemonTypes = [
    'Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 
    'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water'
  ];

  const rarities = [
    'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Rare Secret'
  ];

  const subtypes = [
    'Basic', 'Stage 1', 'Stage 2', 'VMAX', 'VSTAR', 'EX', 'GX'
  ];

  // Build API query from current filters
  const buildFilterQuery = useMemo(() => {
    let queryObj: Record<string, any> = {};

    if (searchTerm) {
      queryObj.name = searchTerm;
    }

    if (filters.types.length > 0) {
      queryObj.types = filters.types;
    }

    if (filters.subtypes.length > 0) {
      queryObj.subtypes = filters.subtypes;
    }

    if (filters.rarity) {
      queryObj.rarity = filters.rarity;
    }

    if (filters.set) {
      queryObj['set.id'] = filters.set;
    }

    // Remove format-based API filtering since we'll do client-side filtering
    // The API's legality data is often outdated after rotations
    // We'll fetch more cards and filter them client-side based on regulation marks

    if (filters.hp.min !== undefined || filters.hp.max !== undefined) {
      queryObj.hp = filters.hp;
    }

    if (filters.retreatCost.min !== undefined || filters.retreatCost.max !== undefined) {
      queryObj.convertedRetreatCost = filters.retreatCost;
    }

    return buildQuery(queryObj);
  }, [searchTerm, filters]);

  // Client-side filter function for format legality
  const filterCardsByFormat = (cards: any[]) => {
    if (!filters.format) return cards;

    return cards.filter(card => {
      switch (filters.format) {
        case 'standard':
          return isStandardLegal(card);
        case 'expanded':
          return isExpandedLegal(card);
        default:
          return true;
      }
    });
  };

  // Update individual filter
  const updateFilter = (filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Toggle array filter (for types, subtypes)
  const toggleArrayFilter = (filterType: 'types' | 'subtypes', value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterType];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [filterType]: newArray,
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      types: [],
      subtypes: [],
      rarity: '',
      set: '',
      format: '',
      hp: {},
      retreatCost: {},
    });
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== '' ||
      filters.types.length > 0 ||
      filters.subtypes.length > 0 ||
      filters.rarity !== '' ||
      filters.set !== '' ||
      filters.format !== '' ||
      Object.keys(filters.hp).length > 0 ||
      Object.keys(filters.retreatCost).length > 0
    );
  }, [searchTerm, filters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.types.length > 0) count++;
    if (filters.subtypes.length > 0) count++;
    if (filters.rarity) count++;
    if (filters.set) count++;
    if (filters.format) count++;
    if (Object.keys(filters.hp).length > 0) count++;
    if (Object.keys(filters.retreatCost).length > 0) count++;
    return count;
  }, [searchTerm, filters]);

  // Preset filter combinations
  const applyPresetFilter = (preset: string) => {
    switch (preset) {
      case 'standard-legal':
        updateFilter('format', 'standard');
        break;
      case 'expanded-legal':
        updateFilter('format', 'expanded');
        break;
      case 'rare-cards':
        updateFilter('rarity', 'Rare');
        break;
      case 'basic-pokemon':
        updateFilter('subtypes', ['Basic']);
        break;
      case 'high-hp':
        updateFilter('hp', { min: 200 });
        break;
      case 'no-retreat':
        updateFilter('retreatCost', { max: 0 });
        break;
      default:
        break;
    }
  };

  return {
    // State
    filters,
    searchTerm,
    
    // Filter options
    pokemonTypes,
    rarities,
    subtypes,
    
    // Actions
    setSearchTerm,
    updateFilter,
    toggleArrayFilter,
    clearFilters,
    applyPresetFilter,
    
    // Computed values
    buildFilterQuery,
    filterCardsByFormat,
    hasActiveFilters,
    activeFilterCount,
  };
};