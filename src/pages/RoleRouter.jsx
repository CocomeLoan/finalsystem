import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function RoleRouter() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const role = user.role || 'student';
    const routes = {
      admin: '/admin',
      dean: '/dean',
      developer: '/developer',
      student: '/student',
    };
    navigate(routes[role] || '/student', { replace: true });
  }, [user, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}