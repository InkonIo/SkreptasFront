import React, { useState } from 'react';

import api from '../api';
import './ResetPassword.css';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | null;

interface ResetPasswordProps {
  onSwitchView: (view: AuthView) => void;
  initialEmail?: string;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onSwitchView, initialEmail }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [token, setToken] = useState(''); // Это будет 6-значный код
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Email не указан.');
      return;
    }

    if (token.length !== 6) {
      setError('Код должен состоять из 6 цифр.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Новый пароль должен быть не менее 6 символов.');
      return;
    }

    try {
      // В API resetPassword используется токен, который теперь будет 6-значным кодом
      const response = await api.resetPassword(token, newPassword);

      if (response.status === 200 || response.message === 'OK' || !response.error) {
        setSuccess('Пароль успешно сброшен! Вы будете перенаправлены на страницу входа.');
        setTimeout(() => onSwitchView('login'), 3000);
      } else {
        setError('Ошибка сброса пароля: ' + (response.message || JSON.stringify(response)));
      }
    } catch (err) {
      setError('Ошибка: Не удалось подключиться к серверу или произошла другая ошибка.');
      console.error(err);
    }
  };

  return (
    <div className="reset-password-container">
      <h1 className="reset-password-title">Установка нового пароля</h1>
      <form onSubmit={handleResetPassword} className="reset-password-form">
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          Введите 6-значный код, отправленный на <strong>{email}</strong>, и новый пароль.
        </p>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="reset-password-input"
            disabled={!!initialEmail}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="6-значный код"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            maxLength={6}
            className="reset-password-input"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Новый пароль (мин. 6 символов)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="reset-password-input"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Подтвердите новый пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="reset-password-input"
          />
        </div>
        {error && <p className="reset-password-error">{error}</p>}
        {success && <p className="reset-password-success">{success}</p>}
        <button type="submit" className="reset-password-button" disabled={!!success}>
          Установить новый пароль
        </button>
      </form>
      <div className="reset-password-links">
        <button type="button" onClick={() => onSwitchView('login')}>
          Вернуться ко входу
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
