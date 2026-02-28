import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/admin/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

// Users API (Admin Management)
export const usersApi = {
  list: () => api.get('/admin/users'),
  get: (id: string) => api.get(`/admin/users/${id}`),
  create: (data: any) => api.post('/admin/users', data),
  update: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  delete: (id: string) => api.delete(`/admin/users/${id}`),
};

// Media API
export const mediaApi = {
  list: (params?: { entityType?: string; entityId?: string }) =>
    api.get('/admin/media', { params }),
  get: (id: string) => api.get(`/admin/media/${id}`),
  upload: (formData: FormData) =>
    api.post('/admin/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  reorder: (mediaIds: string[]) =>
    api.patch('/admin/media/reorder', { mediaIds }),
  delete: (id: string) => api.delete(`/admin/media/${id}`),
};

// Categories API
export const categoriesApi = {
  list: (includeInactive?: boolean) =>
    api.get('/admin/categories', { params: { includeInactive } }),
  tree: () => api.get('/admin/categories/tree'),
  get: (id: string) => api.get(`/admin/categories/${id}`),
  create: (data: any) => api.post('/admin/categories', data),
  update: (id: string, data: any) => api.patch(`/admin/categories/${id}`, data),
  delete: (id: string) => api.delete(`/admin/categories/${id}`),
};

// Products API
export const productsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    search?: string;
  }) => api.get('/admin/products', { params }),
  lowStock: () => api.get('/admin/products/low-stock'),
  get: (id: string) => api.get(`/admin/products/${id}`),
  create: (data: any) => api.post('/admin/products', data),
  update: (id: string, data: any) => api.patch(`/admin/products/${id}`, data),
  adjustStock: (id: string, quantity: number) =>
    api.patch(`/admin/products/${id}/stock`, { quantity }),
  delete: (id: string) => api.delete(`/admin/products/${id}`),
};

// Countries API
export const countriesApi = {
  list: (includeInactive?: boolean) =>
    api.get('/admin/countries', { params: { includeInactive } }),
  get: (id: string) => api.get(`/admin/countries/${id}`),
  create: (data: any) => api.post('/admin/countries', data),
  update: (id: string, data: any) => api.patch(`/admin/countries/${id}`, data),
  delete: (id: string) => api.delete(`/admin/countries/${id}`),
};

// Cities API
export const citiesApi = {
  list: (countryId?: string) =>
    api.get('/admin/cities', { params: { countryId } }),
  get: (id: string) => api.get(`/admin/cities/${id}`),
  create: (data: any) => api.post('/admin/cities', data),
  update: (id: string, data: any) => api.patch(`/admin/cities/${id}`, data),
  delete: (id: string) => api.delete(`/admin/cities/${id}`),
};

// Shipping Methods API
export const shippingApi = {
  list: () => api.get('/admin/shipping-methods'),
  calculate: (cityId: string) =>
    api.get('/admin/shipping-methods/calculate', { params: { cityId } }),
  get: (id: string) => api.get(`/admin/shipping-methods/${id}`),
  create: (data: any) => api.post('/admin/shipping-methods', data),
  update: (id: string, data: any) =>
    api.patch(`/admin/shipping-methods/${id}`, data),
  setCityPrices: (id: string, cityPrices: Array<{ cityId: string; price: number }>) =>
    api.post(`/admin/shipping-methods/${id}/city-prices`, { cityPrices }),
  delete: (id: string) => api.delete(`/admin/shipping-methods/${id}`),
};

// Customers API
export const customersApi = {
  list: (params?: { search?: string; isActive?: boolean }) =>
    api.get('/admin/customers', { params }),
  get: (id: string) => api.get(`/admin/customers/${id}`),
  create: (data: any) => api.post('/admin/customers', data),
  update: (id: string, data: any) => api.patch(`/admin/customers/${id}`, data),
  addAddress: (id: string, address: any) =>
    api.post(`/admin/customers/${id}/addresses`, { address }),
  removeAddress: (id: string, index: number) =>
    api.delete(`/admin/customers/${id}/addresses/${index}`),
  delete: (id: string) => api.delete(`/admin/customers/${id}`),
};

// Coupons API
export const couponsApi = {
  list: () => api.get('/admin/coupons'),
  get: (id: string) => api.get(`/admin/coupons/${id}`),
  create: (data: any) => api.post('/admin/coupons', data),
  validate: (code: string, orderAmount: number) =>
    api.post('/admin/coupons/validate', { code, orderAmount }),
  update: (id: string, data: any) => api.patch(`/admin/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/admin/coupons/${id}`),
};

// Orders API
export const ordersApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    customerId?: string;
  }) => api.get('/admin/orders', { params }),
  get: (id: string) => api.get(`/admin/orders/${id}`),
  create: (data: any) => api.post('/admin/orders', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }),
  updatePaymentStatus: (id: string, paymentStatus: string) =>
    api.patch(`/admin/orders/${id}/payment-status`, { paymentStatus }),
  addTracking: (id: string, trackingNumber: string) =>
    api.patch(`/admin/orders/${id}/tracking`, { trackingNumber }),
};

// Reviews API
export const reviewsApi = {
  list: (params?: { productId?: string; customerId?: string; isApproved?: boolean }) =>
    api.get('/admin/reviews', { params }),
  get: (id: string) => api.get(`/admin/reviews/${id}`),
  create: (data: any) => api.post('/admin/reviews', data),
  approve: (id: string) => api.patch(`/admin/reviews/${id}/approve`),
  reject: (id: string) => api.patch(`/admin/reviews/${id}/reject`),
  delete: (id: string) => api.delete(`/admin/reviews/${id}`),
};

// Settings API
export const settingsApi = {
  get: () => api.get('/admin/settings'),
  update: (data: any) => api.patch('/admin/settings', data),
};

