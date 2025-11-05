import React, { useState, useEffect } from 'react';
import api from '../api';
import './Admin.css';

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

interface AdminAllShopsProps {
  token: string;
  onLogout: () => void;
}

const AdminAllShops: React.FC<AdminAllShopsProps> = ({ token, onLogout }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllShops();
  }, [token]);

  const loadAllShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllShops(token);
      setShops(data);
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      setError('Ошибка загрузки магазинов: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShop = async (shopId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот магазин?')) return;
    try {
      await api.deleteShop(shopId, token);
      alert('Магазин удален!');
      loadAllShops();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка удаления магазина: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  const handleToggleApproval = async (shopId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.rejectShop(shopId, token);
        alert('Магазин снят с публикации!');
      } else {
        await api.approveShop(shopId, token);
        alert('Магазин одобрен!');
      }
      loadAllShops();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  if (loading) return <p>Загрузка всех магазинов...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div>
      <h2 className="admin-section-title">Все магазины ({shops.length})</h2>
      <button onClick={loadAllShops} className="admin-action-button" style={{ marginBottom: '15px' }}>Обновить список</button>
      {shops.length === 0 ? (
        <p>Нет магазинов.</p>
      ) : (
        <ul className="admin-list">
          {shops.map((shop) => (
            <li key={shop.id}>
              <div>
                <strong>{shop.name}</strong> (ID: {shop.id}) - {shop.city}
                <br />
                <small>Владелец: {shop.owner?.email}</small>
                <br />
                <small>Статус: {shop.approved ? '✅ Одобрен' : '⏳ На модерации'}</small>
                {shop.phone && <><br /><small>Телефон: {shop.phone}</small></>}
                {shop.instagram && <><br /><small>Instagram: {shop.instagram}</small></>}
              </div>
              <div>
                <button 
                  onClick={() => handleToggleApproval(shop.id, shop.approved)} 
                  className="admin-action-button"
                  style={{ backgroundColor: shop.approved ? '#f59e0b' : '#10b981' }}
                >
                  {shop.approved ? 'Снять с публикации' : 'Одобрить'}
                </button>
                <button onClick={() => handleDeleteShop(shop.id)} className="admin-action-button danger">
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminAllShops;