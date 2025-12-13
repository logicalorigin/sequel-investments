import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Hammer, 
  HardHat, 
  Home, 
  DollarSign,
  TrendingUp 
} from "lucide-react";
import type { ProductComparisonSectionConfig } from "@shared/schema";

interface ProductComparisonSectionProps {
  config: ProductComparisonSectionConfig;
}

const ICON_MAP: Record<string, typeof Building2> = {
  Building2,
  Hammer,
  HardHat,
  Home,
  DollarSign,
  TrendingUp,
};

const DEFAULT_PRODUCTS = [
  {
    icon: "Building2",
    name: "DSCR Loan",
    description: "Long-term rental financing based on property cash flow",
    specs: [
      { label: "Loan Amount", value: "$75K - $3M" },
      { label: "Term", value: "30 Years" },
      { label: "LTV", value: "Up to 80%" },
    ],
    ctaText: "Get Quote",
    ctaLink: "/get-quote",
  },
  {
    icon: "Hammer",
    name: "Fix & Flip",
    description: "Short-term bridge financing for property renovations",
    specs: [
      { label: "Loan Amount", value: "$100K - $2M" },
      { label: "Term", value: "12-24 Months" },
      { label: "LTC", value: "Up to 90%" },
    ],
    ctaText: "Get Quote",
    ctaLink: "/get-quote",
  },
  {
    icon: "HardHat",
    name: "Construction",
    description: "Ground-up construction financing with draw schedules",
    specs: [
      { label: "Loan Amount", value: "$250K - $5M" },
      { label: "Term", value: "12-18 Months" },
      { label: "LTC", value: "Up to 85%" },
    ],
    ctaText: "Get Quote",
    ctaLink: "/get-quote",
  },
];

export function ProductComparisonSection({ config }: ProductComparisonSectionProps) {
  const title = config.title || "Compare Our Loan Products";
  const description = config.description;
  const products = config.products?.length ? config.products : DEFAULT_PRODUCTS;
  const showCTA = config.showCTA ?? true;

  return (
    <section className="py-12 sm:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 
            className="text-2xl sm:text-4xl font-bold mb-4"
            data-testid="text-product-comparison-title"
          >
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => {
            const IconComponent = ICON_MAP[product.icon || "Building2"] || Building2;
            
            return (
              <Card key={i} className="hover-elevate flex flex-col">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    {product.specs.map((spec, j) => (
                      <div key={j} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                        <span className="text-sm text-muted-foreground">{spec.label}</span>
                        <span className="font-semibold text-sm">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  {showCTA && product.ctaText && (
                    <Button 
                      className="w-full mt-6" 
                      variant="default"
                      asChild
                    >
                      <a href={product.ctaLink || "/get-quote"} data-testid={`button-product-cta-${i}`}>
                        {product.ctaText}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
