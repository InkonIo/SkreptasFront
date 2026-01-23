const BASE_URL = 'http://localhost:8080';

// ==================== INTERFACES ====================

export interface Category {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string | null;
}

export interface CategoryCreateData {
  name: string;
  slug?: string;
}

export interface CategoryUpdateData {
  name?: string;
  slug?: string;
}

export interface Shop {
  id: number;
  name: string;
  description: string | null;
  phone: string;
  instagramLink: string | null;
  city: string;
  address: string | null;
  logoUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  categories?: Category[];
  ownerId: number;
  owner?: {                    // <-- добавь это
    id: number;
    email: string;
    name?: string | null;
  };
}

export interface ShopCreateData {
  name: string;
  description?: string | null;
  phone: string;
  instagramLink?: string | null;
  city: string;
  address?: string | null;
  categoryIds?: number[];
  logoFile?: File | null;
}

export interface ShopUpdateData {
  name?: string;
  description?: string | null;
  phone?: string;
  instagramLink?: string | null;
  city?: string;
  address?: string | null;
  categoryIds?: number[];
}

export interface Item {
  id: number;
  title: string;
  description: string | null;
  city: string | null;
  tags: string[];
  imageUrls: string[];
  categoryId: number;
  shopId: number;
}

export interface ItemCreateData {
  title: string;
  description?: string | null;
  categoryId: number;
  city?: string | null;
  tags?: string[];
  imageFiles?: File[];
}

export interface ItemUpdateData {
  title?: string;
  description?: string | null;
  categoryId?: number;
  city?: string | null;
  tags?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  name?: string | null;
  role: 'USER' | 'SHOP' | 'ADMIN';
}

interface ApiError extends Error {
  status?: number;
  details?: { message: string };
}

// ==================== API ====================

export const api = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${BASE_URL}/api/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  createCategory: async (data: CategoryCreateData, token: string): Promise<Category> => {
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

  updateCategory: async (id: number, data: CategoryUpdateData, token: string): Promise<Category> => {
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

  deleteCategory: async (id: number, token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.text();
  },

  uploadCategoryIcon: async (id: number, formData: FormData, token: string): Promise<Category> => {
    const response = await fetch(`${BASE_URL}/api/categories/${id}/icon`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload category icon');
    return response.json();
  },

  // Shops
  getShops: async (): Promise<Shop[]> => {
    const response = await fetch(`${BASE_URL}/api/shops`);
    if (!response.ok) throw new Error('Failed to fetch shops');
    return response.json();
  },

  getShop: async (id: number): Promise<Shop> => {
    const response = await fetch(`${BASE_URL}/api/shops/${id}`);
    if (!response.ok) throw new Error('Failed to fetch shop');
    return response.json();
  },

  createShop: async (data: ShopCreateData, token: string): Promise<Shop> => {
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

  updateShop: async (id: number, data: ShopUpdateData, token: string): Promise<Shop> => {
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

  deleteShop: async (id: number, token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/shops/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete shop');
    return response.text();
  },

  // Items
  getShopItems: async (shopId: number): Promise<Item[]> => {
    const response = await fetch(`${BASE_URL}/api/shops/${shopId}/items`);
    if (!response.ok) throw new Error('Failed to fetch shop items');
    return response.json();
  },

  getItems: async (): Promise<Item[]> => {
    const response = await fetch(`${BASE_URL}/api/items`);
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  },

  getItem: async (id: number): Promise<Item> => {
    const response = await fetch(`${BASE_URL}/api/items/${id}`);
    if (!response.ok) throw new Error('Failed to fetch item');
    return response.json();
  },

  createItem: async (shopId: number, data: ItemCreateData, token: string): Promise<Item> => {
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

  updateItem: async (id: number, data: ItemUpdateData, token: string): Promise<Item> => {
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

  deleteItem: async (id: number, token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/items/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete item');
    return response.text();
  },

  // Favorites (Items)
  getFavorites: async (token: string): Promise<Item[]> => {
    const response = await fetch(`${BASE_URL}/api/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch favorites');
    return response.json();
  },

  addToFavorites: async (itemId: number, token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/favorites/${itemId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to add to favorites');
    return response.text();
  },

  removeFromFavorites: async (itemId: number, token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/favorites/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove from favorites');
    return response.text();
  },

  // Shop Favorites
  getShopFavorites: async (token: string): Promise<Shop[]> => {
    const response = await fetch(`${BASE_URL}/api/shop-favorites`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch favorite shops');
    return response.json();
  },

  addShopToFavorites: async (shopId: number, token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/shop-favorites/${shopId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to add shop to favorites');
    return response.text();
  },

  removeShopFromFavorites: async (shopId: number, token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/shop-favorites/${shopId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove shop from favorites');
    return response.text();
  },

  isShopInFavorites: async (shopId: number, token: string): Promise<boolean> => {
    const response = await fetch(`${BASE_URL}/api/shop-favorites/${shopId}/check`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Failed to check shop favorite status');
    }
    return response.json();
  },

  // Auth
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error: ApiError = new Error('Login failed');
      error.status = response.status;
      try {
        error.details = await response.json();
      } catch {
        error.details = { message: response.statusText };
      }
      throw error;
    }
    return response.json();
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error: ApiError = new Error('Registration failed');
      error.status = response.status;
      try {
        error.details = await response.json();
      } catch {
        error.details = { message: response.statusText };
      }
      throw error;
    }
    return response.json();
  },

  forgotPassword: async (email: string): Promise<Response> => {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error: ApiError = new Error('Forgot password failed');
      error.status = response.status;
      try {
        error.details = await response.json();
      } catch {
        error.details = { message: response.statusText };
      }
      throw error;
    }
    return response;
  },

  resetPassword: async (token: string, newPassword: string): Promise<Response> => {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!response.ok) {
      const error: ApiError = new Error('Reset password failed');
      error.status = response.status;
      try {
        error.details = await response.json();
      } catch {
        error.details = { message: response.statusText };
      }
      throw error;
    }
    return response;
  },

  deleteMyAccount: async (token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    if (!response.ok) {
      const error: ApiError = new Error('Failed to delete account');
      error.status = response.status;
      throw error;
    }
    return response.text();
  },

  // Admin - Users
  getAllUsers: async (token: string): Promise<User[]> => {
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: ApiError = new Error('Failed to fetch users');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  deleteUser: async (userId: number, token: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: ApiError = new Error('Failed to delete user');
      error.status = response.status;
      throw error;
    }
    return response.text();
  },

  updateUserRole: async (userId: number, newRole: string, token: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newRole }),
    });
    if (!response.ok) {
      const error: ApiError = new Error('Failed to update user role');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  // Admin - Shops
  getPendingShops: async (token: string): Promise<Shop[]> => {
    const response = await fetch(`${BASE_URL}/api/admin/shops/pending`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: ApiError = new Error('Failed to fetch pending shops');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  getAllShops: async (token: string): Promise<Shop[]> => {
    const response = await fetch(`${BASE_URL}/api/admin/shops`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: ApiError = new Error('Failed to fetch all shops');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  approveShop: async (shopId: number, token: string): Promise<Shop> => {
    const response = await fetch(`${BASE_URL}/api/admin/shops/${shopId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: ApiError = new Error('Failed to approve shop');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  rejectShop: async (shopId: number, token: string): Promise<Shop> => {
    const response = await fetch(`${BASE_URL}/api/admin/shops/${shopId}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error: ApiError = new Error('Failed to reject shop');
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
};

export default api;