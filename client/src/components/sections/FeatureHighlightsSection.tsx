import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  Shield, 
  Users, 
  Zap, 
  CheckCircle2, 
  DollarSign,
  Target,
  Headphones,
  TrendingUp,
  Home,
  Building2
} from "lucide-react";
import type { FeatureHighlightsSectionConfig } from "@shared/schema";

interface FeatureHighlightsSectionProps {
  config: FeatureHighlightsSectionConfig;
}

const ICON_MAP: Record<string, typeof Clock> = {
  Clock,
  Shield,
  Users,
  Zap,
  CheckCircle2,
  DollarSign,
  Target,
  Headphones,
  TrendingUp,
  Home,
  Building2,
};

const DEFAULT_FEATURES = [
  { icon: "Clock", title: "Fast Closings", description: "Close in as few as 5 days with our streamlined process" },
  { icon: "Shield", title: "No Prepayment Penalty", description: "Pay off early with no fees or penalties" },
  { icon: "Users", title: "Dedicated Support", description: "Personal loan specialist assigned to your deal" },
  { icon: "DollarSign", title: "Competitive Rates", description: "Industry-leading rates starting at 5.75%" },
  { icon: "Zap", title: "Same-Day Approvals", description: "Quick decisions to keep your deals moving" },
  { icon: "Target", title: "Flexible Terms", description: "Customized loan structures for your needs" },
];

export function FeatureHighlightsSection({ config }: FeatureHighlightsSectionProps) {
  const title = config.title || "Why Investors Choose Us";
  const features = config.features?.length ? config.features : DEFAULT_FEATURES;
  const columns = config.columns || 3;
  const layout = config.layout || "grid";

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 
          className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12"
          data-testid="text-features-title"
        >
          {title}
        </h2>
        
        {layout === "grid" || layout === "cards" ? (
          <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
            {features.map((feature, i) => {
              const IconComponent = ICON_MAP[feature.icon || "CheckCircle2"] || CheckCircle2;
              return (
                <Card key={i} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {features.map((feature, i) => {
              const IconComponent = ICON_MAP[feature.icon || "CheckCircle2"] || CheckCircle2;
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
