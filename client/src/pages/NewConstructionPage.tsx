import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { LeadForm } from "@/components/LeadForm";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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
import constructionImage from "@assets/generated_images/multi-unit_building_framed_construction.png";
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

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${constructionImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">New Construction Loans</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-hero-title">
              Build Your Vision. We'll Fund It.
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Streamlined ground-up construction financing with 48-hour draws and up to 82.5% LTC. Rates from 9.90%.
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
                <span className="font-medium text-white">Up to 82.5% LTC</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-white" />
                <span className="font-medium text-white">48-Hour Draws</span>
              </div>
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-white" />
                <span className="font-medium text-white">Ground-Up Builds</span>
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
                        Finance spec homes and small subdivisions. Flexible structures for builders at any scale.
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
                        <span className="font-semibold">Up to 82.5%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Term Length</span>
                        <span className="font-semibold">12-18 Months</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Draw Turnaround</span>
                        <span className="font-semibold">48 Hours</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Property Types</span>
                        <span className="font-semibold">Residential</span>
                      </div>
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-muted-foreground">Project Size</span>
                        <span className="font-semibold">Single & Multi-Home</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Eligible Projects</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Spec Homes</h4>
                      <p className="text-muted-foreground">Single-family speculation builds for resale</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Infill Development</h4>
                      <p className="text-muted-foreground">Urban infill projects on existing lots</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Small Subdivisions</h4>
                      <p className="text-muted-foreground">Multi-home developments with vertical construction</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Custom Builds</h4>
                      <p className="text-muted-foreground">Owner-investor custom home projects</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> We do not finance horizontal development or land-only loans. Projects must include vertical construction.
                  </p>
                </div>
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
