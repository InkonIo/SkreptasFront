import React, { useState } from 'react';
import { api, type Category } from '../ShopAndUserApi';
import './EditMyShopTab.css'; // New CSS file for edit styles

interface ShopData {
  id: number;
  name: string;
  description?: string | null;
  phone: string;
  instagramLink?: string | null;
  city: string;
  address?: string | null;
  categories: { id: number; name: string }[];
}

interface ItemData {
  id: number;
  title: string;
  description?: string | null;
  tags?: string[];
  city?: string | null;
  category?: { id: number; name: string };
}

interface EditMyShopTabProps {
  myShop: ShopData | null;
  categories: Category[];
  token: string;
  onShopUpdated: () => void;
  onItemUpdated: () => void;
  isEditMode: boolean;
  onCloseEditMode: () => void;
}

const EditMyShopTab: React.FC<EditMyShopTabProps> = ({
  myShop,
  categories,
  token,
  onShopUpdated,
  onItemUpdated,
  isEditMode,
  onCloseEditMode,
}) => {
  // State variables for editing
  const [editShopModal, setEditShopModal] = useState(false);
  const [editItemModal, setEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemData | null>(null);

  // Edit forms
  const [editShopForm, setEditShopForm] = useState({
    name: '',
    description: '',
    phone: '',
    instagramLink: '',
    city: '',
    address: '',
    categoryIds: [] as number[],
  });

  const [editItemForm, setEditItemForm] = useState({
    title: '',
    description: '',
    tags: '',
    city: '',
    categoryId: '',
  });

  // --- Shop Editing Logic ---

  const handleEditShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop) return;

    try {
      await api.updateShop(myShop.id, editShopForm, token);
      alert('Магазин успешно обновлен!');
      setEditShopModal(false);
      onShopUpdated();
      onCloseEditMode();
    } catch (error) {
      alert('Ошибка обновления магазина: ' + error);
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
      onShopUpdated();
      onCloseEditMode();
    } catch (error: unknown) {
      console.error('Ошибка удаления магазина:', error);
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert('Ошибка при удалении магазина: ' + message);
    }
  };

  // --- Item Editing Logic ---

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
      onItemUpdated();
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
      onItemUpdated();
    } catch (error) {
      alert('Ошибка удаления товара: ' + error);
    }
  };

  // If not in edit mode, render nothing
  if (!isEditMode) {
    return null;
  }

  // --- JSX for Modals ---

  return (
    <div className="edit-my-shop-edit-mode-container">
      {/* Edit Shop Modal */}
      {editShopModal && (
        <div className="edit-modal-overlay" onClick={() => { setEditShopModal(false); onCloseEditMode(); }}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3 className="edit-modal-title">Редактировать магазин</h3>
              <button className="edit-modal-close-btn" onClick={() => { setEditShopModal(false); onCloseEditMode(); }}>×</button>
            </div>
            <form onSubmit={handleEditShop}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Название магазина *"
                  value={editShopForm.name}
                  onChange={(e) => setEditShopForm({ ...editShopForm, name: e.target.value })}
                  className="edit-form-input"
                  required
                />
                <textarea
                  placeholder="Описание"
                  value={editShopForm.description}
                  onChange={(e) => setEditShopForm({ ...editShopForm, description: e.target.value })}
                  className="edit-form-textarea"
                />
                <input
                  type="text"
                  placeholder="Телефон *"
                  value={editShopForm.phone}
                  onChange={(e) => setEditShopForm({ ...editShopForm, phone: e.target.value })}
                  className="edit-form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Ссылка на Instagram"
                  value={editShopForm.instagramLink}
                  onChange={(e) => setEditShopForm({ ...editShopForm, instagramLink: e.target.value })}
                  className="edit-form-input"
                />
                <input
                  type="text"
                  placeholder="Город *"
                  value={editShopForm.city}
                  onChange={(e) => setEditShopForm({ ...editShopForm, city: e.target.value })}
                  className="edit-form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Адрес"
                  value={editShopForm.address}
                  onChange={(e) => setEditShopForm({ ...editShopForm, address: e.target.value })}
                  className="edit-form-input"
                />
              </div>
              <div className="edit-modal-actions">
                <button type="button" className="edit-modal-btn edit-modal-btn-secondary" onClick={() => { setEditShopModal(false); onCloseEditMode(); }}>
                  Отмена
                </button>
                <button type="submit" className="edit-modal-btn edit-modal-btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
            <div className="edit-modal-delete-section">
                <button 
                    onClick={handleDeleteShop} 
                    className="edit-delete-shop-btn"
                >
                    🗑️ Удалить магазин
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editItemModal && (
        <div className="edit-modal-overlay" onClick={() => setEditItemModal(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3 className="edit-modal-title">Редактировать товар</h3>
              <button className="edit-modal-close-btn" onClick={() => setEditItemModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditItem}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Название товара *"
                  value={editItemForm.title}
                  onChange={(e) => setEditItemForm({ ...editItemForm, title: e.target.value })}
                  className="edit-form-input"
                  required
                />
                <textarea
                  placeholder="Описание товара"
                  value={editItemForm.description}
                  onChange={(e) => setEditItemForm({ ...editItemForm, description: e.target.value })}
                  className="edit-form-textarea"
                />
                <select
                  value={editItemForm.categoryId}
                  onChange={(e) => setEditItemForm({ ...editItemForm, categoryId: e.target.value })}
                  className="edit-form-select"
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
                  className="edit-form-input"
                />
                <input
                  type="text"
                  placeholder="Город *"
                  value={editItemForm.city}
                  onChange={(e) => setEditItemForm({ ...editItemForm, city: e.target.value })}
                  className="edit-form-input"
                  required
                />
              </div>
              <div className="edit-modal-actions">
                <button type="button" className="edit-modal-btn edit-modal-btn-secondary" onClick={() => setEditItemModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="edit-modal-btn edit-modal-btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
            <div className="edit-modal-delete-section">
                <button 
                    onClick={() => editingItem && handleDeleteItem(editingItem.id)} 
                    className="edit-delete-item-btn"
                >
                    🗑️ Удалить товар
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditMyShopTab;