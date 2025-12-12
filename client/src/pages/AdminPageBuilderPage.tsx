import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  GripVertical,
  Eye,
  EyeOff,
  Settings2,
  RotateCcw,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2,
  LayoutTemplate,
  X,
} from "lucide-react";
import type {
  PageLayout,
  PageSection,
  HeroSectionConfig,
  TrustIndicatorsSectionConfig,
  LoanProductsSectionConfig,
  TestimonialsSectionConfig,
  FAQSectionConfig,
  FeatureHighlightsSectionConfig,
  CTABannerSectionConfig,
} from "@shared/schema";

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

const PAGE_LABELS: Record<string, string> = {
  home: "Home Page",
  dscr: "DSCR Loan Page",
  fix_flip: "Fix & Flip Page",
  construction: "Construction Page",
  about: "About Page",
  contact: "Contact Page",
  resources: "Resources Page",
};

function HeroConfigPanel({ config, onChange }: { config: HeroSectionConfig; onChange: (config: HeroSectionConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Variant</Label>
        <Select value={config.variant || "carousel"} onValueChange={(v) => onChange({ ...config, variant: v as HeroSectionConfig["variant"] })}>
          <SelectTrigger data-testid="select-hero-variant">
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
          data-testid="input-hero-headline"
        />
      </div>
      <div className="space-y-2">
        <Label>Subheadline</Label>
        <Textarea
          value={config.subheadline || ""}
          onChange={(e) => onChange({ ...config, subheadline: e.target.value })}
          placeholder="Enter subheadline"
          data-testid="input-hero-subheadline"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>CTA Text</Label>
          <Input
            value={config.ctaText || ""}
            onChange={(e) => onChange({ ...config, ctaText: e.target.value })}
            placeholder="Button text"
            data-testid="input-hero-cta-text"
          />
        </div>
        <div className="space-y-2">
          <Label>CTA Link</Label>
          <Input
            value={config.ctaLink || ""}
            onChange={(e) => onChange({ ...config, ctaLink: e.target.value })}
            placeholder="/get-quote"
            data-testid="input-hero-cta-link"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={config.showFundedDeals ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showFundedDeals: checked })}
          data-testid="switch-hero-funded-deals"
        />
        <Label>Show Recently Funded Card</Label>
      </div>
    </div>
  );
}

function TrustIndicatorsConfigPanel({ config, onChange }: { config: TrustIndicatorsSectionConfig; onChange: (config: TrustIndicatorsSectionConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={config.showYearsInBusiness ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showYearsInBusiness: checked })}
            data-testid="switch-trust-years"
          />
          <Label>Years in Business</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.showTotalFunded ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showTotalFunded: checked })}
            data-testid="switch-trust-funded"
          />
          <Label>Total Funded</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.showStatesServed ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showStatesServed: checked })}
            data-testid="switch-trust-states"
          />
          <Label>States Served</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.showActiveLoans ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showActiveLoans: checked })}
            data-testid="switch-trust-loans"
          />
          <Label>Active Loans</Label>
        </div>
      </div>
    </div>
  );
}

