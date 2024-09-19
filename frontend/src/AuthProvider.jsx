import { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage if available
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [opponentName, setOpponentName] = useState("");

  useEffect(() => {
    // Synchronize localStorage with user state
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const opponent = (name) => {
    setOpponentName(name);
  }

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, opponent, opponentName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ redirectTo }) => {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to={redirectTo} />;
};

export const GuestRoute = ({ redirectTo }) => {
  const { user } = useAuth();

  return user ? <Navigate to={redirectTo} /> : <Outlet />;
};
