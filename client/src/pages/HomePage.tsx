import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { DSCRCalculator } from "@/components/DSCRCalculator";
import { LeadForm } from "@/components/LeadForm";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import USMap from "@/components/USMap";
import { type StateData, getEligibleStates } from "@shared/schema";
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
import dscrImage from "@assets/stock_images/luxury_modern_single_2639d1bd.jpg";
import fixFlipImage from "@assets/stock_images/house_renovation_con_aaeb0f05.jpg";
import newConstructionImage from "@assets/stock_images/new_construction_hom_ee055247.jpg";
import dscrCardImage from "@assets/stock_images/luxury_beach_house_v_60312048.jpg";
import fixFlipCardImage from "@assets/image_1764095965996.png";
import newConstructionCardImage from "@assets/image_1764097000811.png";
import testimonial1 from "@assets/generated_images/Investor_testimonial_headshot_1_2a222601.png";
import testimonial2 from "@assets/generated_images/Investor_testimonial_headshot_2_bb13b1a2.png";
import testimonial3 from "@assets/generated_images/Investor_testimonial_headshot_3_a4e6c79b.png";
import rateTermImage from "@assets/image_1764113864033.png";
import { useToast } from "@/hooks/use-toast";

const heroSlides = [
  {
    id: "dscr",
    image: dscrImage,
    loanType: "DSCR Rental Loan",
    loanAmount: "$320,000",
    rate: "6.25%",
    closedIn: "21 Days",
  },
  {
    id: "fixflip",
    image: fixFlipImage,
    loanType: "Fix & Flip Loan",
    loanAmount: "$425,000",
    rate: "9.50%",
    closedIn: "4 Days",
  },
  {
    id: "construction",
    image: newConstructionImage,
    loanType: "New Construction",
    loanAmount: "$580,000",
    rate: "10.25%",
    closedIn: "10 Days",
  },
  {
    id: "rateterm",
    image: rateTermImage,
    loanType: "Rate & Term Refinance",
    loanAmount: "$900,000",
    rate: "6.875%",
    closedIn: "35 Days",
  },
];

export default function HomePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const eligibleStates = getEligibleStates();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

      <section className="relative min-h-[85vh] pt-24 pb-16 overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.4fr_0.6fr] gap-12 lg:gap-8 items-center min-h-[70vh]">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img src={testimonial1} alt="Investor" className="w-10 h-10 rounded-full border-2 border-background object-cover" />
                  <img src={testimonial2} alt="Investor" className="w-10 h-10 rounded-full border-2 border-background object-cover" />
                  <img src={testimonial3} alt="Investor" className="w-10 h-10 rounded-full border-2 border-background object-cover" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Trusted by 1,500+ investors</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-title">
                Funding Solutions.<br />
                <span className="text-primary">For Investors. By Investors.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                DSCR, Fix & Flip, and Construction loans — fast, flexible financing with no tax returns required.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link href="/get-quote">
                  <Button size="lg" className="text-lg" data-testid="button-hero-apply">
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">$500M+ Funded</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">48 States + DC</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">48hr Closings</span>
                </div>
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {heroSlides.map((slide, index) => (
                  <img 
                    key={slide.id}
                    src={slide.image} 
                    alt={slide.loanType}
                    className={`w-full h-[500px] object-cover absolute inset-0 transition-opacity duration-700 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                <div className="w-full h-[500px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? "bg-white w-6" : "bg-white/50"
                    }`}
                    data-testid={`button-carousel-${slide.id}`}
                  />
                ))}
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-xl p-5 border max-w-[280px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Funded</p>
                    <p className="text-xs text-muted-foreground">{activeSlide.loanType}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Loan Amount</span>
                    <span className="font-semibold">{activeSlide.loanAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-semibold text-primary">{activeSlide.rate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Closed In</span>
                    <span className="font-semibold text-green-600">{activeSlide.closedIn}</span>
                  </div>
                </div>
              </div>
            </div>
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

      <section className="py-24 bg-card" data-testid="section-where-we-lend">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Where We Lend</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secured Asset Funding is a nationwide private lender serving real estate investors across 48 states + DC. 
              Click on a state to explore our loan programs in your area.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <USMap onStateClick={handleStateClick} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {eligibleStates.slice(0, 12).map((state) => (
              <Link key={state.slug} href={`/states/${state.slug}`}>
                <div className="text-center p-3 rounded-lg border bg-background hover-elevate transition-all cursor-pointer" data-testid={`state-link-${state.slug}`}>
                  <p className="font-semibold text-primary">{state.abbreviation}</p>
                  <p className="text-xs text-muted-foreground">{state.name}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/where-we-lend">
              <Button variant="outline" size="lg" data-testid="button-view-all-states">
                <MapPin className="mr-2 h-4 w-4" />
                View All States
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
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

          <div className="w-full">
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
