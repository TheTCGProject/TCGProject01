import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadSets } from '../utils/dataLoader';
import { Search, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { Set } from '../types';

type SortField = 'name' | 'id' | 'total' | 'releaseDate' | 'series';
type SortDirection = 'asc' | 'desc';

interface FilterOptions {
  searchTerm: string;
  legality: 'standard' | 'expanded' | 'unlimited' | 'all';
  series?: string;
}

const SetsPage = () => {
  const navigate = useNavigate();
  
  // State
  const [sets, setSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('releaseDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    legality: 'all',
    series: undefined
  });

  // Cache implementation
  const CACHE_KEY = 'tcg-sets-cache';
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  // Data loading with cache
  useEffect(() => {
    const loadSetData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setSets(data);
            setIsLoading(false);
            return;
          }
        }

        // Load fresh data if no cache or cache expired
        const setsData = await loadSets();
        setSets(setsData);

        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: setsData,
          timestamp: Date.now()
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sets');
      } finally {
        setIsLoading(false);
      }
    };

    loadSetData();
  }, []);

  // Memoized filtering and sorting
  const filteredAndSortedSets = useMemo(() => {
    if (!sets.length) return [];
    
    return sets
      .filter(set => {
        const matchesSearch = 
          set.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          set.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          set.series.toLowerCase().includes(filters.searchTerm.toLowerCase());

        const matchesLegality = 
          filters.legality === 'all' || 
          (set.legality && set.legality[filters.legality]);

        const matchesSeries = 
          !filters.series || 
          set.series === filters.series;

        return matchesSearch && matchesLegality && matchesSeries;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'id':
            comparison = a.id.localeCompare(b.id);
            break;
          case 'total':
            comparison = a.total - b.total;
            break;
          case 'series':
            comparison = a.series.localeCompare(b.series);
            break;
          case 'releaseDate':
            comparison = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [sets, filters, sortField, sortDirection]);

  // Group sets by series
  const groupedSets = useMemo(() => {
    return filteredAndSortedSets.reduce((acc: Record<string, Set[]>, set) => {
      if (!acc[set.series]) {
        acc[set.series] = [];
      }
      acc[set.series].push(set);
      return acc;
    }, {});
  }, [filteredAndSortedSets]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: event.target.value
    }));
  };

  const handleLegalityFilter = (legality: FilterOptions['legality']) => {
    setFilters(prev => ({
      ...prev,
      legality
    }));
  };

  const handleSeriesFilter = (series: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      series
    }));
  };

  const toggleSeries = (series: string) => {
    setExpandedSeries(prev => ({
      ...prev,
      [series]: !prev[series]
    }));
  };

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2 dark:text-white">Error Loading Sets</h2>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  // Render
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 border-4 border-secondary-200 dark:border-secondary-800 border-t-secondary-600 dark:border-t-secondary-400 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading sets...</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" />
            <input
              type="text"
              placeholder="Search sets..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300"
              value={filters.searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg ${filters.legality === 'standard' 
              ? 'bg-blue-500 dark:bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            onClick={() => handleLegalityFilter('standard')}
          >
            Standard
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${filters.legality === 'expanded'
              ? 'bg-blue-500 dark:bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            onClick={() => handleLegalityFilter('expanded')}
          >
            Expanded
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${filters.legality === 'all'
              ? 'bg-blue-500 dark:bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            onClick={() => handleLegalityFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      {/* Sets Grid */}
      <div className="space-y-6">
        {Object.entries(groupedSets).map(([series, sets]) => (
          <div key={series} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 cursor-pointer"
              onClick={() => toggleSeries(series)}
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{series}</h2>
              {expandedSeries[series] ? <ChevronUp className="text-blue-500 dark:text-blue-400" /> : <ChevronDown className="text-blue-500 dark:text-blue-400" />}
            </div>

            {expandedSeries[series] && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {sets.map(set => (
                  <div
                    key={set.id}
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-500 transition-all cursor-pointer"
                    onClick={() => navigate(`/sets/${set.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={set.images.symbol}
                        alt={`${set.name} symbol`}
                        className="w-10 h-10 drop-shadow-sm dark:filter dark:brightness-90"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{set.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {set.total} cards • Released {new Date(set.releaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetsPage;
