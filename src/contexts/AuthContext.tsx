import { createContext, useContext, useState, useEffect, useCallback } from "react";

type AdminRole = "super_admin" | "country_admin" | "state_admin";

type User = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  countryId?: string;
  countryCode?: string;
  countryName?: string;
  stateId?: string;
  stateCode?: string;
  stateName?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("fc-admin-token");
    const storedUser = localStorage.getItem("fc-admin-user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem("fc-admin-token");
        localStorage.removeItem("fc-admin-user");
      }
    }
    setIsLoading(false);
  }, []);

  // Persist session changes
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("fc-admin-token", token);
      localStorage.setItem("fc-admin-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("fc-admin-token");
      localStorage.removeItem("fc-admin-user");
    }
  }, [token, user]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Login failed:", error.message || response.statusText);
        return false;
      }

      const data = await response.json();

      // Check if response is successful and user is an admin
      if (!data.success || !data.data?.user || data.data.user.type !== "admin") {
        console.error("Login failed: Not an admin user");
        return false;
      }

      const { accessToken, user: apiUser } = data.data;

      // Map API response to our User type
      const mappedUser: User = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.adminRole,
        countryId: apiUser.countryId,
        countryCode: apiUser.countryCode,
        countryName: apiUser.countryName,
        stateId: apiUser.stateId,
        stateCode: apiUser.stateCode,
        stateName: apiUser.stateName,
      };

      setToken(accessToken);
      setUser(mappedUser);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
