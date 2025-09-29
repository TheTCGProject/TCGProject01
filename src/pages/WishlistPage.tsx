import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, Search, Filter, ArrowLeft } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import CardGrid from '../components/ui/CardGrid';
import { cn } from '../utils/cn';

/**
 * Wishlist Page Component
 * Displays and manages user's wishlist of desired cards
 */
const WishlistPage = () => {
  const navigate = useNavigate();
  const { 
    wishlist, 
    removeFromWishlist, 
    clearWishlist, 
    getWishlistBySet,
    getRecentWishlistCards 
  } = useWishlistStore();
  
  // Local state for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'dateAdded' | 'set' | 'rarity'>('dateAdded');
  const [filterBy, setFilterBy] = useState<'all' | 'recent'>('all');
  const [showClearModal, setShowClearModal] = useState(false);

  /**
   * Filter and sort wishlist based on current settings
   */
  const getFilteredAndSortedWishlist = () => {
    let filteredList = wishlist;

    // Apply search filter
    if (searchTerm) {
      filteredList = filteredList.filter(item =>
        item.card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.card.set.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply time filter
    if (filterBy === 'recent') {
      filteredList = getRecentWishlistCards(7);
    }

    // Apply sorting
    filteredList.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.card.name.localeCompare(b.card.name);
        case 'dateAdded':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'set':
          return a.card.set.name.localeCompare(b.card.set.name);
        case 'rarity':
          return (a.card.rarity || '').localeCompare(b.card.rarity || '');
        default:
          return 0;
      }
    });

    return filteredList;
  };

  const filteredWishlist = getFilteredAndSortedWishlist();
  const wishlistBySet = getWishlistBySet();

  /**
   * Handle card click navigation
   */
  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}`);
  };

  /**
   * Handle removing card from wishlist
   */
  const handleRemoveCard = (cardId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    removeFromWishlist(cardId);
  };

  /**
   * Handle clearing entire wishlist
   */
  const handleClearWishlist = () => {
    clearWishlist();
    setShowClearModal(false);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-4 text-slate-700 dark:text-slate-300"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
              <Heart className="w-8 h-8 mr-3 text-red-500 fill-current" />
              My Wishlist
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'card' : 'cards'} you want to collect
            </p>
          </div>
        </div>

        {/* Clear Wishlist Button */}
        {wishlist.length > 0 && (
          <Button
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowClearModal(true)}
          >
            Clear Wishlist
          </Button>
        )}
      </div>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Start building your wishlist by browsing cards and clicking the heart icon on cards you want to collect.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" onClick={() => navigate('/cards')}>
              Browse Cards
            </Button>
            <Button variant="outline" onClick={() => navigate('/sets')}>
              Browse Sets
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Filters and Search */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
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
                <option value="dateAdded">Sort by Date Added</option>
                <option value="name">Sort by Name</option>
                <option value="set">Sort by Set</option>
                <option value="rarity">Sort by Rarity</option>
              </select>

              {/* Filter By */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Cards</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Wishlist Grid */}
          {filteredWishlist.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">No cards match your filters</p>
              <p className="text-slate-500 dark:text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
            >
              <CardGrid
                cards={filteredWishlist.map(item => item.card)}
                onCardClick={(card) => handleCardClick(card.id)}
                showDetails={true}
                showWishlistControls={true}
                className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              />
            </motion.div>
          )}

          {/* Wishlist by Set Summary */}
          {Object.keys(wishlistBySet).length > 1 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Wishlist by Set
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(wishlistBySet).map(([setId, cards]) => {
                  const setData = cards[0].card.set;
                  return (
                    <div
                      key={setId}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/sets/${setId}`)}
                    >
                      <div className="flex items-center mb-3">
                        <img
                          src={setData.images.symbol}
                          alt={setData.name}
                          className="w-8 h-8 mr-3"
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {setData.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {cards.length} {cards.length === 1 ? 'card' : 'cards'} wanted
                          </p>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {cards.slice(0, 4).map((item, index) => (
                          <img
                            key={item.cardId}
                            src={item.card.images.small}
                            alt={item.card.name}
                            className="w-8 h-auto rounded border-2 border-white dark:border-slate-800"
                            style={{ zIndex: 4 - index }}
                          />
                        ))}
                        {cards.length > 4 && (
                          <div className="w-8 h-11 bg-slate-200 dark:bg-slate-600 rounded border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                            +{cards.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Clear Wishlist Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Clear Wishlist
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to remove all {wishlist.length} cards from your wishlist? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleClearWishlist}
              >
                Clear Wishlist
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;