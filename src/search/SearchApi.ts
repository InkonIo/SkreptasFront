const BASE_URL = 'http://localhost:8080';

export interface SearchRequest {
  query: string;
  type?: 'ITEM' | 'SHOP' | 'CATEGORY' | null;
  limit?: number;
}

export interface SearchResultItem {
  type: 'ITEM' | 'SHOP' | 'CATEGORY';
  id: number;
  title: string;
  score: number;
  data: any; // ItemResponse | ShopResponse | CategoryResponse
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  results: SearchResultItem[];
}

export const searchApi = {
  /**
   * Выполняет поиск
   */
  search: async (request: SearchRequest): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    params.append('query', request.query);
    
    if (request.type) {
      params.append('type', request.type);
    }
    
    if (request.limit) {
      params.append('limit', request.limit.toString());
    }

    const response = await fetch(`${BASE_URL}/api/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    return response.json();
  },

  /**
   * Переиндексирует все данные (ADMIN only)
   */
  reindexAll: async (token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/search/admin/reindex-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Reindex failed');
    }
    
    return response.text();
  },

  /**
   * Переиндексирует товары (ADMIN only)
   */
  reindexItems: async (token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/search/admin/reindex-items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Reindex items failed');
    }
    
    return response.text();
  },

  /**
   * Переиндексирует магазины (ADMIN only)
   */
  reindexShops: async (token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/search/admin/reindex-shops`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Reindex shops failed');
    }
    
    return response.text();
  },
};