import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { LeadForm } from "@/components/LeadForm";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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
import hardMoneyImage from "@assets/generated_images/Hard_money_fix-and-flip_property_fb58005e.png";
import { useToast } from "@/hooks/use-toast";

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

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hardMoneyImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">Fix & Flip Loans</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-hero-title">
              Close in 48 Hours. No Appraisal Required.
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Compete with cash buyers using our fast, flexible fix & flip financing. Up to 90% LTC with rates starting at 8.90%.
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
                <Zap className="h-5 w-5" />
                <span className="font-medium">48-Hour Closing</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Up to 90% LTC</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                <span className="font-medium">No Appraisal</span>
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
                      <p className="text-muted-foreground">
                        Get your rehab funds released in 48 hours. Keep your project on schedule with the fastest draw process.
                      </p>
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
                        <span className="text-muted-foreground">Loan-to-Cost (LTC)</span>
                        <span className="font-semibold">Up to 90%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">ARV</span>
                        <span className="font-semibold">Up to 70%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Term Length</span>
                        <span className="font-semibold">6-12 Months</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Credit Score</span>
                        <span className="font-semibold">620+ Minimum</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Points</span>
                        <span className="font-semibold">1.5% - 4%</span>
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
                <h2 className="text-3xl font-bold mb-6">Ideal For</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Fix and Flip Projects</h4>
                      <p className="text-muted-foreground">Finance purchase and rehab costs for your flip projects</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">BRRRR Strategy (Steps 1-2)</h4>
                      <p className="text-muted-foreground">Buy and renovate before refinancing into a DSCR loan</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Bridge Financing</h4>
                      <p className="text-muted-foreground">Short-term capital while waiting for permanent financing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Auction & REO Purchases</h4>
                      <p className="text-muted-foreground">Move fast on distressed properties requiring quick closes</p>
                    </div>
                  </div>
                </div>
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
