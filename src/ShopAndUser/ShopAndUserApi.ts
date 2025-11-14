const BASE_URL = 'http://localhost:8080';

export const api = {
  // Categories
  getCategories: async () => {
    const response = await fetch(`${BASE_URL}/api/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  createCategory: async (data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  updateCategory: async (id: number, data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  deleteCategory: async (id: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.text();
  },

  // Shops
  getShops: async () => {
    const response = await fetch(`${BASE_URL}/api/shops`);
    if (!response.ok) throw new Error('Failed to fetch shops');
    return response.json();
  },

  getShop: async (id: number) => {
    const response = await fetch(`${BASE_URL}/api/shops/${id}`);
    if (!response.ok) throw new Error('Failed to fetch shop');
    return response.json();
  },

  createShop: async (data: any, token: string) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('phone', data.phone);
    formData.append('instagramLink', data.instagramLink || '');
    formData.append('city', data.city);
    formData.append('address', data.address || '');
    
    if (data.categoryIds && data.categoryIds.length > 0) {
      data.categoryIds.forEach((id: number) => {
        formData.append('categoryIds', id.toString());
      });
    }
    
    if (data.logoFile) {
      formData.append('logoFile', data.logoFile);
    }

    const response = await fetch(`${BASE_URL}/api/shops`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create shop');
    return response.json();
  },

  updateShop: async (id: number, data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/shops/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update shop');
    return response.json();
  },

  deleteShop: async (id: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/shops/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete shop');
    return response.text();
  },

  // Items
  getShopItems: async (shopId: number) => {
    const response = await fetch(`${BASE_URL}/api/shops/${shopId}/items`);
    if (!response.ok) throw new Error('Failed to fetch shop items');
    return response.json();
  },

  getItems: async () => {
    const response = await fetch(`${BASE_URL}/api/items`);
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  },

  getItem: async (id: number) => {
    const response = await fetch(`${BASE_URL}/api/items/${id}`);
    if (!response.ok) throw new Error('Failed to fetch item');
    return response.json();
  },

  createItem: async (shopId: number, data: any, token: string) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('categoryId', data.categoryId.toString());
    formData.append('city', data.city || '');
    
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag: string) => {
        formData.append('tags', tag);
      });
    }
    
    if (data.imageFiles && data.imageFiles.length > 0) {
      data.imageFiles.forEach((file: File) => {
        formData.append('imageFiles', file);
      });
    }

    const response = await fetch(`${BASE_URL}/api/shops/${shopId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create item');
    return response.json();
  },

  updateItem: async (id: number, data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update item');
    return response.json();
  },

  deleteItem: async (id: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/items/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete item');
    return response.text();
  },

  // Favorites (Items)
  getFavorites: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch favorites');
    return response.json();
  },

  addToFavorites: async (itemId: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/favorites/${itemId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to add to favorites');
    return response.text();
  },

  removeFromFavorites: async (itemId: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/favorites/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove from favorites');
    return response.text();
  },

  // Shop Favorites
  getShopFavorites: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/shop-favorites`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch favorite shops');
    return response.json();
  },

  addShopToFavorites: async (shopId: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/shop-favorites/${shopId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to add shop to favorites');
    return response.text();
  },

  removeShopFromFavorites: async (shopId: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/shop-favorites/${shopId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove shop from favorites');
    return response.text();
  },

  isShopInFavorites: async (shopId: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/shop-favorites/${shopId}/check`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      // The check endpoint returns a boolean, so we check for 404/401 etc.
      // If the response is not OK, we assume an error occurred, not that the shop is not a favorite.
      throw new Error('Failed to check shop favorite status');
    }
    // The API returns a boolean value (true/false) in the response body.
    return response.json();
  },

  // Auth
  login: async (credentials: any) => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error: any = new Error('Login failed');
      error.status = response.status;
      try {
        error.details = await response.json();
      } catch (e) {
        error.details = { message: response.statusText };
      }
      throw error;
    }
    return response.json();
  },

  register: async (data: any) => {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error: any = new Error('Registration failed');
      error.status = response.status;
      try {
        error.details = await response.json();
      } catch (e) {
        error.details = { message: response.statusText };
      }
      throw error;
    }
    return response.json();
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error: any = new Error('Forgot password failed');
      error.status = response.status;
      try {
        error.details = await response.json();
      } catch (e) {
        error.details = { message: response.statusText };
      }
      throw error;
    }
    return response;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!response.ok) {
      const error: any = new Error('Reset password failed');
      error.status = response.status;
      try {
        error.details = await response.json();
      } catch (e) {
        error.details = { message: response.statusText };
      }
      throw error;
    }
    return response;
  },

  deleteMyAccount: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    if (!response.ok) {
      const error: any = new Error('Failed to delete account');
      error.status = response.status;
      throw error;
    }
    return response.text();
  },

  // Admin - Users
  getAllUsers: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: any = new Error('Failed to fetch users');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  deleteUser: async (userId: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: any = new Error('Failed to delete user');
      error.status = response.status;
      throw error;
    }
    return response.text();
  },

  updateUserRole: async (userId: number, newRole: string, token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newRole }),
    });
    if (!response.ok) {
      const error: any = new Error('Failed to update user role');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  // Admin - Shops
  getPendingShops: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/shops/pending`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: any = new Error('Failed to fetch pending shops');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  getAllShops: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/shops`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: any = new Error('Failed to fetch all shops');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  approveShop: async (shopId: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/shops/${shopId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: any = new Error('Failed to approve shop');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  rejectShop: async (shopId: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/admin/shops/${shopId}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: any = new Error('Failed to reject shop');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
};

export default api;