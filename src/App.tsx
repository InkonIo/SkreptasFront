import { useState, useEffect } from 'react';
import { api } from './services/api';

function App() {
  const [token, setToken] = useState<string>(localStorage.getItem('token') || '');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'categories' | 'shops' | 'admin'>('login');

  // Login
  const [email, setEmail] = useState('inkonio@bk.ru');
  const [password, setPassword] = useState('');

  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Shops
  const [shops, setShops] = useState<any[]>([]);
  const [pendingShops, setPendingShops] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      loadCategories();
      loadShops();
    }
  }, [token]);

  const handleLogin = async () => {
    try {
      const response = await api.login({ email, password });
      if (response.accessToken) {
        setToken(response.accessToken);
        setUser(response.user);
        alert('Вход успешен!');
      } else {
        alert('Ошибка входа: ' + JSON.stringify(response));
      }
    } catch (error) {
      alert('Ошибка: ' + error);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    setActiveTab('login');
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Введите название категории');
      return;
    }
    try {
      await api.createCategory(
        {
          name: newCategoryName,
          parentId: null,
          icon: 'icon',
          position: 1,
          isActive: true,
        },
        token
      );
      alert('Категория создана!');
      setNewCategoryName('');
      loadCategories();
    } catch (error) {
      alert('Ошибка: ' + error);
    }
  };

  const loadShops = async () => {
    try {
      const data = await api.getShops();
      setShops(data);
    } catch (error) {
      console.error('Ошибка загрузки магазинов:', error);
    }
  };

  const loadPendingShops = async () => {
    try {
      const data = await api.getPendingShops(token);
      setPendingShops(data);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleApproveShop = async (shopId: number) => {
    try {
      await api.approveShop(shopId, token);
      alert('Магазин одобрен!');
      loadPendingShops();
      loadShops();
    } catch (error) {
      alert('Ошибка: ' + error);
    }
  };

  if (!token) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>Вход в систему</h1>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px', width: '300px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '8px', width: '300px' }}
          />
        </div>
        <button onClick={handleLogin} style={{ padding: '8px 20px' }}>
          Войти
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <h1>Skrepta Admin</h1>
        <p>
          Пользователь: {user?.email} ({user?.role})
        </p>
        <button onClick={handleLogout} style={{ padding: '5px 10px' }}>
          Выйти
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('categories')} style={{ marginRight: '10px', padding: '8px' }}>
          Категории
        </button>
        <button onClick={() => setActiveTab('shops')} style={{ marginRight: '10px', padding: '8px' }}>
          Магазины
        </button>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => {
              setActiveTab('admin');
              loadPendingShops();
            }}
            style={{ padding: '8px' }}
          >
            Админка
          </button>
        )}
      </div>

      {activeTab === 'categories' && (
        <div>
          <h2>Категории</h2>
          {user?.role === 'ADMIN' && (
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Название категории"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                style={{ padding: '8px', width: '300px', marginRight: '10px' }}
              />
              <button onClick={handleCreateCategory} style={{ padding: '8px' }}>
                Создать
              </button>
            </div>
          )}
          <ul>
            {categories.map((cat) => (
              <li key={cat.id}>
                {cat.name} (ID: {cat.id})
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'shops' && (
        <div>
          <h2>Магазины</h2>
          <ul>
            {shops.map((shop) => (
              <li key={shop.id}>
                <strong>{shop.name}</strong> - {shop.city} - {shop.approved ? '✅ Одобрен' : '⏳ На модерации'}
                <br />
                <small>Владелец: {shop.owner?.email}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'admin' && user?.role === 'ADMIN' && (
        <div>
          <h2>Админ панель</h2>
          <h3>Магазины на модерации</h3>
          {pendingShops.length === 0 ? (
            <p>Нет магазинов на модерации</p>
          ) : (
            <ul>
              {pendingShops.map((shop) => (
                <li key={shop.id}>
                  <strong>{shop.name}</strong> - {shop.city}
                  <br />
                  <small>Владелец: {shop.owner?.email}</small>
                  <br />
                  <button onClick={() => handleApproveShop(shop.id)} style={{ marginTop: '5px', padding: '5px' }}>
                    Одобрить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;