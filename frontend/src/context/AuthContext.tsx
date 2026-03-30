import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: any | null;
  login: (userId: string, email: string, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🛡️ ONE-TIME MIGRATION: Clear old localStorage keys to ensure new strict session rules apply
    if (localStorage.getItem('token') || localStorage.getItem('userId')) {
      localStorage.clear();
    }

    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    const email = sessionStorage.getItem('email');

    // 🔥 ONLY trust token for authentication status if it looks valid
    const isTokenValid = token && token !== 'undefined' && token !== 'null' && token.length > 20;

    if (isTokenValid && userId && email) {
      setUser({ id: userId, email });
    } else {
      // Clear any partial data if some keys are missing
      if (token || userId || email) {
        sessionStorage.clear();
      }
      setUser(null);
    }

    setLoading(false);
  }, []);

  // 🔥 Authentication now uses sessionStorage for strict per-tab security
  const login = (userId: string, email: string, token: string) => {
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('token', token);

    setUser({ id: userId, email });
  };

  const logout = () => {
    sessionStorage.clear(); // 🔥 Full session reset
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};