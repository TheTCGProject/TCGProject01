import React from 'react';
import { Award, Lock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Badge } from '../../types';

interface AccountBadgesProps {
  standardEarnedBadges: Badge[];
  specialEarnedBadges: Badge[];
  standardLockedBadges: Badge[];
  specialLockedBadges: Badge[];
  stats: any;
}

const AccountBadges: React.FC<AccountBadgesProps> = ({ 
  standardEarnedBadges, 
  specialEarnedBadges,
  standardLockedBadges,
  specialLockedBadges,
  stats
}) => {
  
  /**
   * Get rarity styling for special badges
   */
  const getRarityStyle = (rarity?: string) => {
    switch (rarity) {
      case 'common':
        return 'ring-2 ring-gray-300 dark:ring-gray-600';
      case 'rare':
        return 'ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg shadow-blue-500/20';
      case 'epic':
        return 'ring-2 ring-purple-400 dark:ring-purple-500 shadow-lg shadow-purple-500/20';
      case 'legendary':
        return 'ring-4 ring-yellow-400 dark:ring-yellow-500 shadow-xl shadow-yellow-500/30 animate-pulse-slow';
      default:
        return '';
    }
  };

  /**
   * Get rarity text color
   */
  const getRarityTextColor = (rarity?: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 dark:text-gray-400';
      case 'rare':
        return 'text-blue-600 dark:text-blue-400';
      case 'epic':
        return 'text-purple-600 dark:text-purple-400';
      case 'legendary':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  /**
   * Render badge card with progress for locked badges
   */
  const renderBadge = (badge: Badge, isUnlocked: boolean) => {
    const progress = badge.getRequirementProgress ? badge.getRequirementProgress(stats) : 0;
    const isSpecial = badge.category === 'special';
    
    return (
      <motion.div
        key={badge.id}
        className={cn(
          "relative bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 text-center transition-all duration-300",
          isUnlocked ? "hover:shadow-lg" : "opacity-75",
          isSpecial && isUnlocked && getRarityStyle(badge.rarity)
        )}
        whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Special badge rarity indicator */}
        {isSpecial && isUnlocked && badge.rarity && (
          <div className="absolute top-2 right-2">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
              getRarityTextColor(badge.rarity),
              badge.rarity === 'legendary' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
              badge.rarity === 'epic' ? 'bg-purple-100 dark:bg-purple-900/20' :
              badge.rarity === 'rare' ? 'bg-blue-100 dark:bg-blue-900/20' :
              'bg-gray-100 dark:bg-gray-900/20'
            )}>
              {badge.rarity}
            </span>
          </div>
        )}

        {/* Badge icon */}
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white relative",
          isUnlocked ? badge.color : "bg-slate-300 dark:bg-slate-600"
        )}>
          {isUnlocked ? badge.icon : <Lock className="w-6 h-6 text-slate-500" />}
          
          {/* Legendary glow effect */}
          {isSpecial && isUnlocked && badge.rarity === 'legendary' && (
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
          )}
        </div>

        {/* Badge name */}
        <h3 className={cn(
          "font-semibold mb-2",
          isUnlocked ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
        )}>
          {badge.name}
        </h3>

        {/* Badge description */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {badge.description}
        </p>

        {/* Progress bar for locked badges */}
        {!isUnlocked && badge.getRequirementProgress && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Progress
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isSpecial ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-primary-500"
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Unlock date for earned badges */}
        {isUnlocked && badge.unlockedAt && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Standard Badges Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <Award className="w-6 h-6 mr-3 text-blue-500" />
              Standard Badges
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Achievement badges earned through collecting and playing
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {standardEarnedBadges.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              of {standardEarnedBadges.length + standardLockedBadges.length} earned
            </div>
          </div>
        </div>

        {/* Earned Standard Badges */}
        {standardEarnedBadges.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Earned ({standardEarnedBadges.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {standardEarnedBadges.map((badge) => renderBadge(badge, true))}
            </div>
          </div>
        )}

        {/* Locked Standard Badges */}
        {standardLockedBadges.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-slate-500" />
              In Progress ({standardLockedBadges.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {standardLockedBadges.map((badge) => renderBadge(badge, false))}
            </div>
          </div>
        )}

        {standardEarnedBadges.length === 0 && standardLockedBadges.length === 0 && (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No standard badges available yet. Keep collecting to unlock achievements!
            </p>
          </div>
        )}
      </section>

      {/* Special Badges Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <div className="w-6 h-6 mr-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              Special Badges
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Rare achievements for dedicated collectors and players
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {specialEarnedBadges.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              of {specialEarnedBadges.length + specialLockedBadges.length} earned
            </div>
          </div>
        </div>

        {/* Earned Special Badges */}
        {specialEarnedBadges.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Earned ({specialEarnedBadges.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialEarnedBadges.map((badge) => renderBadge(badge, true))}
            </div>
          </div>
        )}

        {/* Locked Special Badges */}
        {specialLockedBadges.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-slate-500" />
              Legendary Goals ({specialLockedBadges.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialLockedBadges.map((badge) => renderBadge(badge, false))}
            </div>
          </div>
        )}

        {specialEarnedBadges.length === 0 && specialLockedBadges.length === 0 && (
          <div className="text-center py-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Special badges are rare achievements for the most dedicated collectors!
            </p>
          </div>
        )}
      </section>

      {/* Overall Progress Summary */}
      <section className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Achievement Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {standardEarnedBadges.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Standard Badges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {specialEarnedBadges.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Special Badges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {specialEarnedBadges.filter(b => b.rarity === 'legendary').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Legendary</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round(((standardEarnedBadges.length + specialEarnedBadges.length) / (standardEarnedBadges.length + specialEarnedBadges.length + standardLockedBadges.length + specialLockedBadges.length)) * 100) || 0}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Completion</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountBadges;