import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Register.css';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
  const navigate = useNavigate();
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

    // Basic validation
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов.');
      return;
    }

    try {
      const requestData = {
        email,
        password,
        fio,
        phoneNumber,
        city,
        role: 'USER', // Hardcoded as per API schema
      };

      const response = await api.register(requestData);

      // Check for success: either accessToken is present (full response) or success: true (empty response)
      if (response.accessToken || response.success) {
        setSuccess('Регистрация прошла успешно! Теперь вы можете войти.');
        setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
      } else {
        // This block should ideally not be reached if api.ts throws on error, but kept for safety
        const errorMessage = response.message || response.error || JSON.stringify(response);
        setError('Ошибка регистрации: ' + errorMessage);
      }
    } catch (err: any) {
      // Catch network errors or errors thrown by api.register if it doesn't handle non-200 responses
      const errorMessage = err.message || 'Не удалось подключиться к серверу или произошла другая ошибка.';
      setError('Ошибка: ' + errorMessage);
      console.error(err);
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Регистрация</h1>
      <form onSubmit={handleRegister} className="register-form">
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
            placeholder="Пароль (мин. 6 символов)"
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
        {error && <p className="register-error">{error}</p>}
        {success && <p className="register-success">{success}</p>}
        <button type="submit" className="register-button" disabled={!!success}>
          Зарегистрироваться
        </button>
        <div className="register-links">
          <a href="#" onClick={() => navigate('/login')}>
            Уже есть аккаунт? Войти
          </a>
        </div>
      </form>
    </div>
  );
};

export default Register;
