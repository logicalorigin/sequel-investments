import type {
  PageSection,
  HeroSectionConfig,
  TrustIndicatorsSectionConfig,
  LoanProductsSectionConfig,
  TestimonialsSectionConfig,
  FAQSectionConfig,
  FeatureHighlightsSectionConfig,
  CTABannerSectionConfig,
  LeadFormSectionConfig,
  RecentlyFundedSectionConfig,
  StateMapSectionConfig,
  CustomContentSectionConfig,
  StatsBarSectionConfig,
} from "@shared/schema";
import {
  HeroSection,
  TrustIndicatorsSection,
  LoanProductsSection,
  TestimonialsSection,
  FAQSection,
  FeatureHighlightsSection,
  CTABannerSection,
  LeadFormSection,
  RecentlyFundedSection,
  StateMapSection,
  CustomContentSection,
  StatsBarSection,
} from "@/components/sections";

interface RenderSectionContentProps {
  section: PageSection;
}

export function RenderSectionContent({ section }: RenderSectionContentProps) {
  switch (section.type) {
    case "hero":
      return <HeroSection config={section.config as HeroSectionConfig} />;

    case "trust_indicators":
      return <TrustIndicatorsSection config={section.config as TrustIndicatorsSectionConfig} />;

    case "loan_products":
      return <LoanProductsSection config={section.config as LoanProductsSectionConfig} />;

    case "testimonials":
      return <TestimonialsSection config={section.config as TestimonialsSectionConfig} />;

    case "faq":
      return <FAQSection config={section.config as FAQSectionConfig} />;

    case "feature_highlights":
      return <FeatureHighlightsSection config={section.config as FeatureHighlightsSectionConfig} />;

    case "cta_banner":
      return <CTABannerSection config={section.config as CTABannerSectionConfig} />;

    case "lead_form":
      return <LeadFormSection config={section.config as LeadFormSectionConfig} />;

    case "recently_funded":
      return <RecentlyFundedSection config={section.config as RecentlyFundedSectionConfig} />;

    case "state_map":
      return <StateMapSection config={section.config as StateMapSectionConfig} />;

    case "custom_content":
      return <CustomContentSection config={section.config as CustomContentSectionConfig} />;

    case "stats_bar":
      return <StatsBarSection config={section.config as StatsBarSectionConfig} />;

    default:
      return (
        <div className="py-16 text-center text-muted-foreground" data-testid={`section-placeholder-${section.type}`}>
          <p className="text-sm">Unknown section type: "{section.type}"</p>
        </div>
      );
  }
}
