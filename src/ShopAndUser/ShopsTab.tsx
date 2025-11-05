import React from 'react';
import '../ShopAndUser/css/ShopsTab.css';

interface ShopsTabProps {
  shops: any[];
}

const ShopsTab: React.FC<ShopsTabProps> = ({ shops }) => {
  return (
    <div className="shops-container">
      <h2 className="shops-title">Все магазины</h2>
      <div className="shops-grid">
        {shops.map((shop) => (
          <div 
            key={shop.id} 
            className={`shop-card ${shop.approved ? 'approved' : 'pending'}`}
          >
            <div className="shop-content">
              {shop.logoUrl && (
                <img 
                  src={shop.logoUrl} 
                  alt={shop.name}
                  className="shop-logo"
                />
              )}
              <div className="shop-details">
                <h3 className="shop-name">{shop.name}</h3>
                <p className="shop-description">{shop.description}</p>
                <p className="shop-meta">📍 {shop.city}, {shop.address}</p>
                <p className="shop-meta">📞 {shop.phone}</p>
                {shop.instagram && <p className="shop-meta">📷 {shop.instagram}</p>}
                <p className={`shop-status ${shop.approved ? 'approved' : 'pending'}`}>
                  {shop.approved ? '✅ Одобрен' : '⏳ На модерации'}
                </p>
                {shop.categories && shop.categories.length > 0 && (
                  <p className="shop-categories">
                    🏷️ {shop.categories.map((c: any) => c.name).join(', ')}
                  </p>
                )}
                <small className="shop-owner">Владелец: {shop.owner?.email}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopsTab;