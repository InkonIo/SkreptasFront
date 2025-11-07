import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ShopAndUserDashboard from './ShopAndUser/ShopAndUserDashboard';
import AuthRoutes from './auth/AuthRoutes';
import { api } from './ShopAndUser/ShopAndUserApi';
import './ShopAndUser/css/ShopAndUserDashboard.css';

// Интерфейс для пользователя
interface User {
  id: number;
  email: string;
  role: 'USER' | 'SHOP' | 'ADMIN';
}

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (authToken: string) => {
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
  };

  useEffect(() => {
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    window.location.href = '/'; 
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Главная страница - "Лендинг" для всех */}
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

        {/* Маршруты аутентификации */}
        <Route 
          path="/*" 
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