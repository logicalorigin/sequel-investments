import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";
import { TeaserDSCRCalculator } from "@/components/TeaserDSCRCalculator";
import { RecentlyFundedCarousel } from "@/components/RecentlyFundedCarousel";
import { RatesTermsSection, type RateTermItem, type BenefitItem } from "@/components/RatesTermsSection";
import { ResourcesSection, type ResourceItem } from "@/components/ResourcesSection";
import USMap from "@/components/USMap";
import { type StateData, getEligibleStates } from "@shared/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  CheckCircle2, 
  Home, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  FileCheck,
  Building,
  ArrowRight,
  MapPin
} from "lucide-react";
import dscrImage from "@assets/stock_images/luxury_modern_single_2639d1bd.jpg";
import { useToast } from "@/hooks/use-toast";
import { GeometricPattern } from "@/components/GeometricPattern";
import { AirDNACollapsible } from "@/components/AirDNACollapsible";

const ratesTermsItems: RateTermItem[] = [
  { label: "Rates as low as", value: "5.75%*", icon: "percent" },
  { label: "Loans from", value: "$100K to $3M", icon: "dollar" },
  { label: "Up to", value: "80%", sublabel: "LTV purchase/refi", icon: "home" },
  { label: "DSCR requirement", value: "No Minimum", sublabel: "we close below 1.0x", icon: "calculator" },
  { label: "Term options", value: "30-Year Fixed", sublabel: "or 5/6 ARM available", icon: "calendar" },
  { label: "No seasoning", value: "Cash-Out OK", sublabel: "BRRRR friendly", icon: "wallet" },
];

const ratesTermsBenefits: BenefitItem[] = [
  { text: "No W2 or Tax Returns" },
  { text: "No Income Verification" },
  { text: "STR/Airbnb Friendly" },
];

const resourcesItems: ResourceItem[] = [
  {
    type: "Guide",
    title: "The Complete Guide to DSCR Rental Property Loans",
    link: "/resources/complete-guide-to-dscr-loans",
  },
  {
    type: "Article",
    title: "What Every Real Estate Investor Should Know About ADUs",
    link: "/resources/what-investors-should-know-about-adus",
  },
  {
    type: "Calculator",
    title: "DSCR Calculator: Analyze Your Rental Property Deal",
    link: "/portal/dscr-analyzer",
  },
];

