import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { LeadForm } from "@/components/LeadForm";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TeaserFixFlipCalculator } from "@/components/TeaserFixFlipCalculator";
import { RecentlyFundedCarousel } from "@/components/RecentlyFundedCarousel";
import { RatesTermsSection, type RateTermItem, type BenefitItem } from "@/components/RatesTermsSection";
import { ResourcesSection, type ResourceItem } from "@/components/ResourcesSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Zap,
  FileCheck,
  Building,
  ArrowRight
} from "lucide-react";
import fixFlipImage from "@assets/stock_images/house_renovation_con_aaeb0f05.jpg";
import { useToast } from "@/hooks/use-toast";

const ratesTermsItems: RateTermItem[] = [
  { label: "Rates as low as", value: "8.90%*", icon: "percent" },
  { label: "Loans from", value: "$80K to $2M", icon: "dollar" },
  { label: "Up to", value: "90%", sublabel: "of purchase price", icon: "home" },
  { label: "Up to", value: "100%", sublabel: "of rehab cost", icon: "hammer" },
  { label: "Term options", value: "6-24 months", sublabel: "w/ interest-only options", icon: "calendar" },
  { label: "Close in as fast as", value: "48 hours", icon: "clock" },
];

const ratesTermsBenefits: BenefitItem[] = [
  { text: "No Application Fee" },
  { text: "No Appraisal Required" },
  { text: "No Income Verification" },
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
    title: "Fix & Flip Deal Analyzer: Calculate Your ROI Before You Buy",
    link: "/portal/fixflip-analyzer",
  },
];

export default function FixFlipPage() {
  const { toast } = useToast();

  const handleFormSuccess = () => {
    toast({
      title: "Application Received!",
      description: "A loan specialist will contact you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-12 pb-12 sm:pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${fixFlipImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <Badge className="mb-3 sm:mb-4" variant="secondary">Fix & Flip Loans</Badge>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6" data-testid="text-hero-title">
              Close in 48 Hours. No Appraisal Required.
            </h1>
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8">
              Compete with cash buyers using our fast, flexible fix & flip financing. Up to 90% of purchase + 100% of rehab with rates starting at 8.90%.
            </p>
            
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
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">48-Hour Closing</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">90% Purchase + 100% Rehab</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">No Appraisal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kiavi-style Rates & Terms Section */}
      <RatesTermsSection
        sectionLabel="Rates & Terms"
        title="Fix-and-Flip Rates + Terms"
        description="We calculate financing terms based on the property, not just the borrower—so you can move forward with confidence."
        items={ratesTermsItems}
        benefits={ratesTermsBenefits}
        ctaText="See Your Rate"
        ctaLink="/get-quote"
      />

      {/* Recently Funded Carousel - Moved Higher */}
      <RecentlyFundedCarousel 
        loanType="Fix & Flip" 
        title="Recently Funded Fix & Flip Projects"
        subtitle="See real rehab deals we've closed for investors"
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
                        <Clock className="h-5 w-5 text-primary" />
                        Lightning Fast Closings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Close in as fast as 48 hours. Compete with cash offers and never lose a deal to slow financing.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileCheck className="h-5 w-5 text-primary" />
                        No Appraisal Required
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Skip the appraisal wait. We use in-house valuation to speed up your deal.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-primary" />
                        48-Hour Draws
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Rehab funds released in 48 hours, no inspection needed. Keep your project on schedule with an industry leading draw process.</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building className="h-5 w-5 text-primary" />
                        No Tax Returns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        We qualify the property, not your W2. No tax returns or extensive income verification needed.
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
                    <span>Fix and Flip Projects</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>BRRRR Strategy</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Bridge Financing</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Auction & REO Purchases</span>
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
                        <span className="font-semibold">8.90%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Loan Amounts</span>
                        <span className="font-semibold">$80K - $2M</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Purchase Financing</span>
                        <span className="font-semibold">Up to 90%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Rehab Financing</span>
                        <span className="font-semibold">Up to 100%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">ARV</span>
                        <span className="font-semibold">Up to 75%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Term Length</span>
                        <span className="font-semibold">6-24 Months</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Credit Score</span>
                        <span className="font-semibold">660+ FICO</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Points</span>
                        <span className="font-semibold">0% - 3%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Prepayment Penalty</span>
                        <span className="font-semibold">None</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Fix & Flip Calculator</h2>
                <TeaserFixFlipCalculator />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" data-testid="faq-ff-item-1">
                    <AccordionTrigger>How quickly can I close on a fix & flip loan?</AccordionTrigger>
                    <AccordionContent>
                      We can close in as fast as 48 hours for qualified borrowers with complete documentation. Most deals close within 5-7 business days. Our streamlined process and in-house underwriting allow us to move quickly.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" data-testid="faq-ff-item-2">
                    <AccordionTrigger>What documents do I need for a fix & flip loan?</AccordionTrigger>
                    <AccordionContent>
                      You'll need proof of experience (prior flips or real estate ownership), bank statements showing reserves, credit authorization, and your rehab scope of work with budget. No tax returns or W2s required!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" data-testid="faq-ff-item-3">
                    <AccordionTrigger>How does the draw process work?</AccordionTrigger>
                    <AccordionContent>
                      Rehab funds are released through draws as work is completed. You submit photos and invoices, we inspect the work, and funds are released within 48 hours. Draw inspections can be done remotely in most cases.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" data-testid="faq-ff-item-4">
                    <AccordionTrigger>Do I need experience to qualify?</AccordionTrigger>
                    <AccordionContent>
                      While experience helps with pricing, we work with both new and experienced investors. First-time flippers may need a higher down payment or have a slightly higher rate, but we're happy to help you get started.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" data-testid="faq-ff-item-5">
                    <AccordionTrigger>What happens if my project takes longer than expected?</AccordionTrigger>
                    <AccordionContent>
                      We offer loan extensions if your project runs over. Extensions are typically available in 3-month increments at competitive rates. We work with you to ensure you have time to complete your project and maximize your profit.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Your Fix & Flip Rate</CardTitle>
                    <CardDescription>
                      Fill out this form to speak with a loan specialist
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LeadForm 
                      onSubmitSuccess={handleFormSuccess} 
                      defaultLoanType="Fix & Flip"
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
        title="Kickstart your fix-and-flip loan financing"
        description="Have questions about fix-and-flip loans or growing your real estate investment strategy? We offer resources to help you stay informed and make confident decisions."
        resources={resourcesItems}
        viewMoreLink="/resources"
        viewMoreText="View More"
      />

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Close Your Next Deal?
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
