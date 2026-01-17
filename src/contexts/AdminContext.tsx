/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

type Country = {
  id: string;
  code: string;
  name: string;
  nameLocal?: string;
  flag?: string;
};

type AdminContextType = {
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country) => void;
  countries: Country[];
  isLoadingCountries: boolean;
  needsCountrySelection: boolean;
  clearCountrySelection: () => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Country flags emoji map
const countryFlags: Record<string, string> = {
  IN: "🇮🇳",
  KE: "🇰🇪",
  NG: "🇳🇬",
  ET: "🇪🇹",
  TZ: "🇹🇿",
  UG: "🇺🇬",
  GH: "🇬🇭",
  ZA: "🇿🇦",
  BD: "🇧🇩",
  NP: "🇳🇵",
};

// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = API_BASE_URL ? `${API_BASE_URL}/api/v1` : "";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [selectedCountry, setSelectedCountryState] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  // Determine if user needs to select a country
  const needsCountrySelection =
    isAuthenticated &&
    user?.role === "super_admin" &&
    !selectedCountry;

  // Load countries for super_admin
  useEffect(() => {
    if (isAuthenticated && user?.role === "super_admin") {
      // eslint-disable-next-line react-compiler/react-compiler
      setIsLoadingCountries(true);
      fetch(`${API_URL}/admin/locations/countries`, {
        credentials: "include", // Use httpOnly cookies for authentication
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            const countriesWithFlags = data.data.map((c: Country) => ({
              ...c,
              flag: countryFlags[c.code] || "🌍",
            }));
            setCountries(countriesWithFlags);
          }
        })
        .catch((err) => {
          console.error("Failed to load countries:", err);
        })
        .finally(() => {
          setIsLoadingCountries(false);
        });
    }
  }, [isAuthenticated, user?.role]);

  // For country_admin or state_admin, auto-set their country
  useEffect(() => {
    if (isAuthenticated && user && user.role !== "super_admin" && user.countryId) {
      // eslint-disable-next-line react-compiler/react-compiler
      setSelectedCountryState({
        id: user.countryId,
        code: user.countryCode || "",
        name: user.countryName || "",
        flag: countryFlags[user.countryCode || ""] || "🌍",
      });
    }
  }, [isAuthenticated, user]);

  // Restore selected country for super_admin from sessionStorage
  useEffect(() => {
    if (isAuthenticated && user?.role === "super_admin") {
      const storedCountry = sessionStorage.getItem("fc-admin-selected-country");
      if (storedCountry) {
        try {
          const country = JSON.parse(storedCountry);
          // eslint-disable-next-line react-compiler/react-compiler
          setSelectedCountryState({
            ...country,
            flag: countryFlags[country.code] || "🌍",
          });
        } catch {
          sessionStorage.removeItem("fc-admin-selected-country");
        }
      }
    }
  }, [isAuthenticated, user?.role]);

  // Persist selected country to sessionStorage
  useEffect(() => {
    if (selectedCountry && user?.role === "super_admin") {
      sessionStorage.setItem(
        "fc-admin-selected-country",
        JSON.stringify({
          id: selectedCountry.id,
          code: selectedCountry.code,
          name: selectedCountry.name,
        })
      );
    }
  }, [selectedCountry, user?.role]);

  const setSelectedCountry = useCallback((country: Country) => {
    setSelectedCountryState({
      ...country,
      flag: countryFlags[country.code] || "🌍",
    });
  }, []);

  const clearCountrySelection = useCallback(() => {
    setSelectedCountryState(null);
    sessionStorage.removeItem("fc-admin-selected-country");
  }, []);

  return (
    <AdminContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        countries,
        isLoadingCountries,
        needsCountrySelection,
        clearCountrySelection,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
