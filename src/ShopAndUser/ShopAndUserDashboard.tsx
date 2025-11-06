import React, { useState, useEffect } from 'react';
import '../ShopAndUser/css/ShopAndUserDashboard.css';
import { api } from './ShopAndUserApi';
import ShopsTab from './ShopsTab';
import ItemsTab from './ItemsTab';
import FavoritesTab from './FavoritesTab';
import MyShopTab from './MyShopTab';

interface ShopAndUserDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
}

const ShopAndUserDashboard: React.FC<ShopAndUserDashboardProps> = ({ token, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'shops' | 'items' | 'favorites' | 'my-shop'>('shops');
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [myShop, setMyShop] = useState<any>(null);

  useEffect(() => {
    loadCategories();
    loadShops();
    loadItems();
    loadFavorites();
    if (user?.role === 'SHOP') {
      loadMyShop();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const loadShops = async () => {
    try {
      const data = await api.getShops();
      setShops(data);
    } catch (error) {
      console.error('Ошибка загрузки магазинов:', error);
    }
  };

  const loadItems = async () => {
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await api.getFavorites(token);
      setFavorites(data);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    }
  };

  const loadMyShop = async () => {
    try {
      const allShops = await api.getShops();
      const userShop = allShops.find((s: any) => s.owner?.email === user.email);
      setMyShop(userShop || null);
    } catch (error) {
      console.error('Ошибка загрузки моего магазина:', error);
    }
  };

  const handleToggleFavorite = async (itemId: number, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await api.removeFromFavorites(itemId, token);
        alert('Удалено из избранного');
      } else {
        await api.addToFavorites(itemId, token);
        alert('Добавлено в избранное');
      }
      loadFavorites();
    } catch (error) {
      alert('Ошибка: ' + error);
    }
  };

  const handleShopCreated = () => {
    loadMyShop();
    loadShops();
  };

  const handleItemCreated = () => {
    loadItems();
  };

  const handleDeleteAccount = async () => {
  console.log('Token:', token); // Добавьте эту строку
  if (window.confirm('Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.')) {
    try {
      await api.deleteMyAccount(token);
      alert('Аккаунт успешно удален.');
      onLogout();
    } catch (error) {
      console.error('Ошибка удаления аккаунта:', error);
      alert('Ошибка при удалении аккаунта. Попробуйте позже.');
    }
  }
};

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Skrepta App</h1>
        <div>
          <p className="user-info">
            Пользователь: {user?.email} ({user?.role})
          </p>
          <button onClick={onLogout} className="logout-button">
            Выйти
          </button>
          <button onClick={handleDeleteAccount} className="delete-account-button">
            Удалить аккаунт
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button 
          onClick={() => setActiveTab('shops')} 
          className={`tab-button ${activeTab === 'shops' ? 'active-primary' : ''}`}
        >
          🏪 Магазины
        </button>
        <button 
          onClick={() => setActiveTab('items')} 
          className={`tab-button ${activeTab === 'items' ? 'active-primary' : ''}`}
        >
          📦 Товары
        </button>
        <button 
          onClick={() => setActiveTab('favorites')} 
          className={`tab-button ${activeTab === 'favorites' ? 'active-primary' : ''}`}
        >
          ❤️ Избранное {favorites.length > 0 && `(${favorites.length})`}
        </button>
        {user?.role === 'SHOP' && (
          <button 
            onClick={() => setActiveTab('my-shop')} 
            className={`tab-button ${activeTab === 'my-shop' ? 'active-secondary' : ''}`}
          >
            🏪 Мой магазин
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'shops' && <ShopsTab shops={shops} />}
        
        {activeTab === 'items' && (
          <ItemsTab 
            items={items} 
            favorites={favorites} 
            onToggleFavorite={handleToggleFavorite} 
          />
        )}
        
        {activeTab === 'favorites' && (
          <FavoritesTab 
            favorites={favorites} 
            onRemoveFavorite={(itemId) => handleToggleFavorite(itemId, true)} 
          />
        )}
        
        {activeTab === 'my-shop' && user?.role === 'SHOP' && (
          <MyShopTab 
            myShop={myShop}
            categories={categories}
            items={items}
            token={token}
            onShopCreated={handleShopCreated}
            onItemCreated={handleItemCreated}
          />
        )}
      </div>
    </div>
  );
};

export default ShopAndUserDashboard;