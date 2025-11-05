import React from 'react';
import '../ShopAndUser/css/ItemsTab.css';

interface ItemsTabProps {
  items: any[];
  favorites: any[];
  onToggleFavorite: (itemId: number, isFavorite: boolean) => void;
}

const ItemsTab: React.FC<ItemsTabProps> = ({ items, favorites, onToggleFavorite }) => {
  const hasImages = (item: any) => item.images && Array.isArray(item.images) && item.images.length > 0;
  
  // ✅ Оставлена одна корректная функция isFavorite
  const isFavorite = (itemId: number) => {
    return favorites.some(fav => fav.id === itemId);
  };

  // ✅ Исправленная функция hasTags
  const hasTags = (item: any) => item.tags && Array.isArray(item.tags) && item.tags.length > 0;

  return (
    <div className="items-container">
      <h2 className="items-title">Все товары</h2>
      <div className="items-grid">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-content">
              <div className="item-info">
                {hasImages(item) && (
                <div className="item-images">
                    {item.images.slice(0, 3).map((img: string, idx: number) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={item.title}
                        className="item-image"
                      />
                    ))}
                    {item.images.length > 3 && (
                      <div className="item-image-more">
                        +{item.images.length - 3} фото
                      </div>
                    )}
                  </div>
                )}
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">{item.description}</p>
                <p className="item-meta">🏪 Магазин: {item.shop?.name}</p>
                <p className="item-meta">📍 {item.city}</p>
                {hasTags(item) && (
                  <p className="item-tags">
                    🏷️ {item.tags.map((tag: string) => `#${tag}`).join(' ')}
                  </p>
                )}
                <small className="item-stats">
                  👁️ {item.views} | ❤️ {item.favorites}
                </small>
              </div>
              <button
                onClick={() => onToggleFavorite(item.id, isFavorite(item.id))}
                className={`item-favorite-btn ${isFavorite(item.id) ? 'is-favorite' : ''}`}
              >
                {isFavorite(item.id) ? '❤️ Убрать' : '🤍 В избранное'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsTab;