/**
 * Pokemon TCG API service
 * Handles all API communication with the Pokemon TCG API
 */

/**
 * Fallback image URL for when card images fail to load
 */
export const FALLBACK_IMAGE = 'https://images.pokemontcg.io/swsh45/1_hires.png';

/**
 * Ensure URLs use HTTPS protocol for security
 */
const ensureHttps = (url: string): string => {
  if (!url) return '';
  return url.replace(/^http:\/\//i, 'https://');
};

/**
 * Transform API response data to ensure HTTPS URLs
 */
const transformImageUrls = (item: any) => {
  // Transform card images
  if (item.images) {
    item.images.small = ensureHttps(item.images.small);
    item.images.large = ensureHttps(item.images.large);
  }
  
  // Transform set images
  if (item.set?.images) {
    item.set.images.symbol = ensureHttps(item.set.images.symbol);
    item.set.images.logo = ensureHttps(item.set.images.logo);
  }
  
  return item;
};

/**
 * Simple HTTP client using fetch instead of axios
 */
class ApiClient {
  private baseURL = 'https://api.pokemontcg.io/v2';
  private apiKey = import.meta.env.VITE_POKEMON_TCG_API_KEY;

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-Api-Key'] = this.apiKey;
    }

    try {
      const response = await fetch(url.toString(), { headers });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('API Key error. Please check your Pokemon TCG API key.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform image URLs to use HTTPS
      if (data?.data) {
        if (Array.isArray(data.data)) {
          data.data = data.data.map(transformImageUrls);
        } else {
          data.data = transformImageUrls(data.data);
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, params);
  }
}

const apiClient = new ApiClient();

/**
 * Fetch cards with various filters and pagination
 */
export const fetchCards = async (params: {
  page?: number;
  pageSize?: number;
  q?: string;
  orderBy?: string;
}) => {
  return apiClient.get('/cards', params);
};

/**
 * Fetch a single card by its unique ID
 */
export const fetchCardById = async (id: string) => {
  const response = await apiClient.get<{ data: any }>(`/cards/${id}`);
  return response.data;
};

/**
 * Fetch all available sets
 */
export const fetchSets = async () => {
  return apiClient.get('/sets');
};

/**
 * Fetch a single set by its ID
 */
export const fetchSetById = async (id: string) => {
  const response = await apiClient.get<{ data: any }>(`/sets/${id}`);
  return response.data;
};

/**
 * Fetch cards from a specific set with pagination support
 */
export const fetchCardsFromSet = async (setId: string, params?: {
  page?: number;
  pageSize?: number;
  orderBy?: string;
}) => {
  return apiClient.get('/cards', {
    q: `set.id:${setId}`,
    orderBy: params?.orderBy || 'number',
    page: params?.page || 1,
    pageSize: params?.pageSize || 24,
    ...params,
  });
};

/**
 * Get market price for a card variant from TCGPlayer data
 */
export const getCardPrice = (card: any, variant: string = 'normal'): number => {
  if (!card.tcgplayer?.prices) return 0;
  
  // Map internal variant names to TCGPlayer price keys
  const priceKeyMap: Record<string, string> = {
    'regular': 'normal',
    'reverse-holo': 'reverseHolofoil',
    'holo': 'holofoil',
    'full-art': 'normal', // Fallback to normal for special variants
    'alt-art': 'normal',
    'rainbow': 'normal',
    'gold': 'normal',
    'secret': 'normal',
  };
  
  const priceKey = priceKeyMap[variant] || 'normal';
  const priceData = card.tcgplayer.prices[priceKey];
  
  if (priceData) {
    // Prefer market price, fallback to mid, then low
    return priceData.market || priceData.mid || priceData.low || 0;
  }
  
  // Fallback to first available price if specific variant not found
  const firstPrice = Object.values(card.tcgplayer.prices)[0] as any;
  return firstPrice?.market || firstPrice?.mid || firstPrice?.low || 0;
};

/**
 * Build search query string from filter object
 */
export const buildQuery = (filters: Record<string, any>): string => {
  const queries: string[] = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      
      // Create OR query for array values
      const arrayQuery = value.map(v => `${key}:"${v}"`).join(' OR ');
      if (arrayQuery) queries.push(`(${arrayQuery})`);
    } else if (typeof value === 'object') {
      // Handle range queries (min/max)
      if (value.min !== undefined) queries.push(`${key}:>=${value.min}`);
      if (value.max !== undefined) queries.push(`${key}:<=${value.max}`);
    } else {
      // Handle simple string/number values
      queries.push(`${key}:"${value}"`);
    }
  });

  return queries.join(' ');
};