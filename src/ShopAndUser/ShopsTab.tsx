import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../ShopAndUser/css/ShopsTab.css';
import ShopDetailView from './ShopDetailView';
import { api } from './ShopAndUserApi';

interface ShopsTabProps {
  shops: any[];
  currentUserId: number | null;
  categories: any[];
}

const ShopsTab: React.FC<ShopsTabProps> = ({ shops, currentUserId, categories }) => {
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [favoriteShops, setFavoriteShops] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [errorFavorites, setErrorFavorites] = useState<string | null>(null);

  // Получаем токен из localStorage напрямую
  const getAccessToken = () => localStorage.getItem('accessToken');

  // Эффект для загрузки избранного
  useEffect(() => {
    if (activeTab === 'favorites') {
      const token = getAccessToken();
      if (token) {
        const fetchFavoriteShops = async () => {
          setLoadingFavorites(true);
          setErrorFavorites(null);
          try {
            const fetchedFavorites = await api.getShopFavorites(token);
            setFavoriteShops(fetchedFavorites);
          } catch (err) {
            console.error('Failed to fetch favorite shops:', err);
            setErrorFavorites('Не удалось загрузить избранные магазины.');
          } finally {
            setLoadingFavorites(false);
          }
        };
        fetchFavoriteShops();
      }
    }
  }, [activeTab]);

  const handleTabChange = (tab: 'all' | 'favorites') => {
    setActiveTab(tab);
  };

  const handleShopClick = (shop: any) => {
    setSelectedShop(shop);
  };

  const handleCloseModal = () => {
    setSelectedShop(null);
  };

  const navigate = useNavigate();

  const handleCategoryClick = (category: any) => {
    console.log('Category clicked:', category.name);
    // Переход на страницу категории
    navigate(`/category/${category.slug}`);
  };
  
  const renderShopCard = (shop: any) => (
    <div 
      key={shop.id} 
      className={`shop-card ${shop.approved ? 'approved' : 'pending'}`}
      onClick={() => handleShopClick(shop)}
    >
      <div className="shop-content-logo">
        {shop.logoUrl ? (
          <img 
            src={shop.logoUrl} 
            alt={shop.name}
            className="shop-logo-only"
          />
        ) : (
          <div className="shop-logo-placeholder">
            {shop.name.substring(0, 2)}
          </div>
        )}
      </div>
      <div className="shop-card-details">
        <h4 className="shop-card-name">{shop.name}</h4>
        {shop.instagramLink && (
          <a 
            href={shop.instagramLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="shop-card-instagram-link"
            onClick={(e) => e.stopPropagation()}
          >
            📷 Перейти в Instagram
          </a>
        )}
      </div>
    </div>
  );

  const renderShopList = (shopList: any[], title: string) => (
    <>
      <h2 className="shops-title">{title}</h2>
      <div className="shops-grid">
        {shopList.map(renderShopCard)}
      </div>
    </>
  );

  const renderContent = () => {
    if (activeTab === 'all') {
      return renderShopList(shops, 'Все магазины');
    }

    if (activeTab === 'favorites') {
      const token = getAccessToken();
      if (!token) {
        return <div className="shops-message">Войдите, чтобы просматривать избранные магазины.</div>;
      }
      if (loadingFavorites) {
        return <div className="shops-message">Загрузка избранных магазинов...</div>;
      }
      if (errorFavorites) {
        return <div className="shops-message error">{errorFavorites}</div>;
      }
      if (favoriteShops.length === 0) {
        return <div className="shops-message">У вас пока нет избранных магазинов.</div>;
      }
      return renderShopList(favoriteShops, 'Избранные магазины');
    }
    return null;
  };

  return (
    <>
      {/* Лента категорий с бесконечной прокруткой */}
      {categories && categories.length > 0 && (
        <div className="categories-carousel-wrapper">
          <h2 className="categories-carousel-title">Основные категории</h2>
          <div className="categories-carousel-container">
            <div className="categories-carousel">
              {/* Утраиваем категории для бесконечной прокрутки */}
              {[...categories, ...categories, ...categories].map((category, index) => (
                <div 
                  key={`${category.id}-${index}`} 
                  className="category-card"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.icon ? (
                    <img 
                      src={category.icon} 
                      alt={category.name}
                      className="category-card-image"
                    />
                  ) : (
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #df1778 0%, #ff6b9d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {category.name.substring(0, 2)}
                    </div>
                  )}
                  <span className="category-card-name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="shops-tabs">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          Все магазины
        </button>
        <button 
          className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => handleTabChange('favorites')}
        >
          Избранное
        </button>
      </div>
      
      <div className="shops-container">
        {renderContent()}
      </div>

      {selectedShop && (
        <ShopDetailView 
          shop={selectedShop} 
          onClose={handleCloseModal} 
          currentUserId={currentUserId}
        />
      )}
    </>
  );
};

export default ShopsTab;