import React, { useState, useEffect } from 'react';
import api from '../api';
import './Admin.css';

interface Item {
  id: number;
  title: string;
  description: string;
  city: string;
  views: number;
  favorites: number;
  active: boolean;
  shop: {
    id: number;
    name: string;
    owner: {
      email: string;
    };
  };
  images: string[];
  tags: string[];
  createdAt: string;
}

interface AdminItemsProps {
  token: string;
  onLogout: () => void;
}

const AdminItems: React.FC<AdminItemsProps> = ({ token, onLogout }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (err: any) {
      setError('Ошибка загрузки товаров: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await api.deleteItem(itemId, token);
      alert('Товар удален!');
      loadItems();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка удаления товара: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  if (loading) return <p>Загрузка товаров...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div>
      <h2 className="admin-section-title">Все товары ({items.length})</h2>
      <button onClick={loadItems} className="admin-action-button" style={{ marginBottom: '15px' }}>
        Обновить список
      </button>
      {items.length === 0 ? (
        <p>Нет товаров.</p>
      ) : (
        <ul className="admin-list">
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.title}</strong> (ID: {item.id})
                <br />
                <small>
                  Магазин: {item.shop?.name} (ID: {item.shop?.id})
                  <br />
                  Владелец магазина: {item.shop?.owner?.email}
                  <br />
                  Город: {item.city} | Просмотры: {item.views} | В избранном: {item.favorites}
                  <br />
                  Статус: {item.active ? '✅ Активен' : '❌ Неактивен'}
                  <br />
                  Изображений: {item.images?.length || 0} | Тегов: {item.tags?.length || 0}
                  {item.tags && item.tags.length > 0 && (
                    <><br />Теги: {item.tags.join(', ')}</>
                  )}
                </small>
                {item.description && (
                  <>
                    <br />
                    <small style={{ color: '#666' }}>
                      {item.description.length > 100 
                        ? item.description.substring(0, 100) + '...' 
                        : item.description}
                    </small>
                  </>
                )}
              </div>
              <div>
                <button onClick={() => handleDeleteItem(item.id)} className="admin-action-button danger">
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

export default AdminItems;