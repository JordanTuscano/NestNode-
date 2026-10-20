import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load: if a token exists, ask the backend who it belongs to
  useEffect(() => {
    if (!localStorage.getItem('nestnode_token')) return setLoading(false);
    api.get('/auth/me')
      .then(({ data }) => setUser({ id: data._id, name: data.name, email: data.email }))
      .catch(() => localStorage.removeItem('nestnode_token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const { data } = await api.post(path, body);
    localStorage.setItem('nestnode_token', data.token);
    setUser(data.user);
  };

  const value = {
    user, loading,
    login: (body) => authenticate('/auth/login', body),
    register: (body) => authenticate('/auth/register', body),
    logout: () => { localStorage.removeItem('nestnode_token'); setUser(null); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
