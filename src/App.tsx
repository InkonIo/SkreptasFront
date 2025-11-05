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
  console.log('ðŸ”‘ Initial token from localStorage:', storedToken ? 'exists' : 'null/empty');
  
  const [token, setToken] = useState<string>(storedToken || '');
  const [user, setUser] = useState<any>(null);
  const [isTokenChecked, setIsTokenChecked] = useState(false);

  useEffect(() => {
    console.log('ðŸ” Token check:', token ? 'Token exists' : 'No token');
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
      console.log('ðŸ“¦ Decoded JWT payload:', payload);
      
      // Ð’ÐÐ–ÐÐž: Ð£Ð±Ð¸Ñ€Ð°ÐµÐ¼ Ð¿Ñ€ÐµÑ„Ð¸ÐºÑ ROLE_ ÐµÑÐ»Ð¸ Ð¾Ð½ ÐµÑÑ‚ÑŒ
      let role = payload.role || '';
      if (role.startsWith('ROLE_')) {
        role = role.substring(5);
      }
      
      const userData = {
        email: payload.sub,
        role: role,
      };
      
      console.log('ðŸ‘¤ User data:', userData);
      setUser(userData);
    } catch (e) {
      console.error('âŒ Error decoding token:', e);
      handleLogout();
    } finally {
      setIsTokenChecked(true);
    }
  };

  const handleLoginSuccess = (accessToken: string, userData: any) => {
    console.log('âœ… Login success - Token:', accessToken);
    console.log('âœ… Login success - User:', userData);
    
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(userData);
    
    alert('Ð’Ñ…Ð¾Ð´ ÑƒÑÐ¿ÐµÑˆÐµÐ½!');
  };

  const handleLogout = () => {
    console.log('ðŸšª Logging out...');
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
        Ð—Ð°Ð³Ñ€ÑƒÐ·ÐºÐ°...
      </div>
    );
  }

  console.log('ðŸŽ¯ Current user role:', user?.role);

  return (
    <Router>
      <Routes>
        {/* Ð•ÑÐ»Ð¸ Ð½Ðµ Ð°Ð²Ñ‚Ð¾Ñ€Ð¸Ð·Ð¾Ð²Ð°Ð½ - Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°ÐµÐ¼ ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ñ‹ Ð°Ð²Ñ‚Ð¾Ñ€Ð¸Ð·Ð°Ñ†Ð¸Ð¸ */}
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
            {/* Ð•ÑÐ»Ð¸ Ð°Ð´Ð¼Ð¸Ð½ - Ñ€ÐµÐ´Ð¸Ñ€ÐµÐºÑ‚ Ð½Ð° /panel-admin */}
            {user.role === 'ADMIN' && (
              <>
                <Route path="/" element={<Navigate to="/panel-admin" replace />} />
                <Route path="/panel-admin" element={<AdminDashboard token={token} user={user} onLogout={handleLogout} />} />
                <Route path="*" element={<Navigate to="/panel-admin" replace />} />
              </>
            )}
            
            {/* Ð•ÑÐ»Ð¸ Ð¾Ð±Ñ‹Ñ‡Ð½Ñ‹Ð¹ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒ Ð¸Ð»Ð¸ SHOP */}
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