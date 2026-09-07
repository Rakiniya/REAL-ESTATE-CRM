import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "estateflow_access_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear current authentication session
  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // Verify saved token with backend
  const verifySession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    // No token means user is not logged in
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Backend verifies JWT and returns current user
      const response = await api.get("/auth/me");

      setUser(response.data);
    } catch (error) {
      console.error("Session verification failed:", error);

      // Token is invalid/expired
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  // Verify authentication when application starts
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Login
  const login = useCallback(async (email, password) => {
    // Get JWT token
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { access_token } = response.data;

    // Save token so refresh does not log user out
    localStorage.setItem(TOKEN_KEY, access_token);

    // Immediately verify token and get user information
    const meResponse = await api.get("/auth/me");

    setUser(meResponse.data);

    return meResponse.data;
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      verifySession,
    }),
    [user, loading, login, logout, verifySession]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export { TOKEN_KEY };