import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, Eye, Target, Award, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import { Badge } from '../../types';
import { cn } from '../../utils/cn';

interface AccountOverviewProps {
  favoriteCard: any;
  topValueCards: Array<{
    card: any;
    variant: string;
    quantity: number;
    totalValue: number;
  }>;
  collectionSummary: Array<{
    setId: string;
    setData: any;
    progress: number;
    value: number;
    cardsCollected: number;
    totalCards: number;
  }>;
  earnedBadges?: Badge[];
}

const AccountOverview: React.FC<AccountOverviewProps> = ({
  favoriteCard,
  topValueCards,
  collectionSummary,
  earnedBadges = []
}) => {
  const navigate = useNavigate();
  const { showcaseBadgeIds } = useSettingsStore();

  // Get showcase badges or recent badges if no showcase is set
  const getDisplayBadges = () => {
    if (showcaseBadgeIds.length > 0) {
      return earnedBadges.filter(badge => showcaseBadgeIds.includes(badge.id)).slice(0, 4);
    }
    // Show most recent badges (assuming they have unlockedAt or use array order)
    return earnedBadges.slice(-4).reverse();
  };

  const displayBadges = getDisplayBadges();

  /**
   * Get rarity styling for special badges
   */
  const getRarityStyle = (badge: Badge) => {
    if (badge.category !== 'special' || !badge.rarity) return '';
    
    switch (badge.rarity) {
      case 'rare':
        return 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/20';
      case 'epic':
        return 'ring-2 ring-purple-400 shadow-lg shadow-purple-500/20';
      case 'legendary':
        return 'ring-2 ring-yellow-400 shadow-xl shadow-yellow-500/30';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Showcase Badges Section */}
      {displayBadges.length > 0 && (
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              {showcaseBadgeIds.length > 0 ? 'Showcase Badges' : 'Recent Achievements'}
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/account?tab=badges')}
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayBadges.map((badge) => (
              <motion.div
                key={badge.id}
                className={cn(
                  "relative bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center transition-all duration-300 hover:shadow-md",
                  getRarityStyle(badge)
                )}
                whileHover={{ scale: 1.02 }}
              >
                {/* Special badge rarity indicator */}
                {badge.category === 'special' && badge.rarity && (
                  <div className="absolute top-1 right-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      badge.rarity === 'legendary' ? 'bg-yellow-400' :
                      badge.rarity === 'epic' ? 'bg-purple-400' :
                      badge.rarity === 'rare' ? 'bg-blue-400' : 'bg-gray-400'
                    )} />
                  </div>
                )}

                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white",
                  badge.color
                )}>
                  {badge.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {badge.description}
                </p>
                
                {/* Legendary glow effect */}
                {badge.category === 'special' && badge.rarity === 'legendary' && (
                  <div className="absolute inset-0 rounded-xl bg-yellow-400/10 animate-pulse pointer-events-none" />
                )}
              </motion.div>
            ))}
          </div>
          
          {showcaseBadgeIds.length === 0 && earnedBadges.length > 4 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> You can customize which badges to showcase in your{' '}
                <button 
                  onClick={() => navigate('/settings')}
                  className="underline hover:no-underline"
                >
                  settings
                </button>
                !
              </p>
            </div>
          )}
        </section>
      )}

      {/* Favorite Card & Collection Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Favorite Card */}
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Favorite Card
          </h2>
          
          {favoriteCard ? (
            <div className="flex items-center gap-4">
              <img
                src={favoriteCard.card.images.small}
                alt={favoriteCard.card.name}
                className="w-16 h-auto rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate(`/cards/${favoriteCard.card.id}?setId=${favoriteCard.setId}`)}
              />
              <div>
                <h3 
                  className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  onClick={() => navigate(`/cards/${favoriteCard.card.id}?setId=${favoriteCard.setId}`)}
                >
                  {favoriteCard.card.name}
                </h3>
                <p className="text-success-600 dark:text-success-400 font-medium">
                  {favoriteCard.card.tcgplayer?.prices ? 
                    `$${Object.values(favoriteCard.card.tcgplayer.prices)[0]?.market?.toFixed(2) || '0.00'}` : 
                    'Price N/A'
                  }
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Change Favorite
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                No favorite card selected yet
              </p>
              <Button variant="outline" size="sm">
                Choose Favorite
              </Button>
            </div>
          )}
        </section>

        {/* Top 5 Most Valuable Cards */}
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Top 5 Most Valuable
          </h2>
          
          {topValueCards.length > 0 ? (
            <div className="space-y-3">
              {topValueCards.map((item, index) => (
                <div 
                  key={`${item.card.id}-${item.variant}`} 
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
                  onClick={() => navigate(`/cards/${item.card.id}`)}
                >
                  <span className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                    {index + 1}
                  </span>
                  <img
                    src={item.card.images.small}
                    alt={item.card.name}
                    className="w-10 h-auto rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {item.card.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.variant} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-success-600 dark:text-success-400 font-medium">
                    ${item.totalValue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 text-center py-4">
              No cards in collection yet
            </p>
          )}
        </section>
      </div>

      {/* Collection Summary */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Your Collection by Set
        </h2>
        
        {collectionSummary.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Start Your Collection
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Start collecting by visiting a set and tracking your first card!
            </p>
            <Button variant="primary" onClick={() => navigate('/sets')}>
              Browse Sets
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionSummary.map((summary) => (
              <motion.div
                key={summary.setId}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                whileHover={{ y: -4 }}
              >
                <div className="aspect-[3/1] relative overflow-hidden bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                  <img
                    src={summary.setData.images.logo}
                    alt={summary.setData.name}
                    className="absolute inset-0 w-full h-full object-contain p-4"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <img
                      src={summary.setData.images.symbol}
                      alt=""
                      className="w-6 h-6 mr-2"
                    />
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {summary.setData.name}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Progress
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {Math.round(summary.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${summary.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {summary.cardsCollected} / {summary.totalCards} cards
                      </span>
                      <span className="font-medium text-success-600 dark:text-success-400">
                        ${summary.value.toFixed(0)}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      leftIcon={<Eye className="w-4 h-4" />}
                      onClick={() => navigate(`/sets/${summary.setId}`)}
                    >
                      View Set
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AccountOverview;