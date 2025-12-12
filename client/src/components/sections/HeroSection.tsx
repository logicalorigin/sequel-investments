import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ArrowRight, Star } from "lucide-react";
import { GeometricPattern } from "@/components/GeometricPattern";
import type { HeroSectionConfig, FundedDeal } from "@shared/schema";

import testimonial1 from "@assets/generated_images/Investor_testimonial_headshot_1_2a222601.png";
import testimonial2 from "@assets/generated_images/Investor_testimonial_headshot_2_bb13b1a2.png";
import testimonial3 from "@assets/generated_images/Investor_testimonial_headshot_3_a4e6c79b.png";
import tempeAZProperty from "@assets/stock_images/luxury_single_family_efde7a4e.jpg";
import fortWorthTXProperty from "@assets/stock_images/luxury_single_family_91c2c6a3.jpg";
import doverDEProperty from "@assets/stock_images/luxury_single_family_a38e4174.jpg";
import postFallsIDProperty from "@assets/stock_images/luxury_single_family_c32ea781.jpg";

interface HeroSlide {
  id: string;
  image: string;
  loanType: string;
  loanAmount: string;
  rate: string;
  closedIn: string;
  location: string;
}

const defaultImages = [tempeAZProperty, fortWorthTXProperty, doverDEProperty, postFallsIDProperty];

const fallbackHeroSlides: HeroSlide[] = [
  {
    id: "tempe-az-comp",
    image: tempeAZProperty,
    loanType: "Bridge Loan",
    loanAmount: "$370,350",
    rate: "9.25%",
    closedIn: "5 Days",
    location: "Tempe, AZ",
  },
  {
    id: "fort-worth-tx-comp",
    image: fortWorthTXProperty,
    loanType: "Bridge Loan",
    loanAmount: "$297,500",
    rate: "9.75%",
    closedIn: "6 Days",
    location: "Fort Worth, TX",
  },
  {
    id: "dover-de-comp",
    image: doverDEProperty,
    loanType: "DSCR Loan",
    loanAmount: "$189,000",
    rate: "6.875%",
    closedIn: "18 Days",
    location: "Dover, DE",
  },
  {
    id: "post-falls-id-comp",
    image: postFallsIDProperty,
    loanType: "Bridge Loan",
    loanAmount: "$387,500",
    rate: "9.375%",
    closedIn: "3 Days",
    location: "Post Falls, ID",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function mapDealToHeroSlide(deal: FundedDeal, index: number): HeroSlide {
  return {
    id: deal.id,
    image: deal.imageUrl || defaultImages[index % defaultImages.length],
    loanType: deal.loanType === "Fix & Flip" ? "Bridge Loan" : `${deal.loanType} Loan`,
    loanAmount: formatCurrency(deal.loanAmount),
    rate: deal.rate,
    closedIn: deal.closeTime,
    location: `${deal.location}, ${deal.state}`,
  };
}

interface HeroSectionProps {
  config: HeroSectionConfig;
}

export function HeroSection({ config }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: fundedDeals } = useQuery<FundedDeal[]>({
    queryKey: ["/api/funded-deals"],
    staleTime: 5 * 60 * 1000,
    enabled: config.showFundedDeals !== false,
  });

  const heroSlides = useMemo(() => {
    if (config.showFundedDeals !== false && fundedDeals && fundedDeals.length >= 4) {
      return fundedDeals.slice(0, 4).map((deal, idx) => mapDealToHeroSlide(deal, idx));
    }
    return fallbackHeroSlides;
  }, [fundedDeals, config.showFundedDeals]);

  useEffect(() => {
    if (config.variant === "carousel" || !config.variant) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroSlides.length, config.variant]);

  const activeSlide = heroSlides[currentSlide];
  const headline = config.headline || "Funding Solutions.";
  const subheadline = config.subheadline || "For Investors. By Investors.";
  const ctaText = config.ctaText || "Apply Now";
  const ctaLink = config.ctaLink || "/get-quote";

  return (
    <section className="relative pt-4 pb-6 sm:pt-8 sm:pb-12 md:pt-12 md:pb-16 overflow-hidden bg-background">
      <GeometricPattern 
        variant="orbs" 
        className="text-primary" 
        opacity={0.08}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[0.4fr_0.6fr] gap-4 sm:gap-8 lg:gap-8 items-center">
          <div className="space-y-3 sm:space-y-6 md:space-y-8 order-1">
            <div className="hidden sm:flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2">
                <img src={testimonial1} alt="Investor" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-background object-cover" />
                <img src={testimonial2} alt="Investor" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-background object-cover" />
                <img src={testimonial3} alt="Investor" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-background object-cover" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">Trusted by 1,500+ investors</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-title">
              {headline}
              <span className="block mt-1 sm:mt-2 text-primary">{subheadline}</span>
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-lg">
              DSCR, Fix & Flip, and Construction loans — fast, flexible financing with no tax returns required.
            </p>

            <div className="flex flex-row items-center gap-3">
              <Link href={ctaLink}>
                <Button size="default" className="text-sm sm:text-lg sm:h-11 sm:px-6" data-testid="button-hero-apply">
                  {ctaText}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <div className="flex sm:hidden items-center gap-1">
                <div className="flex -space-x-1">
                  <img src={testimonial1} alt="Investor" className="w-6 h-6 rounded-full border border-background object-cover" />
                  <img src={testimonial2} alt="Investor" className="w-6 h-6 rounded-full border border-background object-cover" />
                </div>
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6 pt-1 sm:pt-2 md:pt-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="h-3 w-3 sm:h-5 sm:w-5 text-primary" />
                <span className="text-[10px] sm:text-sm font-medium">No Tax Returns</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="h-3 w-3 sm:h-5 sm:w-5 text-primary" />
                <span className="text-[10px] sm:text-sm font-medium">No Income Verification</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="h-3 w-3 sm:h-5 sm:w-5 text-primary" />
                <span className="text-[10px] sm:text-sm font-medium">Same-Day Approvals</span>
              </div>
            </div>
          </div>

          <div className="relative order-2 lg:pl-8">
            <div className="relative rounded-lg sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
              {heroSlides.map((slide, index) => (
                <img 
                  key={slide.id}
                  src={slide.image} 
                  alt={slide.loanType}
                  className={`w-full h-[180px] sm:h-[350px] md:h-[400px] lg:h-[500px] object-cover absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="w-full h-[180px] sm:h-[350px] md:h-[400px] lg:h-[500px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}: ${slide.loanType}`}
                  aria-current={index === currentSlide ? "true" : undefined}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 ${
                    index === currentSlide ? "bg-white w-4 sm:w-6" : "bg-white/50"
                  }`}
                  data-testid={`button-carousel-${slide.id}`}
                />
              ))}
            </div>
            
            {config.showFundedDeals !== false && (
              <>
                <div className="hidden sm:block absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 bg-card rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-5 border max-w-[220px] sm:max-w-[280px]">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm">Funded</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{activeSlide.loanType}</p>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-semibold">{activeSlide.location}</span>
                    </div>
                    <div className="flex justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-muted-foreground">Loan Amount</span>
                      <span className="font-semibold">{activeSlide.loanAmount}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Interest Rate</span>
                      <span className="font-semibold text-primary">{activeSlide.rate}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Closed In</span>
                      <span className="font-semibold text-green-600">{activeSlide.closedIn}</span>
                    </div>
                  </div>
                </div>
                
                <div className="sm:hidden absolute bottom-2 right-2 bg-card rounded-md shadow-md p-1.5 border z-10 max-w-[100px]" data-testid="card-funded-mobile">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-2 w-2 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-[6px] leading-tight">Funded</p>
                      <p className="text-[5px] leading-tight text-muted-foreground">{activeSlide.loanType}</p>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between gap-1 text-[5px]">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-semibold">{activeSlide.location}</span>
                    </div>
                    <div className="flex justify-between gap-1 text-[5px]">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold">{activeSlide.loanAmount}</span>
                    </div>
                    <div className="flex justify-between text-[5px]">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-semibold text-primary">{activeSlide.rate}</span>
                    </div>
                    <div className="flex justify-between text-[5px]">
                      <span className="text-muted-foreground">Closed</span>
                      <span className="font-semibold text-green-600">{activeSlide.closedIn}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
