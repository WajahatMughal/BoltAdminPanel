import { create } from 'zustand';
import { Category, Product, SubCategory } from './types';
import * as api from './api';

interface AdminStore {
  categories: Category[];
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  addCategory: (name: string, imageUrl?: string) => Promise<void>;
  addSubCategory: (name: string, parentId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  categories: [],
  products: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });
      const categories = await api.fetchCategories();
      set({ categories });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch categories' });
    } finally {
      set({ loading: false });
    }
  },

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const products = await api.fetchProducts();
      set({ products });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch products' });
    } finally {
      set({ loading: false });
    }
  },
  
  addCategory: async (name, imageUrl) => {
    try {
      set({ loading: true, error: null });
      const category = await api.createCategory({ name, imageUrl });
      set(state => ({
        categories: [...state.categories, category]
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add category' });
    } finally {
      set({ loading: false });
    }
  },

  addSubCategory: async (name, parentId) => {
    try {
      set({ loading: true, error: null });
      const subCategory = await api.createSubCategory({ name, categoryId: parentId });
      set(state => ({
        categories: state.categories.map(category =>
          category.id === parentId
            ? { ...category, subCategories: [...category.subCategories, subCategory] }
            : category
        )
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add subcategory' });
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    try {
      set({ loading: true, error: null });
      const newProduct = await api.createProduct(product);
      set(state => ({
        products: [...state.products, newProduct]
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add product' });
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (product) => {
    try {
      set({ loading: true, error: null });
      const updatedProduct = await api.updateProduct(product.id, product);
      set(state => ({
        products: state.products.map(p =>
          p.id === product.id ? updatedProduct : p
        )
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update product' });
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ loading: true, error: null });
      await api.deleteProduct(id);
      set(state => ({
        products: state.products.filter(product => product.id !== id)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete product' });
    } finally {
      set({ loading: false });
    }
  },

  deleteCategory: async (id) => {
    try {
      set({ loading: true, error: null });
      await api.deleteCategory(id);
      set(state => ({
        categories: state.categories.filter(category => category.id !== id)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete category' });
    } finally {
      set({ loading: false });
    }
  },

  deleteSubCategory: async (id) => {
    try {
      set({ loading: true, error: null });
      await api.deleteSubCategory(id);
      set(state => ({
        categories: state.categories.map(category => ({
          ...category,
          subCategories: category.subCategories.filter(sub => sub.id !== id)
        }))
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete subcategory' });
    } finally {
      set({ loading: false });
    }
  }
}));