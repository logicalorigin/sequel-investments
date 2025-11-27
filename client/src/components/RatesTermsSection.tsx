import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowRight,
  Percent,
  DollarSign,
  Wallet,
  PiggyBank,
  Calendar,
  Building,
  Home,
  Hammer,
  CheckCircle2,
  Clock,
  FileX,
  Calculator
} from "lucide-react";

export interface RateTermItem {
  label: string;
  value: string;
  sublabel?: string;
  icon: "percent" | "dollar" | "wallet" | "piggybank" | "calendar" | "building" | "home" | "hammer" | "clock" | "calculator";
}

export interface BenefitItem {
  text: string;
}

interface RatesTermsSectionProps {
  sectionLabel?: string;
  title: string;
  description: string;
  items: RateTermItem[];
  benefits?: BenefitItem[];
  ctaText?: string;
  ctaLink?: string;
}

const iconMap = {
  percent: Percent,
  dollar: DollarSign,
  wallet: Wallet,
  piggybank: PiggyBank,
  calendar: Calendar,
  building: Building,
  home: Home,
  hammer: Hammer,
  clock: Clock,
  calculator: Calculator,
};

export function RatesTermsSection({
  sectionLabel = "Rates & Terms",
  title,
  description,
  items,
  benefits = [],
  ctaText = "See Your Rate",
  ctaLink = "/get-quote",
}: RatesTermsSectionProps) {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-primary font-semibold text-sm mb-3" data-testid="text-rates-label">
          {sectionLabel}
        </p>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8 sm:mb-10">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" data-testid="text-rates-title">
              {title}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              {description}
            </p>
          </div>
          
          <Link href={ctaLink}>
            <Button size="lg" className="text-base px-6" data-testid="button-rates-cta">
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon];
            return (
              <div 
                key={index}
                className="bg-card border rounded-lg p-5 sm:p-6 flex items-start justify-between gap-4"
                data-testid={`card-rate-term-${index}`}
              >
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                    {item.value}
                  </p>
                  {item.sublabel && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {item.sublabel}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
            );
          })}
        </div>
        
        {benefits.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 border-t">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm sm:text-base" data-testid={`benefit-${index}`}>
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
