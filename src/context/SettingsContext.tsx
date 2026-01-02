import { createContext, useContext, ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopApi } from "@/lib/api";
import { ShopSettings } from "@/types/shop";
import { useLocation } from "react-router-dom";

interface SettingsContextType {
  settings: ShopSettings | null;
  isLoading: boolean;
  isError: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: true,
  isError: false,
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings = null, isLoading, isError } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: async () => {
      const response = await shopApi.getSettings();
      return response.data as ShopSettings;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes - settings rarely change
    retry: 2,
  });

  const contextValue = useMemo(
    () => ({ settings, isLoading, isError }),
    [settings, isLoading, isError]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);


