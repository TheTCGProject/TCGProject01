import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, ChevronDown, X, AlertTriangle } from 'lucide-react';
import { fetchCards } from '../services/api';
import CardGrid from '../components/ui/CardGrid';
import Button from '../components/ui/Button';
import { useCardFilters } from '../hooks/useCardFilters';
import { getStandardLegalityExplanation } from '../utils/cardLegality';

const CardDatabasePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Use custom hook for filter management
  const {
    filters,
    searchTerm,
    pokemonTypes,
    rarities,
    subtypes,
    setSearchTerm,
    updateFilter,
    toggleArrayFilter,
    clearFilters,
    buildFilterQuery,
    filterCardsByFormat,
    hasActiveFilters,
    activeFilterCount
  } = useCardFilters();
  
  // Initialize search term from URL
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search') || '';
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, []);
  
  // Pagination settings
  const pageSize = 24;
  
  // Handle search term changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchParams.set('search', searchTerm);
      } else {
        searchParams.delete('search');
      }
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  
  // Fetch cards with current filters and pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['cards', page, searchTerm, filters],
    queryFn: () => fetchCards({
      page,
      pageSize: filters.format ? pageSize * 3 : pageSize, // Fetch more cards when format filtering to account for client-side filtering
      q: buildFilterQuery,
      orderBy: 'name',
    }),
  });

  // Apply client-side format filtering
  const filteredCards = data?.data ? filterCardsByFormat(data.data) : [];
  
  // Slice to correct page size if we fetched extra for format filtering
  const displayCards = filters.format ? filteredCards.slice(0, pageSize) : filteredCards;
  
  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}`);
  };
  
  const handleClearFilters = () => {
    clearFilters();
    setPage(1);
    navigate('/cards');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Card Database</h1>
        
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search for cards..."
                className="pl-10 pr-4 py-2 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-5 w-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                className="flex items-center"
                onClick={handleClearFilters}
              >
                <X className="mr-2 h-5 w-5" />
                Clear
              </Button>
            )}
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Types Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {pokemonTypes.map((type) => (
                    <button
                      key={type}
                      className={`px-2 py-1 text-xs rounded-full ${
                        filters.types.includes(type)
                          ? 'bg-primary-500 text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                      onClick={() => toggleArrayFilter('types', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Subtypes Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subtypes
                </label>
                <div className="flex flex-wrap gap-2">
                  {subtypes.map((subtype) => (
                    <button
                      key={subtype}
                      className={`px-2 py-1 text-xs rounded-full ${
                        filters.subtypes.includes(subtype)
                          ? 'bg-secondary-500 text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                      onClick={() => toggleArrayFilter('subtypes', subtype)}
                    >
                      {subtype}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rarity Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rarity
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2"
                  value={filters.rarity}
                  onChange={(e) => updateFilter('rarity', e.target.value)}
                >
                  <option value="">All Rarities</option>
                  {rarities.map((rarity) => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
              </div>

              {/* Format Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Format
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2"
                  value={filters.format}
                  onChange={e => updateFilter('format', e.target.value)}
                >
                  <option value="">All Formats</option>
                  <option value="standard">Standard (2025)</option>
                  <option value="expanded">Expanded</option>
                </select>
              </div>
            </div>
          )}

          {/* Format Filter Warning */}
          {filters.format === 'standard' && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-800 dark:text-amber-200 font-medium">Standard Format (2025)</p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    Only showing cards with regulation marks G and H. Sword & Shield series cards have rotated out as of April 2025.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Cards Display */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error-600 dark:text-error-400 text-lg mb-2">Failed to load cards</p>
            <p className="text-slate-600 dark:text-slate-400">Please try again later</p>
          </div>
        ) : (
          <>
            {displayCards && displayCards.length > 0 ? (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    Showing {displayCards.length} cards
                    {filters.format && (
                      <span className="ml-2 text-sm text-amber-600 dark:text-amber-400">
                        (filtered by {filters.format} legality)
                      </span>
                    )}
                  </p>
                </div>
                
                <CardGrid 
                  cards={displayCards} 
                  onCardClick={(card) => handleCardClick(card.id)}
                />
                
                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md">
                      Page {page}
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => p + 1)}
                      disabled={displayCards.length < pageSize}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">No cards found</p>
                <p className="text-slate-500 dark:text-slate-500">Try adjusting your search or filters</p>
                {filters.format && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    Note: {filters.format} format filtering may significantly reduce results
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardDatabasePage;