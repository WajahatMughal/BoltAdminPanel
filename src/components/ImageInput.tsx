import React from 'react';
import { ImagePlus, X } from 'lucide-react';

interface ImageInputProps {
  images: string[];
  maxImages: number;
  onImagesChange: (images: string[]) => void;
}

export function ImageInput({ images, maxImages, onImagesChange }: ImageInputProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    if (url && images.length < maxImages) {
      onImagesChange([...images, url]);
    }
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {images.length < maxImages && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Enter image URL"
            onChange={handleImageChange}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <div className="flex items-center justify-center bg-gray-100 rounded-lg px-4">
            <ImagePlus size={20} className="text-gray-500" />
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}