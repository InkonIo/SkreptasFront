import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log('Попытка входа с:', { email, password: '***' });

    try {
      const response = await api.login({ email, password });
      
      console.log('Ответ от API:', response);

      if (response.accessToken && response.user) {
        console.log('Вход успешен, вызываем onLoginSuccess');
        onLoginSuccess(response.accessToken, response.user);
      } else {
        setError('Некорректный ответ от сервера');
        console.error('Некорректный ответ:', response);
      }
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      const errorMessage = err.message || 'Не удалось подключиться к серверу';
      setError('Ошибка входа: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Вход в систему</h1>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
            disabled={loading}
          />
        </div>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
        <div className="login-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
            Зарегистрироваться
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
            Забыли пароль?
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;