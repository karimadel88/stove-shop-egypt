import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { shopApi } from "@/lib/api";
import { ShopSettings } from "@/types/shop";

interface SettingsContextType {
  settings: ShopSettings | null;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: true,
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await shopApi.getSettings();
        setSettings(response.data);
      } catch (error) {
        console.error("Failed to fetch shop settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
