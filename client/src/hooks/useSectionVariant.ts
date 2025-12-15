import { sectionVariantRegistry, getVariantStyles, type VariantStyles } from "@shared/sectionVariants";
import type { SectionStyleVariant, VariantSectionType, SectionStyleVariantsConfig } from "@shared/schema";

const DEFAULT_VARIANT: SectionStyleVariant = "variantA";

const DEFAULT_CONFIG: SectionStyleVariantsConfig = {
  hero: "variantC",
  feature_highlights: "variantC",
  testimonials: "variantC",
  cta_banner: "variantC",
  stats_bar: "variantA",
  trust_indicators: "variantC",
  process_steps: "variantC",
  faq: "variantC",
  loan_products: "variantC",
  product_comparison: "variantC",
};

export function useSectionVariant(
  sectionType: VariantSectionType,
  overrideVariant?: SectionStyleVariant,
  variantsConfig?: SectionStyleVariantsConfig | null
): VariantStyles {
  const activeConfig = variantsConfig || DEFAULT_CONFIG;
  const variant = overrideVariant || activeConfig[sectionType] || DEFAULT_VARIANT;
  
  const definition = getVariantStyles(sectionType, variant);
  
  if (definition) {
    return definition.styles;
  }
  
  const fallback = getVariantStyles(sectionType, DEFAULT_VARIANT);
  if (fallback) {
    return fallback.styles;
  }
  
  return {
    layout: "",
    spacing: "py-16 md:py-24",
    typography: {
      headline: "text-3xl md:text-4xl font-bold",
      body: "text-base text-muted-foreground",
    },
    background: "bg-background",
  };
}

export function getSectionVariantDefinition(
  sectionType: VariantSectionType,
  variant: SectionStyleVariant
) {
  return getVariantStyles(sectionType, variant);
}

export function getAllVariantsForSection(sectionType: VariantSectionType) {
  return sectionVariantRegistry[sectionType];
}

export type { VariantStyles, SectionStyleVariant, VariantSectionType };
