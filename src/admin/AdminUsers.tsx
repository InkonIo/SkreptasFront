import React, { useState, useEffect } from 'react';
import api from '../api';
import './Admin.css';

interface User {
  id: number;
  email: string;
  fio: string;
  role: 'USER' | 'SHOP' | 'ADMIN';
}

interface AdminUsersProps {
  token: string;
  onLogout: () => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ token, onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [token]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllUsers(token);
      setUsers(data);
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      setError('Ошибка загрузки пользователей: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    try {
      await api.deleteUser(userId, token);
      alert('Пользователь удален!');
      loadUsers();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка удаления пользователя: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  const handleUpdateRole = async (userId: number, newRole: 'USER' | 'SHOP' | 'ADMIN') => {
    try {
      await api.updateUserRole(userId, newRole, token);
      alert(`Роль пользователя ${userId} обновлена на ${newRole}`);
      loadUsers();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка обновления роли: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  if (loading) return <p>Загрузка пользователей...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div>
      <h2 className="admin-section-title">Управление пользователями</h2>
      <button onClick={loadUsers} className="admin-action-button" style={{ marginBottom: '15px' }}>Обновить список</button>
      <ul className="admin-list">
        {Array.isArray(users) && users.map((user) => (
          <li key={user.id}>
            <div>
              <strong>{user.email}</strong> ({user.fio}) - Роль: {user.role}
            </div>
            <div>
              <select className="VisibleRoles"
                value={user.role}
                onChange={(e) => handleUpdateRole(user.id, e.target.value as 'USER' | 'SHOP' | 'ADMIN')}
                style={{ marginRight: '10px', padding: '5px' }}
              >
                <option value="USER">USER</option>
                <option value="SHOP">SHOP</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button onClick={() => handleDeleteUser(user.id)} className="admin-action-button danger">
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUsers;
