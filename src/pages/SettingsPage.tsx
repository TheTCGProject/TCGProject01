import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, AlertTriangle, User, Globe, DollarSign, RefreshCw, Eye, Award, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import { useCollectionStore } from '../stores/collectionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useCardCollection } from '../hooks/useCardCollection';
import { useUserLevel } from '../hooks/useUserLevel';
import { cn } from '../utils/cn';
import { Badge } from '../types';

// Import badges from AccountPage (in a real app, this would be in a shared location)
import { 
  Trophy, 
  Leaf, 
  Flame,
  Droplets,
  Bolt,
  Brain,
  Swords,
  Moon,
  Sparkles,
  Diamond,
  Coins,
  Crown,
  Gem,
  Shield,
  Zap,
  Target
} from 'lucide-react';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

const presetAvatars = [
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
];

// Badge definitions (shared with AccountPage - in a real app, this would be in a shared module)
const badges: Badge[] = [
  {
    id: 'first-card',
    name: 'First Steps',
    description: 'Add your first card to the collection',
    icon: <Star className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.totalCards >= 1,
    color: 'bg-blue-500',
  },
  {
    id: 'set-sleuth',
    name: 'Set Sleuth',
    description: 'Complete your first full set',
    icon: <Trophy className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.setsCompleted >= 1,
    color: 'bg-yellow-500',
  },
  {
    id: 'grass-guru',
    name: 'Grass Guru',
    description: 'Collect 50 grass-type cards',
    icon: <Leaf className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Grass || 0) >= 50,
    color: 'bg-green-500',
  },
  {
    id: 'fire-master',
    name: 'Fire Master',
    description: 'Collect 50 fire-type cards',
    icon: <Flame className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Fire || 0) >= 50,
    color: 'bg-red-500',
  },
  {
    id: 'water-expert',
    name: 'Water Expert',
    description: 'Collect 50 water-type cards',
    icon: <Droplets className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Water || 0) >= 50,
    color: 'bg-blue-600',
  },
  {
    id: 'lightning-lord',
    name: 'Lightning Lord',
    description: 'Collect 50 lightning-type cards',
    icon: <Bolt className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Lightning || 0) >= 50,
    color: 'bg-yellow-400',
  },
  {
    id: 'psychic-sage',
    name: 'Psychic Sage',
    description: 'Collect 50 psychic-type cards',
    icon: <Brain className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Psychic || 0) >= 50,
    color: 'bg-purple-500',
  },
  {
    id: 'fighting-champion',
    name: 'Fighting Champion',
    description: 'Collect 50 fighting-type cards',
    icon: <Swords className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Fighting || 0) >= 50,
    color: 'bg-orange-600',
  },
  {
    id: 'darkness-dealer',
    name: 'Darkness Dealer',
    description: 'Collect 50 darkness-type cards',
    icon: <Moon className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => (stats.typeStats?.Darkness || 0) >= 50,
    color: 'bg-gray-800',
  },
  {
    id: 'variant-hunter',
    name: 'Variant Hunter',
    description: 'Collect 25 different card variants',
    icon: <Gem className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.totalVariants >= 25,
    color: 'bg-purple-500',
  },
  {
    id: 'binder-boss',
    name: 'Binder Boss',
    description: 'Reach $500+ in collection value',
    icon: <Crown className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.totalValue >= 500,
    color: 'bg-blue-500',
  },
  {
    id: 'speed-collector',
    name: 'Speed Collector',
    description: 'Add 20 cards in one day',
    icon: <Zap className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.dailyAdditions >= 20,
    color: 'bg-orange-500',
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Complete 5 full sets',
    icon: <Shield className="w-6 h-6" />,
    category: 'standard',
    requirement: (stats) => stats.setsCompleted >= 5,
    color: 'bg-indigo-500',
  },
  {
    id: 'shiny-hunter',
    name: 'Shiny Hunter',
    description: 'Collect 10 shiny/alternate art cards',
    icon: <Sparkles className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => (stats.shinyCards || 0) >= 10,
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    rarity: 'rare',
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
  },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { clearAllCollections } = useCollectionStore();
  const { 
    collectionMode, 
    currency, 
    profilePublic, 
    selectedAvatar,
    showcaseBadgeIds,
    setCollectionMode,
    setCurrency,
    setProfilePublic,
    setSelectedAvatar,
    setShowcaseBadges,
    updateSettings
  } = useSettingsStore();
  
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');

  // Get collection stats for badge filtering
  const { getTotalStats } = useCardCollection();
  const stats = getTotalStats();

  // Mock user email for deletion confirmation
  const mockUserEmail = 'ash@pokemon.com';

  // Get earned badges
  const earnedBadges = badges.filter(badge => badge.requirement(stats));

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', { collectionMode, currency, profilePublic, selectedAvatar, showcaseBadgeIds });
    // Show success message
  };

  const handleResetCollection = () => {
    clearAllCollections();
    setShowResetModal(false);
    // Show success message
  };

  const handleDeleteAccount = () => {
    if (confirmEmail === mockUserEmail) {
      // In a real app, this would delete the account
      console.log('Deleting account...');
      setShowDeleteModal(false);
      navigate('/');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBadgeToggle = (badgeId: string) => {
    const currentShowcase = [...showcaseBadgeIds];
    const index = currentShowcase.indexOf(badgeId);
    
    if (index > -1) {
      // Remove badge from showcase
      currentShowcase.splice(index, 1);
    } else if (currentShowcase.length < 4) {
      // Add badge to showcase (max 4)
      currentShowcase.push(badgeId);
    }
    
    setShowcaseBadges(currentShowcase);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center text-slate-700 dark:text-slate-300"
        onClick={() => navigate('/account')}
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Account
      </Button>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your account preferences and collection settings
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Collection Mode Setting */}
          <section>
            <div className="flex items-center mb-4">
              <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400 mr-2" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Collection Mode</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              When enabled, unowned cards on Set Detail Pages appear in greyscale. Owned cards are shown in full color.
            </p>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={collectionMode}
                onChange={(e) => setCollectionMode(e.target.checked)}
                className="sr-only"
              />
              <div className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                collectionMode ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-600"
              )}>
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  collectionMode ? "translate-x-6" : "translate-x-1"
                )} />
              </div>
              <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                Enable Collection Mode
              </span>
            </label>
            
            {collectionMode && (
              <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <p className="text-xs text-primary-700 dark:text-primary-300">
                  <strong>Collection Mode is active:</strong> Unowned cards will appear in greyscale on set detail pages, making it easier to identify which cards you still need to collect.
                </p>
              </div>
            )}
          </section>

          {/* Currency Settings */}
          <section>
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-slate-600 dark:text-slate-400 mr-2" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Currency</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Choose your preferred currency for displaying card values
            </p>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </option>
              ))}
            </select>
          </section>

          {/* Avatar Settings */}
          <section>
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-400 mr-2" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Avatar</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Upload a custom image or choose from preset avatars
            </p>
            
            <div className="space-y-4">
              {/* Current Avatar */}
              <div className="flex items-center gap-4">
                <img
                  src={selectedAvatar}
                  alt="Current avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                />
                <div>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
                      Upload New Image
                    </Button>
                  </label>
                </div>
              </div>

              {/* Preset Avatars */}
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Or choose a preset avatar:
                </p>
                <div className="grid grid-cols-6 gap-3">
                  {presetAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={cn(
                        "w-12 h-12 rounded-full overflow-hidden border-2 transition-all",
                        selectedAvatar === avatar
                          ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800"
                          : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                      )}
                    >
                      <img
                        src={avatar}
                        alt={`Preset avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Showcase Badges Settings */}
          {earnedBadges.length > 0 && (
            <section>
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 text-slate-600 dark:text-slate-400 mr-2" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Showcase Badges</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Select up to 4 badges to showcase on your profile overview (leave empty to show recent badges)
              </p>
              
              <div className="space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Selected: {showcaseBadgeIds.length}/4 badges
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {earnedBadges.map((badge) => {
                    const isSelected = showcaseBadgeIds.includes(badge.id);
                    const canSelect = showcaseBadgeIds.length < 4 || isSelected;
                    
                    return (
                      <button
                        key={badge.id}
                        onClick={() => canSelect && handleBadgeToggle(badge.id)}
                        disabled={!canSelect}
                        className={cn(
                          "relative p-3 rounded-lg border-2 transition-all text-center",
                          isSelected
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : canSelect
                            ? "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-700"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                            <Star className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-white text-sm",
                          badge.color
                        )}>
                          {React.cloneElement(badge.icon as React.ReactElement, { className: "w-4 h-4" })}
                        </div>
                        
                        <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                          {badge.name}
                        </div>
                        
                        {badge.category === 'special' && badge.rarity && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                            {badge.rarity}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {showcaseBadgeIds.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowcaseBadges([])}
                  >
                    Clear Showcase
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* Profile Visibility */}
          <section>
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400 mr-2" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Visibility</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Control who can see your collection and profile information
            </p>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profilePublic}
                onChange={(e) => setProfilePublic(e.target.checked)}
                className="sr-only"
              />
              <div className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                profilePublic ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-600"
              )}>
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  profilePublic ? "translate-x-6" : "translate-x-1"
                )} />
              </div>
              <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                Make my profile public
              </span>
            </label>
            
            {!profilePublic && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Your profile will be private and not visible to other users
              </p>
            )}
          </section>

          {/* Save Settings */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="primary" onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>

          {/* Danger Zone */}
          <section className="pt-8 border-t border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-error-600 dark:text-error-400 mb-4">
              Danger Zone
            </h2>
            
            <div className="space-y-4">
              {/* Reset Collection */}
              <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-error-800 dark:text-error-200">
                      Reset Collection
                    </h3>
                    <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                      This will remove all tracked cards from your collection. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-700 dark:hover:bg-error-900/30"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    onClick={() => setShowResetModal(true)}
                  >
                    Reset Collection
                  </Button>
                </div>
              </div>

              {/* Delete Account */}
              <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-error-800 dark:text-error-200">
                      Delete Account
                    </h3>
                    <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-700 dark:hover:bg-error-900/30"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Reset Collection Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-error-500 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Reset Collection
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to reset your entire collection? This will remove all tracked cards and cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-error-600 hover:bg-error-700"
                onClick={handleResetCollection}
              >
                Reset Collection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-error-500 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Delete Account
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This action will permanently delete your account and all associated data. This cannot be undone.
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Please type your email address to confirm:
            </p>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={mockUserEmail}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-6"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmEmail('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-error-600 hover:bg-error-700"
                onClick={handleDeleteAccount}
                disabled={confirmEmail !== mockUserEmail}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;