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
  Star
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

      <section className="relative h-[75vh] min-h-[650px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/75" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm" variant="outline">
            Investor-Focused Lending
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-hero-title">
            Financing Built for the Speed<br className="hidden md:block" /> of Real Estate Investing
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
            Fast, reliable financing for DSCR rentals, fix & flip projects, and new construction. Close in as fast as 48 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/get-quote">
              <Button size="lg" className="text-lg px-8" data-testid="button-hero-getrate">
                Get Your Rate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/calculator">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                data-testid="button-hero-calculator"
              >
                Try Our Calculator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center" data-testid="stat-funded">
              <p className="text-3xl md:text-4xl font-bold text-primary">$500M+</p>
              <p className="text-muted-foreground mt-1">Loans Funded</p>
            </div>
            <div className="text-center" data-testid="stat-loans">
              <p className="text-3xl md:text-4xl font-bold text-primary">1,500+</p>
              <p className="text-muted-foreground mt-1">Investors Served</p>
            </div>
            <div className="text-center" data-testid="stat-closing">
              <p className="text-3xl md:text-4xl font-bold text-primary">48 hrs</p>
              <p className="text-muted-foreground mt-1">Fastest Closing</p>
            </div>
            <div className="text-center" data-testid="stat-states">
              <p className="text-3xl md:text-4xl font-bold text-primary">48 States</p>
              <p className="text-muted-foreground mt-1">+ DC Licensed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Loan Products</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Flexible financing solutions for every stage of your investment journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all" data-testid="card-product-dscr">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={dscrImage} 
                  alt="DSCR Loan - Rental Property" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">DSCR Loans</CardTitle>
                </div>
                <CardDescription>
                  Long-term rental financing with no W2 required
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
                  src={hardMoneyImage} 
                  alt="Fix & Flip Property" 
                  className="w-full h-full object-cover"
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
                    <span className="font-semibold">90%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closing</span>
                    <span className="font-semibold">48 hours</span>
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
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-primary/60" />
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
                    <span className="font-semibold">82.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Draw time</span>
                    <span className="font-semibold">48 hours</span>
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

      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Secured Asset Funding</h2>
            <p className="text-xl text-muted-foreground">
              What makes us the trusted choice for real estate investors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex gap-4" data-testid="benefit-speed">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Speed to Close</h3>
                <p className="text-muted-foreground">
                  Our digital platform automates manual tasks so you can close in as fast as 48 hours, not weeks.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-platform">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Easy Process</h3>
                <p className="text-muted-foreground">
                  We qualify the property, not the W2. No tax returns or extensive income verification required.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-pricing">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Competitive Pricing</h3>
                <p className="text-muted-foreground">
                  We assess each property's unique factors to provide pricing tailored to your specific deal.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-hassle">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Hassle-Free</h3>
                <p className="text-muted-foreground">
                  In-house valuation and servicing teams eliminate paperwork and third-party delays.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-support">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Dedicated Support</h3>
                <p className="text-muted-foreground">
                  Our team of experts guides you from application to closing with personalized attention.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-trusted">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Trusted by 1,500+</h3>
                <p className="text-muted-foreground">
                  Real estate investors nationwide trust us to fund their projects reliably.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">DSCR Calculator</h2>
            <p className="text-xl text-muted-foreground">
              Estimate your financing and see if you qualify in seconds
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Investors Say</h2>
            <p className="text-xl text-muted-foreground">
              Real success stories from real estate investors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card data-testid="card-testimonial-1">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "Closed my hard money loan in 6 days. The team was incredibly responsive and made the process seamless. Already on my third property with them!"
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial1} 
                    alt="Michael Chen" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">Michael Chen</h4>
                    <p className="text-sm text-muted-foreground">Fix & Flip Investor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-testimonial-2">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "No tax returns, no W2s needed. Got approved for a DSCR loan based purely on my property's rental income. Game changer for my portfolio!"
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial2} 
                    alt="Sarah Johnson" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Rental Property Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-testimonial-3">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "Financed 3 apartment buildings in 6 months. Their rates are competitive and the loan officers really understand the investment business."
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial3} 
                    alt="David Rodriguez" 
                    className="w-12 h-12 rounded-full object-cover"
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

      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Scale Your Portfolio?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Get pre-qualified in minutes and receive a term sheet within 24 hours
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg">No obligation quote</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg">Response within 24 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-lg">Transparent rates & terms</span>
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
