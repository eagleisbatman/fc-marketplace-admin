/* eslint-disable react-refresh/only-export-components */
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = API_BASE_URL ? `${API_BASE_URL}/api/v1` : "";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user info on mount (stored in sessionStorage, NOT localStorage)
  // Token is stored in httpOnly cookie by backend, so we just restore user info
  useEffect(() => {
    const storedUser = sessionStorage.getItem("fc-admin-user");

    if (storedUser) {
      try {
        // eslint-disable-next-line react-compiler/react-compiler
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored data, clear it
        sessionStorage.removeItem("fc-admin-user");
      }
    }
    setIsLoading(false);
  }, []);

  // Persist user info changes to sessionStorage (not token - it's in httpOnly cookie)
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("fc-admin-user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("fc-admin-user");
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: allows setting httpOnly cookies
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

      const { user: apiUser } = data.data;
      // Note: accessToken is now set as httpOnly cookie by backend, not stored in JS

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

      setUser(mappedUser);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend to clear httpOnly cookies
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    // Clear local state regardless of API call result
    setUser(null);
    sessionStorage.removeItem("fc-admin-user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
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
