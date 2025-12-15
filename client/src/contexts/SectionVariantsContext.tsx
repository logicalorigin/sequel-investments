import { createContext, useContext, type ReactNode } from "react";
import type { SectionStyleVariantsConfig } from "@shared/schema";

interface SectionVariantsContextValue {
  variantsConfig: SectionStyleVariantsConfig | null;
}

const SectionVariantsContext = createContext<SectionVariantsContextValue>({
  variantsConfig: null,
});

interface SectionVariantsProviderProps {
  variantsConfig: SectionStyleVariantsConfig | null;
  children: ReactNode;
}

export function SectionVariantsProvider({ variantsConfig, children }: SectionVariantsProviderProps) {
  return (
    <SectionVariantsContext.Provider value={{ variantsConfig }}>
      {children}
    </SectionVariantsContext.Provider>
  );
}

export function useSectionVariantsConfig(): SectionStyleVariantsConfig | null {
  const context = useContext(SectionVariantsContext);
  return context.variantsConfig;
}
