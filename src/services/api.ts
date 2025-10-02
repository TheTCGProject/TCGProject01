import { SetBrief, Card } from '../types';

/** Fallback image for missing card/set images */
export const FALLBACK_IMAGE = 'https://tcgdex.dev/static/media/pokeball.c1eb8943.png';

/** Ensure all image URLs are HTTPS for CDN security */
const ensureHttps = (url?: string): string => {
  if (!url) return '';
  return url.replace(/^http:\/\//i, 'https://');
};

/** Globally upgrade image/image props for Card or Set responses */
const transformImageUrls = <T extends Record<string, any>>(item: T): T => {
  const obj = item as any;
  if ('image' in obj && obj.image) {
    obj.image = ensureHttps(obj.image);
  }
  if ('set' in obj && obj.set) {
    if ('logo' in obj.set && obj.set.logo) obj.set.logo = ensureHttps(obj.set.logo);
    if ('symbol' in obj.set && obj.set.symbol) obj.set.symbol = ensureHttps(obj.set.symbol);
  }
  if ('logo' in obj && obj.logo) {
    obj.logo = ensureHttps(obj.logo);
  }
  if ('symbol' in obj && obj.symbol) {
    obj.symbol = ensureHttps(obj.symbol);
  }
  return obj;
};

/** API client for tcgdex.dev */
class ApiClient {
  private baseURL = 'https://tcgdex.dev/api/v2';
  private lang: string;

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
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    // Transform images everywhere
    if (Array.isArray(data)) {
      return data.map(transformImageUrls) as any as T;
    } else if (typeof data === 'object' && data !== null) {
      // If paginated (object with data), fix images in array
      if ('data' in data && Array.isArray(data.data)) {
        data.data = data.data.map(transformImageUrls);
      }
      return transformImageUrls(data) as T;
    }
    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, params);
  }
}

let selectedLang = 'en';
const apiClient = new ApiClient(selectedLang);

/** Set API language for all requests */
export const setApiLanguage = (lang: string) => {
  selectedLang = lang;
  apiClient.setLanguage(lang);
};

/**
 * FETCH CARDS - paginated, search, and sorted
 * Returns: { data: Card[] }
 */
export const fetchCards = async (params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  orderBy?: string;
}): Promise<{ data: Card[] }> => {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 24;
  const offset = (page - 1) * pageSize;
  const query: Record<string, any> = {
    offset,
    limit: pageSize,
    ...(params?.q ? { q: params.q } : {}),
    ...(params?.orderBy ? { orderBy: params.orderBy } : {})
    // Add more params if tcgdex.dev supports them
  };
  return await apiClient.get<{ data: Card[] }>('/cards', query);
};

/** Fetch a single card by ID */
export const fetchCardById = async (id: string): Promise<Card> => {
  return await apiClient.get<Card>(`/cards/${id}`);
};

/** Fetch all sets */
export const fetchSets = async (): Promise<{ data: SetBrief[] }> => {
  return await apiClient.get<{ data: SetBrief[] }>('/sets');
};

/** Fetch a single set by ID */
export const fetchSetById = async (id: string): Promise<SetBrief> => {
  return await apiClient.get<SetBrief>(`/sets/${id}`);
};

/** Fetch all cards from a specific set */
export const fetchCardsFromSet = async (setId: string): Promise<{ data: Card[] }> => {
  return await apiClient.get<{ data: Card[] }>(`/sets/${setId}/cards`);
};

/** Utility to build search queries (can be replaced with more advanced tcgdex logic as needed) */
export const buildQuery = (search: string) => search;