// Contact Messages API
export const messagesApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/contact', { params }),
  get: (id: string) => api.get(`/admin/contact/${id}`),
  delete: (id: string) => api.delete(`/admin/contact/${id}`),
  markAsRead: (id: string) => api.patch(`/admin/contact/${id}/read`),
};

// Dashboard API
export const dashboardApi = {
  stats: () => api.get('/admin/dashboard/stats'),
  recentOrders: (limit?: number) =>
    api.get('/admin/dashboard/recent-orders', { params: { limit } }),
  topProducts: (limit?: number) =>
    api.get('/admin/dashboard/top-products', { params: { limit } }),
};

// Shop Public API
export const shopApi = {
  // Categories
  getCategories: () => api.get('/categories'),
  getCategoryTree: () => api.get('/categories/tree'),

  // Products
  listProducts: (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  getProductBySlug: (slug: string) => api.get(`/products/slug/${slug}`),

  // Shipping & Coupons
  calculateShipping: (cityId: string) => api.get('/shipping/calculate', { params: { cityId } }),
  validateCoupon: (code: string, orderAmount: number) => api.post('/coupons/validate', { code, orderAmount }),

  // Orders (Frontend Checkout)
  placeOrder: (data: any) => api.post('/orders', data),

  // Reviews & Contact
  submitReview: (data: any) => api.post('/reviews', data),
  submitContactForm: (data: any) => api.post('/contact', data),

  // Settings
  getSettings: () => api.get('/settings'),

  // Locations (Public for checkout)
  getCountries: () => api.get('/countries'),
  getCities: (countryId?: string) => api.get('/cities', { params: { countryId } }),

  // Banners
  getBanners: () => api.get('/banners'),

  // Home Page Consolidated Data
  getHomeData: () => api.get('/home'),
};

// Admin Banners API
export const bannersApi = {
  list: () => api.get('/admin/banners'),
  get: (id: string) => api.get(`/admin/banners/${id}`),
  create: (data: any) => api.post('/admin/banners', data),
  update: (id: string, data: any) => api.patch(`/admin/banners/${id}`, data),
  delete: (id: string) => api.delete(`/admin/banners/${id}`),
};

// FAQs API
export const faqsApi = {
  list: () => api.get('/admin/faqs'),
  get: (id: string) => api.get(`/admin/faqs/${id}`),
  create: (data: any) => api.post('/admin/faqs', data),
  update: (id: string, data: any) => api.patch(`/admin/faqs/${id}`, data),
  delete: (id: string) => api.delete(`/admin/faqs/${id}`),
};

// Blogs API
export const blogsApi = {
  list: () => api.get('/admin/blogs'),
  get: (id: string) => api.get(`/admin/blogs/${id}`),
  create: (data: any) => api.post('/admin/blogs', data),
  update: (id: string, data: any) => api.patch(`/admin/blogs/${id}`, data),
  delete: (id: string) => api.delete(`/admin/blogs/${id}`),
};

// Offers API
export const adminOffersApi = {
  list: () => api.get('/admin/offers'),
  get: (id: string) => api.get(`/admin/offers/${id}`),
  create: (data: any) => api.post('/admin/offers', data),
  update: (id: string, data: any) => api.patch(`/admin/offers/${id}`, data),
  delete: (id: string) => api.delete(`/admin/offers/${id}`),
};

// Transfer Public API
export const transferApi = {
  getMethods: () => api.get('/transfer/methods'),
  getQuote: (data: { fromMethodId: string; toMethodId: string; amount: number }) =>
    api.post('/transfer/quote', data),
  confirm: (data: {
    fromMethodId: string;
    toMethodId: string;
    amount: number;
    customerName?: string;
    customerPhone?: string;
    customerWhatsapp?: string;
  }) => api.post('/transfer/confirm', data),
  getOrders: (params: { phone: string; page?: number; limit?: number; status?: string }) =>
    api.get('/transfer/orders', { params }),
  getOrder: (id: string, phone: string) =>
    api.get(`/transfer/orders/${id}`, { params: { phone } }),
};

// Transfer Admin API
export const adminTransferApi = {
  // Methods
  listMethods: () => api.get('/admin/transfer/methods'),
  getMethod: (id: string) => api.get(`/admin/transfer/methods/${id}`),
  createMethod: (data: any) => api.post('/admin/transfer/methods', data),
  updateMethod: (id: string, data: any) => api.patch(`/admin/transfer/methods/${id}`, data),
  deleteMethod: (id: string) => api.delete(`/admin/transfer/methods/${id}`),

  // Fee Rules
  listFeeRules: () => api.get('/admin/transfer/fee-rules'),
  getFeeRule: (id: string) => api.get(`/admin/transfer/fee-rules/${id}`),
  createFeeRule: (data: any) => api.post('/admin/transfer/fee-rules', data),
  updateFeeRule: (id: string, data: any) => api.patch(`/admin/transfer/fee-rules/${id}`, data),
  deleteFeeRule: (id: string) => api.delete(`/admin/transfer/fee-rules/${id}`),

  // Orders
  listOrders: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get('/admin/transfer/orders', { params }),
  getOrder: (id: string) => api.get(`/admin/transfer/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/admin/transfer/orders/${id}/status`, { status }),
  updateOrderNotes: (id: string, adminNotes: string) =>
    api.patch(`/admin/transfer/orders/${id}/notes`, { adminNotes }),

  // Customers
  listCustomers: () => api.get('/admin/transfer/customers'),
  getCustomer: (id: string) => api.get(`/admin/transfer/customers/${id}`),
  toggleCustomerActive: (id: string, isActive: boolean) =>
    api.patch(`/admin/transfer/customers/${id}/toggle-active`, { isActive }),
};

export default api;
