import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { DSCRCalculator } from "@/components/DSCRCalculator";
import { LeadForm } from "@/components/LeadForm";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { 
  Home, 
  TrendingUp, 
  Clock, 
  Shield, 
  Users, 
  Award,
  CheckCircle2,
  DollarSign,
  Zap
} from "lucide-react";
import heroImage from "@assets/generated_images/Mortgage_office_hero_background_15b464fc.png";
import dscrImage from "@assets/generated_images/DSCR_loan_rental_property_4c761fb2.png";
import hardMoneyImage from "@assets/generated_images/Hard_money_fix-and-flip_property_fb58005e.png";
import testimonial1 from "@assets/generated_images/Investor_testimonial_headshot_1_2a222601.png";
import testimonial2 from "@assets/generated_images/Investor_testimonial_headshot_2_bb13b1a2.png";
import testimonial3 from "@assets/generated_images/Investor_testimonial_headshot_3_a4e6c79b.png";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { toast } = useToast();

  const handleFormSuccess = () => {
    toast({
      title: "Thank you for your interest!",
      description: "A loan specialist will contact you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6" data-testid="text-hero-title">
            Non-QM Loan Solutions for Real Estate Investors
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Fast DSCR and Hard Money financing with flexible terms and expert guidance
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/contact">
              <Button size="lg" className="text-lg px-8" data-testid="button-hero-prequalify">
                Get Pre-Qualified
              </Button>
            </Link>
            <Link href="/dscr-loans">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                data-testid="button-hero-products"
              >
                View Loan Products
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-white">
            <div className="flex items-center gap-2" data-testid="trust-indicator-states">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Licensed in 50 States</span>
            </div>
            <div className="flex items-center gap-2" data-testid="trust-indicator-funded">
              <DollarSign className="h-5 w-5" />
              <span className="font-medium">$2B+ Funded</span>
            </div>
            <div className="flex items-center gap-2" data-testid="trust-indicator-approval">
              <Zap className="h-5 w-5" />
              <span className="font-medium">24hr Approval</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Loan Products</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Specialized financing solutions designed for real estate investors
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden hover-elevate active-elevate-2 transition-transform" data-testid="card-product-dscr">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={dscrImage} 
                  alt="DSCR Loan - Rental Property" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">DSCR Loans</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Debt Service Coverage Ratio loans for rental property investors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>No income verification required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Rates starting at 6.5% APR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Up to 80% LTV available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Close in as fast as 14 days</span>
                  </div>
                </div>
                <Link href="/dscr-loans">
                  <Button className="w-full" data-testid="button-learn-dscr">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover-elevate active-elevate-2 transition-transform" data-testid="card-product-hardmoney">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={hardMoneyImage} 
                  alt="Hard Money Loan - Fix and Flip" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Hard Money Loans</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Fast bridge financing for fix-and-flip and rehab projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Approval in 24-48 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Up to 90% of purchase + 100% rehab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Flexible terms 6-24 months</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                    <span>Fund in as little as 7 days</span>
                  </div>
                </div>
                <Link href="/hard-money">
                  <Button className="w-full" data-testid="button-learn-hardmoney">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose PrimeLend</h2>
            <p className="text-xl text-muted-foreground">
              The advantages of working with our expert team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card data-testid="card-benefit-fast">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Fast Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get approved in as little as 24 hours with our streamlined process and dedicated underwriting team.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-benefit-flexible">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Flexible Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Customized loan structures to fit your investment strategy and timeline, not one-size-fits-all.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-benefit-expert">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Expert Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Work with experienced loan officers who understand real estate investing and can guide you to success.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Calculate Your DSCR</h2>
            <p className="text-xl text-muted-foreground">
              See if you qualify for a DSCR loan in seconds
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <DSCRCalculator />
          </div>
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Investors Say</h2>
            <p className="text-xl text-muted-foreground">
              Real success stories from real estate investors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card data-testid="card-testimonial-1">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial1} 
                    alt="Michael Chen" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">Michael Chen</h4>
                    <p className="text-sm text-muted-foreground">Fix & Flip Investor</p>
                  </div>
                </div>
                <Badge>Hard Money Loan</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "Closed my hard money loan in 6 days. The team was incredibly responsive and made the process seamless. Already on my third property with them!"
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-testimonial-2">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial2} 
                    alt="Sarah Johnson" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Rental Property Owner</p>
                  </div>
                </div>
                <Badge>DSCR Loan</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "No tax returns, no W2s needed. Got approved for a DSCR loan based purely on my property's rental income. Game changer for my portfolio growth!"
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-testimonial-3">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial3} 
                    alt="David Rodriguez" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">David Rodriguez</h4>
                    <p className="text-sm text-muted-foreground">Multi-Family Investor</p>
                  </div>
                </div>
                <Badge>DSCR Loan</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "Financed 3 apartment buildings in 6 months. Their rates are competitive and the loan officers really understand the investment business."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-primary-foreground">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Grow Your Portfolio?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Connect with a loan specialist and get pre-qualified in minutes
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg">No obligation consultation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg">Fast response within 24 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg">Transparent rates and terms</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Get Started Today</CardTitle>
                <CardDescription>
                  Fill out this form and we'll be in touch shortly
                </CardDescription>
              </CardHeader>
              <CardContent>
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
