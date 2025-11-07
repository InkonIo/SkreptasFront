import React, { useState } from 'react';
import '../ShopAndUser/css/ShopsTab.css';

interface ShopsTabProps {
  shops: any[];
}

const ShopsTab: React.FC<ShopsTabProps> = ({ shops }) => {
  const [selectedShop, setSelectedShop] = useState<any | null>(null);

  const handleShopClick = (shop: any) => {
    setSelectedShop(shop);
  };

  const handleCloseModal = () => {
    setSelectedShop(null);
  };
  
  return (
    // 🛑 ИСПРАВЛЕНО: Добавлен React Fragment (<>...</>) как единственный корневой элемент
    <>
      <div className="shops-container">
        <h2 className="shops-title">Все магазины</h2>
        <div className="shops-grid">
          {shops.map((shop) => (
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
            </div>
          ))}
        </div>
      </div>

      
      {selectedShop && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={handleCloseModal}>
              &times;
            </button>
            <h2 className="shop-modal-title">{selectedShop.name}</h2>
            <div className="shop-modal-details">
              {selectedShop.logoUrl && (
                <img 
                  src={selectedShop.logoUrl} 
                  alt={selectedShop.name}
                  className="shop-modal-logo"
                />
              )}
              <p className="shop-modal-description">{selectedShop.description}</p>
              <p className="shop-modal-meta">📍 {selectedShop.city}, {selectedShop.address}</p>
              <p className="shop-modal-meta">📞 {selectedShop.phone}</p>
              {selectedShop.instagram && (
                <a 
                  href={selectedShop.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="shop-modal-link"
                >
                  📷 Instagram
                </a>
              )}
              {selectedShop.categories && selectedShop.categories.length > 0 && (
                <p className="shop-modal-categories">
                  🏷️ Категории: {selectedShop.categories.map((c: any) => c.name).join(', ')}
                </p>
              )}
              <small className="shop-modal-owner">Владелец: {selectedShop.owner?.email}</small>
              <p className={`shop-modal-status ${selectedShop.approved ? 'approved' : 'pending'}`}>
                Статус: {selectedShop.approved ? '✅ Одобрен' : '⏳ На модерации'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default ShopsTab;