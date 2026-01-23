import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ShopAndUserDashboard from './ShopAndUser/ShopAndUserDashboard';
import CategoryPage from './ShopAndUser/CategoryPage/CategoryPage';
import PrivacyPolicy from './footer/privacy';
import TermsOfUse from './footer/terms';
import AuthRoutes from './auth/AuthRoutes';
import './ShopAndUser/css/ShopAndUserDashboard.css';
import SearchResults from './search/SearchResults';

// Интерфейс для пользователя
interface User {
  id: number;
  email: string;
  role: 'USER' | 'SHOP' | 'ADMIN';
}

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  }, []);

  const loadUser = useCallback(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Ошибка парсинга данных пользователя:', e);
        handleLogout();
      }
    }
    setLoading(false);
  }, [handleLogout]);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token, loadUser]);

  const handleLoginSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    console.log('Токен сохранен как accessToken:', newToken);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Все маршруты ведут на ShopAndUserDashboard, который управляет контентом */}
        <Route
          path="/"
          element={
            <ShopAndUserDashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
              isLanding={true}
            />
          }
        />

        <Route
          path="/favorites"
          element={
            <ShopAndUserDashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
              isLanding={false}
            />
          }
        />

        <Route
          path="/my-shop"
          element={
            <ShopAndUserDashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
              isLanding={false}
            />
          }
        />

        <Route
          path="/admin-users"
          element={
            <ShopAndUserDashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
              isLanding={false}
            />
          }
        />

        <Route
          path="/admin-shops"
          element={
            <ShopAndUserDashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
              isLanding={false}
            />
          }
        />

        <Route
          path="/admin-all-shops"
          element={
            <ShopAndUserDashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
              isLanding={false}
            />
          }
        />

        <Route
          path="/admin-items"
          element={
            <ShopAndUserDashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
              isLanding={false}
            />
          }
        />

        <Route
          path="/admin-categories"
          element={
            <ShopAndUserDashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
              isLanding={false}
            />
          }
        />

        <Route
          path="/admin-search"
          element={
            <ShopAndUserDashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onLoginSuccess={handleLoginSuccess}
              isLanding={false}
            />
          }
        />

        {/* Страница категории */}
        <Route
          path="/category/:categorySlug"
          element={<CategoryPage />}
        />

        {/* Маршруты для Политики конфиденциальности и Условий пользования */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        {/* Страница результатов поиска */}
        <Route path="/search" element={<SearchResults />} />
        {/* Маршруты аутентификации */}
        <Route
          path="/auth/*"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <AuthRoutes onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;