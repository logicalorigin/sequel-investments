import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import type { CTABannerSectionConfig } from "@shared/schema";

interface CTABannerSectionProps {
  config: CTABannerSectionConfig;
}

export function CTABannerSection({ config }: CTABannerSectionProps) {
  const headline = config.headline || "Ready to Get Started?";
  const description = config.description || "Get your personalized rate quote in minutes";
  const ctaText = config.ctaText || "Get Your Quote";
  const ctaLink = config.ctaLink || "/get-quote";

  return (
    <section 
      className="py-12 sm:py-20 bg-primary"
      style={config.backgroundColor ? { backgroundColor: config.backgroundColor } : undefined}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 
          className="text-2xl sm:text-4xl font-bold text-primary-foreground mb-4"
          style={config.textColor ? { color: config.textColor } : undefined}
          data-testid="text-cta-headline"
        >
          {headline}
        </h2>
        <p 
          className="text-lg sm:text-xl text-primary-foreground/80 mb-8"
          style={config.textColor ? { color: config.textColor, opacity: 0.8 } : undefined}
        >
          {description}
        </p>
        <Link href={ctaLink}>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8"
            data-testid="button-cta-action"
          >
            {ctaText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
