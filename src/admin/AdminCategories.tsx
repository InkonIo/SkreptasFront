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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [editingIconId, setEditingIconId] = useState<number | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Валидация типа файла
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Разрешены только файлы: PNG, JPG, JPEG, WEBP, SVG');
      return;
    }

    // Валидация размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setSelectedFile(file);

    // Создаём превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadIcon = async (categoryId: number) => {
    if (!selectedFile) {
      alert('Выберите файл для загрузки');
      return;
    }

    setUploadingIcon(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.uploadCategoryIcon(categoryId, formData, token);
      alert('Иконка успешно загружена!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditingIconId(null);
      loadCategories();
    } catch (err: any) {
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        alert('Доступ запрещен. Вы будете перенаправлены на страницу входа.');
        onLogout();
        return;
      }
      alert('Ошибка загрузки иконки: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      alert('Введите название категории');
      return;
    }
    try {
      const createdCategory = await api.createCategory(newCategory, token);
      
      let iconUploadSuccess = true;
      // Если выбран файл, загружаем иконку
      if (selectedFile && createdCategory.id) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
          await api.uploadCategoryIcon(createdCategory.id, formData, token);
        } catch (iconErr) {
          iconUploadSuccess = false;
          console.error('Ошибка при загрузке иконки:', iconErr);
          alert('Категория создана, но произошла ошибка при загрузке иконки: ' + (iconErr as any).message);
        }
      }

      if (iconUploadSuccess) {
        alert('Категория создана!');
      }
      setShowCreateForm(false);
      setNewCategory({ name: '', parentId: null, icon: '', position: 0, isActive: true });
      setSelectedFile(null);
      setPreviewUrl(null);
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
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setSelectedFile(null);
            setPreviewUrl(null);
          }} 
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
          
          {/* Загрузка иконки */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Иконка категории:
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={handleFileSelect}
              style={{ marginBottom: '10px' }}
            />
            {previewUrl && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb'
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <input
              type="number"
              placeholder="Позиция"
              value={newCategory.position || ''}
              onChange={(e) => setNewCategory({ ...newCategory, position: parseInt(e.target.value) || 0 })}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Превью иконки */}
                {cat.icon ? (
                  <img
                    src={cat.icon}
                    alt={cat.name}
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    Нет иконки
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <strong>{cat.name}</strong> (ID: {cat.id}, Slug: {cat.slug})
                  <br />
                  <small>
                    Позиция: {cat.position} | Статус: {cat.isActive ? '✅ Активна' : '❌ Неактивна'}
                    {cat.parentId && ` | Родитель ID: ${cat.parentId}`}
                  </small>

                  {/* Форма загрузки иконки */}
                  {editingIconId === cat.id && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                        onChange={handleFileSelect}
                        style={{ marginBottom: '10px' }}
                      />
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginRight: '10px'
                          }}
                        />
                      )}
                      <button
                        onClick={() => handleUploadIcon(cat.id)}
                        disabled={!selectedFile || uploadingIcon}
                        className="admin-action-button"
                        style={{ backgroundColor: '#3b82f6', marginRight: '5px' }}
                      >
                        {uploadingIcon ? 'Загрузка...' : 'Загрузить'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingIconId(null);
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="admin-action-button"
                        style={{ backgroundColor: '#6b7280' }}
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button
                  onClick={() => setEditingIconId(editingIconId === cat.id ? null : cat.id)}
                  className="admin-action-button"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  {editingIconId === cat.id ? 'Отмена' : '🖼️ Иконка'}
                </button>
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