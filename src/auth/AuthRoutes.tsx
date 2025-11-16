import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import type { AuthView } from '../types/AuthView';
import Register from '../auth/register/Register';
import ForgotPassword from '../auth/forgot/ForgotPassword';
import ResetPassword from '../auth/reset/ResetPassword';
import Login from './login/Login';

interface AuthRoutesProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const AuthRoutes: React.FC<AuthRoutesProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleSwitchView = (view: AuthView) => {
    navigate(`/${view}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Login
            onLoginSuccess={onLoginSuccess}
            onSwitchView={handleSwitchView}
          />
        }
      />

      <Route
        path="/login"
        element={
          <Login
            onLoginSuccess={onLoginSuccess}
            onSwitchView={handleSwitchView}
          />
        }
      />

      <Route
        path="/register"
        element={
          <Register
            onSwitchView={handleSwitchView}
          />
        }
      />

      <Route
        path="/forgot-password"
        element={
          <ForgotPassword
            onSwitchView={handleSwitchView}
          />
        }
      />

      <Route
        path="/reset-password"
        element={
          <ResetPassword
            onSwitchView={handleSwitchView}
          />
        }
      />
    </Routes>
  );
};

export default AuthRoutes;
