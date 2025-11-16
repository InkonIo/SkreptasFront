import React, { useState } from 'react';
import api from '../../api';
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

      if (response.status === 200 || response.message === 'OK' || !response.error) {
        setSuccess('Код для сброса пароля отправлен на вашу почту');
        setTimeout(() => onSwitchView('reset-password', email), 2000);
      } else {
        setError('Ошибка: ' + (response.message || JSON.stringify(response)));
      }
    } catch (err) {
      setError('Не удалось отправить код. Проверьте правильность email');
      console.error(err);
    }
  };

  return (
    <div className="forgot-password-container">
      <form onSubmit={handleForgotPassword} className="forgot-password-form">
        <h1 className="forgot-password-title">Восстановление пароля</h1>
        <p>Введите email, и мы отправим вам 6-значный код для сброса пароля</p>
        
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
        
        {error && <div className="forgot-password-error">{error}</div>}
        {success && <div className="forgot-password-success">{success}</div>}
        
        <button type="submit" className="forgot-password-button" disabled={!!success}>
          Отправить код
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