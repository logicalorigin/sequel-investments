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
  accentColor: "#f59e0b",
  backgroundColor: "#0a0a0a",
  foregroundColor: "#fafafa",
  mutedColor: "#171717",
  cardColor: "#1f1f1f",
  fontFamily: "Inter",
  headingWeight: "600",
  borderRadius: "0.5rem",
  contactPhone: "302.388.8860",
  contactEmail: "josh@fundwithsequel.com",
  contactAddress: "800 5th Avenue, Suite 4100, Miami Beach, FL 33139",
  footerText: null,
  isActive: false,
  isDemoMode: false,
  buttonStyle: "rounded",
  themePreference: "dark",
  heroStyle: "gradient",
  heroImageUrl: null,
  heroPatternType: null,
  heroOverlayOpacity: 80,
  favicon: null,
  socialFacebook: null,
  socialTwitter: null,
  socialLinkedin: null,
  socialInstagram: null,
  socialYoutube: null,
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

function getButtonBorderRadius(buttonStyle: string | null | undefined): string {
  switch (buttonStyle) {
    case "square":
      return "0";
    case "pill":
      return "9999px";
    case "rounded":
    default:
      return "0.375rem";
  }
}

// Calculate relative luminance of a hex color to determine if it's light or dark
// Uses the WCAG formula for relative luminance
function getRelativeLuminance(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 0.5;

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  // Convert to linear RGB
  const linearR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const linearG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const linearB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
}

// Returns appropriate foreground color (HSL format) based on background color luminance
function getContrastingForeground(hex: string): string {
  const luminance = getRelativeLuminance(hex);
  // If luminance > 0.5, background is light, use dark text; otherwise use light text
  return luminance > 0.5 ? "0 0% 10%" : "0 0% 100%";
}

function loadGoogleFont(fontFamily: string): void {
  const fontId = `google-font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
  
  if (document.getElementById(fontId)) {
    return;
  }
  
  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

function updateFavicon(faviconUrl: string | null | undefined): void {
  const existingFavicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  
  if (faviconUrl) {
    if (existingFavicon) {
      existingFavicon.href = faviconUrl;
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = faviconUrl;
      document.head.appendChild(link);
    }
  } else if (existingFavicon) {
    existingFavicon.href = "/favicon.png";
  }
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
  const isWhiteLabelActive = settings?.isActive || isDemoMode;

  useEffect(() => {
    const root = document.documentElement;
    
    if (isWhiteLabelActive && settings) {
      root.setAttribute("data-white-label", "true");
      
      if (settings.primaryColor) {
        root.style.setProperty("--wl-primary", hexToHSL(settings.primaryColor));
        root.style.setProperty("--wl-primary-foreground", getContrastingForeground(settings.primaryColor));
      }
      if (settings.secondaryColor) {
        root.style.setProperty("--wl-secondary", hexToHSL(settings.secondaryColor));
      }
      if (settings.accentColor) {
        root.style.setProperty("--wl-accent", hexToHSL(settings.accentColor));
      }
      if (settings.backgroundColor) {
        root.style.setProperty("--wl-background", hexToHSL(settings.backgroundColor));
      }
      if (settings.foregroundColor) {
        root.style.setProperty("--wl-foreground", hexToHSL(settings.foregroundColor));
      }
      if (settings.mutedColor) {
        root.style.setProperty("--wl-muted", hexToHSL(settings.mutedColor));
      }
      if (settings.cardColor) {
        root.style.setProperty("--wl-card", hexToHSL(settings.cardColor));
      }
      if (settings.fontFamily) {
        loadGoogleFont(settings.fontFamily);
        root.style.setProperty("--wl-font-family", `"${settings.fontFamily}", sans-serif`);
      }
      if (settings.headingWeight) {
        root.style.setProperty("--wl-heading-weight", settings.headingWeight);
      }
      if (settings.borderRadius) {
        root.style.setProperty("--wl-radius", settings.borderRadius);
      }
      
      root.style.setProperty("--wl-button-radius", getButtonBorderRadius(settings.buttonStyle));
      
      if (settings.heroOverlayOpacity !== undefined && settings.heroOverlayOpacity !== null) {
        root.style.setProperty("--wl-hero-overlay-opacity", String(settings.heroOverlayOpacity / 100));
      }
      
      // Apply theme preference (light/dark mode)
      if (settings.themePreference === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
      
      updateFavicon(settings.favicon);
      
      setCssApplied(true);
    } else if (!isWhiteLabelActive && cssApplied) {
      root.removeAttribute("data-white-label");
      root.style.removeProperty("--wl-primary");
      root.style.removeProperty("--wl-primary-foreground");
      root.style.removeProperty("--wl-secondary");
      root.style.removeProperty("--wl-accent");
      root.style.removeProperty("--wl-background");
      root.style.removeProperty("--wl-foreground");
      root.style.removeProperty("--wl-muted");
      root.style.removeProperty("--wl-card");
      root.style.removeProperty("--wl-font-family");
      root.style.removeProperty("--wl-heading-weight");
      root.style.removeProperty("--wl-radius");
      root.style.removeProperty("--wl-button-radius");
      root.style.removeProperty("--wl-hero-overlay-opacity");
      
      updateFavicon(null);
      
      setCssApplied(false);
    }
  }, [settings, isWhiteLabelActive, cssApplied]);

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