function LoanProductsConfigPanel({ config, onChange }: { config: LoanProductsSectionConfig; onChange: (config: LoanProductsSectionConfig) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={config.customTitle || ""}
          onChange={(e) => onChange({ ...config, customTitle: e.target.value })}
          placeholder="Loan Programs"
          data-testid="input-products-title"
        />
      </div>
      <div className="space-y-2">
        <Label>Card Style</Label>
        <Select value={config.cardStyle || "default"} onValueChange={(v) => onChange({ ...config, cardStyle: v as LoanProductsSectionConfig["cardStyle"] })}>
          <SelectTrigger data-testid="select-products-style">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={config.showDSCR ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showDSCR: checked })}
            data-testid="switch-products-dscr"
          />
          <Label>DSCR</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.showFixFlip ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showFixFlip: checked })}
            data-testid="switch-products-fixflip"
          />
          <Label>Fix & Flip</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.showConstruction ?? true}
            onCheckedChange={(checked) => onChange({ ...config, showConstruction: checked })}
            data-testid="switch-products-construction"
          />
          <Label>Construction</Label>
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
          <SelectTrigger data-testid="select-testimonials-layout">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={config.showRatings ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showRatings: checked })}
          data-testid="switch-testimonials-ratings"
        />
        <Label>Show Star Ratings</Label>
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
          data-testid="input-faq-title"
        />
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={config.layout || "accordion"} onValueChange={(v) => onChange({ ...config, layout: v as FAQSectionConfig["layout"] })}>
          <SelectTrigger data-testid="select-faq-layout">
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
          data-testid="input-features-title"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Layout</Label>
          <Select value={config.layout || "grid"} onValueChange={(v) => onChange({ ...config, layout: v as FeatureHighlightsSectionConfig["layout"] })}>
            <SelectTrigger data-testid="select-features-layout">
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
            <SelectTrigger data-testid="select-features-columns">
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
          data-testid="input-cta-headline"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={config.description || ""}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          placeholder="Enter description"
          data-testid="input-cta-description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={config.ctaText || ""}
            onChange={(e) => onChange({ ...config, ctaText: e.target.value })}
            placeholder="Get Your Quote"
            data-testid="input-cta-button-text"
          />
        </div>
        <div className="space-y-2">
          <Label>Button Link</Label>
          <Input
            value={config.ctaLink || ""}
            onChange={(e) => onChange({ ...config, ctaLink: e.target.value })}
            placeholder="/get-quote"
            data-testid="input-cta-button-link"
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
          Configuration not yet available for this section type.
        </div>
      );
  }
}

interface SectionItemProps {
  section: PageSection;
  index: number;
  totalSections: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onConfigChange: (config: PageSection["config"]) => void;
}

function SectionItem({
  section,
  index,
  totalSections,
  isExpanded,
  onToggleExpand,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onConfigChange,
}: SectionItemProps) {
  return (
    <Card className={`transition-all ${!section.isVisible ? "opacity-60" : ""}`} data-testid={`section-item-${section.id}`}>
      <div className="flex items-center gap-2 p-3 border-b">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{section.title || SECTION_TYPE_LABELS[section.type]}</span>
            <Badge variant="secondary" className="text-xs shrink-0">
              {SECTION_TYPE_LABELS[section.type]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
            data-testid={`button-move-up-${section.id}`}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={index === totalSections - 1}
            data-testid={`button-move-down-${section.id}`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleVisibility}
            data-testid={`button-visibility-${section.id}`}
          >
            {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            data-testid={`button-config-${section.id}`}
          >
            <Settings2 className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <CardContent className="pt-4">
          <SectionConfigPanel section={section} onChange={onConfigChange} />
        </CardContent>
      )}
    </Card>
  );
}

export default function AdminPageBuilderPage() {
  const { toast } = useToast();
  const [selectedPageId, setSelectedPageId] = useState<string>("home");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [localSections, setLocalSections] = useState<PageSection[] | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: layout, isLoading } = useQuery<PageLayout>({
    queryKey: ["/api/page-layouts", selectedPageId],
  });

  const sections = localSections ?? layout?.sections ?? [];

  const updateLayoutMutation = useMutation({
    mutationFn: async (sections: PageSection[]) => {
      return apiRequest("PUT", `/api/admin/page-layouts/${selectedPageId}`, { sections });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/page-layouts", selectedPageId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-layouts"] });
      setLocalSections(null);
      setHasChanges(false);
      toast({
        title: "Layout saved",
        description: "Your page layout has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving layout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetLayoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/admin/page-layouts/${selectedPageId}/reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/page-layouts", selectedPageId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-layouts"] });
      setLocalSections(null);
      setHasChanges(false);
      toast({
        title: "Layout reset",
        description: "The page layout has been reset to defaults.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error resetting layout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSection = useCallback((sectionId: string, updates: Partial<PageSection>) => {
    setLocalSections((prev) => {
      const current = prev ?? layout?.sections ?? [];
      return current.map((s) => (s.id === sectionId ? { ...s, ...updates } : s));
    });
    setHasChanges(true);
  }, [layout?.sections]);

  const moveSectionUp = useCallback((index: number) => {
    if (index <= 0) return;
    setLocalSections((prev) => {
      const current = [...(prev ?? layout?.sections ?? [])];
      const temp = current[index].order;
      current[index].order = current[index - 1].order;
      current[index - 1].order = temp;
      [current[index], current[index - 1]] = [current[index - 1], current[index]];
      return current;
    });
    setHasChanges(true);
  }, [layout?.sections]);

  const moveSectionDown = useCallback((index: number) => {
    setLocalSections((prev) => {
      const current = [...(prev ?? layout?.sections ?? [])];
      if (index >= current.length - 1) return prev;
      const temp = current[index].order;
      current[index].order = current[index + 1].order;
      current[index + 1].order = temp;
      [current[index], current[index + 1]] = [current[index + 1], current[index]];
      return current;
    });
    setHasChanges(true);
  }, [layout?.sections]);

  const handlePageChange = (pageId: string) => {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to switch pages?")) {
        return;
      }
    }
    setSelectedPageId(pageId);
    setLocalSections(null);
    setHasChanges(false);
    setExpandedSection(null);
  };

  const handleSave = () => {
    if (sections.length > 0) {
      // Normalize order values to be sequential before saving
      const normalizedSections = sortedSections.map((s, idx) => ({
        ...s,
        order: idx,
      }));
      updateLayoutMutation.mutate(normalizedSections);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset this page to its default layout? This cannot be undone.")) {
      resetLayoutMutation.mutate();
    }
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="page-title">
            <LayoutTemplate className="h-6 w-6" />
            Page Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize the layout and content of your website pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetLayoutMutation.isPending}
            data-testid="button-reset-layout"
          >
            {resetLayoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Reset to Default
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateLayoutMutation.isPending}
            data-testid="button-save-layout"
          >
            {updateLayoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={selectedPageId} onValueChange={handlePageChange}>
        <TabsList className="mb-6" data-testid="page-tabs">
          {Object.entries(PAGE_LABELS).map(([id, label]) => (
            <TabsTrigger key={id} value={id} data-testid={`tab-${id}`}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(PAGE_LABELS).map((pageId) => (
          <TabsContent key={pageId} value={pageId} className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Page Sections</CardTitle>
                        {hasChanges && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            Unsaved changes
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[calc(100vh-320px)]">
                        <div className="space-y-3 pr-4">
                          {sortedSections.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <LayoutTemplate className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No sections configured for this page.</p>
                              <p className="text-sm">Click "Reset to Default" to load the default layout.</p>
                            </div>
                          ) : (
                            sortedSections.map((section, index) => (
                              <SectionItem
                                key={section.id}
                                section={section}
                                index={index}
                                totalSections={sortedSections.length}
                                isExpanded={expandedSection === section.id}
                                onToggleExpand={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                                onToggleVisibility={() => updateSection(section.id, { isVisible: !section.isVisible })}
                                onMoveUp={() => moveSectionUp(index)}
                                onMoveDown={() => moveSectionDown(index)}
                                onConfigChange={(config) => updateSection(section.id, { config })}
                              />
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preview Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Page</div>
                        <div className="font-medium">{PAGE_LABELS[selectedPageId]}</div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Sections</div>
                        <div className="font-medium">{sections.length}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Visible Sections</div>
                        <div className="font-medium">{sections.filter((s) => s.isVisible).length}</div>
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        Changes are saved to the database and will be reflected on the live site immediately after saving.
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setLocalSections((prev) => {
                            const current = prev ?? layout?.sections ?? [];
                            return current.map((s) => ({ ...s, isVisible: true }));
                          });
                          setHasChanges(true);
                        }}
                        data-testid="button-show-all"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Show All Sections
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setLocalSections((prev) => {
                            const current = prev ?? layout?.sections ?? [];
                            return current.map((s) => ({ ...s, isVisible: false }));
                          });
                          setHasChanges(true);
                        }}
                        data-testid="button-hide-all"
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide All Sections
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setExpandedSection(null)}
                        data-testid="button-collapse-all"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Collapse All Panels
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
