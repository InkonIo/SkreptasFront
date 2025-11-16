import React, { useState } from 'react';
import api from '../../api';
import './Login.css';


type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | null;

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onSwitchView: (view: AuthView) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.login({ email, password });

      if (response.accessToken && response.user) {
        onLoginSuccess(response.accessToken, response.user);
      } else {
        setError('Некорректный ответ от сервера');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Не удалось подключиться к серверу';
      setError('Ошибка входа: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h1 className="login-title">Вход в систему</h1>
        <p>Войдите в свой аккаунт, чтобы продолжить</p>
        
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
        
        {error && <div className="login-error">{error}</div>}
        
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
        
        <div className="login-links">
          <button type="button" onClick={() => onSwitchView('forgot-password')}>
            Забыли пароль?
          </button>
          <button type="button" onClick={() => onSwitchView('register')}>
            Нет аккаунта? Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;