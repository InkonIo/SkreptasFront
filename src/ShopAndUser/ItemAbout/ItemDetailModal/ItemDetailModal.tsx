import React from 'react';
import './ItemDetailModal.css';

interface ItemDetailModalProps {
  item: any;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isFavorite,
  onClose,
  onToggleFavorite
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const hasImages = item.images && Array.isArray(item.images) && item.images.length > 0;
  const hasTags = item.tags && Array.isArray(item.tags) && item.tags.length > 0;

  const handlePrevImage = () => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => 
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="item-detail-overlay" onClick={onClose}>
      <div className="item-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="item-detail-close" onClick={onClose}>
          ×
        </button>

        <div className="item-detail-content">
          {/* Галерея изображений */}
          <div className="item-detail-gallery">
            {hasImages ? (
              <>
                <img
                  src={item.images[currentImageIndex]}
                  alt={item.title}
                  className="item-detail-image"
                />
                {item.images.length > 1 && (
                  <>
                    <button 
                      className="item-detail-nav item-detail-nav-prev"
                      onClick={handlePrevImage}
                    >
                      ‹
                    </button>
                    <button 
                      className="item-detail-nav item-detail-nav-next"
                      onClick={handleNextImage}
                    >
                      ›
                    </button>
                    <div className="item-detail-indicators">
                      {item.images.map((_: any, idx: number) => (
                        <div
                          key={idx}
                          className={`item-detail-indicator ${idx === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(idx)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="item-detail-no-image">
                Нет изображения
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="item-detail-info">
            <h2 className="item-detail-title">{item.title}</h2>
            
            {item.description && (
              <p className="item-detail-description">{item.description}</p>
            )}

            <div className="item-detail-meta">
              {item.shop?.name && (
                <div className="item-detail-meta-item">
                  <span className="item-detail-meta-label">🏪 Магазин:</span>
                  <span>{item.shop.name}</span>
                </div>
              )}

              {item.city && (
                <div className="item-detail-meta-item">
                  <span className="item-detail-meta-label">📍 Город:</span>
                  <span>{item.city}</span>
                </div>
              )}

              {hasTags && (
                <div className="item-detail-meta-item">
                  <span className="item-detail-meta-label">🏷️ Теги:</span>
                  <span className="item-detail-tags">
                    {item.tags.map((tag: string) => `#${tag}`).join(' ')}
                  </span>
                </div>
              )}

              <div className="item-detail-stats">
                👁️ {item.views || 0} просмотров | ❤️ {item.favorites || 0} избранных
              </div>
            </div>

            {item.shop?.instagramLink && (
              <a
                href={item.shop.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="item-detail-instagram-link"
              >
                📷 Открыть Instagram магазина
              </a>
            )}

            <button
              onClick={onToggleFavorite}
              className={`item-detail-favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
            >
              {isFavorite ? '❤️ Убрать из избранного' : '♡ Добавить в избранное'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;