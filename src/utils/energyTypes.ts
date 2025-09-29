/**
 * Pokemon energy type utilities
 * Provides energy symbols, colors, and type-related functionality
 */

/**
 * Mapping of energy types to their official symbol URLs
 */
const energySymbols: Record<string, string> = {
  Colorless: '/img/colorless-energy.png',
  Darkness: '/img/darkness-energy.png',
  Dragon: '/img/dragon-energy.png',
  Fairy: '/img/fairy-energy.png',
  Fighting: '/img/fighting-energy.png',
  Fire: '/img/fire-energy.png',
  Grass: '/img/grass-energy.png',
  Lightning: '/img/lightning-energy.png',
  Metal: '/img/metal-energy.png',
  Psychic: '/img/psychic-energy.png',
  Water: '/img/water-energy.png',
  // Optional: Add a generic/unknown symbol if you have one
  Unknown: 'https://images.pokemontcg.io/symbols/unknown.png'
};

/**
 * Get energy symbol URL for a given type
 * @param type - Energy type name (case-insensitive)
 * @returns Symbol image URL
 */
export const getEnergySymbol = (type: string): string => {
  if (!type) return energySymbols.Unknown || energySymbols.Colorless;
  
  // Normalize: capitalize first letter, lowercase the rest
  const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  return energySymbols[normalized] || energySymbols.Unknown || energySymbols.Colorless;
};

/**
 * Get Tailwind CSS classes for energy type styling
 * @param type - Energy type name
 * @returns CSS class string for background and text colors
 */
export const getEnergyTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    Grass: 'bg-green-500 text-white',
    Fire: 'bg-red-500 text-white',
    Water: 'bg-blue-500 text-white',
    Lightning: 'bg-yellow-400 text-black',
    Psychic: 'bg-purple-500 text-white',
    Fighting: 'bg-orange-600 text-white',
    Darkness: 'bg-gray-800 text-white',
    Metal: 'bg-gray-400 text-black',
    Fairy: 'bg-pink-400 text-white',
    Dragon: 'bg-gradient-to-r from-yellow-400 to-red-500 text-white',
    Colorless: 'bg-gray-200 text-black',
    Unknown: 'bg-gray-300 text-black'
  };
  
  if (!type) return colorMap.Unknown || colorMap.Colorless;
  
  // Normalize type name for consistent lookup
  const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  return colorMap[normalized] || colorMap.Unknown || colorMap.Colorless;
};