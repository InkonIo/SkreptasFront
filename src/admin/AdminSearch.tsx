import React, { useState } from 'react';
import './Admin.css';

interface AdminSearchProps {
  token: string;
  onLogout?: () => void; // Made optional since it's not used
}

const AdminSearch: React.FC<AdminSearchProps> = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReindexAll = async () => {
    if (!window.confirm('Переиндексировать ВСЕ данные? Это может занять несколько минут!')) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/search/admin/reindex-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Ошибка переиндексации');
      }
      
      const result = await response.text();
      setMessage(result);
      alert('✅ Переиндексация запущена! Проверьте логи сервера.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError('Ошибка: ' + message);
      alert('❌ Ошибка переиндексации: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const handleReindexItems = async () => {
    if (!window.confirm('Переиндексировать все товары?')) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/search/admin/reindex-items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Ошибка переиндексации');
      }
      
      const result = await response.text();
      setMessage(result);
      alert('✅ Переиндексация товаров запущена!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError('Ошибка: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const handleReindexShops = async () => {
    if (!window.confirm('Переиндексировать все магазины?')) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/search/admin/reindex-shops', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Ошибка переиндексации');
      }
      
      const result = await response.text();
      setMessage(result);
      alert('✅ Переиндексация магазинов запущена!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError('Ошибка: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="admin-section-title">🔍 Управление поиском</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
        <p style={{ margin: 0, color: '#856404' }}>
          ⚠️ <strong>Внимание:</strong> Переиндексация - это долгая операция! 
          Используйте только когда товары не находятся в поиске.
        </p>
      </div>

      {message && (
        <div style={{ marginBottom: '15px', padding: '12px', background: '#d1f2eb', borderRadius: '8px', color: '#0f5132' }}>
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="admin-error">
          ❌ {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '2px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🔄 Полная переиндексация</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Переиндексирует ВСЕ товары, магазины и категории. Используйте для первоначальной настройки.
          </p>
          <button 
            onClick={handleReindexAll} 
            className="admin-action-button"
            disabled={loading}
            style={{ 
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '16px',
              padding: '12px 24px'
            }}
          >
            {loading ? '⏳ Выполняется...' : '🚀 Переиндексировать ВСЁ'}
          </button>
        </div>

        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '2px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>📦 Товары</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Переиндексирует только товары. Быстрее, чем полная переиндексация.
          </p>
          <button 
            onClick={handleReindexItems} 
            className="admin-action-button"
            disabled={loading}
            style={{ background: loading ? '#ccc' : '#10b981' }}
          >
            {loading ? '⏳ Выполняется...' : '📦 Переиндексировать товары'}
          </button>
        </div>

        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '2px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🏪 Магазины</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Переиндексирует только магазины.
          </p>
          <button 
            onClick={handleReindexShops} 
            className="admin-action-button"
            disabled={loading}
            style={{ background: loading ? '#ccc' : '#3b82f6' }}
          >
            {loading ? '⏳ Выполняется...' : '🏪 Переиндексировать магазины'}
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', background: '#e7f3ff', borderRadius: '12px', border: '2px solid #0078d4' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0078d4' }}>💡 Полезная информация</h3>
        <ul style={{ color: '#333', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Новые товары и магазины <strong>автоматически индексируются</strong> при создании</li>
          <li>Переиндексация нужна только для <strong>старых данных</strong>, созданных до обновления</li>
          <li>Процесс выполняется в фоне - можете продолжать работу</li>
          <li>Проверяйте логи сервера для отслеживания прогресса</li>
          <li>После переиндексации товары сразу становятся доступны в поиске</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSearch;