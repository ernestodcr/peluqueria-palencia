import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // FUNCIÓN REAL DE CIERRE DE SESIÓN: Limpia el disco duro y avisa al árbitro
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null); // Al volver a null, el árbitro te echa al Login automáticamente
  };

  return (
    // Inyectamos "logout" en el value para que Dashboard.jsx pueda usarlo
    <AuthContext.Provider value={{ usuario, setUsuario, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
