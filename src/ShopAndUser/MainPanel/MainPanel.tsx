import React, { useState, useEffect } from 'react';
import { api, type Shop, type Category } from '../ShopAndUserApi';
import ShopsTab from '../ShopsTab/ShopsTab';
import './MainPanel.css';

const MainPanel: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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