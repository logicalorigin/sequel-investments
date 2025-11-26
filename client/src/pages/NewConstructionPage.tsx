import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { LeadForm } from "@/components/LeadForm";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TeaserConstructionCalculator } from "@/components/TeaserConstructionCalculator";
import { RecentlyFundedCarousel } from "@/components/RecentlyFundedCarousel";
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
  ArrowRight
} from "lucide-react";
import constructionImage from "@assets/stock_images/new_construction_hom_ee055247.jpg";
import { useToast } from "@/hooks/use-toast";

export default function NewConstructionPage() {
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

      <section className="relative pt-12 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${constructionImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">New Construction Loans</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-hero-title">
              Turn Your Plans Into Profits
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Streamlined ground-up construction financing for 1-4 unit properties. 9-24 month terms, up to 90% LTC. Rates from 9.90%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/get-quote">
                <Button size="lg" className="text-lg px-8" data-testid="button-hero-getrate">
                  Get Your Rate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-white" />
                <span className="font-medium text-white">Up to 90% LTC</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-white" />
                <span className="font-medium text-white">9-24 Month Terms</span>
              </div>
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-white" />
                <span className="font-medium text-white">1-4 Unit Properties</span>
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
                <h2 className="text-3xl font-bold mb-6">Eligible Projects</h2>
                <div className="grid sm:grid-cols-2 gap-4">
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
      
      {/* Recently Funded Carousel */}
      <RecentlyFundedCarousel 
        loanType="New Construction" 
        title="Recently Funded Construction Projects"
        subtitle="See real ground-up builds we've financed"
      />

      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-6 text-center">
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
