import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings2, X, Eye, EyeOff, Trash2 } from "lucide-react";
import type {
  PageSection,
  HeroSectionConfig,
  TrustIndicatorsSectionConfig,
  LoanProductsSectionConfig,
  TestimonialsSectionConfig,
  FAQSectionConfig,
  FeatureHighlightsSectionConfig,
  CTABannerSectionConfig,
} from "@shared/schema";
import { useEditorStore } from "@/stores/editorStore";
import { useCallback, useMemo } from "react";

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: "Hero Section",
  trust_indicators: "Trust Indicators",
  loan_products: "Loan Products",
  testimonials: "Testimonials",
  faq: "FAQ",
  lead_form: "Lead Form",
  recently_funded: "Recently Funded",
  state_map: "State Map",
  feature_highlights: "Feature Highlights",
  cta_banner: "CTA Banner",
  custom_content: "Custom Content",
  stats_bar: "Stats Bar",
};

function HeroConfigPanel({ config, onChange }: { config: HeroSectionConfig; onChange: (config: HeroSectionConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Variant</Label>
        <Select value={config.variant || "carousel"} onValueChange={(v) => onChange({ ...config, variant: v as HeroSectionConfig["variant"] })}>
          <SelectTrigger data-testid="inspector-select-hero-variant">
            <SelectValue placeholder="Select variant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="static">Static</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="split">Split</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={config.headline || ""}
          onChange={(e) => onChange({ ...config, headline: e.target.value })}
          placeholder="Enter headline"
          data-testid="inspector-input-hero-headline"
        />
      </div>
      <div className="space-y-2">
        <Label>Subheadline</Label>
        <Textarea
          value={config.subheadline || ""}
          onChange={(e) => onChange({ ...config, subheadline: e.target.value })}
          placeholder="Enter subheadline"
          data-testid="inspector-input-hero-subheadline"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>CTA Text</Label>
          <Input
            value={config.ctaText || ""}
            onChange={(e) => onChange({ ...config, ctaText: e.target.value })}
            placeholder="Button text"
            data-testid="inspector-input-hero-cta-text"
          />
        </div>
        <div className="space-y-2">
          <Label>CTA Link</Label>
          <Input
            value={config.ctaLink || ""}
            onChange={(e) => onChange({ ...config, ctaLink: e.target.value })}
            placeholder="/get-quote"
            data-testid="inspector-input-hero-cta-link"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={config.showFundedDeals ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showFundedDeals: checked })}
          data-testid="inspector-switch-hero-funded"
        />
        <Label className="text-sm">Show Recently Funded Card</Label>
      </div>
    </div>
  );
}

function TrustIndicatorsConfigPanel({ config, onChange }: { config: TrustIndicatorsSectionConfig; onChange: (config: TrustIndicatorsSectionConfig) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Years in Business</Label>
        <Switch
          checked={config.showYearsInBusiness ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showYearsInBusiness: checked })}
          data-testid="inspector-switch-trust-years"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">Total Funded</Label>
        <Switch
          checked={config.showTotalFunded ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showTotalFunded: checked })}
          data-testid="inspector-switch-trust-funded"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">States Served</Label>
        <Switch
          checked={config.showStatesServed ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showStatesServed: checked })}
          data-testid="inspector-switch-trust-states"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">Active Loans</Label>
        <Switch
          checked={config.showActiveLoans ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showActiveLoans: checked })}
          data-testid="inspector-switch-trust-loans"
        />
      </div>
    </div>
  );
}

function LoanProductsConfigPanel({ config, onChange }: { config: LoanProductsSectionConfig; onChange: (config: LoanProductsSectionConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={config.customTitle || ""}
          onChange={(e) => onChange({ ...config, customTitle: e.target.value })}
          placeholder="Loan Programs"
          data-testid="inspector-input-products-title"
        />
      </div>
      <div className="space-y-2">
        <Label>Card Style</Label>
        <Select value={config.cardStyle || "default"} onValueChange={(v) => onChange({ ...config, cardStyle: v as LoanProductsSectionConfig["cardStyle"] })}>
          <SelectTrigger data-testid="inspector-select-products-style">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label className="text-sm font-medium">Show Products</Label>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-normal">DSCR</Label>
          <Switch
            checked={config.showDSCR ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showDSCR: checked })}
            data-testid="inspector-switch-products-dscr"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-normal">Fix & Flip</Label>
          <Switch
            checked={config.showFixFlip ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showFixFlip: checked })}
            data-testid="inspector-switch-products-fixflip"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-normal">Construction</Label>
          <Switch
            checked={config.showConstruction ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showConstruction: checked })}
            data-testid="inspector-switch-products-construction"
          />
        </div>
      </div>
    </div>
  );
}

function TestimonialsConfigPanel({ config, onChange }: { config: TestimonialsSectionConfig; onChange: (config: TestimonialsSectionConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={config.layout || "carousel"} onValueChange={(v) => onChange({ ...config, layout: v as TestimonialsSectionConfig["layout"] })}>
          <SelectTrigger data-testid="inspector-select-testimonials-layout">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">Show Star Ratings</Label>
        <Switch
          checked={config.showRatings ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showRatings: checked })}
          data-testid="inspector-switch-testimonials-ratings"
        />
      </div>
    </div>
  );
}

function FAQConfigPanel({ config, onChange }: { config: FAQSectionConfig; onChange: (config: FAQSectionConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={config.title || ""}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Frequently Asked Questions"
          data-testid="inspector-input-faq-title"
        />
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={config.layout || "accordion"} onValueChange={(v) => onChange({ ...config, layout: v as FAQSectionConfig["layout"] })}>
          <SelectTrigger data-testid="inspector-select-faq-layout">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accordion">Accordion</SelectItem>
            <SelectItem value="two-column">Two Column</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function FeatureHighlightsConfigPanel({ config, onChange }: { config: FeatureHighlightsSectionConfig; onChange: (config: FeatureHighlightsSectionConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={config.title || ""}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Why Choose Us"
          data-testid="inspector-input-features-title"
        />
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={config.layout || "grid"} onValueChange={(v) => onChange({ ...config, layout: v as FeatureHighlightsSectionConfig["layout"] })}>
          <SelectTrigger data-testid="inspector-select-features-layout">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
            <SelectItem value="cards">Cards</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Columns</Label>
        <Select value={String(config.columns || 3)} onValueChange={(v) => onChange({ ...config, columns: Number(v) as 2 | 3 | 4 })}>
          <SelectTrigger data-testid="inspector-select-features-columns">
            <SelectValue placeholder="Columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function CTABannerConfigPanel({ config, onChange }: { config: CTABannerSectionConfig; onChange: (config: CTABannerSectionConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={config.headline || ""}
          onChange={(e) => onChange({ ...config, headline: e.target.value })}
          placeholder="Ready to Get Started?"
          data-testid="inspector-input-cta-headline"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={config.description || ""}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          placeholder="Enter description"
          data-testid="inspector-input-cta-description"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={config.ctaText || ""}
            onChange={(e) => onChange({ ...config, ctaText: e.target.value })}
            placeholder="Get Your Quote"
            data-testid="inspector-input-cta-button-text"
          />
        </div>
        <div className="space-y-2">
          <Label>Button Link</Label>
          <Input
            value={config.ctaLink || ""}
            onChange={(e) => onChange({ ...config, ctaLink: e.target.value })}
            placeholder="/get-quote"
            data-testid="inspector-input-cta-button-link"
          />
        </div>
      </div>
    </div>
  );
}

function SectionConfigPanel({ section, onChange }: { section: PageSection; onChange: (config: PageSection["config"]) => void }) {
  switch (section.type) {
    case "hero":
      return <HeroConfigPanel config={section.config as HeroSectionConfig} onChange={onChange} />;
    case "trust_indicators":
      return <TrustIndicatorsConfigPanel config={section.config as TrustIndicatorsSectionConfig} onChange={onChange} />;
    case "loan_products":
      return <LoanProductsConfigPanel config={section.config as LoanProductsSectionConfig} onChange={onChange} />;
    case "testimonials":
      return <TestimonialsConfigPanel config={section.config as TestimonialsSectionConfig} onChange={onChange} />;
    case "faq":
      return <FAQConfigPanel config={section.config as FAQSectionConfig} onChange={onChange} />;
    case "feature_highlights":
      return <FeatureHighlightsConfigPanel config={section.config as FeatureHighlightsSectionConfig} onChange={onChange} />;
    case "cta_banner":
      return <CTABannerConfigPanel config={section.config as CTABannerSectionConfig} onChange={onChange} />;
    default:
      return (
        <div className="text-sm text-muted-foreground italic py-4">
          Configuration not available for this section type.
        </div>
      );
  }
}

interface PropertyInspectorProps {
  className?: string;
}

export function PropertyInspector({ className }: PropertyInspectorProps) {
  const {
    draftSections,
    selectedSectionId,
    selectSection,
    updateSection,
    updateSectionConfig,
    toggleSectionVisibility,
    removeSection,
  } = useEditorStore();

  const selectedSection = useMemo(
    () => draftSections.find((s) => s.id === selectedSectionId),
    [draftSections, selectedSectionId]
  );

  const handleConfigChange = useCallback(
    (config: PageSection["config"]) => {
      if (selectedSectionId) {
        updateSectionConfig(selectedSectionId, config);
      }
    },
    [selectedSectionId, updateSectionConfig]
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      if (selectedSectionId) {
        updateSection(selectedSectionId, { title });
      }
    },
    [selectedSectionId, updateSection]
  );

  if (!selectedSection) {
    return (
      <div className={`flex flex-col h-full bg-background border-l ${className}`}>
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <Settings2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Select a section to edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-background border-l ${className}`}>
      <div className="p-3 border-b flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Properties</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => selectSection(null)}
          data-testid="button-close-inspector"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="text-xs">
                {SECTION_TYPE_LABELS[selectedSection.type]}
              </Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => toggleSectionVisibility(selectedSection.id)}
                  data-testid="inspector-button-toggle-visibility"
                >
                  {selectedSection.isVisible ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => {
                    removeSection(selectedSection.id);
                    selectSection(null);
                  }}
                  data-testid="inspector-button-remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={selectedSection.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={SECTION_TYPE_LABELS[selectedSection.type]}
                data-testid="inspector-input-section-title"
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium mb-3 block">Configuration</Label>
            <SectionConfigPanel
              section={selectedSection}
              onChange={handleConfigChange}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
