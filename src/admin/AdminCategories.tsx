import React, { useState, useEffect } from 'react';
import api from '../api';
import './Admin.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  icon: string;
  position: number;
  isActive: boolean;
}

interface AdminCategoriesProps {
  token: string;
  onLogout: () => void;
}

const AdminCategories: React.FC<AdminCategoriesProps> = ({ token, onLogout }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    parentId: null as number | null,
    icon: '',
    position: 0,
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError('Ошибка загрузки категорий: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      alert('Введите название категории');
      return;
    }
    try {
      await api.createCategory(newCategory, token);
      alert('Категория создана!');
      setShowCreateForm(false);
      setNewCategory({ name: '', parentId: null, icon: '', position: 0, isActive: true });
      loadCategories();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка создания категории: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    try {
      await api.deleteCategory(categoryId, token);
      alert('Категория удалена!');
      loadCategories();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка удаления категории: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  const handleToggleActive = async (categoryId: number, currentStatus: boolean) => {
    try {
      await api.updateCategory(categoryId, { isActive: !currentStatus }, token);
      alert(`Категория ${!currentStatus ? 'активирована' : 'деактивирована'}!`);
      loadCategories();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка обновления категории: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  if (loading) return <p>Загрузка категорий...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div>
      <h2 className="admin-section-title">Управление категориями ({categories.length})</h2>
      <div style={{ marginBottom: '15px' }}>
        <button onClick={loadCategories} className="admin-action-button" style={{ marginRight: '10px' }}>
          Обновить список
        </button>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="admin-action-button"
          style={{ backgroundColor: '#10b981' }}
        >
          {showCreateForm ? 'Отмена' : '+ Создать категорию'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateCategory} style={{ 
          backgroundColor: '#f9fafb', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0 }}>Новая категория</h3>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Название категории"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Иконка (опционально)"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="number"
              placeholder="Позиция"
              value={newCategory.position}
              onChange={(e) => setNewCategory({ ...newCategory, position: parseInt(e.target.value) })}
              style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={newCategory.isActive}
                onChange={(e) => setNewCategory({ ...newCategory, isActive: e.target.checked })}
                style={{ marginRight: '5px' }}
              />
              Активна
            </label>
          </div>
          <button type="submit" className="admin-action-button" style={{ backgroundColor: '#10b981' }}>
            Создать
          </button>
        </form>
      )}

      {categories.length === 0 ? (
        <p>Нет категорий.</p>
      ) : (
        <ul className="admin-list">
          {categories.map((cat) => (
            <li key={cat.id}>
              <div>
                <strong>{cat.name}</strong> (ID: {cat.id}, Slug: {cat.slug})
                <br />
                <small>
                  Позиция: {cat.position} | Статус: {cat.isActive ? '✅ Активна' : '❌ Неактивна'}
                  {cat.icon && ` | Иконка: ${cat.icon}`}
                  {cat.parentId && ` | Родитель ID: ${cat.parentId}`}
                </small>
              </div>
              <div>
                <button 
                  onClick={() => handleToggleActive(cat.id, cat.isActive)} 
                  className="admin-action-button"
                  style={{ backgroundColor: cat.isActive ? '#f59e0b' : '#10b981' }}
                >
                  {cat.isActive ? 'Деактивировать' : 'Активировать'}
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)} className="admin-action-button danger">
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

export default AdminCategories;