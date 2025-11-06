import React, { useState } from 'react';
import AdminUsers from './AdminUsers';
import AdminShops from './AdminShops';
import AdminCategories from './AdminCategories.tsx';
import AdminItems from './AdminItems.tsx';
import AdminAllShops from './AdminAllShops.tsx';
import './Admin.css';

interface AdminDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Панель администратора</h1>
        <div>
          <span>{user?.email} ({user?.role})</span>
          <button onClick={onLogout} className="admin-action-button danger" style={{ marginLeft: '15px' }}>Выйти</button>
        </div>
      </div>

      <nav className="admin-nav">
        <button onClick={() => setActiveTab('users')}>Пользователи</button>
        <button onClick={() => setActiveTab('pending-shops')}>Модерация магазинов</button>
        <button onClick={() => setActiveTab('all-shops')}>Все магазины</button>
        <button onClick={() => setActiveTab('categories')}>Категории</button>
        <button onClick={() => setActiveTab('items')}>Товары</button>
      </nav>

      <div className="admin-content">
        {activeTab === 'users' && <AdminUsers token={token} onLogout={onLogout} />}
        {activeTab === 'pending-shops' && <AdminShops token={token} onLogout={onLogout} />}
        {activeTab === 'all-shops' && <AdminAllShops token={token} onLogout={onLogout} />}
        {activeTab === 'categories' && <AdminCategories token={token} onLogout={onLogout} />}
        {activeTab === 'items' && <AdminItems token={token} onLogout={onLogout} />}
      </div>
    </div>
  );
};

export default AdminDashboard;