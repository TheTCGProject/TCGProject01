import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCards, fetchSets, buildQuery } from '../services/api';
import { useDeckStore } from '../stores/deckStore';
import { useToast } from '../components/ui/Toast';
import { Save, Download, Share2, Trash2, Edit, X, Search, Filter, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import CardGrid from '../components/ui/CardGrid';
import { cn } from '../utils/cn';
import { isStandardLegal, isExpandedLegal, getStandardLegalityExplanation } from '../utils/cardLegality';

/**
 * Deck Builder Page Component
 * Comprehensive deck building interface with format filtering and card management
 */
const DeckBuilderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const deckId = queryParams.get('id');
  const { showToast } = useToast();

  // Deck store hooks
  const decks = useDeckStore(state => state.decks);
  const createDeck = useDeckStore(state => state.createDeck);
  const updateDeck = useDeckStore(state => state.updateDeck);
  const deleteDeck = useDeckStore(state => state.deleteDeck);
  const addCardToDeck = useDeckStore(state => state.addCardToDeck);
  const removeCardFromDeck = useDeckStore(state => state.removeCardFromDeck);
  const updateCardQuantity = useDeckStore(state => state.updateCardQuantity);

  // Get current deck
  const deck = decks.find(d => d.id === deckId);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [selectedTab, setSelectedTab] = useState('builder');
  const [selectedCardType, setSelectedCardType] = useState<'pokemon' | 'trainer' | 'energy' | 'all'>('pokemon');
  const [selectedFormat, setSelectedFormat] = useState<'standard' | 'expanded' | 'unlimited'>('standard');
  const [showFilters, setShowFilters] = useState(false);
  const [browserCardType, setBrowserCardType] = useState<'pokemon' | 'trainer' | 'energy' | 'all'>('all');

  // Enhanced Card Browser Filter States
  const [browserFilters, setBrowserFilters] = useState({
    rarity: '',
    set: '',
    hpMin: '',
    hpMax: '',
    retreatCostMin: '',
    retreatCostMax: '',
    subtypes: [] as string[],
  });

  // Fetch sets data for filter dropdown
  const { data: setsData } = useQuery({
    queryKey: ['sets'],
    queryFn: fetchSets,
  });

  // Available filter options
  const rarities = [
    'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Rare Secret',
    'Illustration Rare', 'Special Illustration Rare', 'Hyper Rare'
  ];

  const subtypes = [
    'Basic', 'Stage 1', 'Stage 2', 'VMAX', 'VSTAR', 'ex', 'EX', 'GX', 'V',
    'Item', 'Supporter', 'Stadium', 'Tool', 'Special Energy', 'Basic Energy'
  ];

  /**
   * Build search query based on current filters
   */
  function getCardQuery(searchTerm: string, format: 'standard' | 'expanded' | 'unlimited', cardType: 'pokemon' | 'trainer' | 'energy' | 'all') {
    let queryObj: Record<string, any> = {};
    
    // Add search term if provided
    if (searchTerm.trim()) {
      queryObj.name = searchTerm.trim();
    }
    
    // Add card type filter
    if (cardType !== 'all') {
      switch (cardType) {
        case 'pokemon':
          queryObj.supertype = 'Pokémon';
          break;
        case 'trainer':
          queryObj.supertype = 'Trainer';
          break;
        case 'energy':
          queryObj.supertype = 'Energy';
          break;
      }
    } else if (!searchTerm.trim()) {
      // Default to Pokemon cards if no search term and no type filter
      queryObj.supertype = 'Pokémon';
    }

    // Add enhanced browser filters
    if (browserFilters.rarity) {
      queryObj.rarity = browserFilters.rarity;
    }

    if (browserFilters.set) {
      queryObj['set.id'] = browserFilters.set;
    }

    if (browserFilters.subtypes.length > 0) {
      queryObj.subtypes = browserFilters.subtypes;
    }

    // HP range filter
    if (browserFilters.hpMin || browserFilters.hpMax) {
      const hpFilter: Record<string, number> = {};
      if (browserFilters.hpMin) hpFilter.min = parseInt(browserFilters.hpMin);
      if (browserFilters.hpMax) hpFilter.max = parseInt(browserFilters.hpMax);
      queryObj.hp = hpFilter;
    }

    // Retreat cost range filter
    if (browserFilters.retreatCostMin || browserFilters.retreatCostMax) {
      const retreatFilter: Record<string, number> = {};
      if (browserFilters.retreatCostMin) retreatFilter.min = parseInt(browserFilters.retreatCostMin);
      if (browserFilters.retreatCostMax) retreatFilter.max = parseInt(browserFilters.retreatCostMax);
      queryObj.convertedRetreatCost = retreatFilter;
    }
    
    return buildQuery(queryObj);
  }

  // Fetch cards for the card browser
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['cardSearch', searchTerm, selectedFormat, browserCardType, browserFilters],
    queryFn: () => fetchCards({
      pageSize: selectedFormat === 'unlimited' ? 24 : 48, // Fetch more for format filtering
      q: getCardQuery(searchTerm, selectedFormat, browserCardType),
      orderBy: 'name',
    }),
    enabled: selectedTab === 'builder',
  });

  // Filter cards by format legality client-side
  const getFilteredCards = () => {
    if (!searchResults?.data) return [];
    
    if (selectedFormat === 'unlimited') {
      return searchResults.data;
    }
    
    return searchResults.data.filter(card => {
      if (selectedFormat === 'standard') {
        return isStandardLegal(card);
      } else if (selectedFormat === 'expanded') {
        return isExpandedLegal(card);
      }
      return true;
    }).slice(0, 24); // Limit to reasonable number for display
  };

  const filteredCards = getFilteredCards();
  
  // Handle deck creation and navigation when no valid deck exists
  useEffect(() => {
    if (!deckId || !decks.find(d => d.id === deckId)) {
      const newId = createDeck({
        name: 'New Deck',
        description: '',
        format: 'standard',
        cards: [],
        isPublic: false,
      });
      navigate(`/decks/builder?id=${newId}`, { replace: true });
    }
  }, [deckId, createDeck, navigate, decks]);

  // Update local state when deck changes
  useEffect(() => {
    if (deck) {
      if (deckName !== deck.name) {
        setDeckName(deck.name);
      }
      if (deckDescription !== (deck.description || '')) {
        setDeckDescription(deck.description || '');
      }
      // Update selected format to match deck format
      if (deck.format !== selectedFormat) {
        setSelectedFormat(deck.format as 'standard' | 'expanded' | 'unlimited');
      }
    }
  }, [deck]);

  /**
   * Update deck name and description
   */
  const handleSaveDeckInfo = () => {
    if (deck && deckId) {
      updateDeck(deckId, {
        name: deckName,
        description: deckDescription,
        format: selectedFormat,
      });
      setIsEditingName(false);
      showToast('Deck information updated successfully!', 'success', { duration: 2000 });
    }
  };

  /**
   * Add card to deck with validation and toast notifications
   */
  const handleAddCard = (card: any) => {
    if (!deckId) return;

    // Check format legality with improved logic
    let isLegal = true;
    let errorMessage = '';

    if (selectedFormat === 'standard') {
      isLegal = isStandardLegal(card);
      if (!isLegal) {
        errorMessage = getStandardLegalityExplanation(card) || 'This card is not legal in Standard format.';
      }
    } else if (selectedFormat === 'expanded') {
      isLegal = isExpandedLegal(card);
      if (!isLegal) {
        errorMessage = 'This card is not legal in Expanded format.';
      }
    }
    // Unlimited allows all cards

    if (!isLegal) {
      showToast(errorMessage, 'error', { 
        duration: 5000,
        action: {
          label: 'Learn More',
          onClick: () => navigate('/help')
        }
      });
      return;
    }

    // Check 4-copy rule for non-energy cards
    if (card.supertype !== 'Energy') {
      const currentCard = deck?.cards.find(dc => dc.cardId === card.id);
      const currentQty = currentCard?.quantity || 0;
      if (currentQty >= 4) {
        showToast(
          `You already have 4 copies of "${card.name}" in your deck. You can only have up to 4 copies of any card (except basic Energy cards).`,
          'warning',
          { 
            duration: 6000,
            action: {
              label: 'View Deck Rules',
              onClick: () => navigate('/help')
            }
          }
        );
        return;
      }
    }

    // Add card and show success notification
    addCardToDeck(deckId, card);
    showToast(`Added "${card.name}" to your deck!`, 'success', { 
      duration: 3000,
      action: {
        label: 'View Deck',
        onClick: () => setSelectedTab('builder') // Switch to deck view
      }
    });
  };

  /**
   * Remove card from deck
   */
  const handleRemoveCard = (cardId: string) => {
    if (deckId) {
      const cardInDeck = deck?.cards.find(dc => dc.cardId === cardId);
      removeCardFromDeck(deckId, cardId, 1);
      
      if (cardInDeck) {
        showToast(`Removed "${cardInDeck.card.name}" from deck`, 'info', { duration: 2000 });
      }
    }
  };

  /**
   * Handle deck actions from card grid
   */
  const handleDeckAction = (card: any, action: 'add' | 'remove', quantity: number = 1) => {
    if (action === 'add') {
      handleAddCard(card);
    } else {
      handleRemoveCard(card.id);
    }
  };

  /**
   * Change card quantity with validation
   */
  const handleQuantityChange = (cardId: string, quantity: number) => {
    if (!deckId) return;

    const card = deck?.cards.find(dc => dc.cardId === cardId)?.card;
    
    // Validate 4-copy rule for non-energy cards
    if (card?.supertype !== 'Energy' && quantity > 4) {
      showToast(
        `You can only have up to 4 copies of "${card?.name || 'this card'}" (except basic Energy cards).`,
        'warning',
        { duration: 4000 }
      );
      return;
    }
    
    updateCardQuantity(deckId, cardId, quantity);
    
    if (quantity === 0 && card) {
      showToast(`Removed "${card.name}" from deck`, 'info', { duration: 2000 });
    }
  };

  /**
   * Delete the current deck
   */
  const handleDeleteDeck = () => {
    if (deckId && window.confirm('Are you sure you want to delete this deck?')) {
      deleteDeck(deckId);
      showToast('Deck deleted successfully', 'info', { duration: 3000 });
      navigate('/');
    }
  };

  /**
   * Handle format change
   */
  const handleFormatChange = (newFormat: 'standard' | 'expanded' | 'unlimited') => {
    setSelectedFormat(newFormat);
    if (deck && deckId) {
      updateDeck(deckId, { format: newFormat });
      showToast(`Deck format changed to ${newFormat}`, 'info', { duration: 2000 });
    }
  };

  /**
   * Handle deck list card type selection
   * This also updates the browser card type filter
   */
  const handleDeckCardTypeChange = (type: 'pokemon' | 'trainer' | 'energy' | 'all') => {
    setSelectedCardType(type);
    // Update browser filter to match the selected deck list type
    setBrowserCardType(type);
  };

  /**
   * Filter deck cards by type
   */
  const getFilteredDeckCards = () => {
    if (!deck) return [];
    if (selectedCardType === 'all') return deck.cards; // Show all cards for Full Deck view
    
    return deck.cards.filter((deckCard: any) => {
      const card = deckCard.card;
      if (selectedCardType === 'pokemon') return card.supertype === 'Pokémon';
      if (selectedCardType === 'trainer') return card.supertype === 'Trainer';
      if (selectedCardType === 'energy') return card.supertype === 'Energy';
      return true;
    });
  };

  /**
   * Update browser filter
   */
  const updateBrowserFilter = (key: string, value: any) => {
    setBrowserFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Toggle subtype filter
   */
  const toggleSubtypeFilter = (subtype: string) => {
    setBrowserFilters(prev => ({
      ...prev,
      subtypes: prev.subtypes.includes(subtype)
        ? prev.subtypes.filter(s => s !== subtype)
        : [...prev.subtypes, subtype]
    }));
  };

  /**
   * Clear all browser filters
   */
  const clearBrowserFilters = () => {
    setBrowserFilters({
      rarity: '',
      set: '',
      hpMin: '',
      hpMax: '',
      retreatCostMin: '',
      retreatCostMax: '',
      subtypes: [],
    });
  };

  /**
   * Get active filter count for browser
   */
  const getActiveBrowserFilterCount = () => {
    let count = 0;
    if (browserFilters.rarity) count++;
    if (browserFilters.set) count++;
    if (browserFilters.hpMin || browserFilters.hpMax) count++;
    if (browserFilters.retreatCostMin || browserFilters.retreatCostMax) count++;
    if (browserFilters.subtypes.length > 0) count++;
    return count;
  };

  /**
   * Calculate deck statistics
   */
  const calculateDeckStats = () => {
    if (!deck) return { totalCards: 0, pokemon: 0, trainer: 0, energy: 0, types: {} };
    
    let stats = {
      totalCards: 0,
      pokemon: 0,
      trainer: 0,
      energy: 0,
      types: {} as Record<string, number>,
    };
    
    deck.cards.forEach((deckCard: any) => {
      const card = deckCard.card;
      const qty = deckCard.quantity;
      
      stats.totalCards += qty;
      
      if (card.supertype === 'Pokémon') {
        stats.pokemon += qty;
        if (card.types) {
          card.types.forEach((type: string) => {
            stats.types[type] = (stats.types[type] || 0) + qty;
          });
        } else {
          stats.types['Colorless'] = (stats.types['Colorless'] || 0) + qty;
        }
      } else if (card.supertype === 'Trainer') {
        stats.trainer += qty;
      } else if (card.supertype === 'Energy') {
        stats.energy += qty;
      }
    });
    
    return stats;
  };

  // Prepare data for display
  const deckStats = calculateDeckStats();
  const filteredDeckCards = getFilteredDeckCards();
  const cardsWithQuantities = deck?.cards.reduce((acc: Record<string, number>, deckCard: any) => {
    acc[deckCard.cardId] = deckCard.quantity;
    return acc;
  }, {}) || {};

  // Loading state
  if (!deck) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin h-8 w-8 border-t-2 border-primary-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Deck Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex flex-col gap-2">
              <input
                value={deckName}
                onChange={e => setDeckName(e.target.value)}
                className="text-xl font-semibold bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-primary-500 outline-none text-slate-900 dark:text-white"
                placeholder="Deck name"
                autoFocus
              />
              <textarea
                value={deckDescription}
                onChange={e => setDeckDescription(e.target.value)}
                className="bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none text-slate-600 dark:text-slate-400"
                placeholder="Deck description (optional)"
                rows={2}
              />
              <div className="flex gap-2 mt-1">
                <Button size="sm" onClick={handleSaveDeckInfo}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{deckName}</h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-500 hover:text-primary-500 transition-colors"
                  aria-label="Edit deck name"
                >
                  <Edit size={18} />
                </button>
              </div>
              {deckDescription && (
                <p className="text-slate-500 dark:text-slate-400 mt-1">{deckDescription}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" leftIcon={<Save size={18} />}>Save</Button>
          <Button variant="ghost" leftIcon={<Download size={18} />}>Export</Button>
          <Button variant="ghost" leftIcon={<Share2 size={18} />}>Share</Button>
          <Button
            variant="ghost"
            className="text-error-600 hover:text-error-700"
            leftIcon={<Trash2 size={18} />}
            onClick={handleDeleteDeck}
            aria-label="Delete deck"
          />
        </div>
      </header>

      {/* Format Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Format:</h3>
          <div className="flex gap-2">
            {(['standard', 'expanded', 'unlimited'] as const).map(format => (
              <button
                key={format}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedFormat === format
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                )}
                onClick={() => handleFormatChange(format)}
              >
                {format.charAt(0).toUpperCase() + format.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Format Description with Legality Warning */}
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {selectedFormat === 'standard' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-800 dark:text-amber-200 font-medium">Standard Format (2025)</p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    Only cards with regulation marks G and H are legal. Sword & Shield series cards have rotated out as of April 2025.
                  </p>
                </div>
              </div>
            </div>
          )}
          {selectedFormat === 'expanded' && "Expanded format includes a larger card pool from Black & White series onwards."}
          {selectedFormat === 'unlimited' && "Unlimited format allows cards from all sets with no restrictions."}
        </div>
      </div>

      {/* Deck Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: deckStats.totalCards, color: 'text-slate-900 dark:text-white' },
          { label: 'Pokémon', value: deckStats.pokemon, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Trainer', value: deckStats.trainer, color: 'text-green-600 dark:text-green-400' },
          { label: 'Energy', value: deckStats.energy, color: 'text-yellow-600 dark:text-yellow-400' }
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center shadow-sm">
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <nav className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-6">
        {['builder', 'analysis'].map(tab => (
          <button
            key={tab}
            className={cn(
              "px-4 py-2 font-medium transition-colors",
              selectedTab === tab
                ? "border-b-2 border-primary-500 text-primary-600 dark:text-primary-400"
                : "text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400"
            )}
            onClick={() => setSelectedTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Builder Tab */}
      {selectedTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deck List */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Deck List</h3>
                <div className="flex gap-1">
                  {(['pokemon', 'trainer', 'energy', 'all'] as const).map(type => (
                    <button
                      key={type}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                        selectedCardType === type
                          ? "bg-primary-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      )}
                      onClick={() => handleDeckCardTypeChange(type)}
                    >
                      {type === 'all' ? 'Full Deck' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {filteredDeckCards.length === 0 ? (
                  <div className="text-center text-slate-400 dark:text-slate-500 py-8">
                    {selectedCardType === 'all' 
                      ? 'No cards in your deck yet.' 
                      : `No ${selectedCardType} cards in your deck yet.`
                    }
                  </div>
                ) : (
                  filteredDeckCards.map(deckCard => (
                    <div
                      key={deckCard.cardId}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <img
                        src={deckCard.card.images.small}
                        alt={deckCard.card.name}
                        className="w-10 h-auto rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {deckCard.card.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {deckCard.card.set.name} · {deckCard.card.number}/{deckCard.card.set.printedTotal}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="w-6 h-6 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-colors"
                          onClick={() => handleQuantityChange(deckCard.cardId, Math.max(0, deckCard.quantity - 1))}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-slate-900 dark:text-white">
                          {deckCard.quantity}
                        </span>
                        <button
                          className="w-6 h-6 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-green-500 hover:text-white transition-colors"
                          onClick={() => handleQuantityChange(deckCard.cardId, deckCard.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          className="w-6 h-6 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-600 text-error-600 hover:bg-error-500 hover:text-white transition-colors ml-1"
                          onClick={() => handleRemoveCard(deckCard.cardId)}
                          aria-label="Remove card"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Card Browser */}
          <main className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Card Browser
                  {browserCardType !== 'all' && (
                    <span className="ml-2 text-sm font-normal text-slate-600 dark:text-slate-400">
                      - {browserCardType.charAt(0).toUpperCase() + browserCardType.slice(1)} Cards
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Card Type Filter */}
                  <select
                    value={browserCardType}
                    onChange={(e) => setBrowserCardType(e.target.value as any)}
                    className="px-3 py-1 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="pokemon">Pokémon</option>
                    <option value="trainer">Trainer</option>
                    <option value="energy">Energy</option>
                  </select>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Filter className="w-4 h-4" />}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filters
                    {getActiveBrowserFilterCount() > 0 && (
                      <span className="ml-2 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {getActiveBrowserFilterCount()}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for cards..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Enhanced Filters */}
              {showFilters && (
                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Rarity Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Rarity
                      </label>
                      <select
                        value={browserFilters.rarity}
                        onChange={(e) => updateBrowserFilter('rarity', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">All Rarities</option>
                        {rarities.map((rarity) => (
                          <option key={rarity} value={rarity}>{rarity}</option>
                        ))}
                      </select>
                    </div>

                    {/* Set Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Set
                      </label>
                      <select
                        value={browserFilters.set}
                        onChange={(e) => updateBrowserFilter('set', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">All Sets</option>
                        {setsData?.data?.slice(0, 20).map((set) => (
                          <option key={set.id} value={set.id}>{set.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* HP Range */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        HP Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={browserFilters.hpMin}
                          onChange={(e) => updateBrowserFilter('hpMin', e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={browserFilters.hpMax}
                          onChange={(e) => updateBrowserFilter('hpMax', e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    {/* Retreat Cost Range */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Retreat Cost
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={browserFilters.retreatCostMin}
                          onChange={(e) => updateBrowserFilter('retreatCostMin', e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={browserFilters.retreatCostMax}
                          onChange={(e) => updateBrowserFilter('retreatCostMax', e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    {/* Subtypes Filter */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Subtypes
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {subtypes.slice(0, 8).map((subtype) => (
                          <button
                            key={subtype}
                            className={cn(
                              "px-2 py-1 text-xs rounded-full transition-colors",
                              browserFilters.subtypes.includes(subtype)
                                ? "bg-primary-500 text-white"
                                : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500"
                            )}
                            onClick={() => toggleSubtypeFilter(subtype)}
                          >
                            {subtype}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearBrowserFilters}
                      disabled={getActiveBrowserFilterCount() === 0}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Card Grid */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-t-2 border-primary-500 rounded-full"></div>
                  </div>
                ) : (
                  <>
                    {filteredCards.length === 0 && searchResults?.data && searchResults.data.length > 0 && (
                      <div className="text-center py-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-4">
                        <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                        <p className="text-amber-800 dark:text-amber-200 font-medium">No cards match format requirements</p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                          Found {searchResults.data.length} cards, but none are legal in {selectedFormat} format
                        </p>
                      </div>
                    )}
                    <CardGrid
                      cards={filteredCards}
                      showDeckControls={true}
                      onDeckAction={handleDeckAction}
                      cardQuantities={cardsWithQuantities}
                      className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    />
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Analysis Tab */}
      {selectedTab === 'analysis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Type Distribution</h2>
            {Object.keys(deckStats.types).length === 0 ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-slate-600 dark:text-slate-400">
                  No Pokémon cards in your deck yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(deckStats.types).map(([type, count]) => {
                  const percentage = Math.round((count / deckStats.pokemon) * 100);
                  return (
                    <div key={type}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-slate-900 dark:text-white">{type}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {count} cards ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Categories */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Card Categories</h2>
            <div className="space-y-4">
              {[
                { label: 'Pokémon', count: deckStats.pokemon, color: 'bg-blue-600' },
                { label: 'Trainer', count: deckStats.trainer, color: 'bg-green-600' },
                { label: 'Energy', count: deckStats.energy, color: 'bg-yellow-600' }
              ].map(({ label, count, color }) => {
                const percentage = deckStats.totalCards ? Math.round((count / deckStats.totalCards) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-900 dark:text-white">{label}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {count} cards ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                      <div
                        className={cn(color, "h-4 rounded-full transition-all duration-300")}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Recommendations */}
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">Deck Recommendations</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {deckStats.totalCards < 60 && (
                  <li>Add {60 - deckStats.totalCards} more cards to reach the standard 60-card deck size</li>
                )}
                {deckStats.totalCards > 60 && (
                  <li>Remove {deckStats.totalCards - 60} cards to meet the standard 60-card limit</li>
                )}
                {deckStats.pokemon < 15 && (
                  <li>Consider adding more Pokémon cards (15-20 recommended for consistency)</li>
                )}
                {deckStats.energy < 10 && (
                  <li>Consider adding more Energy cards to power your attacks</li>
                )}
                {deckStats.trainer < 15 && (
                  <li>Add more Trainer cards to support your strategy</li>
                )}
                {Object.keys(deckStats.types).length > 3 && (
                  <li>Consider focusing on fewer energy types for better consistency</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckBuilderPage;