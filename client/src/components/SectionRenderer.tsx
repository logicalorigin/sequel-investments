import { 
  PageSection, 
  HeroSectionConfig,
  TrustIndicatorsSectionConfig,
  LoanProductsSectionConfig,
  TestimonialsSectionConfig,
  FAQSectionConfig,
  FeatureHighlightsSectionConfig,
  CTABannerSectionConfig,
} from "@shared/schema";
import {
  HeroSection,
  TrustIndicatorsSection,
  LoanProductsSection,
  TestimonialsSection,
  FAQSection,
  FeatureHighlightsSection,
  CTABannerSection,
} from "@/components/sections";

interface SectionRendererProps {
  sections: PageSection[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  const sortedSections = [...sections]
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedSections.map((section) => (
        <RenderSection key={section.id} section={section} />
      ))}
    </>
  );
}

interface RenderSectionProps {
  section: PageSection;
}

function RenderSection({ section }: RenderSectionProps) {
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
    case "recently_funded":
    case "state_map":
    case "custom_content":
    case "stats_bar":
      return (
        <div className="py-16 text-center text-muted-foreground" data-testid={`section-placeholder-${section.type}`}>
          <p className="text-sm">Section type "{section.type}" coming soon</p>
        </div>
      );
    
    default:
      return null;
  }
}

export default SectionRenderer;
