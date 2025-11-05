import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

interface AuthRoutesProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const AuthRoutes: React.FC<AuthRoutesProps> = ({ onLoginSuccess }) => {
  return (
    <Routes>
      <Route path="/" element={<Login onLoginSuccess={onLoginSuccess} />} />
      <Route path="/login" element={<Login onLoginSuccess={onLoginSuccess} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};

export default AuthRoutes;
