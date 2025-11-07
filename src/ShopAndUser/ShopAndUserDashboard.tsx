import React, { useState, useEffect } from 'react';
import '../ShopAndUser/css/ShopAndUserDashboard.css';
import { api } from './ShopAndUserApi';
import ShopsTab from './ShopsTab';
import ItemsTab from './ItemsTab';
import FavoritesTab from './FavoritesTab';
import MyShopTab from './MyShopTab';
import AdminUsers from '../admin/AdminUsers';
import AdminShops from '../admin/AdminShops';
import AdminAllShops from '../admin/AdminAllShops';
import AdminItems from '../admin/AdminItems';
import AdminCategories from '../admin/AdminCategories';

// Импорт компонентов аутентификации для модального окна
import Login from '../auth/Login';
import Register from '../auth/Register';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';

interface ShopAndUserDashboardProps {
  token: string | null;
  user: any;
  onLogout: () => void;
  onLoginSuccess: (token: string, user: any) => void;
  isLanding: boolean;
  // onNavigate?: (path: string) => void; // Удалено, так как навигация будет модальной
}

const ShopAndUserDashboard: React.FC<ShopAndUserDashboardProps> = ({ token, user, onLogout, isLanding, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'shops' | 'items' | 'favorites' | 'my-shop' | 'admin-users' | 'admin-shops' | 'admin-all-shops' | 'admin-items' | 'admin-categories'>(isLanding ? 'shops' : 'shops');
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [myShop, setMyShop] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | null;
  const [activeAuthView, setActiveAuthView] = useState<AuthView>(null);
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string | undefined>(undefined);

  const handleOpenAuthModal = (view: AuthView) => {
    setIsMenuOpen(false);
    setResetPasswordEmail(undefined); // Сброс email при открытии
    setActiveAuthView(view);
  };

  const handleCloseAuthModal = () => {
    setActiveAuthView(null);
    setResetPasswordEmail(undefined);
  };

  const handleAuthSuccess = (token: string, user: any) => {
    // Предполагаем, что onLoginSuccess будет вызван извне, но для модала нужно закрыть его
    handleCloseAuthModal();
    // onLoginSuccess(token, user); // Эта логика должна быть в родительском компоненте, который передает onLoginSuccess
    // Но так как onLoginSuccess не передается в ShopAndUserDashboard, просто закрываем модал.
    // Если onLoginSuccess нужен, его нужно добавить в ShopAndUserDashboardProps
    // Для простоты, полагаемся на то, что родительский компонент обновит состояние token/user
  };

  useEffect(() => {
    // Если это лендинг и нет токена, не загружаем избранное и мой магазин
    if (isLanding && !token) {
      loadCategories();
      loadShops();
      loadItems();
      return;
    }

    loadCategories();
    loadShops();
    loadItems();
    loadFavorites();
    if (user?.role === 'SHOP' && token) {
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
    if (!token) return;

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
    if (!token) {
      alert('Для добавления в избранное необходимо войти в систему.');
      return;
    }

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
    if (!token) return;

    console.log('Token:', token);
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
        {/* Бургер-меню, перемещенное вправо */}
        <button className="menu-toggle-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
      </div>

      {/* Модальное меню (мини-окно) */}
      {isMenuOpen && (
        <div className="modal-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="modal-menu" onClick={(e) => e.stopPropagation()}>
            <button className="close-menu-button" onClick={() => setIsMenuOpen(false)}>
              &times;
            </button>
            {token ? (
              <div className="user-panel">
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
            ) : (
              <div className="auth-links">
                <button className="auth-link-button" onClick={() => handleOpenAuthModal('login')}>Войти</button>
                <button className="auth-link-button" onClick={() => handleOpenAuthModal('register')}>Регистрация</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно аутентификации */}
      {activeAuthView && (
        <div className="modal-overlay" onClick={handleCloseAuthModal}>
          <div className="modal-menu auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-menu-button" onClick={handleCloseAuthModal}>
              &times;
            </button>
            {activeAuthView === 'login' && (
              <Login 
                onLoginSuccess={(token: string, user: any) => { handleAuthSuccess(token, user); onLoginSuccess(token, user); }}
                onSwitchView={setActiveAuthView}
              />
            )}
            {activeAuthView === 'register' && (
              <Register 
                onSwitchView={setActiveAuthView}
              />
            )}
            {activeAuthView === 'forgot-password' && (
              <ForgotPassword 
                onSwitchView={(view, email) => {
                  if (view === 'reset-password' && email) {
                    setResetPasswordEmail(email);
                  }
                  setActiveAuthView(view);
                }}
              />
            )}
            {activeAuthView === 'reset-password' && (
              <ResetPassword 
                onSwitchView={setActiveAuthView}
                initialEmail={resetPasswordEmail}
              />
            )}
          </div>
        </div>
      )}

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
        {token && (
          <button 
            onClick={() => setActiveTab('favorites')} 
            className={`tab-button ${activeTab === 'favorites' ? 'active-primary' : ''}`}
          >
            ❤️ Избранное {favorites.length > 0 && `(${favorites.length})`}
          </button>
        )}
        {token && user?.role === 'SHOP' && (
          <button 
            onClick={() => setActiveTab('my-shop')} 
            className={`tab-button ${activeTab === 'my-shop' ? 'active-secondary' : ''}`}
          >
            🏪 Мой магазин
          </button>
        )}
        {token && user?.role === 'ADMIN' && (
          <>
            <button 
              onClick={() => setActiveTab('admin-users')} 
              className={`tab-button ${activeTab === 'admin-users' ? 'active-admin' : ''}`}
            >
              🧑‍💻 Пользователи
            </button>
            <button 
              onClick={() => setActiveTab('admin-shops')} 
              className={`tab-button ${activeTab === 'admin-shops' ? 'active-admin' : ''}`}
            >
              ⏳ Магазины (Модерация)
            </button>
            <button 
              onClick={() => setActiveTab('admin-all-shops')} 
              className={`tab-button ${activeTab === 'admin-all-shops' ? 'active-admin' : ''}`}
            >
              🏪 Все Магазины
            </button>
            <button 
              onClick={() => setActiveTab('admin-items')} 
              className={`tab-button ${activeTab === 'admin-items' ? 'active-admin' : ''}`}
            >
              📦 Все Товары
            </button>
            <button 
              onClick={() => setActiveTab('admin-categories')} 
              className={`tab-button ${activeTab === 'admin-categories' ? 'active-admin' : ''}`}
            >
              🏷️ Категории
            </button>
          </>
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
        
        {activeTab === 'favorites' && token && (
          <FavoritesTab 
            favorites={favorites} 
            onRemoveFavorite={(itemId) => handleToggleFavorite(itemId, true)} 
          />
        )}
        
        {activeTab === 'my-shop' && token && user?.role === 'SHOP' && (
          <MyShopTab 
            myShop={myShop}
            categories={categories}
            items={items}
            token={token}
            onShopCreated={handleShopCreated}
            onItemCreated={handleItemCreated}
          />
        )}

        {/* Admin Tabs */}
        {activeTab === 'admin-users' && token && user?.role === 'ADMIN' && (
          <AdminUsers token={token} onLogout={onLogout} />
        )}
        {activeTab === 'admin-shops' && token && user?.role === 'ADMIN' && (
          <AdminShops token={token} onLogout={onLogout} />
        )}
        {activeTab === 'admin-all-shops' && token && user?.role === 'ADMIN' && (
          <AdminAllShops token={token} onLogout={onLogout} />
        )}
        {activeTab === 'admin-items' && token && user?.role === 'ADMIN' && (
          <AdminItems token={token} onLogout={onLogout} />
        )}
        {activeTab === 'admin-categories' && token && user?.role === 'ADMIN' && (
          <AdminCategories token={token} onLogout={onLogout} />
        )}
      </div>
    </div>
  );
};

export default ShopAndUserDashboard;