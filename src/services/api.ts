/**
 * Pokemon TCG API service for tcgdex.dev (supports multilingual)
 */
export const FALLBACK_IMAGE = 'https://tcgdex.dev/static/media/pokeball.c1eb8943.png';

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
  if (item.image) {
    item.image = ensureHttps(item.image);
  }
  // Transform set image
  if (item.set && item.set.logo) {
    item.set.logo = ensureHttps(item.set.logo);
  }
  return item;
};

/**
 * Simple HTTP client using fetch for tcgdex.dev
 * Accepts a language prefix for endpoints ('en', 'fr', etc.)
 */
class ApiClient {
  private baseURL = 'https://tcgdex.dev/api/v2';
  private lang: string; // 'en', 'fr', etc.

  constructor(lang: string = 'en') {
    this.lang = lang;
  }

  setLanguage(lang: string) {
    this.lang = lang;
  }

  private async request<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    const url = new URL(`${this.baseURL}/${this.lang}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform image URLs
      if (Array.isArray(data)) {
        return data.map(transformImageUrls) as any as T;
      } else if (typeof data === 'object' && data !== null) {
        return transformImageUrls(data) as T;
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

// You may want to pull the language setting from a global store or user profile
let selectedLang = 'en'; // Can be switched to 'fr' dynamically

const apiClient = new ApiClient(selectedLang);

/**
 * Set API language
 */
export const setApiLanguage = (lang: string) => {
  selectedLang = lang;
  apiClient.setLanguage(lang);
};

/**
 * Fetch all cards, with optional pagination and search
 */
export const fetchCards = async (params?: { page?: number; q?: string }) => {
  // tcgdex.dev uses offset & limit for pagination; adjust if needed
  const q = params?.q ? `?q=${encodeURIComponent(params.q)}` : '';
  return await apiClient.get(`/cards${q}`);
};

/**
 * Fetch a single card by its ID
 */
export const fetchCardById = async (id: string) => {
  return await apiClient.get(`/cards/${id}`);
};

/**
 * Fetch all sets
 */
export const fetchSets = async () => {
  return await apiClient.get('/sets');
};

/**
 * Fetch a single set by its ID
 */
export const fetchSetById = async (id: string) => {
  return await apiClient.get(`/sets/${id}`);
};

/**
 * Fetch cards from a specific set
 */
export const fetchCardsFromSet = async (setId: string) => {
  // tcgdex.dev returns cards-per-set via: /sets/:id/cards
  return await apiClient.get(`/sets/${setId}/cards`);
};

/**
 * Build query string for tcgdex.dev (basic text search)
 * Note: tcgdex.dev query features may be less complex than pokemontcg.io
 */
export const buildQuery = (search: string) => {
  return search;
};
