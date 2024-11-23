import React, { useState } from 'react';
import { useAdminStore } from '../store';
import type { Product } from '../types';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';

export function Products() {
  const { categories, products, addProduct, updateProduct, deleteProduct } = useAdminStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    images: [],
    categoryId: '',
    subCategoryId: ''
  });

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      images: [],
      categoryId: '',
      subCategoryId: ''
    });
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      const editingProduct = products.find(p => p.name === formData.name);
      if (editingProduct) {
        updateProduct({ ...formData, id: editingProduct.id });
      }
    } else {
      addProduct(formData);
    }
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setIsEditing(true);
  };

  const handleFormChange = (data: Partial<Omit<Product, 'id'>>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Products Management</h2>
      
      <ProductForm
        formData={formData}
        isEditing={isEditing}
        categories={categories}
        selectedCategory={selectedCategory}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        onCancel={resetForm}
      />

      <ProductList
        products={products}
        categories={categories}
        onEdit={handleEdit}
        onDelete={deleteProduct}
      />
    </div>
  );
}