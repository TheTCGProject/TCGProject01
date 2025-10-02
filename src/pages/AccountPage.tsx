import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSets } from '../services/api';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';
import { Badge } from '../types';
import { useSettingsStore } from '../stores/settingsStore';

// New: Import your account subcomponents and hooks here.
import AccountHeader from '../components/account/AccountHeader';
import AccountStats from '../components/account/AccountStats';
import AccountOverview from '../components/account/AccountOverview';
import AccountBadges from '../components/account/AccountBadges';
import AccountActivity from '../components/account/AccountActivity';

import { useCardCollection } from '../hooks/useCardCollection';
import { useUserLevel } from '../hooks/useUserLevel';

// --- (For demo, use mock user data or adapt to Auth if you have it)
const mockUser = {
  id: '1',
  name: 'Ash Ketchum',
  email: 'ash@pokemon.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  joinDate: '2024-01-15',
  isLoggedIn: true, // Change to support signed out state
};

const AccountPage = () => {
  const navigate = useNavigate();
  const language = useSettingsStore(state => state.language);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'activity'>('overview');
  const previouslyEarned = useRef<Set<string>>(new Set());

  // Hooks for collection/stats
  const { collection, getSetProgress, getSetValue, getTotalStats, getRecentlyAddedCards, getTopValueCards, getFavoriteCard } = useCardCollection();
  const { userLevel, xp } = useUserLevel(getTotalStats().totalCards, getTotalStats().totalValue, 0); // supply setsCompleted if available

  // Fetch sets from tcgdex.dev (use new type!)
  const { data: setsData, isLoading: setsLoading } = useQuery({ queryKey: ['sets', language], queryFn: fetchSets });

  // Redirect UI for signed out users
  if (!mockUser.isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Sign In Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Please sign in to view your collection dashboard and track your progress.</p>
          <Button variant="primary" className="w-full">Sign In</Button>
        </div>
      </div>
    );
  }

  // Calculate stats and derived badge progress.
  const stats = React.useMemo(() => getTotalStats(), [collection, setsData]);

  // (Optionally) recalculate set completion using tcgdex sets/legality
  const setsCompleted = setsData?.length
    ? setsData.filter(set => {
        const cardsInSet = collection.filter(card => card.set.id === set.id).length;
        return cardsInSet >= (set.cardCount?.total || 0);
      }).length
    : 0;

  // Your badge system here: (Keep as you had or use new criteria)
  // Filter badges with your new progress/stat system.
  // Example logic, adjust as your Badge/Progress implementation
  const earnedBadges = []; // ... your logic here ...
  const lockedBadges = []; // ... your logic here ...

  // Use effect for toast or progress, omitted for brevity
  // ...

  // Subcomponents for each tab
  return (
    <div className="container mx-auto px-4 py-8">
      <AccountHeader user={mockUser} userLevel={userLevel} stats={stats} xp={xp} />
      <AccountStats stats={stats} />
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'px-6 py-3 font-medium transition-colors',
            activeTab === 'overview' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          Collection Overview
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={cn(
            'px-6 py-3 font-medium transition-colors',
            activeTab === 'badges' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          Badges & Achievements
          {/* Add badge count if you wish */}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={cn(
            'px-6 py-3 font-medium transition-colors',
            activeTab === 'activity' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          Recent Activity
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <AccountOverview
          favoriteCard={getFavoriteCard()}
          topValueCards={getTopValueCards(5)}
          collectionSummary={[]} // Fill in with your real summary logic
          earnedBadges={earnedBadges}
        />
      )}
      {activeTab === 'badges' && (
        <AccountBadges
          // Pass correct badge lists and stats
          standardEarnedBadges={earnedBadges}
          specialEarnedBadges={[]}
          standardLockedBadges={lockedBadges}
          specialLockedBadges={[]}
          stats={stats}
        />
      )}
      {activeTab === 'activity' && (
        <AccountActivity
          recentCards={getRecentlyAddedCards(7)}
          userLevel={userLevel}
          earnedBadges={earnedBadges}
        />
      )}
    </div>
  );
};

export default AccountPage;