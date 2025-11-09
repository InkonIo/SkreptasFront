import React, { useState, useEffect } from 'react';
import api from '../api';
import './Admin.css';

interface Shop {
  id: number;
  name: string;
  city: string;
  approved: boolean;
  description: string;
  logoUrl: string;
  phone: string;
  instagramLink: string;
  address: string;
  owner: {
    email: string;
    fio: string;
    phoneNumber: string;
  };
  categories: {
    id: number;
    name: string;
  }[];
}

interface AdminShopsProps {
  token: string;
  onLogout: () => void;
}

const AdminShops: React.FC<AdminShopsProps> = ({ token, onLogout }) => {
  const [pendingShops, setPendingShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const handleViewDetails = async (shopId: number) => {
    try {
      const shopDetails = await api.getShopById(shopId, token);
      setSelectedShop(shopDetails);
      setShowDetailsModal(true);
    } catch (err: any) {
      alert('Ошибка загрузки деталей магазина: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  const closeModal = () => {
    setSelectedShop(null);
    setShowDetailsModal(false);
  };

  return (
    <div>
      <h2 className="admin-section-title">Магазины на модерации</h2>
      <button onClick={loadPendingShops} className="admin-action-button" style={{ marginBottom: '15px' }}>Обновить список</button>
      {pendingShops.length === 0 ? (
        <p className='NoneOfShop'>Нет магазинов на модерации.</p>
      ) : (
        <ul className="admin-list">
          {pendingShops.map((shop) => (
            <li key={shop.id}>
	              <div style={{ flexGrow: 1 }}>
	                <strong>{shop.name}</strong> - {shop.city}
	                <br />
	                <small>Владелец: {shop.owner?.email}</small>
	              </div>
	              <div style={{ display: 'flex', gap: '10px' }}>
	                <button onClick={() => handleViewDetails(shop.id)} className="admin-action-button" style={{ backgroundColor: '#3b82f6' }}>
	                  Детали
	                </button>
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

      {/* Модальное окно для деталей магазина */}
      {showDetailsModal && selectedShop && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Детали магазина: {selectedShop.name}</h3>
            <div className="modal-body">
              <p><strong>ID:</strong> {selectedShop.id}</p>
              <p><strong>Город:</strong> {selectedShop.city}</p>
              <p><strong>Адрес:</strong> {selectedShop.address}</p>
              <p><strong>Телефон:</strong> {selectedShop.phone}</p>
              <p><strong>Instagram:</strong> <a href={selectedShop.instagramLink} target="_blank" rel="noopener noreferrer">{selectedShop.instagramLink}</a></p>
              <p><strong>Описание:</strong> {selectedShop.description}</p>
              <p><strong>Категории:</strong> {selectedShop.categories.map(c => c.name).join(', ')}</p>
              
              <h4 style={{ marginTop: '15px' }}>Владелец</h4>
              <p><strong>ФИО:</strong> {selectedShop.owner.fio}</p>
              <p><strong>Email:</strong> {selectedShop.owner.email}</p>
              <p><strong>Телефон:</strong> {selectedShop.owner.phoneNumber}</p>

              {selectedShop.logoUrl && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Логотип:</strong>
                  <img src={selectedShop.logoUrl} alt="Логотип магазина" style={{ maxWidth: '100%', maxHeight: '150px', display: 'block', marginTop: '5px' }} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="admin-action-button secondary">
                Закрыть
              </button>
              <button onClick={() => { handleApproveShop(selectedShop.id); closeModal(); }} className="admin-action-button">
                Одобрить
              </button>
              <button onClick={() => { handleRejectShop(selectedShop.id); closeModal(); }} className="admin-action-button danger">
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}
	    </div>
  );
};

export default AdminShops;
