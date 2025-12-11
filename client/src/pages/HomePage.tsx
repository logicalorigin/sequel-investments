import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { LeadForm } from "@/components/LeadForm";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import USMap from "@/components/USMap";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type StateData, getEligibleStates, type FundedDeal } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  TrendingUp, 
  Building2,
  Clock, 
  Shield, 
  Users, 
  CheckCircle2,
  DollarSign,
  Zap,
  Headphones,
  Target,
  ArrowRight,
  Star,
  MapPin
} from "lucide-react";
import { 
  Timer, 
  CheckAll, 
  CreditCard01, 
  LockOpen, 
  UserVoice, 
  UserCircle 
} from "react-coolicons";
import dscrCardImage from "@assets/stock_images/luxury_beach_house_v_60312048.jpg";
import fixFlipCardImage from "@assets/image_1764095965996.png";
import newConstructionCardImage from "@assets/image_1764097000811.png";
import testimonial1 from "@assets/generated_images/Investor_testimonial_headshot_1_2a222601.png";
import testimonial2 from "@assets/generated_images/Investor_testimonial_headshot_2_bb13b1a2.png";
import testimonial3 from "@assets/generated_images/Investor_testimonial_headshot_3_a4e6c79b.png";
import tempeAZProperty from "@assets/stock_images/luxury_single_family_efde7a4e.jpg";
import fortWorthTXProperty from "@assets/stock_images/luxury_single_family_91c2c6a3.jpg";
import doverDEProperty from "@assets/stock_images/luxury_single_family_a38e4174.jpg";
import postFallsIDProperty from "@assets/stock_images/luxury_single_family_c32ea781.jpg";
import { useToast } from "@/hooks/use-toast";
import { GeometricPattern } from "@/components/GeometricPattern";

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

