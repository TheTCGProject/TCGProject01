import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchSets } from '../services/api';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

type SortField = 'name' | 'id' | 'total' | 'releaseDate';
type SortDirection = 'asc' | 'desc';

const SetsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('releaseDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>({});

  const { data: sets, isLoading } = useQuery({
    queryKey: ['sets'],
    queryFn: fetchSets,
  });

  // Sorting logic
  const sortedSets = sets?.data.slice().sort((a, b) => {
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
      case 'releaseDate':
        comparison = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Filtering logic
  const filteredSets = sortedSets?.filter(set =>
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group sets by series
  const groupBySeries = (setsArr: typeof sets.data) => {
    return setsArr?.reduce((acc: Record<string, typeof sets.data>, set) => {
      acc[set.series] = acc[set.series] || [];
      acc[set.series].push(set);
      return acc;
    }, {}) || {};
  };

  const groupedSets = groupBySeries(filteredSets || []);

  // Expand/collapse series
  const toggleSeries = (series: string) => {
    setExpandedSeries(prev => ({
      ...prev,
      [series]: !prev[series],
    }));
  };

  // Sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Sorting handler
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pokémon TCG Sets</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search sets..."
            className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700">
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Set Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    Set Code
                    <SortIcon field="id" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center">
                    Cards
                    <SortIcon field="total" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
                  onClick={() => handleSort('releaseDate')}
                >
                  <div className="flex items-center">
                    Released
                    <SortIcon field="releaseDate" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Legal In
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {(() => {
                const allSeries = Object.keys(groupedSets);
                // Place "Other" at the end
                const sortedSeries = [
                  ...allSeries.filter(series => series !== 'Other'),
                  ...allSeries.filter(series => series === 'Other'),
                ];
                return sortedSeries.map(series => (
                  <React.Fragment key={series}>
                    {/* Series header row */}
                    <tr
                      className="bg-slate-100 dark:bg-slate-900 cursor-pointer"
                      onClick={() => toggleSeries(series)}
                    >
                      <td colSpan={5} className="px-4 py-3 font-bold text-lg flex items-center">
                        <span className="mr-2">
                          {expandedSeries[series] ? <ChevronDown /> : <ChevronUp />}
                        </span>
                        {series}
                      </td>
                    </tr>
                    {/* Only show sets if this series is expanded */}
                    {expandedSeries[series] &&
                      groupedSets[series].map((set) => (
                        <tr
                          key={set.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                          onClick={() => navigate(`/sets/${set.id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={set.images.symbol}
                                alt={set.name}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = 'https://images.pokemontcg.io/placeholder.png';
                                }}
                              />
                              <span className="font-medium text-slate-900 dark:text-white">{set.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {set.id.toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {set.total}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {new Date(set.releaseDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {set.legalities.standard === 'Legal' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200">
                                  Standard
                                </span>
                              )}
                              {set.legalities.expanded === 'Legal' && (
                                <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                                  Expanded
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SetsPage;
