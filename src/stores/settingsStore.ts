import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Settings store state interface
 * Manages user preferences and application settings
 */
interface SettingsState {
  /** Enable collection mode (grayscale unowned cards) */
  collectionMode: boolean;
  /** Preferred currency for price display */
  currency: string;
  /** Whether user profile is publicly visible */
  profilePublic: boolean;
  /** Selected avatar URL */
  selectedAvatar: string;
  /** Array of badge IDs to showcase on profile (max 4) */
  showcaseBadgeIds: string[];
  
  // Settings update actions
  setCollectionMode: (enabled: boolean) => void;
  setCurrency: (currency: string) => void;
  setProfilePublic: (isPublic: boolean) => void;
  setSelectedAvatar: (avatar: string) => void;
  setShowcaseBadges: (badgeIds: string[]) => void;
  updateSettings: (settings: Partial<Omit<SettingsState, 'setCollectionMode' | 'setCurrency' | 'setProfilePublic' | 'setSelectedAvatar' | 'setShowcaseBadges' | 'updateSettings'>>) => void;
}

/**
 * Settings store implementation
 * Persisted to localStorage for user preference persistence
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default settings
      collectionMode: false,
      currency: 'USD',
      profilePublic: true,
      selectedAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      showcaseBadgeIds: [],
      
      /**
       * Toggle collection mode on/off
       * When enabled, unowned cards appear in grayscale
       */
      setCollectionMode: (enabled) => set({ collectionMode: enabled }),
      
      /**
       * Update preferred currency for price display
       * @param currency - Currency code (e.g., 'USD', 'EUR')
       */
      setCurrency: (currency) => set({ currency }),
      
      /**
       * Set profile visibility preference
       * @param isPublic - Whether profile should be publicly visible
       */
      setProfilePublic: (isPublic) => set({ profilePublic: isPublic }),
      
      /**
       * Update user's selected avatar
       * @param avatar - Avatar image URL
       */
      setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
      
      /**
       * Set showcase badges for profile display
       * @param badgeIds - Array of badge IDs to showcase (max 4)
       */
      setShowcaseBadges: (badgeIds) => set({ showcaseBadgeIds: badgeIds.slice(0, 4) }),
      
      /**
       * Bulk update multiple settings at once
       * @param settings - Partial settings object to update
       */
      updateSettings: (settings) => set(settings),
    }),
    {
      name: 'pokemon-tcg-settings',
    }
  )
);