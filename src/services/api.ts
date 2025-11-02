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
}

export const api = {
  // Auth
  login: async (data: LoginRequest) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  register: async (data: RegisterRequest) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_URL}/categories`);
    return response.json();
  },

  createCategory: async (data: any, token: string) => {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Shops
  getShops: async () => {
    const response = await fetch(`${API_URL}/shops`);
    return response.json();
  },

  createShop: async (formData: FormData, token: string) => {
    const response = await fetch(`${API_URL}/shops`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },

  // Admin
  getAllUsers: async (token: string) => {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getPendingShops: async (token: string) => {
    const response = await fetch(`${API_URL}/admin/shops/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  approveShop: async (shopId: number, token: string) => {
    const response = await fetch(`${API_URL}/admin/shops/${shopId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  rejectShop: async (shopId: number, token: string) => {
    const response = await fetch(`${API_URL}/admin/shops/${shopId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};