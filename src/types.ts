export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  parentId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  subCategoryId: string;
  stock: number;
}