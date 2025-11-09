import { fetchWrapper } from './general';

const API_URL = 'http://localhost:8080/api';

export const adminApi = {
  // Categories
  createCategory: async (data: any, token: string) => {
    return fetchWrapper(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  updateCategory: async (id: number, data: any, token: string) => {
    return fetchWrapper(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  deleteCategory: async (id: number, token: string) => {
    return fetchWrapper(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // ✅ НОВЫЙ МЕТОД: Загрузка иконки категории
  uploadCategoryIcon: async (categoryId: number, formData: FormData, token: string) => {
    return fetchWrapper(`${API_URL}/categories/${categoryId}/icon`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // НЕ добавляем Content-Type для FormData - браузер сам установит с boundary
      },
      body: formData,
    });
  },

  // Shops
  createShop: async (formData: FormData, token: string) => {
    return fetchWrapper(`${API_URL}/shops`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },

  updateShop: async (id: number, data: any, token: string) => {
    return fetchWrapper(`${API_URL}/shops/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  getShopById: async (id: number, token: string) => {
    return fetchWrapper(`${API_URL}/shops/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  deleteShop: async (id: number, token: string) => {
    return fetchWrapper(`${API_URL}/shops/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Items
  createItem: async (shopId: number, formData: FormData, token: string) => {
    return fetchWrapper(`${API_URL}/shops/${shopId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },

  updateItem: async (id: number, data: any, token: string) => {
    return fetchWrapper(`${API_URL}/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  deleteItem: async (id: number, token: string) => {
    return fetchWrapper(`${API_URL}/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Admin
  getAllUsers: async (token: string) => {
    return fetchWrapper(`${API_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  deleteUser: async (userId: number, token: string) => {
    return fetchWrapper(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  updateUserRole: async (userId: number, newRole: string, token: string) => {
    return fetchWrapper(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newRole }),
    });
  },

  getAllShops: async (token: string) => {
    return fetchWrapper(`${API_URL}/admin/shops`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getPendingShops: async (token: string) => {
    return fetchWrapper(`${API_URL}/admin/shops/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  approveShop: async (shopId: number, token: string) => {
    return fetchWrapper(`${API_URL}/admin/shops/${shopId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  rejectShop: async (shopId: number, token: string) => {
    return fetchWrapper(`${API_URL}/admin/shops/${shopId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

export default adminApi;