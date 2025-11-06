import React from 'react';
import '../ShopAndUser/css/FavoritesTab.css';

interface FavoritesTabProps {
  favorites: any[];
  onRemoveFavorite: (itemId: number) => void;
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ favorites, onRemoveFavorite }) => {
  // Функция для проверки, является ли объект массивом и не пустым
  const hasImages = (item: any) => item.images && Array.isArray(item.images) && item.images.length > 0;
  const hasTags = (item: any) => item.tags && Array.isArray(item.tags) && item.tags.length > 0;
  return (
    <div className="favorites-container">
      <h2 className="favorites-title">❤️ Избранное</h2>
      {favorites.length === 0 ? (
        <p className="favorites-empty">
          Пока нет избранных товаров
        </p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((item) => (
            <div key={item.id} className="favorite-item">
              <div className="favorite-content">
                <div className="favorite-info">
                  {hasImages(item) && (
                    <div className="favorite-images">
                      {item.images.slice(0, 3).map((img: string, idx: number) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={item.title}
                          className="favorite-image"
                        />
                      ))}
                    </div>
                  )}
                  <h3 className="favorite-title">{item.title}</h3>
                  <p className="favorite-description">{item.description}</p>
                  <p className="favorite-meta">🏪 Магазин: {item.shop?.name}</p>
                  <p className="favorite-meta">📍 {item.city}</p>
                  {hasTags(item) && (
                    <p className="favorite-tags">
                      🏷️ {item.tags.map((tag: string) => `#${tag}`).join(' ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveFavorite(item.id)}
                  className="favorite-remove-btn"
                >
                  ❤️ Убрать
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesTab;