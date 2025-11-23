import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../ShopAndUser/css/ShopAndUserDashboard.css';
import { api } from './ShopAndUserApi';
import ShopsTab from '../ShopAndUser/ShopsTab/ShopsTab';
import ItemsTab from './ItemAbout/ItemsTab';
import FavoritesTab from './FavoritesTab';
import MyShopTab from './MyShop/MyShopTab';
import AdminUsers from '../admin/AdminUsers';
import AdminShops from '../admin/AdminShops';
import AdminAllShops from '../admin/AdminAllShops';
import AdminItems from '../admin/AdminItems';
import AdminCategories from '../admin/AdminCategories';
import MainPanel from './MainPanel/MainPanel';
import Footer from '../footer/footer';

import Login from '../auth/login/Login';
import Register from '../auth/register/Register';
import ForgotPassword from '../auth/forgot/ForgotPassword';
import ResetPassword from '../auth/reset/ResetPassword';

interface ShopAndUserDashboardProps {
  token: string | null;
  user: any;
  onLogout: () => void;
  onLoginSuccess: (token: string, user: any) => void;
  isLanding: boolean;
}

const ShopAndUserDashboard: React.FC<ShopAndUserDashboardProps> = ({ token, user, onLogout, isLanding, onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/favorites') return 'favorites';
    if (path === '/my-shop') return 'my-shop';
    if (path === '/admin-users') return 'admin-users';
    if (path === '/admin-shops') return 'admin-shops';
    if (path === '/admin-all-shops') return 'admin-all-shops';
    if (path === '/admin-items') return 'admin-items';
    if (path === '/admin-categories') return 'admin-categories';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<'home' | 'favorites' | 'my-shop' | 'admin-users' | 'admin-shops' | 'admin-all-shops' | 'admin-items' | 'admin-categories'>(getActiveTabFromPath());
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [myShop, setMyShop] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false);
  
  type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | null;
  const [activeAuthView, setActiveAuthView] = useState<AuthView>(null);
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  // Управление открытием/закрытием меню с задержкой
  useEffect(() => {
    if (isMenuOpen) {
      // Небольшая задержка перед рендерингом overlay
      const timer = setTimeout(() => {
        setShouldRenderMenu(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderMenu(false);
    }
  }, [isMenuOpen]);

  const handleOpenAuthModal = (view: AuthView) => {
    setIsMenuOpen(false);
    setResetPasswordEmail(undefined);
    setActiveAuthView(view);
  };

  const handleCloseAuthModal = () => {
    setActiveAuthView(null);
    setResetPasswordEmail(undefined);
  };

  const handleAuthSuccess = (token: string, user: any) => {
    handleCloseAuthModal();
  };

  useEffect(() => {
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
    if (token) {
      loadMyShop();
    }
  }, [user, token]);

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
      {/* Шапка - всегда видна */}
      <div className="dashboard-header">
        <div className="dashboard-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo1.svg" alt="Skrepta App" className="logo-image" />
        </div>
        <div className="header-links">
          {token && (
            <>
              <button 
                onClick={() => navigate('/favorites')} 
                className={`header-link-button ${activeTab === 'favorites' ? 'active-primary' : ''}`}
              >
                ❤️ Избранное {favorites.length > 0 && `(${favorites.length})`}
              </button>
              <button 
                onClick={() => navigate('/my-shop')} 
                className={`header-link-button ${activeTab === 'my-shop' ? 'active-secondary' : ''}`}
              >
                🛍️ Мой магазин
              </button>
            </>
          )}
        </div>
        <button 
          className="menu-toggle-button" 
          onClick={(e) => {
            e.stopPropagation(); // ⭐ ВОТ ИСПРАВЛЕНИЕ
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          ☰
        </button>
      </div>

      {/* Меню бургер */}
      {isMenuOpen && shouldRenderMenu && (
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

      {/* Модальные окна авторизации */}
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

      {/* Админские табы - только для админов */}
      {token && user?.role === 'ADMIN' && (
        <div className="tabs-container">
          <button 
            onClick={() => navigate('/admin-users')} 
            className={`tab-button ${activeTab === 'admin-users' ? 'active-admin' : ''}`}
          >
            🧑‍💻 Пользователи
          </button>
          <button 
            onClick={() => navigate('/admin-shops')} 
            className={`tab-button ${activeTab === 'admin-shops' ? 'active-admin' : ''}`}
          >
            ⏳ Магазины (Модерация)
          </button>
          <button 
            onClick={() => navigate('/admin-all-shops')} 
            className={`tab-button ${activeTab === 'admin-all-shops' ? 'active-admin' : ''}`}
          >
            🏪 Все Магазины
          </button>
          <button 
            onClick={() => navigate('/admin-items')} 
            className={`tab-button ${activeTab === 'admin-items' ? 'active-admin' : ''}`}
          >
            📦 Все Товары
          </button>
          <button 
            onClick={() => navigate('/admin-categories')} 
            className={`tab-button ${activeTab === 'admin-categories' ? 'active-admin' : ''}`}
          >
            🏷️ Категории
          </button>
        </div>
      )}

      {/* Контент - меняется в зависимости от activeTab */}
      <div className="tab-content">
        {/* Главная страница - каталог магазинов */}
        {activeTab === 'home' && <MainPanel />}
        
        {activeTab === 'favorites' && token && (
          <FavoritesTab 
            favorites={favorites} 
            onRemoveFavorite={(itemId) => handleToggleFavorite(itemId, true)} 
          />
        )}
        
        {activeTab === 'my-shop' && token && (
          <MyShopTab 
            myShop={myShop}
            categories={categories}
            items={items}
            token={token}
            onShopCreated={handleShopCreated}
            onItemCreated={handleItemCreated}
          />
        )}

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
      <Footer />
    </div>
  );
};

export default ShopAndUserDashboard;