import authApi, { fetchWrapper } from './general';
import adminApi from './admin';

export const api = {
  ...authApi,
  ...adminApi,
  fetchWrapper, // Export fetchWrapper for use in other modules if needed
};

export default api;
