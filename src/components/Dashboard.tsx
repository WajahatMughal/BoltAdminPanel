import React from 'react';
import { useAdminStore } from '../store';
import { BarChart, Package, FolderTree, DollarSign } from 'lucide-react';

export function Dashboard() {
  const { products, categories } = useAdminStore();
  
  const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Categories',
      value: categories.length,
      icon: FolderTree,
      color: 'bg-green-500',
    },
    {
      title: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Low Stock Items',
      value: products.filter(p => p.stock < 10).length,
      icon: BarChart,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-md p-6 flex items-center"
            >
              <div className={`${stat.color} p-4 rounded-lg mr-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <div>
                <p className="text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}