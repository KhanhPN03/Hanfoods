import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const AuthHandler = () => {
  const { checkAuthStatus, addNotification, user, sessionExpired } = useAppContext();

  useEffect(() => {
    const handleSessionExpired = () => {
      if (user) {
        addNotification(
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          'warning',
          5000
        );
      }
      checkAuthStatus();
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [checkAuthStatus, addNotification, user]);

  return null;
};

export default AuthHandler;