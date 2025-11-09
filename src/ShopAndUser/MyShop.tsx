import React, { useState, useEffect } from 'react';
import api from '../api';
import '../Admin/Admin.css';

interface Shop {
  id: number;
  name: string;
  city: string;
  description: string;
  phone: string;
  instagram: string;
  address: string;
  approved: boolean;
  owner: {
    email: string;
  };
}

interface MyShopProps {
  token: string;
  onLogout: () => void;
}

const MyShop: React.FC<MyShopProps> = ({ token, onLogout }) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyShop();
  }, [token]);

  const loadMyShop = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyShop(token);
      setShop(data);
    } catch (err: any) {
      if (err.status === 404) {
        setError('У вас еще нет магазина.');
      } else if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      setError('Ошибка загрузки магазина: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить свой магазин? Это действие необратимо.')) return;
    try {
      await api.deleteOwnShop(token);
      alert('Ваш магазин был успешно удален.');
      setShop(null);
      setError('У вас еще нет магазина.');
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка удаления магазина: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  if (loading) return <p>Загрузка данных о вашем магазине...</p>;

  return (
    <div>
      <h2 className="admin-section-title">Управление моим магазином</h2>
      {error && !shop && <p className="admin-error">{error}</p>}
      {shop ? (
        <div className="shop-info-card">
          <div className="shop-details">
            <h3>{shop.name}</h3>
            <p><strong>ID:</strong> {shop.id}</p>
            <p><strong>Город:</strong> {shop.city}</p>
            <p><strong>Описание:</strong> {shop.description}</p>
            <p><strong>Телефон:</strong> {shop.phone}</p>
            <p><strong>Instagram:</strong> {shop.instagram}</p>
            <p><strong>Адрес:</strong> {shop.address}</p>
            <p><strong>Статус:</strong> {shop.approved ? '✅ Одобрен' : '⏳ На модерации'}</p>
            <p><strong>Email владельца:</strong> {shop.owner.email}</p>
          </div>
          <div className="shop-actions">
            <button onClick={handleDeleteShop} className="admin-action-button danger">
              Удалить мой магазин
            </button>
          </div>
        </div>
      ) : (
        !loading && !error && <p>Создайте свой магазин, чтобы управлять им здесь.</p>
      )}
    </div>
  );
};

export default MyShop;