import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Home, TrendingUp, Building2, ArrowRight } from "lucide-react";
import { useSectionVariant } from "@/hooks/useSectionVariant";
import type { LoanProductsSectionConfig } from "@shared/schema";

import dscrCardImage from "@assets/stock_images/luxury_beach_house_v_60312048.jpg";
import fixFlipCardImage from "@assets/image_1764095965996.png";
import newConstructionCardImage from "@assets/image_1764097000811.png";

interface LoanProductsSectionProps {
  config: LoanProductsSectionConfig;
}

const PRODUCTS = {
  dscr: {
    title: "DSCR Loans",
    description: "Rental financing with no W2 required",
    mobileDescription: "Rental financing with no W2 or tax returns. Qualify based on property cash flow, not personal income.",
    mobileRate: "From 5.75% • 30-Year Fixed",
    image: dscrCardImage,
    icon: Home,
    stats: [
      { label: "Rates from", value: "5.75%" },
      { label: "LTV up to", value: "80%" },
      { label: "Terms", value: "30-year fixed" },
    ],
    mobileStats: [
      { label: "Max LTV", value: "80%" },
      { label: "Max Loan", value: "$3M" },
      { label: "DSCR", value: "No Min" },
    ],
    link: "/dscr-loans",
  },
  fixflip: {
    title: "Fix & Flip",
    description: "Fast bridge financing for flip projects",
    mobileDescription: "Short-term bridge loans for property flips. Fast closings, renovation financing included.",
    mobileRate: "From 8.90% • 12-24 Mo Terms",
    image: fixFlipCardImage,
    icon: TrendingUp,
    stats: [
      { label: "Rates from", value: "8.90%" },
      { label: "LTC up to", value: "92.5%" },
      { label: "Loan Amounts", value: "$75k - $5M" },
    ],
    mobileStats: [
      { label: "Max LTC", value: "90%" },
      { label: "Max Loan", value: "$2M" },
      { label: "Close", value: "48 hrs" },
    ],
    link: "/fix-flip",
  },
  construction: {
    title: "New Construction",
    description: "Ground-up construction financing",
    mobileDescription: "Ground-up construction financing with flexible draw schedules. Build your vision from the ground up.",
    mobileRate: "From 9.90% • 18-24 Mo Terms",
    image: newConstructionCardImage,
    icon: Building2,
    stats: [
      { label: "Rates from", value: "9.90%" },
      { label: "LTC up to", value: "90%" },
      { label: "Terms", value: "9-24 months" },
    ],
    mobileStats: [
      { label: "Max LTC", value: "85%" },
      { label: "Max Loan", value: "$5M" },
      { label: "Draws", value: "Flexible" },
    ],
    link: "/new-construction",
  },
};

export function LoanProductsSection({ config }: LoanProductsSectionProps) {
  const variantStyles = useSectionVariant("loan_products");
  
  const title = config.customTitle || "Our Loan Products";
  const description = config.customDescription || "Flexible financing solutions for every stage of your investment journey";

  const visibleProducts = Object.entries(PRODUCTS).filter(([key]) => {
    if (key === "dscr" && config.showDSCR === false) return false;
    if (key === "fixflip" && config.showFixFlip === false) return false;
    if (key === "construction" && config.showConstruction === false) return false;
    return true;
  });

  if (visibleProducts.length === 0) return null;

  return (
    <section className={`${variantStyles.spacing} ${variantStyles.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-4 sm:mb-12 md:mb-16">
          <h2 className={`${variantStyles.typography.headline} mb-2 sm:mb-4`}>{title}</h2>
          <p className={`${variantStyles.typography.body} max-w-2xl mx-auto`}>
            {description}
          </p>
        </div>

        <div className="sm:hidden">
          <Accordion type="single" collapsible className="space-y-2">
            {visibleProducts.map(([key, product]) => {
              const Icon = product.icon;
              return (
                <AccordionItem key={key} value={key} className="border rounded-lg overflow-hidden bg-card">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline" data-testid={`accordion-${key}-mobile`}>
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold text-sm">{product.title}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{product.mobileRate}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 pt-0">
                    <div className="space-y-2 text-xs">
                      <p className="text-muted-foreground">{product.mobileDescription}</p>
                      <div className="grid grid-cols-3 gap-2 text-center py-2 border-y">
                        {product.mobileStats.map((stat, i) => (
                          <div key={i}>
                            <p className="font-semibold">{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                      <Link href={product.link}>
                        <Button size="sm" className="w-full text-xs h-8" data-testid={`button-learn-${key}-mobile`}>
                          Learn More
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {visibleProducts.map(([key, product]) => {
            const Icon = product.icon;
            return (
              <Card key={key} className="overflow-hidden hover-elevate active-elevate-2 transition-all" data-testid={`card-product-${key}`}>
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{product.title}</CardTitle>
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {product.stats.map((stat, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{stat.label}</span>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={product.link}>
                    <Button className="w-full" variant="outline" data-testid={`button-learn-${key}`}>
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
