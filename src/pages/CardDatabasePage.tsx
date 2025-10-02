import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, ChevronDown, X, AlertTriangle } from 'lucide-react';
import { fetchCards } from '../services/api';
import CardGrid from '../components/ui/CardGrid';
import Button from '../components/ui/Button';
import { useSettingsStore } from '../stores/settingsStore';
import { isLegal } from '../utils/cardLegality';
import { Card } from '../types';

const ALL_FORMATS = [
  { value: '', label: 'All Formats' },
  { value: 'standard', label: 'Standard' },
  { value: 'expanded', label: 'Expanded' },
];

const CardDatabasePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const language = useSettingsStore(state => state.language);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [format, setFormat] = useState<'standard' | 'expanded' | ''>('');
  const [types, setTypes] = useState<string[]>([]);
  const [rarity, setRarity] = useState<string>('');

  // Debounce update of search params in URL
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchParams.set('search', searchTerm);
      } else {
        searchParams.delete('search');
      }
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, location.pathname, navigate, searchParams]);

  const pageSize = 24;
  const filterQuery = searchTerm;

  // Properly type the fetch function result
  const { data, isLoading, error } = useQuery<{ data: Card[] }>({
    queryKey: ['cards', page, searchTerm, types, rarity, format, language],
    queryFn: () => fetchCards({
      page,
      pageSize: format ? pageSize * 3 : pageSize,
      q: filterQuery,
      orderBy: 'name',
      // Add extra filter fields if your API supports it
    }),
  });

  let filteredCards: Card[] = data?.data ?? [];
  if (format) {
    filteredCards = filteredCards.filter(card => isLegal(card, format));
  }
  if (types.length > 0) {
    filteredCards = filteredCards.filter(card => card.types && types.some(type => card.types?.includes(type)));
  }
  if (rarity) {
    filteredCards = filteredCards.filter(card => card.rarity === rarity);
  }
  const displayCards = filteredCards.slice(0, pageSize);

  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}`);
  };
  const handleClearFilters = () => {
    setTypes([]);
    setRarity('');
    setFormat('');
    setSearchTerm('');
    setPage(1);
    navigate('/cards');
  };
  const activeFilterCount = types.length + (rarity ? 1 : 0) + (format ? 1 : 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Card Database</h1>
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
            {activeFilterCount > 0 && (
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
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Types</label>
                <div className="flex flex-wrap gap-2">
                  {["Fire","Water","Grass","Lightning","Psychic","Fighting","Darkness","Metal","Fairy","Dragon","Colorless"].map((type) => (
                    <button
                      key={type}
                      className={`px-2 py-1 text-xs rounded-full ${types.includes(type)
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                      onClick={() => {
                        setTypes(t => t.includes(type) ? t.filter(v => v !== type) : [...t, type]);
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rarity</label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2"
                  value={rarity}
                  onChange={e => setRarity(e.target.value)}
                >
                  <option value="">All Rarities</option>
                  {["Common","Uncommon","Rare","Rare Holo","Rare Ultra","Rare Secret"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Format</label>
                <select
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2"
                  value={format}
                  onChange={e => setFormat(e.target.value as 'standard' | 'expanded' | '')}
                >
                  {ALL_FORMATS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {format === 'standard' && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-800 dark:text-amber-200 font-medium">Standard Format</p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  Only showing cards legal in Standard (automatically updated).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-error-600 dark:text-error-400 text-lg mb-2">Failed to load cards</p>
        </div>
      ) : (
        <>
          {displayCards.length > 0 ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-slate-600 dark:text-slate-400">
                  Showing {displayCards.length} cards
                  {format && (
                    <span className="ml-2 text-sm text-amber-600 dark:text-amber-400">
                      (filtered by {format} legality)
                    </span>
                  )}
                </p>
              </div>
              <CardGrid
                cards={displayCards}
                onCardClick={(card) => handleCardClick(card.id)}
              />
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >Previous</Button>
                  <span className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md">
                    Page {page}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={displayCards.length < pageSize}
                  >Next</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">No cards found</p>
              <p className="text-slate-500 dark:text-slate-500">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CardDatabasePage;