export default function DSCRLoansPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const eligibleStates = getEligibleStates();

  const handleFormSuccess = () => {
    toast({
      title: "Request received!",
      description: "A DSCR loan specialist will contact you soon.",
    });
  };

  const handleStateClick = (state: StateData) => {
    setLocation(`/states/${state.slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-12 pb-12 sm:pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${dscrImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        <GeometricPattern 
          variant="circles" 
          className="text-white" 
          opacity={0.1}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <Badge className="mb-3 sm:mb-4" variant="secondary">DSCR Loans</Badge>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6" data-testid="text-dscr-title">
              Rates from 5.75%. No W2 Required.
            </h1>
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8">Financing for Long Term and Short Term Rentals that qualifies based on property cash flow, not personal income. Up to 80% LTV with 30-year fixed terms.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Link href="/get-quote">
                <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto" data-testid="button-hero-getrate">
                  Get Your Rate
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-6 text-white text-sm sm:text-base">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">5.75%+ Rates</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">Up to 80% LTV</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">No Minimum DSCR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kiavi-style Rates & Terms Section */}
      <RatesTermsSection
        sectionLabel="Rates & Terms"
        title="DSCR Loan Rates + Terms"
        description="We qualify the property, not your personal income—so you can grow your rental portfolio with confidence."
        items={ratesTermsItems}
        benefits={ratesTermsBenefits}
        ctaText="See Your Rate"
        ctaLink="/get-quote"
      />

      {/* Where We Lend Section - Above Recently Funded */}
      <section className="py-12 sm:py-16 md:py-24 bg-card" data-testid="section-where-we-lend">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Map on left - as large as possible */}
            <div className="order-2 lg:order-1 overflow-visible">
              <div className="w-full overflow-visible">
                <USMap onStateClick={handleStateClick} />
              </div>
            </div>

            {/* Text on right */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                <span className="text-foreground">Where Are You </span>
                <span className="text-primary">Investing?</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
                We offer DSCR loans in 48 states + DC. Click on a state to explore our rental loan programs in your area.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
                {eligibleStates.slice(0, 8).map((state) => (
                  <Link key={state.slug} href={`/states/${state.slug}`}>
                    <div className="text-center p-2 sm:p-3 rounded-lg border bg-background hover-elevate transition-all cursor-pointer" data-testid={`state-link-${state.slug}`}>
                      <p className="font-semibold text-primary text-sm sm:text-base">{state.abbreviation}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{state.name}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center lg:text-left">
                <Link href="/where-we-lend">
                  <Button variant="outline" size="default" className="sm:text-base" data-testid="button-view-all-states">
                    <MapPin className="mr-2 h-4 w-4" />
                    View All States
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Funded Carousel */}
      <RecentlyFundedCarousel 
        loanType="DSCR" 
        title="Recently Funded DSCR Loans"
        subtitle="See real rental property deals we've closed for investors"
      />

      {/* Main Content Section */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8 sm:space-y-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Program Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileCheck className="h-5 w-5 text-primary" />
                        No Income Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        No W2, tax returns, or employment verification. We qualify the property, not your personal income.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-primary" />
                        No Minimum DSCR
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        We can close deals with DSCR below 1.0x. Flexible qualification for a variety of investment scenarios.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Home className="h-5 w-5 text-primary" />
                        Short-Term Rentals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Airbnb and VRBO friendly. We qualify STR income using projections from your property.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-primary" />
                        No Seasoning Required
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Perfect for BRRRR investors. Refinance immediately after rehab with no seasoning period.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Loan Terms</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Rates Starting At</span>
                        <span className="font-semibold">5.75%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Loan Amounts</span>
                        <span className="font-semibold">$100K - $3M</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">LTV (Purchase/Refi)</span>
                        <span className="font-semibold">Up to 80%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">LTV (Cash-Out)</span>
                        <span className="font-semibold">Up to 75%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Term Options</span>
                        <span className="font-semibold">30-Year Fixed or 5/6 ARM</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Credit Score</span>
                        <span className="font-semibold">660+ FICO</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">DSCR Requirement</span>
                        <span className="font-semibold">No Minimum</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Closing Fee</span>
                        <span className="font-semibold">0 - 3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Eligible Property Types</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Single Family Residences (SFR)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>2-4 Unit Properties</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Townhomes & Condos</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Non-Warrantable Condos</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Short-Term Rentals (Airbnb/VRBO)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>5-10 Unit Properties (select programs)</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Ideal For</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Long-Term Rental Investors</h4>
                      <p className="text-muted-foreground">Finance cash-flowing rental properties without traditional income docs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Short-Term Rental Operators</h4>
                      <p className="text-muted-foreground">Airbnb, VRBO, and vacation rental investors with flexible STR qualification</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">BRRRR Investors</h4>
                      <p className="text-muted-foreground">Refinance your fix & flip into a long-term hold with no seasoning</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Self-Employed Investors</h4>
                      <p className="text-muted-foreground">No tax returns or W2s needed - qualify on property income only</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">DSCR Calculator</h2>
                <TeaserDSCRCalculator />
              </div>

              <div data-testid="section-str-income-estimator">
                <h2 className="text-3xl font-bold mb-4">STR Income Estimator</h2>
                <p className="text-muted-foreground mb-6">
                  Planning to finance a short-term rental? Use AirDNA's market data to estimate potential income for your Airbnb or vacation rental property.
                </p>
                <AirDNACollapsible />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" data-testid="faq-item-1">
                    <AccordionTrigger>What is the DSCR formula?</AccordionTrigger>
                    <AccordionContent>
                      DSCR = Monthly Rental Income / Monthly Debt Obligations (PITIA). A DSCR of 1.0 means the property breaks even. Above 1.0 means positive cash flow.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" data-testid="faq-item-2">
                    <AccordionTrigger>What documents do I need for a DSCR loan?</AccordionTrigger>
                    <AccordionContent>
                      You'll need a signed lease agreement (or market rent analysis), property insurance, bank statements for down payment/reserves, and credit authorization. No tax returns or W2s required!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" data-testid="faq-item-3">
                    <AccordionTrigger>How long does it take to close?</AccordionTrigger>
                    <AccordionContent>
                      Most DSCR loans close in 14-21 days once you're under contract. We can expedite to as fast as 10 days with all documents ready.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" data-testid="faq-item-4">
                    <AccordionTrigger>Can I use rental income from Airbnb?</AccordionTrigger>
                    <AccordionContent>
                      Yes! We're STR-friendly and use income projections from AirDNA or similar sources to qualify short-term rental properties.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" data-testid="faq-item-5">
                    <AccordionTrigger>What if my DSCR is below 1.0?</AccordionTrigger>
                    <AccordionContent>
                      We have no minimum DSCR requirement and can close deals below 1.0x at adjusted rates. Many lenders won't do this - we will.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Your DSCR Rate</CardTitle>
                    <CardDescription>
                      Fill out this form to speak with a loan specialist
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LeadForm 
                      onSubmitSuccess={handleFormSuccess}
                      defaultLoanType="DSCR"
                      compact
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <ResourcesSection
        sectionLabel="Resources"
        title="Master DSCR loan financing"
        description="Have questions about DSCR loans or growing your rental portfolio? We offer resources to help you stay informed and make confident decisions."
        resources={resourcesItems}
        viewMoreLink="/resources"
        viewMoreText="View More"
      />

      {/* CTA Section */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <GeometricPattern 
          variant="bubbles" 
          className="text-primary-foreground" 
          opacity={0.15}
        />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Grow Your Rental Portfolio?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get pre-qualified in minutes and receive a term sheet within 24 hours
          </p>
          <Link href="/get-quote">
            <Button size="lg" variant="secondary" className="text-lg px-8" data-testid="button-cta-getrate">
              Get Your Rate Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
