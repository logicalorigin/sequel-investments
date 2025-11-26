import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";
import { DSCROnlyCalculator } from "@/components/DSCROnlyCalculator";
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
  ArrowRight
} from "lucide-react";
import dscrImage from "@assets/stock_images/luxury_modern_single_2639d1bd.jpg";
import { useToast } from "@/hooks/use-toast";

export default function DSCRLoansPage() {
  const { toast } = useToast();

  const handleFormSuccess = () => {
    toast({
      title: "Request received!",
      description: "A DSCR loan specialist will contact you soon.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-12 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${dscrImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">DSCR Loans</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-dscr-title">
              Rates from 5.75%. No W2 Required.
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Long-term rental financing that qualifies based on property cash flow, not personal income. Up to 80% LTV with 30-year fixed terms.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/get-quote">
                <Button size="lg" className="text-lg px-8" data-testid="button-hero-getrate">
                  Get Your Rate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">5.75%+ Rates</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span className="font-medium">Up to 80% LTV</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                <span className="font-medium">No Minimum DSCR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Program Highlights</h2>
                <div className="grid sm:grid-cols-2 gap-6">
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
                        <span className="font-semibold">640+ Minimum</span>
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

              <div>
                <h2 className="text-3xl font-bold mb-6">DSCR Calculator</h2>
                <DSCROnlyCalculator />
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

      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-6 text-center">
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
