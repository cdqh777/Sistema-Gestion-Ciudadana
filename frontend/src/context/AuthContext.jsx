import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
export const API = '/api';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('muni_token');
    const user  = localStorage.getItem('muni_usuario');
    if (token && user) {
      setUsuario(JSON.parse(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setCargando(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('muni_token', token);
    localStorage.setItem('muni_usuario', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUsuario(userData);
  };

  const logout = () => {
    localStorage.removeItem('muni_token');
    localStorage.removeItem('muni_usuario');
    delete axios.defaults.headers.common['Authorization'];
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
