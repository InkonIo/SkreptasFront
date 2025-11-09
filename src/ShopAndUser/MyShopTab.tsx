import React, { useState } from 'react';
import '../ShopAndUser/css/MyShopTab.css';
import { api } from './ShopAndUserApi';
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

  // ✅ НОВАЯ ФУНКЦИЯ: Удаление магазина
  const handleDeleteShop = async () => {
    if (!myShop) return;
    
    if (!window.confirm(`Вы уверены, что хотите удалить магазин "${myShop.name}"? Это действие необратимо и удалит все товары магазина.`)) {
      return;
    }

    try {
      await api.deleteShop(myShop.id, token);
      alert('Магазин успешно удален.');
      onShopCreated(); // Обновляем список магазинов
    } catch (error: any) {
      console.error('Ошибка удаления магазина:', error);
      alert('Ошибка при удалении магазина: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const myShopItems = items.filter(item => item.shop?.id === myShop?.id);

  return (
    <div className="my-shop-container">
      <h2 className="my-shop-title">🏪 Мой магазин</h2>
      
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
                <p className="shop-meta">📍 {myShop.city}, {myShop.address}</p>
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
                {/* ✅ НОВАЯ КНОПКА УДАЛЕНИЯ */}
                <button 
                  onClick={handleDeleteShop} 
                  className="delete-shop-btn"
                  style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Удалить магазин
                </button>
              </div>
            </div>
          </div>

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

          <h3 className="my-items-title">Мои товары ({myShopItems.length})</h3>
          {myShopItems.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
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
                    </div>
                  </div>
                </div> 
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyShopTab;