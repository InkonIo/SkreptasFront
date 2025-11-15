import React, { useState } from 'react';
import ItemDetailModal from './ItemDetailModal/ItemDetailModal';
import '../ItemAbout/ItemsTab.css';

interface ItemsTabProps {
  items: any[];
  favorites: any[];
  onToggleFavorite: (itemId: number, isFavorite: boolean) => void;
}

const ItemsTab: React.FC<ItemsTabProps> = ({ items, favorites, onToggleFavorite }) => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  const hasImages = (item: any) => item.images && Array.isArray(item.images) && item.images.length > 0;
  
  const isFavorite = (itemId: number) => {
    return favorites.some(fav => fav.id === itemId);
  };

  const hasTags = (item: any) => item.tags && Array.isArray(item.tags) && item.tags.length > 0;

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleToggleFavoriteForSelected = () => {
    if (selectedItem) {
      onToggleFavorite(selectedItem.id, isFavorite(selectedItem.id));
    }
  };

  return (
    <>
      <div className="items-container">
        <h2 className="items-title">Все товары</h2>
        <div className="items-grid">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="item-card"
              onClick={() => handleItemClick(item)}
            >
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
                  {item.shop?.instagramLink && (
                    <a 
                      href={item.shop.instagramLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="item-meta-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📷 Instagram
                    </a>
                  )}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id, isFavorite(item.id));
                  }}
                  className={`item-favorite-btn ${isFavorite(item.id) ? 'is-favorite' : ''}`}
                >
                  {isFavorite(item.id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isFavorite={isFavorite(selectedItem.id)}
          onClose={handleCloseModal}
          onToggleFavorite={handleToggleFavoriteForSelected}
        />
      )}
    </>
  );
};

export default ItemsTab;