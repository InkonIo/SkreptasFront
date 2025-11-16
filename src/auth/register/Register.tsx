import React, { useState } from 'react';
import api from '../../api';
import './Register.css';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | null;

interface RegisterProps {
  onSwitchView: (view: AuthView) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fio, setFio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    try {
      const requestData = {
        email,
        password,
        fio,
        phoneNumber,
        city,
        role: 'USER',
      };

      const response = await api.register(requestData);

      if (response.accessToken || response.success) {
        setSuccess('Регистрация прошла успешно! Перенаправление на страницу входа...');
        setTimeout(() => onSwitchView('login'), 2000);
      } else {
        const errorMessage = response.message || response.error || JSON.stringify(response);
        setError('Ошибка регистрации: ' + errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Не удалось подключиться к серверу';
      setError('Ошибка: ' + errorMessage);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <h1 className="register-title">Регистрация</h1>
        <p>Создайте новый аккаунт для доступа ко всем функциям</p>
        
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="register-input"
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="Пароль (минимум 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="register-input"
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            placeholder="ФИО"
            value={fio}
            onChange={(e) => setFio(e.target.value)}
            required
            className="register-input"
          />
        </div>
        
        <div className="form-group">
          <input
            type="tel"
            placeholder="Номер телефона"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="register-input"
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            placeholder="Город"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="register-input"
          />
        </div>
        
        {error && <div className="register-error">{error}</div>}
        {success && <div className="register-success">{success}</div>}
        
        <button type="submit" className="register-button" disabled={!!success}>
          Зарегистрироваться
        </button>
        
        <div className="register-links">
          <button type="button" onClick={() => onSwitchView('login')}>
            Уже есть аккаунт? Войти
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;