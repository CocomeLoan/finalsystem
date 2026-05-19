import React, { createContext, useContext, useState, useEffect } from 'react';

const PortalAuthContext = createContext();

export function PortalAuthProvider({ children }) {
  const [portalUser, setPortalUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('portalUser');
    if (stored) {
      try {
        setPortalUser(JSON.parse(stored));
      } catch (_) {
        sessionStorage.removeItem('portalUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (user) => {
    sessionStorage.setItem('portalUser', JSON.stringify(user));
    setPortalUser(user);
  };

  const logout = () => {
    sessionStorage.removeItem('portalUser');
    setPortalUser(null);
  };

  return (
    <PortalAuthContext.Provider value={{ portalUser, isLoading, login, logout }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider');
  return ctx;
}