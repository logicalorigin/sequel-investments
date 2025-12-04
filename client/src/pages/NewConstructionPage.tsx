import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { LeadForm } from "@/components/LeadForm";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TeaserConstructionCalculator } from "@/components/TeaserConstructionCalculator";
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
  Building2, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Hammer,
  FileCheck,
  HardHat,
  ArrowRight,
  MapPin
} from "lucide-react";
import constructionImage from "@assets/stock_images/new_construction_hom_ee055247.jpg";
import { useToast } from "@/hooks/use-toast";
import { GeometricPattern } from "@/components/GeometricPattern";

const ratesTermsItems: RateTermItem[] = [
  { label: "Rates as low as", value: "9.90%*", icon: "percent" },
  { label: "Loans from", value: "$150K to $3M", icon: "dollar" },
  { label: "Up to", value: "90%", sublabel: "loan-to-cost", icon: "building" },
  { label: "Up to", value: "75%", sublabel: "of completed value", icon: "home" },
  { label: "Term options", value: "9-24 months", sublabel: "w/ extension options", icon: "calendar" },
  { label: "Draw turnaround", value: "48 hours", icon: "clock" },
];

const ratesTermsBenefits: BenefitItem[] = [
  { text: "No Income Verification" },
  { text: "In-House Servicing" },
  { text: "Multi-Home Developments" },
];

const resourcesItems: ResourceItem[] = [
  {
    type: "Guide",
    title: "The Ins and Outs of Your Scope of Work",
    link: "/resources/scope-of-work-guide",
  },
  {
    type: "Article",
    title: "Top Renovations to Maximize Profits for Real Estate Investors",
    link: "/resources/top-renovations-to-maximize-profits",
  },
  {
    type: "Calculator",
    title: "Construction Loan Analyzer: Plan Your Build Project",
    link: "/portal/construction-analyzer",
  },
];

