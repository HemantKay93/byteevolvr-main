import { apiClient } from '../apiClient';

export interface Product {
  id?: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category: string;
  brand?: string;
  sku?: string;
  stock_quantity: number;
  tags?: string[];
  status?: 'active' | 'draft' | 'out_of_stock';
  featured?: boolean;
  sort_order?: number;
  specifications?: Array<{ key: string; value: string }>;
  qna?: Array<{ question: string; answer: string }>;
  reviews?: Array<{ user: string; rating: number; comment: string }>;
}

export const ProductService = {
  getProducts: async (params?: any): Promise<Product[]> => {
    const response = await apiClient.get('/products', { params });
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return response.data?.data || response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data?.data || response.data;
  },

  createProduct: async (payload: Product): Promise<Product> => {
    const response = await apiClient.post('/products', payload);
    return response.data?.data || response.data;
  },

  updateProduct: async (id: string, payload: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, payload);
    return response.data?.data || response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url || response.data.data?.url;
  },

  // Categories
  getCategories: async (): Promise<any[]> => {
    const response = await apiClient.get('/products/categories');
    return response.data?.data || response.data || [];
  },

  createCategory: async (payload: {
    name: string;
    slug?: string;
    parent?: string;
    description?: string;
    status?: string;
  }): Promise<any> => {
    const response = await apiClient.post('/products/categories', payload);
    return response.data?.data || response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/categories/${id}`);
  },

  // Brands
  getBrands: async (): Promise<any[]> => {
    const response = await apiClient.get('/products/brands');
    return response.data?.data || response.data || [];
  },

  createBrand: async (payload: {
    name: string;
    slug?: string;
    website?: string;
    logo_url?: string;
    status?: string;
  }): Promise<any> => {
    const response = await apiClient.post('/products/brands', payload);
    return response.data?.data || response.data;
  },

  deleteBrand: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/brands/${id}`);
  },
};
