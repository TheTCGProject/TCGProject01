import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSets } from '../services/api';
import { 
  Trophy, 
  Star, 
  Award, 
  Zap, 
  Crown, 
  Gem, 
  Shield, 
  Leaf, 
  Target,
  Flame,
  Droplets,
  Bolt,
  Brain,
  Swords,
  Moon,
  Sparkles,
  Diamond,
  Coins
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { cn } from '../utils/cn';
import { Badge } from '../types';

// Import new components
import AccountHeader from '../components/account/AccountHeader';
import AccountStats from '../components/account/AccountStats';
import AccountOverview from '../components/account/AccountOverview';
import AccountBadges from '../components/account/AccountBadges';
import AccountActivity from '../components/account/AccountActivity';

// Import custom hooks
import { useCardCollection } from '../hooks/useCardCollection';
import { useUserLevel } from '../hooks/useUserLevel';

// Mock user data - in a real app this would come from authentication
const mockUser = {
  id: '1',
  name: 'Ash Ketchum',
  email: 'ash@pokemon.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  joinDate: '2024-01-15',
  isLoggedIn: true, // Set to false to test logged-out state
};

// Enhanced badge system with categories and progress tracking
const badges: Badge[] = [
  // Standard Badges - Achievement-based
  {
    id: 'first-card',
    name: 'First Steps',
    description: 'Add your first card to the collection',
    icon: <Star className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.totalCards >= 1,
    color: 'bg-blue-500',
    getRequirementProgress: (stats) => Math.min((stats.totalCards / 1) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.totalCards, 1)}/1 cards`,
  },
  {
    id: 'set-sleuth',
    name: 'Set Sleuth',
    description: 'Complete your first full set',
    icon: <Trophy className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.setsCompleted >= 1,
    color: 'bg-yellow-500',
    getRequirementProgress: (stats) => Math.min((stats.setsCompleted / 1) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.setsCompleted, 1)}/1 sets completed`,
  },
  {
    id: 'grass-guru',
    name: 'Grass Guru',
    description: 'Collect 50 grass-type cards',
    icon: <Leaf className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Grass || 0) >= 50,
    color: 'bg-green-500',
    getRequirementProgress: (stats) => Math.min(((stats.typeStats?.Grass || 0) / 50) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.typeStats?.Grass || 0, 50)}/50 Grass cards`,
  },
  {
    id: 'fire-master',
    name: 'Fire Master',
    description: 'Collect 50 fire-type cards',
    icon: <Flame className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Fire || 0) >= 50,
    color: 'bg-red-500',
    getRequirementProgress: (stats) => Math.min(((stats.typeStats?.Fire || 0) / 50) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.typeStats?.Fire || 0, 50)}/50 Fire cards`,
  },
  {
    id: 'water-expert',
    name: 'Water Expert',
    description: 'Collect 50 water-type cards',
    icon: <Droplets className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Water || 0) >= 50,
    color: 'bg-blue-600',
    getRequirementProgress: (stats) => Math.min(((stats.typeStats?.Water || 0) / 50) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.typeStats?.Water || 0, 50)}/50 Water cards`,
  },
  {
    id: 'lightning-lord',
    name: 'Lightning Lord',
    description: 'Collect 50 lightning-type cards',
    icon: <Bolt className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Lightning || 0) >= 50,
    color: 'bg-yellow-400',
    getRequirementProgress: (stats) => Math.min(((stats.typeStats?.Lightning || 0) / 50) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.typeStats?.Lightning || 0, 50)}/50 Lightning cards`,
  },
  {
    id: 'psychic-sage',
    name: 'Psychic Sage',
    description: 'Collect 50 psychic-type cards',
    icon: <Brain className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Psychic || 0) >= 50,
    color: 'bg-purple-500',
    getRequirementProgress: (stats) => Math.min(((stats.typeStats?.Psychic || 0) / 50) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.typeStats?.Psychic || 0, 50)}/50 Psychic cards`,
  },
  {
    id: 'fighting-champion',
    name: 'Fighting Champion',
    description: 'Collect 50 fighting-type cards',
    icon: <Swords className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Fighting || 0) >= 50,
    color: 'bg-orange-600',
    getRequirementProgress: (stats) => Math.min(((stats.typeStats?.Fighting || 0) / 50) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.typeStats?.Fighting || 0, 50)}/50 Fighting cards`,
  },
  {
    id: 'darkness-dealer',
    name: 'Darkness Dealer',
    description: 'Collect 50 darkness-type cards',
    icon: <Moon className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Darkness || 0) >= 50,
    color: 'bg-gray-800',
    getRequirementProgress: (stats) => Math.min(((stats.typeStats?.Darkness || 0) / 50) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.typeStats?.Darkness || 0, 50)}/50 Darkness cards`,
  },
  {
    id: 'variant-hunter',
    name: 'Variant Hunter',
    description: 'Collect 25 different card variants',
    icon: <Gem className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.totalVariants >= 25,
    color: 'bg-purple-500',
    getRequirementProgress: (stats) => Math.min((stats.totalVariants / 25) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.totalVariants, 25)}/25 variants`,
  },
  {
    id: 'binder-boss',
    name: 'Binder Boss',
    description: 'Reach $500+ in collection value',
    icon: <Crown className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.totalValue >= 500,
    color: 'bg-blue-500',
    getRequirementProgress: (stats) => Math.min((stats.totalValue / 500) * 100, 100),
    progressTextFormatter: (stats) => `$${Math.min(stats.totalValue, 500).toFixed(0)}/$500 value`,
  },
  {
    id: 'speed-collector',
    name: 'Speed Collector',
    description: 'Add 20 cards in one day',
    icon: <Zap className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.dailyAdditions >= 20,
    color: 'bg-orange-500',
    getRequirementProgress: (stats) => Math.min((stats.dailyAdditions / 20) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.dailyAdditions, 20)}/20 cards today`,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Complete 5 full sets',
    icon: <Shield className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.setsCompleted >= 5,
    color: 'bg-indigo-500',
    getRequirementProgress: (stats) => Math.min((stats.setsCompleted / 5) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.setsCompleted, 5)}/5 sets completed`,
  },

  // Special Badges - Rare achievements with different rarities
  {
    id: 'shiny-hunter',
    name: 'Shiny Hunter',
    description: 'Collect 10 shiny/alternate art cards',
    icon: <Sparkles className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => (stats.shinyCards || 0) >= 10,
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    rarity: 'rare',
    getRequirementProgress: (stats) => Math.min(((stats.shinyCards || 0) / 10) * 100, 100),
    progressTextFormatter: (stats) => `${Math.min(stats.shinyCards || 0, 10)}/10 special cards`,
  },
  {
    id: 'legendary-collector',
    name: 'Legendary Collector',
    description: 'Own cards worth over $2000 total',
    icon: <Diamond className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => stats.totalValue >= 2000,
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    rarity: 'epic',
    getRequirementProgress: (stats) => Math.min((stats.totalValue / 2000) * 100, 100),
    progressTextFormatter: (stats) => `$${Math.min(stats.totalValue, 2000).toFixed(0)}/$2000 value`,
  },
  {
    id: 'master-trainer',
    name: 'Master Trainer',
    description: 'Complete 10 sets and own 1000+ cards',
    icon: <Crown className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => stats.setsCompleted >= 10 && stats.totalCards >= 1000,
    color: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500',
    rarity: 'legendary',
    getRequirementProgress: (stats) => {
      const setProgress = Math.min((stats.setsCompleted / 10) * 50, 50);
      const cardProgress = Math.min((stats.totalCards / 1000) * 50, 50);
      return setProgress + cardProgress;
    },
    progressTextFormatter: (stats) => `${Math.min(stats.setsCompleted, 10)}/10 sets, ${Math.min(stats.totalCards, 1000)}/1000 cards`,
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Achieve a collection value of $10,000+',
    icon: <Coins className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => stats.totalValue >= 10000,
    color: 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600',
    rarity: 'legendary',
    getRequirementProgress: (stats) => Math.min((stats.totalValue / 10000) * 100, 100),
    progressTextFormatter: (stats) => `$${Math.min(stats.totalValue, 10000).toFixed(0)}/$10,000 value`,
  },
  {
    id: 'type-master',
    name: 'Type Master',
    description: 'Collect 25+ cards of each energy type',
    icon: <Target className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => {
      const types = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Fairy'];
      return types.every(type => (stats.typeStats?.[type] || 0) >= 25);
    },
    color: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    rarity: 'epic',
    getRequirementProgress: (stats) => {
      const types = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Fairy'];
      const completedTypes = types.filter(type => (stats.typeStats?.[type] || 0) >= 25).length;
      return (completedTypes / types.length) * 100;
    },
    progressTextFormatter: (stats) => {
      const types = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Fairy'];
      const completedTypes = types.filter(type => (stats.typeStats?.[type] || 0) >= 25).length;
      return `${completedTypes}/${types.length} types mastered`;
    },
  },
];

const AccountPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'activity'>('overview');
  
  // Track previously earned badges for toast notifications
  const previouslyEarnedBadgeIds = useRef<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);

  // Use custom hooks
  const {
    collection,
    getSetProgress,
    getSetValue,
    getTotalStats,
    getRecentlyAddedCards,
    getTopValueCards,
    getFavoriteCard
  } = useCardCollection();

  // Fetch all sets for collection summary
  const { data: setsData } = useQuery({
    queryKey: ['sets'],
    queryFn: fetchSets,
  });

  // Check if user is logged in
  if (!mockUser.isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Sign In Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please sign in to view your collection dashboard and track your progress.
          </p>
          <Button variant="primary" className="w-full">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Calculate collection statistics
  const calculateStats = () => {
    const baseStats = getTotalStats();
    let setsCompleted = 0;
    let typeStats: Record<string, number> = {};
    let shinyCards = 0;

    // Calculate sets completed using real set data
    if (setsData?.data) {
      Object.entries(collection).forEach(([setId, cards]) => {
        const setData = setsData.data.find(s => s.id === setId);
        if (setData) {
          const progress = getSetProgress(setId, setData.total);
          if (progress >= 100) {
            setsCompleted++;
          }
        }

        // Count by type and special variants
        cards.forEach(card => {
          if (card.card.types) {
            card.card.types.forEach(type => {
              typeStats[type] = (typeStats[type] || 0) + card.quantity;
            });
          }
          
          // Count shiny/special variants
          if (card.variant && ['holo', 'full-art', 'alt-art', 'rainbow', 'gold', 'secret'].includes(card.variant)) {
            shinyCards += card.quantity;
          }
        });
      });
    }

    return {
      ...baseStats,
      setsCompleted,
      typeStats,
      shinyCards,
      dailyAdditions: 5, // Mock data
      totalVariants: Object.values(collection).reduce((total, cards) => total + cards.length, 0)
    };
  };

  const stats = calculateStats();
  
  // Use user level hook
  const { userLevel, xp } = useUserLevel(stats.totalCards, stats.totalValue, stats.setsCompleted);
  
  // Calculate earned and locked badges
  const earnedBadges = badges.filter(badge => badge.requirement(stats));
  const lockedBadges = badges.filter(badge => !badge.requirement(stats));
  
  // Categorize badges
  const standardEarnedBadges = earnedBadges.filter(badge => badge.category === 'standard');
  const specialEarnedBadges = earnedBadges.filter(badge => badge.category === 'special');
  const standardLockedBadges = lockedBadges.filter(badge => badge.category === 'standard');
  const specialLockedBadges = lockedBadges.filter(badge => badge.category === 'special');

  // Check for newly unlocked badges and show toast notifications
  useEffect(() => {
    if (!hasInitialized) {
      // Initialize with current earned badges on first render
      previouslyEarnedBadgeIds.current = new Set(earnedBadges.map(badge => badge.id));
      setHasInitialized(true);
      return;
    }

    // Check for newly earned badges
    const currentEarnedBadgeIds = new Set(earnedBadges.map(badge => badge.id));
    const newlyEarnedBadges = earnedBadges.filter(
      badge => !previouslyEarnedBadgeIds.current.has(badge.id)
    );

    // Show toast for each newly earned badge
    newlyEarnedBadges.forEach(badge => {
      const rarityText = badge.rarity ? ` (${badge.rarity.toUpperCase()})` : '';
      
      showToast(
        `🏆 Badge Unlocked: "${badge.name}"${rarityText}!`,
        'achievement',
        {
          duration: 8000,
          action: {
            label: 'View Badges',
            onClick: () => setActiveTab('badges')
          }
        }
      );
    });

    // Update the previous badges set
    previouslyEarnedBadgeIds.current = currentEarnedBadgeIds;
  }, [earnedBadges, hasInitialized, showToast]);

  const recentCards = getRecentlyAddedCards(7);
  const topValueCards = getTopValueCards(5);
  const favoriteCard = getFavoriteCard();

  // Get collection summary by set
  const getCollectionSummary = () => {
    if (!setsData?.data) return [];
    
    return Object.keys(collection).map(setId => {
      const setData = setsData.data.find(s => s.id === setId);
      if (!setData) return null;

      const progress = getSetProgress(setId, setData.total);
      const value = getSetValue(setId);
      const uniqueCards = new Set(collection[setId].map(c => c.cardId)).size;

      return {
        setId,
        setData,
        progress,
        value,
        cardsCollected: uniqueCards,
        totalCards: setData.total
      };
    }).filter(Boolean);
  };

  const collectionSummary = getCollectionSummary();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <AccountHeader 
        user={mockUser}
        userLevel={userLevel}
        stats={stats}
        xp={xp}
      />

      {/* Quick Stats */}
      <AccountStats stats={stats} />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-6 py-3 font-medium transition-colors",
            activeTab === 'overview'
              ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          Collection Overview
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={cn(
            "px-6 py-3 font-medium transition-colors relative",
            activeTab === 'badges'
              ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          Badges & Achievements
          {earnedBadges.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-success-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {earnedBadges.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={cn(
            "px-6 py-3 font-medium transition-colors",
            activeTab === 'activity'
              ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          Recent Activity
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <AccountOverview 
          favoriteCard={favoriteCard}
          topValueCards={topValueCards}
          collectionSummary={collectionSummary}
          earnedBadges={earnedBadges}
        />
      )}

      {activeTab === 'badges' && (
        <AccountBadges 
          standardEarnedBadges={standardEarnedBadges}
          specialEarnedBadges={specialEarnedBadges}
          standardLockedBadges={standardLockedBadges}
          specialLockedBadges={specialLockedBadges}
          stats={stats}
        />
      )}

      {activeTab === 'activity' && (
        <AccountActivity 
          recentCards={recentCards}
          userLevel={userLevel}
          earnedBadges={earnedBadges}
        />
      )}
    </div>
  );
};

export default AccountPage;