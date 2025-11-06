import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import AdminDashboard from './admin/AdminDashboard';
import ShopAndUserDashboard from './ShopAndUser/ShopAndUserDashboard';

function App() {
  const storedToken = localStorage.getItem('token');
  console.log('🔐 Initial token from localStorage:', storedToken ? 'exists' : 'null/empty');
  
  const [token, setToken] = useState<string>(storedToken || '');
  const [user, setUser] = useState<any>(null);
  const [isTokenChecked, setIsTokenChecked] = useState(false);

  useEffect(() => {
    console.log('🔍 Token check:', token ? 'Token exists' : 'No token');
    if (token) {
      localStorage.setItem('token', token);
      loadUserFromToken(token);
    } else {
      setIsTokenChecked(true);
    }
  }, [token]);

  const loadUserFromToken = (accessToken: string) => {
    try {
      const parts = accessToken.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');
      
      const payload = JSON.parse(atob(parts[1]));
      console.log('📦 Decoded JWT payload:', payload);
      
      // Убираем префикс ROLE_ если он есть
      let role = payload.role || '';
      if (role.startsWith('ROLE_')) {
        role = role.substring(5);
      }
      
      const userData = {
        email: payload.sub,
        role: role,
      };
      
      console.log('👤 User data:', userData);
      setUser(userData);
    } catch (e) {
      console.error('❌ Error decoding token:', e);
      handleLogout();
    } finally {
      setIsTokenChecked(true);
    }
  };

  const handleLoginSuccess = (accessToken: string, userData: any) => {
    console.log('✅ Login success - Token:', accessToken);
    console.log('✅ Login success - User:', userData);
    
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(userData);
    
    alert('Вход успешен!');
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  if (!isTokenChecked) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        Загрузка...
      </div>
    );
  }

  console.log('🎯 Current user role:', user?.role);

  return (
    <Router>
      <Routes>
        {/* Если не авторизован — показываем страницы авторизации */}
        {!token || !user ? (
          <>
            <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* Если ADMIN — редирект на панель администратора */}
            {user.role === 'ADMIN' && (
              <>
                <Route path="/" element={<Navigate to="/panel-admin" replace />} />
                <Route path="/panel-admin" element={<AdminDashboard token={token} user={user} onLogout={handleLogout} />} />
                <Route path="*" element={<Navigate to="/panel-admin" replace />} />
              </>
            )}
            
            {/* Если обычный пользователь или SHOP */}
            {user.role !== 'ADMIN' && (
              <>
                <Route path="/" element={<ShopAndUserDashboard token={token} user={user} onLogout={handleLogout} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
