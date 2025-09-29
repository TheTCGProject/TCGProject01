import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckStore } from '../stores/deckStore';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  Calendar, 
  Clock,
  BarChart3,
  Share2,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

/**
 * My Decks Page Component
 * Displays and manages all user-created decks
 */
const MyDecksPage = () => {
  const navigate = useNavigate();
  const { decks, deleteDeck, createDeck } = useDeckStore();
  
  // Local state for filtering and display
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created' | 'format'>('updated');
  const [filterFormat, setFilterFormat] = useState<'all' | 'standard' | 'expanded' | 'unlimited' | 'custom'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);

  /**
   * Filter and sort decks based on current settings
   */
  const getFilteredAndSortedDecks = () => {
    let filteredDecks = decks;

    // Apply search filter
    if (searchTerm) {
      filteredDecks = filteredDecks.filter(deck =>
        deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply format filter
    if (filterFormat !== 'all') {
      filteredDecks = filteredDecks.filter(deck => deck.format === filterFormat);
    }

    // Apply sorting
    filteredDecks.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'format':
          return a.format.localeCompare(b.format);
        default:
          return 0;
      }
    });

    return filteredDecks;
  };

  const filteredDecks = getFilteredAndSortedDecks();

  /**
   * Calculate deck statistics
   */
  const calculateDeckStats = (deck: any) => {
    let stats = {
      totalCards: 0,
      pokemon: 0,
      trainer: 0,
      energy: 0,
    };

    deck.cards.forEach((deckCard: any) => {
      const card = deckCard.card;
      const qty = deckCard.quantity;
      
      stats.totalCards += qty;
      
      if (card.supertype === 'Pokémon') {
        stats.pokemon += qty;
      } else if (card.supertype === 'Trainer') {
        stats.trainer += qty;
      } else if (card.supertype === 'Energy') {
        stats.energy += qty;
      }
    });

    return stats;
  };

  /**
   * Handle creating a new deck
   */
  const handleCreateDeck = () => {
    const newDeckId = createDeck({
      name: 'New Deck',
      description: '',
      format: 'standard',
      cards: [],
      isPublic: false,
    });
    navigate(`/decks/builder?id=${newDeckId}`);
  };

  /**
   * Handle deck deletion
   */
  const handleDeleteDeck = (deckId: string) => {
    deleteDeck(deckId);
    setDeckToDelete(null);
  };

  /**
   * Get format badge styling
   */
  const getFormatBadge = (format: string) => {
    const formatStyles = {
      standard: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      expanded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      unlimited: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      custom: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    };
    return formatStyles[format as keyof typeof formatStyles] || formatStyles.custom;
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            My Decks
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'} in your collection
          </p>
        </div>
        
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={handleCreateDeck}
          className="mt-4 md:mt-0"
        >
          Create New Deck
        </Button>
      </div>

      {/* Empty State */}
      {decks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            No decks yet
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Start building your first deck! Create powerful combinations and test your strategies.
          </p>
          <Button variant="primary" leftIcon={<Plus className="w-5 h-5" />} onClick={handleCreateDeck}>
            Create Your First Deck
          </Button>
        </div>
      ) : (
        <>
          {/* Filters and Controls */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search decks..."
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="updated">Sort by Last Updated</option>
                <option value="created">Sort by Date Created</option>
                <option value="name">Sort by Name</option>
                <option value="format">Sort by Format</option>
              </select>

              {/* Format Filter */}
              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value as any)}
                className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Formats</option>
                <option value="standard">Standard</option>
                <option value="expanded">Expanded</option>
                <option value="unlimited">Unlimited</option>
                <option value="custom">Custom</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex rounded-md border border-slate-300 dark:border-slate-600 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-3 py-2 flex items-center transition-colors",
                    viewMode === 'grid'
                      ? "bg-primary-600 text-white"
                      : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-2 flex items-center transition-colors",
                    viewMode === 'list'
                      ? "bg-primary-600 text-white"
                      : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Decks Display */}
          {filteredDecks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">No decks match your filters</p>
              <p className="text-slate-500 dark:text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredDecks.map((deck) => {
                const stats = calculateDeckStats(deck);
                return (
                  <motion.div
                    key={deck.id}
                    variants={item}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                    whileHover={{ y: -4 }}
                  >
                    {/* Deck Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                            {deck.name}
                          </h3>
                          {deck.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {deck.description}
                            </p>
                          )}
                        </div>
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium ml-2", getFormatBadge(deck.format))}>
                          {deck.format.charAt(0).toUpperCase() + deck.format.slice(1)}
                        </span>
                      </div>

                      {/* Deck Stats */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalCards}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.pokemon}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Pokémon</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.trainer}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Trainer</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.energy}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Energy</div>
                        </div>
                      </div>

                      {/* Deck Meta */}
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-4">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Updated {new Date(deck.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Deck Actions */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={() => navigate(`/decks/${deck.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          leftIcon={<Edit className="w-4 h-4" />}
                          onClick={() => navigate(`/decks/builder?id=${deck.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => setDeckToDelete(deck.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* List View */
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Deck Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Format
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Cards
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredDecks.map((deck) => {
                      const stats = calculateDeckStats(deck);
                      return (
                        <tr key={deck.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {deck.name}
                              </div>
                              {deck.description && (
                                <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                                  {deck.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getFormatBadge(deck.format))}>
                              {deck.format.charAt(0).toUpperCase() + deck.format.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-slate-900 dark:text-white font-medium">{stats.totalCards}</span>
                              <div className="flex space-x-2 text-xs">
                                <span className="text-blue-600 dark:text-blue-400">{stats.pokemon}P</span>
                                <span className="text-green-600 dark:text-green-400">{stats.trainer}T</span>
                                <span className="text-yellow-600 dark:text-yellow-400">{stats.energy}E</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {new Date(deck.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/decks/${deck.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/decks/builder?id=${deck.id}`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setDeckToDelete(deck.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deckToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Delete Deck
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete "{decks.find(d => d.id === deckToDelete)?.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeckToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => handleDeleteDeck(deckToDelete)}
              >
                Delete Deck
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDecksPage;