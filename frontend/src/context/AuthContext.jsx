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

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");

      setUser(response.data);
    } catch (error) {
      console.error(
        "Session verification failed:",
        error.response?.data || error.message
      );

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
  const login = useCallback(
    async (email, password, selectedRole) => {
      try {
        // Send email, password AND role to backend
        const response = await api.post(
          "/auth/login",
          {
            email: email.trim(),
            password,
            role: selectedRole,
          }
        );


        const { access_token } = response.data;


        if (!access_token) {
          throw new Error(
            "No access token returned by server."
          );
        }


        // Save JWT token
        localStorage.setItem(
          TOKEN_KEY,
          access_token
        );


        // Get logged-in user
        const meResponse = await api.get(
          "/auth/me"
        );


        setUser(meResponse.data);


        return meResponse.data;
      } catch (error) {
        console.error(
          "Login failed:",
          error.response?.data || error.message
        );

        clearSession();

        throw error;
      }
    },
    [clearSession]
  );


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
    [
      user,
      loading,
      login,
      logout,
      verifySession,
    ]
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