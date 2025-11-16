import React, { useState, useMemo } from 'react';
import './MyShopTab.css';
import { api } from '../ShopAndUserApi';
import imageCompression from 'browser-image-compression';

interface MyShopTabProps {
  myShop: any;
  categories: any[];
  items: any[];
  token: string;
  onShopCreated: () => void;
  onItemCreated: () => void;
}

const MyShopTab: React.FC<MyShopTabProps> = ({ 
  myShop, 
  categories, 
  items, 
  token, 
  onShopCreated,
  onItemCreated 
}) => {
  // Form states for creating shop
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    phone: '',
    instagramLink: '',
    city: '',
    address: '',
    categoryIds: [] as number[],
    logoFile: null as File | null,
  });

  // Form states for creating item
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    tags: '',
    city: '',
    categoryId: '',
    imageFiles: [] as File[],
  });

  // Edit modals
  const [editShopModal, setEditShopModal] = useState(false);
  const [editItemModal, setEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Edit forms
  const [editShopForm, setEditShopForm] = useState({
    name: '',
    description: '',
    phone: '',
    instagramLink: '',
    city: '',
    address: '',
  });

  const [editItemForm, setEditItemForm] = useState({
    title: '',
    description: '',
    tags: '',
    city: '',
    categoryId: '',
  });

  const [isCompressing, setIsCompressing] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Сжатие: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return compressedFile;
    } catch (error) {
      console.error('Ошибка сжатия:', error);
      throw error;
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    const maxSizeBeforeCompression = 10 * 1024 * 1024;
    if (file.size > maxSizeBeforeCompression) {
      alert('Файл слишком большой. Максимальный размер: 10MB');
      return;
    }

    try {
      setIsCompressing(true);
      const compressedFile = await compressImage(file);
      setShopForm({ ...shopForm, logoFile: compressedFile });
    } catch (error) {
      alert('Ошибка при сжатии изображения');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleImageFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);

    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('Все файлы должны быть изображениями');
      return;
    }

    if (files.length > 10) {
      alert('Максимум 10 изображений');
      return;
    }

    try {
      setIsCompressing(true);
      
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );
      
      setItemForm({ ...itemForm, imageFiles: compressedFiles });
    } catch (error) {
      alert('Ошибка при сжатии изображений');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopForm.name.trim()) {
      alert('Введите название магазина');
      return;
    }
    if (shopForm.categoryIds.length === 0) {
      alert('Выберите хотя бы одну категорию');
      return;
    }
    try {
      await api.createShop(shopForm, token);
      alert('Магазин создан! Ожидает модерации.');
      setShopForm({
        name: '',
        description: '',
        phone: '',
        instagramLink: '',
        city: '',
        address: '',
        categoryIds: [],
        logoFile: null,
      });
      onShopCreated();
    } catch (error) {
      alert('Ошибка создания магазина: ' + error);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop) {
      alert('Сначала создайте магазин');
      return;
    }
    if (!itemForm.title.trim()) {
      alert('Введите название товара');
      return;
    }
    if (!itemForm.categoryId) {
      alert('Выберите категорию');
      return;
    }
    try {
      const tagsArray = itemForm.tags.split(',').map(t => t.trim()).filter(t => t);
      await api.createItem(
        myShop.id,
        {
          title: itemForm.title,
          description: itemForm.description,
          imageFiles: itemForm.imageFiles,
          categoryId: parseInt(itemForm.categoryId),
          tags: tagsArray,
          city: itemForm.city,
        },
        token
      );
      alert('Товар создан!');
      setItemForm({
        title: '',
        description: '',
        tags: '',
        city: '',
        categoryId: '',
        imageFiles: [],
      });
      onItemCreated();
    } catch (error) {
      alert('Ошибка создания товара: ' + error);
    }
  };

  const handleDeleteShop = async () => {
    if (!myShop) return;
    
    if (!window.confirm(`Вы уверены, что хотите удалить магазин "${myShop.name}"? Это действие необратимо и удалит все товары магазина.`)) {
      return;
    }

    try {
      await api.deleteShop(myShop.id, token);
      alert('Магазин успешно удален.');
      onShopCreated();
    } catch (error: any) {
      console.error('Ошибка удаления магазина:', error);
      alert('Ошибка при удалении магазина: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const openEditShopModal = () => {
    if (!myShop) return;
    setEditShopForm({
      name: myShop.name,
      description: myShop.description || '',
      phone: myShop.phone,
      instagramLink: myShop.instagramLink || '',
      city: myShop.city,
      address: myShop.address || '',
    });
    setEditShopModal(true);
  };

  const handleEditShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop) return;

    try {
      await api.updateShop(myShop.id, editShopForm, token);
      alert('Магазин успешно обновлен!');
      setEditShopModal(false);
      onShopCreated();
    } catch (error) {
      alert('Ошибка обновления магазина: ' + error);
    }
  };

  const openEditItemModal = (item: any) => {
    setEditingItem(item);
    setEditItemForm({
      title: item.title,
      description: item.description || '',
      tags: item.tags ? item.tags.join(', ') : '',
      city: item.city || '',
      categoryId: item.category?.id?.toString() || '',
    });
    setEditItemModal(true);
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const tagsArray = editItemForm.tags.split(',').map(t => t.trim()).filter(t => t);
      await api.updateItem(
        editingItem.id,
        {
          title: editItemForm.title,
          description: editItemForm.description,
          categoryId: parseInt(editItemForm.categoryId),
          tags: tagsArray,
          city: editItemForm.city,
        },
        token
      );
      alert('Товар успешно обновлен!');
      setEditItemModal(false);
      setEditingItem(null);
      onItemCreated();
    } catch (error) {
      alert('Ошибка обновления товара: ' + error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await api.deleteItem(itemId, token);
      alert('Товар успешно удален.');
      onItemCreated();
    } catch (error) {
      alert('Ошибка удаления товара: ' + error);
    }
  };

  const myShopItems = useMemo(() => items.filter(item => item.shop?.id === myShop?.id), [items, myShop]);

  return (
    <div className="my-shop-container">
      <h2 className="my-shop-title">🪀 Мой магазин</h2>
      
      {!myShop ? (
        <div>
          <h3 className="shop-form-title">Создать магазин</h3>
          <form onSubmit={handleCreateShop} className="shop-form">
            <input
              type="text"
              placeholder="Название магазина *"
              value={shopForm.name}
              onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
              className="form-input"
              required
            />
            <textarea
              placeholder="Описание"
              value={shopForm.description}
              onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
              className="form-textarea"
            />
            <div className="form-file-group">
              <label className="form-file-label">Логотип магазина (макс. 10MB, будет сжат до 1MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                disabled={isCompressing}
              />
              {isCompressing && (
                <small className="file-compressing-info">⏳ Сжатие изображения...</small>
              )}
              {shopForm.logoFile && !isCompressing && (
                <small className="file-selected-info">
                  ✓ Файл выбран: {shopForm.logoFile.name} ({(shopForm.logoFile.size / 1024 / 1024).toFixed(2)}MB)
                </small>
              )}
            </div>
            <input
              type="text"
              placeholder="Телефон *"
              value={shopForm.phone}
              onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Ссылка на Instagram (полный URL)"
              value={shopForm.instagramLink}
              onChange={(e) => setShopForm({ ...shopForm, instagramLink: e.target.value })}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Город *"
              value={shopForm.city}
              onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Адрес"
              value={shopForm.address}
              onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
              className="form-input"
            />
            <div className="form-checkbox-group">
              <label className="form-checkbox-label">Категории *</label>
              {categories.map(cat => (
                <label key={cat.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={shopForm.categoryIds.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setShopForm({ ...shopForm, categoryIds: [...shopForm.categoryIds, cat.id] });
                      } else {
                        setShopForm({ ...shopForm, categoryIds: shopForm.categoryIds.filter(id => id !== cat.id) });
                      }
                    }}
                  />
                  {cat.name}
                </label>
              ))}
              {shopForm.categoryIds.length === 0 && (
                <small className="category-warning">Выберите хотя бы одну категорию</small>
              )}
            </div>
            <button 
              type="submit" 
              className="form-submit-btn"
              disabled={isCompressing}
            >
              Создать магазин
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className="shop-management-grid">
            <div 
              className={`shop-info-card ${myShop.approved ? 'approved' : 'pending'}`}
            >
            <div className="shop-content">
              {myShop.logoUrl && (
                <img 
                  src={myShop.logoUrl} 
                  alt={myShop.name}
                  className="shop-logo"
                />
              )}
              <div className="shop-details">
                <h3 className="shop-name">{myShop.name}</h3>
                <p className="shop-description">{myShop.description}</p>
                <p className="shop-meta">📞 {myShop.phone}</p>
                {myShop.instagramLink && (
                  <a 
                    href={myShop.instagramLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="instagram-link-btn"
                  >
                    Перейти в Instagram
                  </a>
                )}
                {myShop.categories && myShop.categories.length > 0 && (
                  <p className="shop-categories">
                    🏷️ {myShop.categories.map((c: any) => c.name).join(', ')}
                  </p>
                )}
                <p className={`shop-status ${myShop.approved ? 'approved' : 'pending'}`}>
                  {myShop.approved ? '✅ Одобрен' : '⏳ На модерации'}
                </p>
                <div className="shop-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditShopModal();
                    }}
                    className="edit-shop-btn"
                  >
                    ✏️ Редактировать
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteShop();
                    }}
                    className="delete-shop-btn"
                  >
                    🗑️ Удалить магазин
                  </button>
                </div>
              </div>
            </div>
            </div>
            <div className="item-form-wrapper">
              <h3 className="item-form-title">Добавить товар</h3>
              <form onSubmit={handleCreateItem} className="item-form">
            <input
              type="text"
              placeholder="Название товара *"
              value={itemForm.title}
              onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
              className="form-input"
              required
            />
            <textarea
              placeholder="Описание товара"
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              className="form-textarea"
            />
            <select
              value={itemForm.categoryId}
              onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
              className="form-select"
              required
            >
              <option value="">Выберите категорию *</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="form-file-group">
              <label className="form-file-label">Фотографии товара (макс. 10 шт., каждая до 10MB)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFilesChange}
                disabled={isCompressing}
              />
              {isCompressing && (
                <small className="file-compressing-info">⏳ Сжатие изображений...</small>
              )}
              {itemForm.imageFiles.length > 0 && !isCompressing && (
                <small className="file-selected-info">
                  ✓ Выбрано файлов: {itemForm.imageFiles.length} 
                  ({(itemForm.imageFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)}MB)
                </small>
              )}
            </div>
            <input
              type="text"
              placeholder="Теги (через запятую)"
              value={itemForm.tags}
              onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Город *"
              value={itemForm.city}
              onChange={(e) => setItemForm({ ...itemForm, city: e.target.value })}
              className="form-input"
              required
            />
            <button 
              type="submit" 
              className="form-submit-btn"
              disabled={isCompressing}
            >
              Добавить товар
            </button>
          </form>
            </div>
          </div>

          <h3 className="my-items-title">Мои товары ({myShopItems.length})</h3>
          {myShopItems.length === 0 ? (
            <p className="no-items-message">
              У вас пока нет товаров
            </p>
          ) : (
            <div className="my-shop-items-grid">
              {myShopItems.map((item) => (
                <div 
                  key={item.id} 
                  className="my-shop-item-card"
                >
                  <div className="my-shop-item-content">
                    {item.images && item.images.length > 0 && (
                      <img 
                        src={item.images[0]} 
                        alt={item.title}
                        className="my-shop-item-image"
                      />
                    )}
                    <div className="my-shop-item-details">
                      <h4 className="my-shop-item-title">{item.title}</h4>
                      <p className="my-shop-item-meta">{item.description}</p>
                      <p className="my-shop-item-meta">📍 {item.city}</p>
                      {item.tags && item.tags.length > 0 && (
                        <p className="my-shop-item-meta">
                          🏷️ {item.tags.map((tag: string) => `#${tag}`).join(' ')}
                        </p>
                      )}
                      <small className="my-shop-item-meta">
                        👁️ {item.views} просмотров | ❤️ {item.favorites} в избранном
                      </small>
                      <div className="item-actions">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditItemModal(item);
                          }}
                          className="edit-btn"
                        >
                          ✏️ Изменить
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="delete-item-btn"
                        >
                          🗑️ Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div> 
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Shop Modal */}
      {editShopModal && (
        <div className="modal-overlay" onClick={() => setEditShopModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Редактировать магазин</h3>
              <button className="modal-close-btn" onClick={() => setEditShopModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditShop}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Название магазина *"
                  value={editShopForm.name}
                  onChange={(e) => setEditShopForm({ ...editShopForm, name: e.target.value })}
                  className="form-input"
                  required
                />
                <textarea
                  placeholder="Описание"
                  value={editShopForm.description}
                  onChange={(e) => setEditShopForm({ ...editShopForm, description: e.target.value })}
                  className="form-textarea"
                />
                <input
                  type="text"
                  placeholder="Телефон *"
                  value={editShopForm.phone}
                  onChange={(e) => setEditShopForm({ ...editShopForm, phone: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Ссылка на Instagram"
                  value={editShopForm.instagramLink}
                  onChange={(e) => setEditShopForm({ ...editShopForm, instagramLink: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Город *"
                  value={editShopForm.city}
                  onChange={(e) => setEditShopForm({ ...editShopForm, city: e.target.value })}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Адрес"
                  value={editShopForm.address}
                  onChange={(e) => setEditShopForm({ ...editShopForm, address: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn modal-btn-secondary" onClick={() => setEditShopModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="modal-btn modal-btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editItemModal && (
        <div className="modal-overlay" onClick={() => setEditItemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Редактировать товар</h3>
              <button className="modal-close-btn" onClick={() => setEditItemModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditItem}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Название товара *"
                  value={editItemForm.title}
                  onChange={(e) => setEditItemForm({ ...editItemForm, title: e.target.value })}
                  className="form-input"
                  required
                />
                <textarea
                  placeholder="Описание товара"
                  value={editItemForm.description}
                  onChange={(e) => setEditItemForm({ ...editItemForm, description: e.target.value })}
                  className="form-textarea"
                />
                <select
                  value={editItemForm.categoryId}
                  onChange={(e) => setEditItemForm({ ...editItemForm, categoryId: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="">Выберите категорию *</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Теги (через запятую)"
                  value={editItemForm.tags}
                  onChange={(e) => setEditItemForm({ ...editItemForm, tags: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Город *"
                  value={editItemForm.city}
                  onChange={(e) => setEditItemForm({ ...editItemForm, city: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn modal-btn-secondary" onClick={() => setEditItemModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="modal-btn modal-btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShopTab;