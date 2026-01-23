import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type Shop, type Category } from '../ShopAndUserApi';
import ShopsTab from '../ShopsTab/ShopsTab';
import './CategoryPage.css';

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [shopsData, categoriesData] = await Promise.all([
          api.getShops(),
          api.getCategories(),
        ]);
        
        // Находим текущую категорию по slug
        const category = categoriesData.find((cat) => cat.slug === categorySlug);
        
        if (!category) {
          setError('Категория не найдена');
          setLoading(false);
          return;
        }
        
        setCurrentCategory(category);
        
        // Фильтруем магазины по категории
        const filteredShops = shopsData.filter((shop) => 
          shop.categories && shop.categories.some((cat) => cat.id === category.id)
        );
        
        setShops(filteredShops);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные категории');
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      loadData();
    }
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="category-page-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка категории...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page-error">
        <h2>😕 {error}</h2>
        <button onClick={() => navigate('/')} className="back-button">
          ← Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <div className="category-page-container">
      {/* Шапка категории */}
      <div className="category-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Назад
        </button>
        <div className="category-info">
          {currentCategory?.iconUrl && (
            <img 
              src={currentCategory.iconUrl} 
              alt={currentCategory.name}
              className="category-header-image"
            />
          )}
          <h1 className="category-header-title">
            {currentCategory?.name}
          </h1>
        </div>
      </div>

      {/* Список магазинов */}
      {shops.length === 0 ? (
        <div className="no-shops-message">
          <p>😔 В этой категории пока нет магазинов</p>
          <button onClick={() => navigate('/')} className="back-button">
            Вернуться на главную
          </button>
        </div>
      ) : (
        <ShopsTab 
          shops={shops}
          currentUserId={null}
          categories={[]} // Не показываем карусель категорий на странице категории
        />
      )}
    </div>
  );
};

export default CategoryPage;