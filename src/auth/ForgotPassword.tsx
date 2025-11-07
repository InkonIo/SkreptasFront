import React, { useState } from 'react';
import api from '../api';
import './ForgotPassword.css';



type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | null;

interface ForgotPasswordProps {
  onSwitchView: (view: AuthView, email?: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSwitchView }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await api.forgotPassword(email);

      // Assuming the API returns a success message or status 200 on success
      if (response.status === 200 || response.message === 'OK' || !response.error) {
        setSuccess('Инструкции по сбросу пароля отправлены на вашу почту. Перенаправление...');
        // Переключаемся на модальное окно сброса пароля, передавая email
        setTimeout(() => onSwitchView('reset-password', email), 2000);
      } else {
        setError('Ошибка: ' + (response.message || JSON.stringify(response)));
      }
    } catch (err) {
      setError('Ошибка: Не удалось подключиться к серверу или произошла другая ошибка.');
      console.error(err);
    }
  };

  return (
    <div className="forgot-password-container">
      <h1 className="forgot-password-title">Восстановление пароля</h1>
      <form onSubmit={handleForgotPassword} className="forgot-password-form">
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          Введите ваш email, и мы вышлем вам инструкции по сбросу пароля.
        </p>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="forgot-password-input"
          />
        </div>
        {error && <p className="forgot-password-error">{error}</p>}
        {success && <p className="forgot-password-success">{success}</p>}
        <button type="submit" className="forgot-password-button" disabled={!!success}>
          Сбросить пароль
        </button>
        <div className="forgot-password-links">
          <button type="button" onClick={() => onSwitchView('login')}>
            Вернуться ко входу
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
