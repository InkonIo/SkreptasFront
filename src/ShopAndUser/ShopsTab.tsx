import React, { useState, useEffect } from 'react';
import '../ShopAndUser/css/ShopsTab.css';
import ShopDetailView from './ShopDetailView';

import { api } from './ShopAndUserApi';

interface ShopsTabProps {
  shops: any[];
  currentUserId: number | null;
  // token: string | null; // УДАЛЕНО
}

const ShopsTab: React.FC<ShopsTabProps> = ({ shops, currentUserId }) => { // УДАЛЕНО: token
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [favoriteShops, setFavoriteShops] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [errorFavorites, setErrorFavorites] = useState<string | null>(null);
  const [currentAccessToken, setCurrentAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));

  // Эффект для загрузки избранного
  useEffect(() => {
    if (activeTab === 'favorites' && currentAccessToken) {
      const fetchFavoriteShops = async () => {
        setLoadingFavorites(true);
        setErrorFavorites(null);
        try {
          const fetchedFavorites = await api.getShopFavorites(currentAccessToken);
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
  }, [activeTab, currentAccessToken]); // Добавили currentAccessToken в зависимости

  // Функция для переключения вкладок
  const handleTabChange = (tab: 'all' | 'favorites') => {
    setActiveTab(tab);
    // При переключении на вкладку "Избранное" обновляем токен
    if (tab === 'favorites') {
      setCurrentAccessToken(localStorage.getItem('accessToken'));
    }
  };


  
  const handleShopClick = (shop: any) => {
    setSelectedShop(shop);
  };

  const handleCloseModal = () => {
    setSelectedShop(null);
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
      if (!currentAccessToken) {
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
          // token={token} // УДАЛЕНО
        />
      )}
    </>
  );
};

export default ShopsTab;