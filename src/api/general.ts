const API_URL = 'http://localhost:8080/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fio: string;
  phoneNumber: string;
  city: string;
  role: string;
}

// Generic fetch wrapper to handle errors and return status
export const fetchWrapper = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  
  // Try to parse JSON response
  let json;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    json = await response.json();
  } else {
    // If not JSON, try to read as text
    const text = await response.text();
    json = { message: text || response.statusText };
  }

  if (!response.ok) {
    // Throw an error object that includes the status code and the response body
    const error = new Error(json.message || json.error || response.statusText);
    (error as any).status = response.status;
    (error as any).body = json;
    throw error;
  }

  return json;
};

export const authApi = {
  // Auth
  login: async (data: LoginRequest) => {
    return fetchWrapper(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  register: async (data: RegisterRequest) => {
    try {
      return await fetchWrapper(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      // Custom error handling for registration to extract specific DB error
      const errorMessage = error.body?.message || error.body?.error || error.message;
      
      // Check for the specific database error pattern
      const dbErrorMatch = errorMessage.match(/ОШИБКА: повторяющееся значение ключа нарушает ограничение уникальности "(.*?)"\s+Подробности: Ключ "(.*?)" уже существует/);
      if (dbErrorMatch) {
        throw new Error(`Пользователь с такими данными уже существует. ${dbErrorMatch[2]}`);
      }
      
      throw error; // Re-throw the error object with status
    }
  },

  forgotPassword: async (email: string) => {
    return fetchWrapper(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return fetchWrapper(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
  },

  // Categories
  getCategories: async () => {
    return fetchWrapper(`${API_URL}/categories`);
  },

  // Shops
  getShops: async () => {
    return fetchWrapper(`${API_URL}/shops`);
  },

  getShopById: async (id: number) => {
    return fetchWrapper(`${API_URL}/shops/${id}`);
  },

  // Items
  getItems: async () => {
    return fetchWrapper(`${API_URL}/items`);
  },

  getItemById: async (id: number) => {
    return fetchWrapper(`${API_URL}/items/${id}`);
  },

  // Favorites
  getFavorites: async (token: string) => {
    return fetchWrapper(`${API_URL}/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  addFavorite: async (itemId: number, token: string) => {
    return fetchWrapper(`${API_URL}/favorites/${itemId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  removeFavorite: async (itemId: number, token: string) => {
    return fetchWrapper(`${API_URL}/favorites/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

export default authApi;
