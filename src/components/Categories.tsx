import React, { useState } from 'react';
import { useAdminStore } from '../store';
import { Plus, Trash2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

export function Categories() {
  const { categories, addCategory, addSubCategory, deleteCategory, deleteSubCategory } = useAdminStore();
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryImages, setNewCategoryImages] = useState<string[]>([]);
  const [newSubCategory, setNewSubCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim(), newCategoryImages[0]);
      setNewCategory('');
      setNewCategoryImages([]);
    }
  };

  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubCategory.trim() && selectedCategory) {
      addSubCategory(newSubCategory.trim(), selectedCategory);
      setNewSubCategory('');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Categories Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Categories */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Main Categories</h3>
          <form onSubmit={handleAddCategory} className="mb-4 space-y-3">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <ImageUpload
              images={newCategoryImages}
              maxImages={1}
              type="categories"
              onImagesChange={setNewCategoryImages}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
            >
              <Plus size={20} className="mr-2" />
              Add Category
            </button>
          </form>

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-10 w-10 rounded-full object-cover mr-3"
                    />
                  )}
                  <span className="font-medium">{category.name}</span>
                </div>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sub Categories */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Sub Categories</h3>
          <form onSubmit={handleAddSubCategory} className="mb-4 space-y-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Main Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                placeholder="New subcategory name"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                disabled={!selectedCategory}
              >
                <Plus size={20} className="mr-2" />
                Add
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id}>
                <h4 className="font-medium text-gray-700 mb-2">{category.name}</h4>
                <div className="ml-4 space-y-2">
                  {category.subCategories.map((subCategory) => (
                    <div
                      key={subCategory.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span>{subCategory.name}</span>
                      <button
                        onClick={() => deleteSubCategory(category.id, subCategory.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}