export default function HomePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const eligibleStates = getEligibleStates();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: fundedDeals } = useQuery<FundedDeal[]>({
    queryKey: ["/api/funded-deals"],
    staleTime: 5 * 60 * 1000,
  });

  const heroSlides = useMemo(() => {
    if (fundedDeals && fundedDeals.length >= 4) {
      return fundedDeals.slice(0, 4).map((deal, idx) => mapDealToHeroSlide(deal, idx));
    }
    return fallbackHeroSlides;
  }, [fundedDeals]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleFormSuccess = () => {
    toast({
      title: "Thank you for your interest!",
      description: "A loan specialist will contact you within 24 hours.",
    });
  };

  const handleStateClick = (state: StateData) => {
    setLocation(`/states/${state.slug}`);
  };

  const activeSlide = heroSlides[currentSlide];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-4 pb-6 sm:pt-8 sm:pb-12 md:pt-12 md:pb-16 overflow-hidden bg-background">
        <GeometricPattern 
          variant="orbs" 
          className="text-primary" 
          opacity={0.08}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[0.4fr_0.6fr] gap-4 sm:gap-8 lg:gap-8 items-center">
            <div className="space-y-3 sm:space-y-6 md:space-y-8 order-1">
              {/* Trust badges - hidden on mobile for space */}
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
                Funding Solutions.
                <span className="block mt-1 sm:mt-2 text-primary">For Investors. By Investors.</span>
              </h1>

              <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-lg">
                DSCR, Fix & Flip, and Construction loans — fast, flexible financing with no tax returns required.
              </p>

              <div className="flex flex-row items-center gap-3">
                <Link href="/get-quote">
                  <Button size="default" className="text-sm sm:text-lg sm:h-11 sm:px-6" data-testid="button-hero-apply">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                {/* Mobile inline trust indicator */}
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
              
              {/* Desktop: Floating card outside image */}
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
              
              {/* Mobile: Compact card - 50% smaller than before */}
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
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 sm:py-12 bg-card border-b relative overflow-hidden">
        <GeometricPattern 
          variant="dots" 
          className="text-primary" 
          opacity={0.15}
          animated={false}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile: 2x2 grid on very small screens, 4-column on larger mobile */}
          <div className="sm:hidden grid grid-cols-2 min-[360px]:grid-cols-4 gap-2 min-[360px]:gap-1 text-center">
            <div data-testid="stat-funded">
              <p className="text-sm min-[360px]:text-base font-bold text-primary">$500M+</p>
              <p className="text-[9px] text-muted-foreground leading-tight">Funded</p>
            </div>
            <div data-testid="stat-loans">
              <p className="text-sm min-[360px]:text-base font-bold text-primary">1,500+</p>
              <p className="text-[9px] text-muted-foreground leading-tight">Investors</p>
            </div>
            <div data-testid="stat-closing">
              <p className="text-sm min-[360px]:text-base font-bold text-primary">48 hrs</p>
              <p className="text-[9px] text-muted-foreground leading-tight">Fastest</p>
            </div>
            <div data-testid="stat-states">
              <p className="text-sm min-[360px]:text-base font-bold text-primary">48</p>
              <p className="text-[9px] text-muted-foreground leading-tight">States</p>
            </div>
          </div>
          {/* Desktop: Grid layout */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center group">
              <p className="text-3xl md:text-4xl font-bold text-primary group-hover:animate-scale-pulse">$500M+</p>
              <p className="text-sm text-muted-foreground mt-1">Loans Funded</p>
            </div>
            <div className="text-center group">
              <p className="text-3xl md:text-4xl font-bold text-primary group-hover:animate-scale-pulse">1,500+</p>
              <p className="text-sm text-muted-foreground mt-1">Investors Served</p>
            </div>
            <div className="text-center group">
              <p className="text-3xl md:text-4xl font-bold text-primary group-hover:animate-scale-pulse">48 hrs</p>
              <p className="text-sm text-muted-foreground mt-1">Fastest Closing</p>
            </div>
            <div className="text-center group">
              <p className="text-3xl md:text-4xl font-bold text-primary group-hover:animate-scale-pulse">48 States</p>
              <p className="text-sm text-muted-foreground mt-1">+ DC Licensed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Our Loan Products</h2>
            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Flexible financing solutions for every stage of your investment journey
            </p>
          </div>

          {/* Mobile: Accordion cards */}
          <div className="sm:hidden">
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="dscr" className="border rounded-lg overflow-hidden bg-card">
                <AccordionTrigger className="px-3 py-2 hover:no-underline" data-testid="accordion-dscr-mobile">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                      <img src={dscrCardImage} alt="DSCR" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-sm">DSCR Loans</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">From 5.75% • 30-Year Fixed</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-0">
                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground">Rental financing with no W2 or tax returns. Qualify based on property cash flow, not personal income.</p>
                    <div className="grid grid-cols-3 gap-2 text-center py-2 border-y">
                      <div>
                        <p className="font-semibold">80%</p>
                        <p className="text-[10px] text-muted-foreground">Max LTV</p>
                      </div>
                      <div>
                        <p className="font-semibold">$3M</p>
                        <p className="text-[10px] text-muted-foreground">Max Loan</p>
                      </div>
                      <div>
                        <p className="font-semibold">No Min</p>
                        <p className="text-[10px] text-muted-foreground">DSCR</p>
                      </div>
                    </div>
                    <Link href="/dscr-loans">
                      <Button size="sm" className="w-full text-xs h-8" data-testid="button-learn-dscr-mobile">
                        Learn More
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fixflip" className="border rounded-lg overflow-hidden bg-card">
                <AccordionTrigger className="px-3 py-2 hover:no-underline" data-testid="accordion-fixflip-mobile">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                      <img src={fixFlipCardImage} alt="Fix & Flip" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-sm">Fix & Flip</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">From 8.90% • 12-24 Mo Terms</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-0">
                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground">Short-term bridge loans for property flips. Fast closings, renovation financing included.</p>
                    <div className="grid grid-cols-3 gap-2 text-center py-2 border-y">
                      <div>
                        <p className="font-semibold">90%</p>
                        <p className="text-[10px] text-muted-foreground">Max LTC</p>
                      </div>
                      <div>
                        <p className="font-semibold">$2M</p>
                        <p className="text-[10px] text-muted-foreground">Max Loan</p>
                      </div>
                      <div>
                        <p className="font-semibold">48 hrs</p>
                        <p className="text-[10px] text-muted-foreground">Close</p>
                      </div>
                    </div>
                    <Link href="/fix-flip">
                      <Button size="sm" className="w-full text-xs h-8" data-testid="button-learn-fixflip-mobile">
                        Learn More
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="construction" className="border rounded-lg overflow-hidden bg-card">
                <AccordionTrigger className="px-3 py-2 hover:no-underline" data-testid="accordion-construction-mobile">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                      <img src={newConstructionCardImage} alt="New Construction" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-sm">New Construction</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">From 9.90% • 18-24 Mo Terms</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-0">
                  <div className="space-y-2 text-xs">
                    <p className="text-muted-foreground">Ground-up construction financing with flexible draw schedules. Build your vision from the ground up.</p>
                    <div className="grid grid-cols-3 gap-2 text-center py-2 border-y">
                      <div>
                        <p className="font-semibold">85%</p>
                        <p className="text-[10px] text-muted-foreground">Max LTC</p>
                      </div>
                      <div>
                        <p className="font-semibold">$5M</p>
                        <p className="text-[10px] text-muted-foreground">Max Loan</p>
                      </div>
                      <div>
                        <p className="font-semibold">Flexible</p>
                        <p className="text-[10px] text-muted-foreground">Draws</p>
                      </div>
                    </div>
                    <Link href="/new-construction">
                      <Button size="sm" className="w-full text-xs h-8" data-testid="button-learn-construction-mobile">
                        Learn More
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Desktop: Full cards grid */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all" data-testid="card-product-dscr">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={dscrCardImage} 
                  alt="DSCR Loan - Beach Vacation Rental Property" 
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">DSCR Loans</CardTitle>
                </div>
                <CardDescription>
                  Rental financing with no W2 required
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rates from</span>
                    <span className="font-semibold">5.75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LTV up to</span>
                    <span className="font-semibold">80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terms</span>
                    <span className="font-semibold">30-year fixed</span>
                  </div>
                </div>
                <Link href="/dscr-loans">
                  <Button className="w-full" variant="outline" data-testid="button-learn-dscr">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all" data-testid="card-product-fixflip">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={fixFlipCardImage} 
                  alt="Fix & Flip Property - Remodel In Progress" 
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Fix & Flip</CardTitle>
                </div>
                <CardDescription>
                  Fast bridge financing for flip projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rates from</span>
                    <span className="font-semibold">8.90%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LTC up to</span>
                    <span className="font-semibold">92.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loan Amounts</span>
                    <span className="font-semibold">$75k - $5M</span>
                  </div>
                </div>
                <Link href="/fix-flip">
                  <Button className="w-full" variant="outline" data-testid="button-learn-fixflip">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all" data-testid="card-product-construction">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={newConstructionCardImage} 
                  alt="New Construction - Multi-Family Framing" 
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">New Construction</CardTitle>
                </div>
                <CardDescription>
                  Ground-up construction financing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rates from</span>
                    <span className="font-semibold">9.90%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LTC up to</span>
                    <span className="font-semibold">90%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terms</span>
                    <span className="font-semibold">9-24 months</span>
                  </div>
                </div>
                <Link href="/new-construction">
                  <Button className="w-full" variant="outline" data-testid="button-learn-construction">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-16 md:py-24 bg-card" data-testid="section-where-we-lend">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile: Vertical layout with text, map, then states */}
          <div className="lg:hidden flex flex-col gap-4">
            {/* Header and description */}
            <div className="text-center">
              <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4 flex items-baseline flex-wrap justify-center">
                <span className="text-foreground">Where Are You&nbsp;</span>
                <span 
                  className="inline-block overflow-hidden"
                  style={{ height: '1.25em', lineHeight: '1.25' }}
                >
                  <span 
                    className="flex flex-col"
                    style={{ animation: 'wordTickerDown 12s ease-in-out infinite' }}
                  >
                    <span className="text-primary" style={{ lineHeight: '1.25' }}>Investing?</span>
                    <span className="text-primary" style={{ lineHeight: '1.25' }}>Flipping?</span>
                    <span className="text-primary" style={{ lineHeight: '1.25' }}>Building?</span>
                    <span className="text-primary" style={{ lineHeight: '1.25' }}>Investing?</span>
                  </span>
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                We lend nationwide in 48 states + DC. Tap a state to explore.
              </p>
            </div>

            {/* Map */}
            <div className="w-full overflow-visible">
              <USMap onStateClick={handleStateClick} />
            </div>

            {/* States grid below map on mobile */}
            <div className="grid grid-cols-4 gap-2">
              {eligibleStates.slice(0, 8).map((state) => (
                <Link key={state.slug} href={`/states/${state.slug}`}>
                  <div className="text-center py-1.5 px-1 rounded-md border bg-background hover-elevate transition-all cursor-pointer" data-testid={`state-link-mobile-${state.slug}`}>
                    <p className="font-semibold text-primary text-xs">{state.abbreviation}</p>
                    <p className="text-[8px] text-muted-foreground truncate">{state.name}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link href="/where-we-lend">
                <Button variant="outline" size="sm" data-testid="button-view-all-states-mobile">
                  <MapPin className="mr-1.5 h-3 w-3" />
                  View All States
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop: Side by side layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            {/* Map on left */}
            <div className="overflow-visible">
              <div className="w-full overflow-visible">
                <USMap onStateClick={handleStateClick} />
              </div>
            </div>

            {/* Text on right */}
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-baseline flex-wrap">
                <span className="text-foreground">Where Are You&nbsp;</span>
                <span 
                  className="inline-block overflow-hidden"
                  style={{ height: '1.25em', lineHeight: '1.25' }}
                >
                  <span 
                    className="flex flex-col"
                    style={{ animation: 'wordTickerDown 12s ease-in-out infinite' }}
                  >
                    <span className="text-primary" style={{ lineHeight: '1.25' }}>Investing?</span>
                    <span className="text-primary" style={{ lineHeight: '1.25' }}>Flipping?</span>
                    <span className="text-primary" style={{ lineHeight: '1.25' }}>Building?</span>
                    <span className="text-primary" style={{ lineHeight: '1.25' }}>Investing?</span>
                  </span>
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
                Sequel Investments is a nationwide private lender serving real estate investors across 48 states + DC. 
                Click on a state to explore our loan programs in your area.
              </p>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {eligibleStates.slice(0, 8).map((state) => (
                  <Link key={state.slug} href={`/states/${state.slug}`}>
                    <div className="text-center p-3 rounded-lg border bg-background hover-elevate transition-all cursor-pointer" data-testid={`state-link-${state.slug}`}>
                      <p className="font-semibold text-primary text-base">{state.abbreviation}</p>
                      <p className="text-xs text-muted-foreground">{state.name}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link href="/where-we-lend">
                <Button variant="outline" size="default" data-testid="button-view-all-states">
                  <MapPin className="mr-2 h-4 w-4" />
                  View All States
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Why Choose Sequel Investments</h2>
            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground">
              What makes us the trusted choice for real estate investors
            </p>
          </div>

          {/* Mobile: Compact 2-column grid with minimal text */}
          <div className="grid grid-cols-2 sm:hidden gap-3">
            <div className="flex flex-col items-center text-center p-3 rounded-lg border bg-card" data-testid="benefit-speed-mobile">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-xs">48hr Closings</h3>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg border bg-card" data-testid="benefit-platform-mobile">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <CheckAll className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-xs">No W2 Required</h3>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg border bg-card" data-testid="benefit-pricing-mobile">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <CreditCard01 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-xs">Best Rates</h3>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg border bg-card" data-testid="benefit-hassle-mobile">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <LockOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-xs">In-House Servicing</h3>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg border bg-card" data-testid="benefit-support-mobile">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <UserVoice className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-xs">Dedicated Support</h3>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg border bg-card" data-testid="benefit-trusted-mobile">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-xs">1,500+ Investors</h3>
            </div>
          </div>

          {/* Desktop: Full layout with descriptions */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex gap-3 sm:gap-4" data-testid="benefit-speed">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Speed to Close</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Our digital platform automates manual tasks so you can close in as fast as 48 hours, not weeks.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4" data-testid="benefit-platform">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckAll className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Easy Process</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  We qualify the property, not the W2. No tax returns or extensive income verification required.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4" data-testid="benefit-pricing">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard01 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Competitive Pricing</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  We assess each property's unique factors to provide pricing tailored to your specific deal.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4" data-testid="benefit-hassle">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LockOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Hassle-Free</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  In-house valuation and servicing teams eliminate paperwork and third-party delays.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4" data-testid="benefit-support">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserVoice className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Dedicated Support</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Our team of experts guides you from application to closing with personalized attention.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4" data-testid="benefit-trusted">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Trusted by 1,500+</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Real estate investors nationwide trust us to fund their projects reliably.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section 
        className="py-12 sm:py-16 md:py-24 bg-card"
        role="region"
        aria-label="Investor testimonials"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">What Our Investors Say</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Real success stories from real estate investors
            </p>
          </div>

          {/* Mobile: Carousel */}
          <div className="sm:hidden">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-2">
                <CarouselItem className="pl-2 basis-[85%]">
                  <Card data-testid="card-testimonial-1-mobile" tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <CardContent className="pt-6">
                      <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars" role="img">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        ))}
                      </div>
                      <blockquote className="text-sm text-muted-foreground mb-4">
                        "Closed my hard money loan in 6 days. The team was incredibly responsive and made the process seamless. Already on my third property with them!"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <img 
                          src={testimonial1} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover"
                          aria-hidden="true"
                        />
                        <div>
                          <h4 className="font-semibold text-sm">Michael Chen</h4>
                          <p className="text-xs text-muted-foreground">Fix & Flip Investor</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
                <CarouselItem className="pl-2 basis-[85%]">
                  <Card data-testid="card-testimonial-2-mobile" tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <CardContent className="pt-6">
                      <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars" role="img">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        ))}
                      </div>
                      <blockquote className="text-sm text-muted-foreground mb-4">
                        "No tax returns, no W2s needed. Got approved for a DSCR loan based purely on my property's rental income. Game changer for my portfolio!"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <img 
                          src={testimonial2} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover"
                          aria-hidden="true"
                        />
                        <div>
                          <h4 className="font-semibold text-sm">Sarah Johnson</h4>
                          <p className="text-xs text-muted-foreground">Rental Property Owner</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
                <CarouselItem className="pl-2 basis-[85%]">
                  <Card data-testid="card-testimonial-3-mobile" tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <CardContent className="pt-6">
                      <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars" role="img">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        ))}
                      </div>
                      <blockquote className="text-sm text-muted-foreground mb-4">
                        "Financed 3 apartment buildings in 6 months. Their rates are competitive and the loan officers really understand the investment business."
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <img 
                          src={testimonial3} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover"
                          aria-hidden="true"
                        />
                        <div>
                          <h4 className="font-semibold text-sm">David Rodriguez</h4>
                          <p className="text-xs text-muted-foreground">Multi-Family Investor</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
            <p className="text-center text-xs text-muted-foreground mt-3">Swipe for more</p>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card data-testid="card-testimonial-1" tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars" role="img">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-6">
                  "Closed my hard money loan in 6 days. The team was incredibly responsive and made the process seamless. Already on my third property with them!"
                </blockquote>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial1} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover"
                    aria-hidden="true"
                  />
                  <div>
                    <h4 className="font-semibold">Michael Chen</h4>
                    <p className="text-sm text-muted-foreground">Fix & Flip Investor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-testimonial-2" tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars" role="img">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-6">
                  "No tax returns, no W2s needed. Got approved for a DSCR loan based purely on my property's rental income. Game changer for my portfolio!"
                </blockquote>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial2} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover"
                    aria-hidden="true"
                  />
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Rental Property Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-testimonial-3" tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars" role="img">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-6">
                  "Financed 3 apartment buildings in 6 months. Their rates are competitive and the loan officers really understand the investment business."
                </blockquote>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial3} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover"
                    aria-hidden="true"
                  />
                  <div>
                    <h4 className="font-semibold">David Rodriguez</h4>
                    <p className="text-sm text-muted-foreground">Multi-Family Investor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 bg-primary relative overflow-hidden">
        <GeometricPattern 
          variant="circles" 
          className="text-primary-foreground" 
          opacity={0.15}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-primary-foreground">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Ready to Scale Your Portfolio?
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">
                Get pre-qualified in minutes and receive a term sheet within 24 hours
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <span className="text-sm sm:text-base md:text-lg">No obligation quote</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <span className="text-sm sm:text-base md:text-lg">Response within 24 hours</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                  <span className="text-sm sm:text-base md:text-lg">Transparent rates & terms</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Get Started Today</CardTitle>
                <CardDescription className="text-sm">
                  Fill out this form and we'll be in touch shortly
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <LeadForm onSubmitSuccess={handleFormSuccess} compact />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
