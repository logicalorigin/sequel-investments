import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { WhiteLabelSettings } from "@shared/schema";

interface WhiteLabelContextType {
  settings: WhiteLabelSettingsWithMeta | null;
  isLoading: boolean;
  isDemoMode: boolean;
  refetch: () => void;
}

interface WhiteLabelSettingsWithMeta extends Partial<WhiteLabelSettings> {
  isDemoMode: boolean;
}

const defaultSettings: WhiteLabelSettingsWithMeta = {
  companyName: "SEQUEL INVESTMENTS",
  logoUrl: null,
  primaryColor: "#D4A01D",
  secondaryColor: "#1a1a1a",
  contactPhone: "302.388.8860",
  contactEmail: "josh@fundwithsequel.com",
  contactAddress: "800 5th Avenue, Suite 4100, Miami Beach, FL 33139",
  footerText: null,
  isActive: false,
  isDemoMode: false,
};

const WhiteLabelContext = createContext<WhiteLabelContextType>({
  settings: defaultSettings,
  isLoading: true,
  isDemoMode: false,
  refetch: () => {},
});

function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "45 90% 50%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const [cssApplied, setCssApplied] = useState(false);

  const { data, isLoading, refetch } = useQuery<WhiteLabelSettingsWithMeta>({
    queryKey: ["/api/white-label"],
    staleTime: 1000 * 60 * 5, 
  });

  const settings = useMemo(() => {
    return data || defaultSettings;
  }, [data]);

  const isDemoMode = settings?.isDemoMode || false;

  useEffect(() => {
    if (settings?.primaryColor && isDemoMode) {
      const hslValue = hexToHSL(settings.primaryColor);
      document.documentElement.style.setProperty("--primary", hslValue);
      
      if (settings.secondaryColor) {
        const secondaryHsl = hexToHSL(settings.secondaryColor);
        document.documentElement.style.setProperty("--secondary", secondaryHsl);
      }
      
      setCssApplied(true);
    } else if (!isDemoMode && cssApplied) {
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--secondary");
      setCssApplied(false);
    }
  }, [settings?.primaryColor, settings?.secondaryColor, isDemoMode, cssApplied]);

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <WhiteLabelContext.Provider
      value={{
        settings,
        isLoading,
        isDemoMode,
        refetch: handleRefetch,
      }}
    >
      {children}
    </WhiteLabelContext.Provider>
  );
}

export function useWhiteLabel() {
  const context = useContext(WhiteLabelContext);
  if (!context) {
    throw new Error("useWhiteLabel must be used within a WhiteLabelProvider");
  }
  return context;
}
