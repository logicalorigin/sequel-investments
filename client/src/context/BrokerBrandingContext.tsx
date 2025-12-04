import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

type PublicBrokerBrandingData = {
  id: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  foregroundColor: string | null;
  mutedColor: string | null;
  fontFamily: string | null;
  footerText: string | null;
  privacyPolicyUrl: string | null;
  termsOfServiceUrl: string | null;
  isPublished: boolean;
  companyName: string;
  companySlug: string;
};

type BrokerBrandingContextType = {
  branding: PublicBrokerBrandingData | null;
  isLoading: boolean;
  brokerSlug: string | null;
  isWhiteLabel: boolean;
  error: Error | null;
};

const BrokerBrandingContext = createContext<BrokerBrandingContextType>({
  branding: null,
  isLoading: false,
  brokerSlug: null,
  isWhiteLabel: false,
  error: null,
});

export function useBrokerBranding() {
  return useContext(BrokerBrandingContext);
}

function getBrokerSlugFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const brokerParam = urlParams.get("broker");
  if (brokerParam) {
    return brokerParam;
  }

  const hostname = window.location.hostname;
  if (hostname.includes(".securedassetfunding.com")) {
    const subdomain = hostname.split(".")[0];
    if (subdomain && subdomain !== "www" && subdomain !== "app") {
      return subdomain;
    }
  }

  return null;
}

function clearBrandingStyles() {
  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--primary-foreground");
  root.style.removeProperty("--secondary");
  root.style.removeProperty("--accent");
  root.style.removeProperty("--background");
  root.style.removeProperty("--foreground");
  root.style.removeProperty("--muted");
  root.style.removeProperty("--font-family");
  document.body.style.fontFamily = "";
}

export function BrokerBrandingProvider({ children }: { children: React.ReactNode }) {
  const [brokerSlug, setBrokerSlug] = useState<string | null>(null);

  useEffect(() => {
    const slug = getBrokerSlugFromUrl();
    setBrokerSlug(slug);
  }, []);

  const { data: branding, isLoading, error } = useQuery<PublicBrokerBrandingData, Error>({
    queryKey: ["/api/broker/branding/public", brokerSlug],
    enabled: !!brokerSlug,
    retry: false,
    queryFn: async () => {
      const res = await fetch(`/api/broker/branding/public/${brokerSlug}`);
      if (!res.ok) {
        throw new Error("Failed to fetch branding");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (error) {
      clearBrandingStyles();
      return;
    }

    if (branding && branding.isPublished) {
      const root = document.documentElement;

      if (branding.primaryColor) {
        root.style.setProperty("--primary", branding.primaryColor);
        root.style.setProperty("--primary-foreground", "0 0% 100%");
      }
      if (branding.secondaryColor) {
        root.style.setProperty("--secondary", branding.secondaryColor);
      }
      if (branding.accentColor) {
        root.style.setProperty("--accent", branding.accentColor);
      }
      if (branding.backgroundColor) {
        root.style.setProperty("--background", branding.backgroundColor);
      }
      if (branding.foregroundColor) {
        root.style.setProperty("--foreground", branding.foregroundColor);
      }
      if (branding.mutedColor) {
        root.style.setProperty("--muted", branding.mutedColor);
      }
      if (branding.fontFamily) {
        root.style.setProperty("--font-family", branding.fontFamily);
        document.body.style.fontFamily = branding.fontFamily;
      }
      if (branding.faviconUrl) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
          favicon.href = branding.faviconUrl;
        }
      }

      return () => {
        clearBrandingStyles();
      };
    }

    return () => {
      clearBrandingStyles();
    };
  }, [branding, error]);

  const isWhiteLabel = !!brokerSlug && !!branding?.isPublished;

  return (
    <BrokerBrandingContext.Provider
      value={{
        branding: branding || null,
        isLoading,
        brokerSlug,
        isWhiteLabel,
        error: error || null,
      }}
    >
      {children}
    </BrokerBrandingContext.Provider>
  );
}
