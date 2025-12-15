
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductFeature {
  title: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

interface UpcrunchProductComparisonSectionProps {
  heading?: string;
  subheading?: string;
  products?: ProductFeature[];
}

const defaultProducts: ProductFeature[] = [
  {
    title: "DSCR Loans",
    features: [
      "Rates from 5.75%",
      "Up to 80% LTV",
      "No minimum DSCR",
      "30-year fixed terms",
      "Cash-out refinancing available",
    ],
    ctaText: "Learn More",
    ctaLink: "/dscr-loans",
  },
  {
    title: "Fix & Flip",
    features: [
      "12-month terms",
      "Up to 90% LTC",
      "65% of ARV",
      "Interest-only payments",
      "Fast closings (10-14 days)",
    ],
    ctaText: "Get Started",
    ctaLink: "/fix-flip",
  },
  {
    title: "New Construction",
    features: [
      "18-month terms",
      "Up to 85% LTC",
      "Ground-up construction",
      "Interest reserves available",
      "Draw management included",
    ],
    ctaText: "Learn More",
    ctaLink: "/new-construction",
  },
];

export default function UpcrunchProductComparisonSection({
  heading = "Our Loan Programs",
  subheading = "Flexible financing solutions for real estate investors",
  products = defaultProducts,
}: UpcrunchProductComparisonSectionProps) {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {heading}
          </h2>
          {subheading && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {subheading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card
              key={index}
              className="rounded-none border-border hover:shadow-md transition-shadow duration-300"
              data-testid={`card-product-${index}`}
            >
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {product.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {product.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#23D7FF] flex-shrink-0 mt-0.5" />
                      <span className="text-base text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href={product.ctaLink} className="block">
                  <Button
                    className="w-full rounded-[100px] bg-[#23D7FF] hover:bg-[#23D7FF]/90 text-white font-semibold py-3 px-8 transition-opacity duration-200"
                    data-testid={`button-product-${index}`}
                  >
                    {product.ctaText}
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
