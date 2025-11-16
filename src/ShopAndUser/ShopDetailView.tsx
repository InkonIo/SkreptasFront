import React, { useState, useEffect } from 'react';
import { api } from './ShopAndUserApi';
import ItemsTab from './ItemAbout/ItemsTab';
import '../ShopAndUser/css/ShopDetailView.css';

interface ShopDetailViewProps {
  shop: any;
  onClose: () => void;
  currentUserId: number | null;
}

const ShopDetailView: React.FC<ShopDetailViewProps> = ({ 
  shop, 
  onClose, 
  currentUserId 
}) => {
  
  const extractInstagramUsername = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:instagram\.com|instagr\.am)\/([A-Za-z0-9_.]+)/i);
    if (match && match[1]) {
      return match[1];
    }
    if (!url.includes('/') && !url.includes('.')) {
        return url;
    }
    return null;
  };

  const instagramUsername = extractInstagramUsername(shop.instagramLink);
  const displayTitle = instagramUsername || shop.name;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [loadingFavoriteItems, setLoadingFavoriteItems] = useState(false);

  useEffect(() => {
    const fetchShopItems = async () => {
      if (!shop || !shop.id) return;

      try {
        setLoading(true);
        const fetchedItems = await api.getShopItems(shop.id);
        setItems(fetchedItems);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch shop items:', err);
        setError('Не удалось загрузить товары. Возможно, у магазина пока нет товаров или произошла ошибка.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopItems();
  }, [shop]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token || !shop?.id) return;
      
      try {
        const status = await api.isShopInFavorites(shop.id, token);
        setIsFavorite(status);
      } catch (err) {
        console.error('Failed to check favorite status:', err);
      }
    };
    
    checkFavoriteStatus();
  }, [shop]);

  useEffect(() => {
    const loadFavoriteItems = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setFavoriteItems([]);
        return;
      }

      setLoadingFavoriteItems(true);
      try {
        const favorites = await api.getFavorites(token);
        setFavoriteItems(favorites);
      } catch (err) {
        console.error('Failed to load favorite items:', err);
        setFavoriteItems([]);
      } finally {
        setLoadingFavoriteItems(false);
      }
    };

    loadFavoriteItems();
  }, []);

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !shop?.id) {
      alert('Войдите, чтобы добавить в избранное');
      return;
    }
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await api.removeShopFromFavorites(shop.id, token);
        setIsFavorite(false);
      } else {
        await api.addShopToFavorites(shop.id, token);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      alert('Не удалось обновить избранное');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleToggleFavoriteItem = async (itemId: number, isFavorite: boolean) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Войдите, чтобы добавить в избранное');
      return;
    }

    try {
      if (isFavorite) {
        await api.removeFromFavorites(itemId, token);
        setFavoriteItems(prev => prev.filter(item => item.id !== itemId));
        alert('Удалено из избранного');
      } else {
        await api.addToFavorites(itemId, token);
        const item = items.find(i => i.id === itemId);
        if (item) {
          setFavoriteItems(prev => [...prev, item]);
        }
        alert('Добавлено в избранное');
      }
    } catch (err) {
      console.error('Failed to toggle favorite item:', err);
      alert('Ошибка при обновлении избранного');
    }
  };

  const renderShopDetails = () => (
  <div 
    className="shop-detail-header"
    onClick={(e) => e.stopPropagation()} // останавливаем всплытие для всей карточки
  >
    <div className="shop-logo-wrapper">
      {shop.logoUrl ? (
        <img 
          src={shop.logoUrl} 
          alt={shop.name}
          className="shop-detail-logo"
        />
      ) : (
        <div className="shop-detail-logo-placeholder">
          {shop.name.substring(0, 2)}
        </div>
      )}
    </div>

    <div className="shop-info-block">
      <h1 className="shop-detail-name">{displayTitle}</h1>

      {shop.instagramLink && (
        <a 
          href={shop.instagramLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="shop-detail-instagram-link"
          onClick={(e) => e.stopPropagation()} // предотвращаем всплытие
        >
          Открыть инстаграм аккаунт 🔗
        </a>
      )}

      <button 
        className="shop-detail-favorite-button"
        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
        disabled={favoriteLoading}
      >
        <span className="heart-icon">{isFavorite ? '❤️' : '♡'}</span> 
        {isFavorite ? 'Убрать из избранного' : 'Добавить в избранные'}
      </button>

      {currentUserId && shop.owner?.id === currentUserId && (
        <div className="shop-owner-actions">
          <p className="shop-owner-message">
            ✅ **Это Ваш магазин.** Вы можете управлять им через вкладку "Мой магазин".
          </p>
        </div>
      )}

      <div className="shop-detail-meta-info">
        <p className="shop-detail-category">
          Категория: <span>{shop.categories?.map((c: any) => c.name).join(', ') || 'Не указана'}</span>
        </p>
        <h3 className="shop-detail-description-title">Описание:</h3>
        <div className="shop-detail-description-text">
          {shop.description ? (
            shop.description.split('\n').map((line: string, index: number) => (
              <p key={index} dangerouslySetInnerHTML={{ __html: line }} />
            ))
          ) : (
            <p>Описание отсутствует.</p>
          )}
        </div>
      </div>
    </div>
  </div>
);


  const renderItemsSection = () => {
    if (loading) {
      return <div className="items-loading">Загрузка товаров...</div>;
    }

    if (error) {
      return <div className="items-error">{error}</div>;
    }

    if (items.length === 0) {
      return <div className="items-empty">Товары не найдены.</div>;
    }

    return (
      <>
        <h2 className="items-section-title">Все товары</h2>
        <ItemsTab 
          items={items} 
          favorites={favoriteItems}
          onToggleFavorite={handleToggleFavoriteItem} 
        />
      </>
    );
  };

  return (
    <div className="modal-overlay full-screen-modal" onClick={onClose}>
      <div className="modal-content shop-detail-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-button" onClick={onClose}>
          &times;
        </button>
        
        {renderShopDetails()}
        
        <hr className="shop-detail-separator" />
        
        {renderItemsSection()}
        
      </div>
    </div>
  );
};

export default ShopDetailView;