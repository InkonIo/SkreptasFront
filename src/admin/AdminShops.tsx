import React, { useState, useEffect } from 'react';
import api from '../api';
import './Admin.css';

interface Shop {
  id: number;
  name: string;
  city: string;
  approved: boolean;
  owner: {
    email: string;
  };
}

interface AdminShopsProps {
  token: string;
  onLogout: () => void;
}

const AdminShops: React.FC<AdminShopsProps> = ({ token, onLogout }) => {
  const [pendingShops, setPendingShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingShops();
  }, [token]);

  const loadPendingShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPendingShops(token);
      setPendingShops(data);
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      setError('Ошибка загрузки магазинов на модерации: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveShop = async (shopId: number) => {
    try {
      await api.approveShop(shopId, token);
      alert('Магазин одобрен!');
      loadPendingShops();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка одобрения магазина: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  const handleRejectShop = async (shopId: number) => {
    try {
      await api.rejectShop(shopId, token);
      alert('Магазин отклонен!');
      loadPendingShops();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка отклонения магазина: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  if (loading) return <p>Загрузка магазинов на модерации...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div>
      <h2 className="admin-section-title">Магазины на модерации</h2>
      <button onClick={loadPendingShops} className="admin-action-button" style={{ marginBottom: '15px' }}>Обновить список</button>
      {pendingShops.length === 0 ? (
        <p>Нет магазинов на модерации.</p>
      ) : (
        <ul className="admin-list">
          {pendingShops.map((shop) => (
            <li key={shop.id}>
              <div>
                <strong>{shop.name}</strong> - {shop.city}
                <br />
                <small>Владелец: {shop.owner?.email}</small>
              </div>
              <div>
                <button onClick={() => handleApproveShop(shop.id)} className="admin-action-button">
                  Одобрить
                </button>
                <button onClick={() => handleRejectShop(shop.id)} className="admin-action-button danger">
                  Отклонить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminShops;
