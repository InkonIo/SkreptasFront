import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../ShopAndUserApi';
import ShopsTab from '../ShopsTab/ShopsTab';
import './MainPanel.css';

interface Shop {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  city: string;
  categories: { id: number; name: string }[];
}

interface Category {
  id: number;
  name: string;
}

const MainPanel: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [shopsData, categoriesData] = await Promise.all([
          api.getShops(),
          api.getCategories(),
        ]);
        setShops(shopsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить магазины или категории.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredShops = useMemo(() => {
    if (!selectedCategory) {
      return shops;
    }
    return shops.filter(shop => 
      shop.categories.some(cat => cat.id === selectedCategory)
    );
  }, [shops, selectedCategory]);

  if (loading) {
    return <div className="main-panel-loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="main-panel-error">{error}</div>;
  }

  return (
    <div className="main-panel-container">
      {/* Используем ShopsTab с лентой категорий */}
      <ShopsTab 
        shops={shops}
        currentUserId={null}
        categories={categories}
      />
    </div>
  );
};

export default MainPanel;