export default function NewConstructionPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const eligibleStates = getEligibleStates();

  const handleFormSuccess = () => {
    toast({
      title: "Application Received!",
      description: "A loan specialist will contact you within 24 hours.",
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
          style={{ backgroundImage: `url(${constructionImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        <GeometricPattern 
          variant="rings" 
          className="text-white" 
          opacity={0.12}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <Badge className="mb-3 sm:mb-4" variant="secondary">New Construction Loans</Badge>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6" data-testid="text-hero-title">
              Turn Your Plans Into Profits
            </h1>
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8">
              Streamlined ground-up construction financing for 1-4 unit properties. 9-24 month terms, up to 90% LTC. Rates from 9.90%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Link href="/get-quote">
                <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto" data-testid="button-hero-getrate">
                  Get Your Rate
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-6 text-sm sm:text-base">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="font-medium text-white">Up to 90% LTC</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="font-medium text-white">9-24 Month Terms</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <HardHat className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="font-medium text-white">1-4 Unit Properties</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kiavi-style Rates & Terms Section */}
      <RatesTermsSection
        sectionLabel="Rates & Terms"
        title="Construction Loan Rates + Terms"
        description="We structure financing based on your project, not just the borrower—so you can break ground with confidence."
        items={ratesTermsItems}
        benefits={ratesTermsBenefits}
        ctaText="See Your Rate"
        ctaLink="/get-quote"
      />

      {/* Recently Funded Carousel - Moved Higher */}
      <RecentlyFundedCarousel 
        loanType="New Construction" 
        title="Recently Funded Construction Projects"
        subtitle="See real ground-up builds we've financed"
      />

      {/* Main Content Section */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8 sm:space-y-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Eligible Projects</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Spec Homes & Infill Development</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Small Subdivisions (up to 4 units per parcel)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Custom Builds & Owner-Investor Projects</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Multi-Home Developments (1-4 Units)</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> We do not finance horizontal development or land-only loans. Projects must include vertical construction.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Program Highlights</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-primary" />
                        48-Hour Draw Process
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        The fastest draw turnaround in the industry. Keep your project on schedule with quick fund releases.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                        Multi-Home Developments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Finance spec homes and small subdivisions with up to 4 units per parcel. Flexible structures for builders.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Hammer className="h-5 w-5 text-primary" />
                        In-House Servicing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        We service your loan from start to finish. No last-minute changes or third-party surprises.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileCheck className="h-5 w-5 text-primary" />
                        Custom Loan Structures
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        We work with you to create a financing package tailored to your project's unique needs.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Ideal For</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Ground-Up Builders & Developers</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Spec Home Investors</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Infill & Urban Development</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Build-to-Rent Projects</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Loan Terms</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Rates Starting At</span>
                        <span className="font-semibold">9.90%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Loan-to-Cost (LTC)</span>
                        <span className="font-semibold">Up to 90%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Base Term</span>
                        <span className="font-semibold">9 Months</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Extended Terms</span>
                        <span className="font-semibold">Up to 24 Months</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Draw Turnaround</span>
                        <span className="font-semibold">48 Hours</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Project Size</span>
                        <span className="font-semibold">1-4 Units</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Credit Score</span>
                        <span className="font-semibold">660+ FICO</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Construction Loan Calculator</h2>
                <TeaserConstructionCalculator />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" data-testid="faq-guc-item-1">
                    <AccordionTrigger>What if I already own the land?</AccordionTrigger>
                    <AccordionContent>
                      If you own the land free and clear, the equity in your land can be applied toward your down payment and cash to close. Use our calculator's "Land is Owned" option to see how this affects your financing.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" data-testid="faq-guc-item-2">
                    <AccordionTrigger>How does the draw process work?</AccordionTrigger>
                    <AccordionContent>
                      Construction funds are released through a draw process as work is completed. After each phase, you submit photos and invoices, we conduct an inspection, and funds are released within 48 hours. This ensures steady cash flow throughout your build.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" data-testid="faq-guc-item-3">
                    <AccordionTrigger>What experience do I need to qualify?</AccordionTrigger>
                    <AccordionContent>
                      We work with builders at all experience levels. New builders may need a licensed general contractor on the project or may qualify with a higher down payment. Experienced builders with a track record of completed projects will receive the best terms.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" data-testid="faq-guc-item-4">
                    <AccordionTrigger>Can I build multiple homes on one loan?</AccordionTrigger>
                    <AccordionContent>
                      Yes! We finance multi-home developments with up to 4 units per parcel. Whether you're building duplexes, townhomes, or multiple single-family homes, we can structure financing to fit your project.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" data-testid="faq-guc-item-5">
                    <AccordionTrigger>What happens when construction is complete?</AccordionTrigger>
                    <AccordionContent>
                      Once construction is complete, you can sell the property and pay off the construction loan, or refinance into a long-term DSCR loan if you plan to hold it as a rental. We offer seamless transitions to permanent financing.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Your Construction Rate</CardTitle>
                    <CardDescription>
                      Fill out this form to speak with a loan specialist
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LeadForm 
                      onSubmitSuccess={handleFormSuccess} 
                      defaultLoanType="New Construction"
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
        title="Build smarter with our construction financing guides"
        description="Have questions about construction loans or planning your next build project? We offer resources to help you stay informed and make confident decisions."
        resources={resourcesItems}
        viewMoreLink="/resources"
        viewMoreText="View More"
      />

      {/* Where We Lend Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-card" data-testid="section-where-we-lend">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              <span className="text-foreground">Where Are You</span>{" "}
              <span className="inline-block relative align-bottom">
                <span className="inline-block border-b-2 border-primary pb-0.5">
                  <span 
                    className="inline-block overflow-hidden align-bottom"
                    style={{ height: '1.15em' }}
                  >
                    <span 
                      className="flex flex-col"
                      style={{ 
                        animation: 'wordTickerVertical 9s ease-in-out infinite',
                      }}
                    >
                      <span className="block text-primary leading-tight">Renting</span>
                      <span className="block text-primary leading-tight">Flipping</span>
                      <span className="block text-primary leading-tight">Building</span>
                    </span>
                  </span>
                </span>
              </span>
              <span className="text-foreground">?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              We offer New Construction loans in 48 states + DC. Click on a state to explore our ground-up financing in your area.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-8 sm:mb-12 overflow-x-auto">
            <USMap onStateClick={handleStateClick} />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {eligibleStates.slice(0, 12).map((state) => (
              <Link key={state.slug} href={`/states/${state.slug}`}>
                <div className="text-center p-2 sm:p-3 rounded-lg border bg-background hover-elevate transition-all cursor-pointer" data-testid={`state-link-${state.slug}`}>
                  <p className="font-semibold text-primary text-sm sm:text-base">{state.abbreviation}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{state.name}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <Link href="/where-we-lend">
              <Button variant="outline" size="default" className="sm:text-base" data-testid="button-view-all-states">
                <MapPin className="mr-2 h-4 w-4" />
                View All States
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <GeometricPattern 
          variant="rings" 
          className="text-primary-foreground" 
          opacity={0.15}
        />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Break Ground?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get pre-qualified in minutes and start building your next project
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
