import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

type BrokerBranding = {
  id: string;
  brokerId: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  customCss: string | null;
  isPublished: boolean;
};

type BrokerInfo = {
  id: string;
  companyName: string;
  companySlug: string;
  phone: string | null;
  website: string | null;
  branding: BrokerBranding | null;
};

type BrokerBrandingContextType = {
  isWhiteLabel: boolean;
  brokerInfo: BrokerInfo | null;
  branding: BrokerBranding | null;
  isLoading: boolean;
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

const defaultBranding: BrokerBrandingContextType = {
  isWhiteLabel: false,
  brokerInfo: null,
  branding: null,
  isLoading: false,
  companyName: "Secured Asset Funding",
  logoUrl: null,
  primaryColor: "",
  secondaryColor: "",
  accentColor: "",
};

const BrokerBrandingContext = createContext<BrokerBrandingContextType>(defaultBranding);

function detectBrokerSlug(): string | null {
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  
  if (hostname.includes("securedassetfunding.com") && subdomain !== "www" && subdomain !== "securedassetfunding") {
    return subdomain;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const brokerSlug = urlParams.get("broker");
  if (brokerSlug) {
    return brokerSlug;
  }
  
  if (window.location.pathname.startsWith("/broker-portal/")) {
    const slug = window.location.pathname.split("/")[2];
    if (slug) return slug;
  }
  
  return null;
}

function hslToHslValue(color: string): string | null {
  if (!color) return null;
  
  if (color.startsWith("hsl(") || color.startsWith("hsla(")) {
    const match = color.match(/hsl[a]?\(([^)]+)\)/);
    if (match) {
      return match[1].trim();
    }
  }
  
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }
  
  return color;
}

export function BrokerBrandingProvider({ children }: { children: ReactNode }) {
  const [brokerSlug, setBrokerSlug] = useState<string | null>(null);

  useEffect(() => {
    const slug = detectBrokerSlug();
    setBrokerSlug(slug);
  }, []);

  const { data: brokerInfo, isLoading } = useQuery<BrokerInfo>({
    queryKey: ["/api/broker-portal", brokerSlug],
    queryFn: async () => {
      if (!brokerSlug) throw new Error("No broker slug provided");
      const encodedSlug = encodeURIComponent(brokerSlug);
      const res = await fetch(`/api/broker-portal/${encodedSlug}`);
      if (!res.ok) {
        throw new Error("Failed to fetch broker portal info");
      }
      return res.json();
    },
    enabled: !!brokerSlug,
  });

  useEffect(() => {
    if (!brokerInfo?.branding || !brokerInfo.branding.isPublished) {
      const root = document.documentElement;
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--accent");
      return;
    }

    const { branding } = brokerInfo;
    const root = document.documentElement;

    if (branding.primaryColor) {
      const hslValue = hslToHslValue(branding.primaryColor);
      if (hslValue) {
        root.style.setProperty("--primary", hslValue);
      }
    }

    if (branding.secondaryColor) {
      const hslValue = hslToHslValue(branding.secondaryColor);
      if (hslValue) {
        root.style.setProperty("--secondary", hslValue);
      }
    }

    if (branding.accentColor) {
      const hslValue = hslToHslValue(branding.accentColor);
      if (hslValue) {
        root.style.setProperty("--accent", hslValue);
      }
    }

    if (branding.customCss) {
      let styleEl = document.getElementById("broker-custom-css");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "broker-custom-css";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = branding.customCss;
    }

    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--accent");
      const styleEl = document.getElementById("broker-custom-css");
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, [brokerInfo]);

  const value: BrokerBrandingContextType = {
    isWhiteLabel: !!brokerInfo && !!brokerInfo.branding?.isPublished,
    brokerInfo: brokerInfo || null,
    branding: brokerInfo?.branding || null,
    isLoading,
    companyName: brokerInfo?.companyName || "Secured Asset Funding",
    logoUrl: brokerInfo?.branding?.logoUrl || null,
    primaryColor: brokerInfo?.branding?.primaryColor || "",
    secondaryColor: brokerInfo?.branding?.secondaryColor || "",
    accentColor: brokerInfo?.branding?.accentColor || "",
  };

  return (
    <BrokerBrandingContext.Provider value={value}>
      {children}
    </BrokerBrandingContext.Provider>
  );
}

export function useBrokerBranding() {
  const context = useContext(BrokerBrandingContext);
  if (!context) {
    throw new Error("useBrokerBranding must be used within a BrokerBrandingProvider");
  }
  return context;
}

export function WhiteLabelLogo({ className = "" }: { className?: string }) {
  const { isWhiteLabel, logoUrl, companyName } = useBrokerBranding();
  
  if (isWhiteLabel && logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={companyName} 
        className={className}
        data-testid="white-label-logo"
      />
    );
  }
  
  return null;
}

export function HiddenInWhiteLabel({ children }: { children: ReactNode }) {
  const { isWhiteLabel } = useBrokerBranding();
  
  if (isWhiteLabel) {
    return null;
  }
  
  return <>{children}</>;
}

export function ShownInWhiteLabel({ children }: { children: ReactNode }) {
  const { isWhiteLabel } = useBrokerBranding();
  
  if (!isWhiteLabel) {
    return null;
  }
  
  return <>{children}</>;
}
