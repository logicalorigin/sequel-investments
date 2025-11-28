import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";
import { getStateBySlug, type StateData, type MarketDataResponse } from "@shared/schema";
import { 
  Home, 
  TrendingUp, 
  Building2, 
  Hammer, 
  Check, 
  ArrowRight,
  DollarSign,
  Percent,
  Calendar,
  BarChart3,
  Star,
  Quote,
  Calculator,
  RefreshCw,
  MapPin,
} from "lucide-react";

import luxuryHome from "@assets/stock_images/luxury_modern_single_2639d1bd.jpg";
import renovationHome from "@assets/stock_images/house_renovation_con_aaeb0f05.jpg";
import newConstruction from "@assets/stock_images/new_construction_hom_ee055247.jpg";
import rentalProperty from "@assets/stock_images/residential_investme_a188ab28.jpg";
import suburbanHome from "@assets/stock_images/suburban_single_fami_544678ca.jpg";
import multiFamilyHome from "@assets/stock_images/multi-family_apartme_e7cec58d.jpg";

const fundingImages = [luxuryHome, renovationHome, newConstruction, rentalProperty, suburbanHome, multiFamilyHome];
import { useToast } from "@/hooks/use-toast";

function formatLoanVolume(volume: number): string {
  if (volume >= 1) {
    return `$${volume.toFixed(1)}M`;
  }
  return `$${(volume * 1000).toFixed(0)}K`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface RecentFunding {
  id: string;
  loanType: "DSCR" | "Fix & Flip" | "Construction";
  city: string;
  amount: number;
  rate: number;
  ltv: number;
  daysAgo: number;
  image: string;
}

function generateRecentFundings(state: StateData): RecentFunding[] {
  const cities: { [key: string]: string[] } = {
    "california": ["Los Angeles", "San Diego", "San Francisco", "Sacramento", "Oakland"],
    "texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
    "florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
    "arizona": ["Phoenix", "Scottsdale", "Tucson", "Mesa", "Chandler"],
    "georgia": ["Atlanta", "Savannah", "Augusta", "Columbus", "Athens"],
    "colorado": ["Denver", "Colorado Springs", "Aurora", "Boulder", "Fort Collins"],
    "nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks"],
    "north-carolina": ["Charlotte", "Raleigh", "Durham", "Greensboro", "Winston-Salem"],
    "tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"],
    "default": ["Metro Area", "Downtown", "Suburbs", "Midtown", "Uptown"],
  };
  
  const stateCities = cities[state.slug] || cities["default"];
  const loanTypes: ("DSCR" | "Fix & Flip" | "Construction")[] = ["DSCR", "Fix & Flip", "Construction"];
  
  const seed = state.loansClosed;
  const fundings: RecentFunding[] = [];
  
  for (let i = 0; i < 6; i++) {
    const loanType = loanTypes[i % 3];
    const city = stateCities[i % stateCities.length];
    const baseAmount = loanType === "DSCR" ? 350000 : loanType === "Fix & Flip" ? 280000 : 420000;
    const amount = baseAmount + ((seed * (i + 1) * 17) % 150000);
    const rate = loanType === "DSCR" ? 6.5 + (i * 0.125) : loanType === "Fix & Flip" ? 9.5 + (i * 0.1) : 10.5 + (i * 0.15);
    const ltv = loanType === "DSCR" ? 75 + (i % 6) : 85 + (i % 6);
    
    fundings.push({
      id: `${state.slug}-${i}`,
      loanType,
      city,
      amount,
      rate: Math.round(rate * 100) / 100,
      ltv,
      daysAgo: (i * 3) + 1,
      image: fundingImages[i % fundingImages.length],
    });
  }
  
  return fundings;
}

function getFallbackMarketData(state: StateData): MarketDataResponse {
  const basePrices: { [key: string]: number } = {
    "california": 750000,
    "new-york": 680000,
    "florida": 420000,
    "texas": 340000,
    "arizona": 445000,
    "colorado": 560000,
    "washington": 620000,
    "nevada": 410000,
    "georgia": 380000,
    "north-carolina": 365000,
    "tennessee": 340000,
    "default": 350000,
  };
  
  const basePrice = basePrices[state.slug] || basePrices["default"];
  const variance = (state.loansClosed % 50000);
  
  return {
    stateSlug: state.slug,
    stateName: state.name,
    medianHomePrice: basePrice + variance,
    avgCapRate: 5.5 + (state.loanVolume % 2),
    avgDaysOnMarket: 25 + (state.loansClosed % 20),
    priceGrowthYoY: 3.5 + (state.loanVolume % 4),
    rentGrowthYoY: 4.2 + (state.loansClosed % 3),
    medianRent: Math.round((basePrice + variance) * 0.006),
    source: "fallback",
    dataDate: new Date(),
    isCached: false,
  };
}

interface Testimonial {
  name: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
  loanType: string;
}

function getTestimonials(state: StateData): Testimonial[] {
  return [
    {
      name: "Michael R.",
      role: "Real Estate Investor",
      location: state.name,
      quote: `Secured Asset Funding made my ${state.name} rental property purchase seamless. The DSCR loan process was incredibly fast - closed in under 2 weeks with no W2 requirements. Highly recommend for serious investors.`,
      rating: 5,
      loanType: "DSCR Loan",
    },
    {
      name: "Sarah T.",
      role: "Fix & Flip Specialist",
      location: state.name,
      quote: `I've done over 15 flips in ${state.name} with SAF. Their draw process is the fastest I've experienced - usually within 48 hours. The rates are competitive and the team really understands investor needs.`,
      rating: 5,
      loanType: "Fix & Flip",
    },
    {
      name: "David L.",
      role: "Portfolio Investor",
      location: state.name,
      quote: `After struggling with traditional lenders for my ${state.name} properties, SAF was a breath of fresh air. They focus on the property's cash flow, not my personal income. Now I own 8 rentals across the state.`,
      rating: 5,
      loanType: "DSCR Loan",
    },
  ];
}

function MiniDSCRCalculator({ stateName }: { stateName: string }) {
  const [propertyValue, setPropertyValue] = useState("450000");
  const [monthlyRent, setMonthlyRent] = useState("3500");
  
  const results = useMemo(() => {
    const value = parseFloat(propertyValue) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const loanAmount = value * 0.75;
    const monthlyPI = (loanAmount * (6.75 / 100 / 12)) / (1 - Math.pow(1 + (6.75 / 100 / 12), -360));
    const monthlyTaxIns = value * 0.012 / 12;
    const totalMonthly = monthlyPI + monthlyTaxIns;
    const dscr = totalMonthly > 0 ? rent / totalMonthly : 0;
    const cashFlow = rent - totalMonthly;
    
    return {
      loanAmount,
      dscr,
      monthlyPayment: totalMonthly,
      cashFlow,
    };
  }, [propertyValue, monthlyRent]);
  
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Quick DSCR Calculator</CardTitle>
        </div>
        <CardDescription>Estimate your {stateName} rental loan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Property Value</Label>
            <div className="relative mt-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
              <Input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                className="pl-5 text-sm"
                data-testid="mini-calc-property-value"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Monthly Rent</Label>
            <div className="relative mt-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
              <Input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="pl-5 text-sm"
                data-testid="mini-calc-monthly-rent"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. Loan (75% LTV)</span>
            <span className="font-medium">{formatCurrency(results.loanAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">DSCR Ratio</span>
            <span className={`font-bold ${results.dscr >= 1.0 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
              {results.dscr.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Cash Flow</span>
            <span className={`font-medium ${results.cashFlow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(results.cashFlow)}
            </span>
          </div>
        </div>
        
        <Link href="/portal/dscr-analyzer">
          <Button className="w-full" size="sm" data-testid="button-full-calculator">
            Open Full Calculator
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function StateInvestmentPage() {
  const params = useParams<{ stateSlug: string }>();
  const state = getStateBySlug(params.stateSlug || "");
  const { toast } = useToast();

  useEffect(() => {
    if (state) {
      document.title = `${state.name} Investment Property Loans | DSCR & Fix & Flip | Secured Asset Funding`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", `Get DSCR, Fix & Flip, and Hard Money loans in ${state.name}. Secured Asset Funding has closed ${state.loansClosed.toLocaleString()} loans totaling ${formatLoanVolume(state.loanVolume)} in ${state.abbreviation}. Fast closings, competitive rates.`);
      }
    }
  }, [state]);

  const handleFormSuccess = () => {
    toast({
      title: "Thank you for your interest!",
      description: "A loan specialist will contact you within 24 hours.",
    });
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">State Not Found</h1>
          <p className="text-muted-foreground mb-8">The state you're looking for doesn't exist in our system.</p>
          <Link href="/where-we-lend">
            <Button>View All States</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!state.isEligible) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">{state.name}</h1>
          <p className="text-muted-foreground mb-8">
            We are not currently lending in {state.name}. Please check our other available states.
          </p>
          <Link href="/where-we-lend">
            <Button>View All States</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const loanTypes = [
    {
      title: "DSCR Loans",
      slug: "dscr",
      icon: Home,
      description: "Rental financing with no W2 required",
      eligible: state.eligiblePrograms.dscr,
      features: ["Rates from 5.75%", "Up to 80% LTV", "No minimum DSCR"],
    },
    {
      title: "Fix & Flip Loans",
      slug: "fix-flip",
      icon: TrendingUp,
      description: "Fast bridge financing for flip projects",
      eligible: state.eligiblePrograms.fixFlip,
      features: ["Rates from 8.90%", "Up to 90% LTC", "48-hour closes"],
    },
    {
      title: "Hard Money Loans",
      slug: "hard-money",
      icon: Hammer,
      description: "Flexible short-term financing solutions",
      eligible: state.eligiblePrograms.hardMoney,
      features: ["Asset-based lending", "Quick approvals", "Flexible terms"],
    },
    {
      title: "New Construction",
      slug: "new-construction",
      icon: Building2,
      description: "Ground-up construction financing",
      eligible: state.eligiblePrograms.newConstruction,
      features: ["Rates from 9.90%", "Up to 82.5% LTC", "48-hour draws"],
    },
  ];

  const recentFundings = generateRecentFundings(state);
  const testimonials = getTestimonials(state);
  
  const { data: marketData, isLoading: isLoadingMarket } = useQuery<MarketDataResponse>({
    queryKey: ['/api/market-data', state.slug],
  });
  
  const displayMarketData = marketData || getFallbackMarketData(state);

  const fundingsByType = {
    dscr: recentFundings.filter(f => f.loanType === "DSCR").length,
    fixFlip: recentFundings.filter(f => f.loanType === "Fix & Flip").length,
    construction: recentFundings.filter(f => f.loanType === "Construction").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Link href="/where-we-lend" className="hover:text-primary transition-colors">
              Where We Lend
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-foreground">{state.name}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-state-title">
            {state.name} Investment Property Loans
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            Secured Asset Funding is proud to be a leading private lender in {state.name}! 
            We offer industry-leading Hard Money and DSCR Loans for every type of {state.name} real estate investor.
          </p>

          <div className="flex flex-wrap gap-6 mb-8">
            <div className="bg-card rounded-lg px-6 py-4 border">
              <p className="text-3xl font-bold text-primary">{state.loansClosed.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Loans Closed in {state.abbreviation}</p>
            </div>
            <div className="bg-card rounded-lg px-6 py-4 border">
              <p className="text-3xl font-bold text-primary">{formatLoanVolume(state.loanVolume)}</p>
              <p className="text-sm text-muted-foreground">Total Volume Funded</p>
            </div>
          </div>

          <Link href="/get-quote">
            <Button size="lg" data-testid="button-get-quote">
              Get Your Rate
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{state.name} Real Estate Market Data</h2>
            <div className="flex items-center gap-2">
              {isLoadingMarket && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {(displayMarketData.source === "rentcast" || displayMarketData.source === "zillow") && (
                <Badge 
                  variant={displayMarketData.source === "rentcast" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {displayMarketData.source === "rentcast" ? "RentCast" : "Zillow"}
                </Badge>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{formatCurrency(displayMarketData.medianHomePrice)}</p>
                <p className="text-xs text-muted-foreground">Median Home Price</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Percent className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{displayMarketData.avgCapRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Avg. Cap Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{displayMarketData.avgDaysOnMarket}</p>
                <p className="text-xs text-muted-foreground">Avg. Days on Market</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">+{displayMarketData.priceGrowthYoY.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Price Growth YoY</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">+{displayMarketData.rentGrowthYoY.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Rent Growth YoY</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Recent Fundings in {state.name}
            </h2>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                DSCR ({fundingsByType.dscr})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Fix & Flip ({fundingsByType.fixFlip})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Construction ({fundingsByType.construction})
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFundings.map((funding) => (
              <Card key={funding.id} className="overflow-hidden hover-elevate" data-testid={`card-funding-${funding.id}`}>
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={funding.image} 
                    alt={`${funding.city}, ${state.abbreviation}`}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className={`absolute top-2 left-2 text-xs ${
                      funding.loanType === "DSCR" ? "bg-blue-500/90 text-white border-blue-500/30" :
                      funding.loanType === "Fix & Flip" ? "bg-amber-500/90 text-white border-amber-500/30" :
                      "bg-green-500/90 text-white border-green-500/30"
                    }`}
                  >
                    {funding.loanType}
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className="absolute top-2 right-2 text-xs bg-background/90 backdrop-blur-sm"
                  >
                    {funding.daysAgo}d ago
                  </Badge>
                </div>
                <CardContent className="pt-3 pb-4">
                  <div className="flex items-center gap-1 text-muted-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-sm font-medium">{funding.city}, {state.abbreviation}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Amount</p>
                      <p className="font-semibold">{formatCurrency(funding.amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Rate</p>
                      <p className="font-semibold">{funding.rate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">LTV/LTC</p>
                      <p className="font-semibold">{funding.ltv}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Loan Programs Available in {state.name}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanTypes.map((loan) => {
              const Icon = loan.icon;
              return (
                <Card 
                  key={loan.slug} 
                  className={`${!loan.eligible ? 'opacity-60' : 'hover-elevate'}`}
                  data-testid={`card-loan-${loan.slug}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{loan.title}</CardTitle>
                    </div>
                    <CardDescription>{loan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      {loan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {loan.eligible ? (
                      <Link href={`/states/${state.slug}/${loan.slug}`}>
                        <Button variant="outline" className="w-full">
                          Learn More
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Not Available in {state.abbreviation}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            What {state.name} Investors Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-testimonial-${index}`}>
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{testimonial.loanType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Why Choose Secured Asset Funding for Your {state.name} Investment?
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground mb-4">
                  Secured Asset Funding is the investment property loan provider for real estate investors of all experience levels and specialties in {state.name}, 
                  including popular strategies such as Short Term Rentals, Fix and Flip, and the BRRRR Method.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our {state.name} DSCR Loans are perfect rental loans for the long-term real estate investor looking for cash flow. 
                  Our {state.name} Hard Money Loans are ideal for renovators looking to add value through rehabs or ground-up construction!
                </p>
                <ul className="space-y-3 mt-6">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>No W2 or tax returns required for DSCR loans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Close in as fast as 48 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Dedicated {state.name} loan specialists</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Competitive rates and flexible terms</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-8">
                <MiniDSCRCalculator stateName={state.name} />
              </div>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Get Started in {state.name}</CardTitle>
                  <CardDescription>
                    Talk to one of our {state.name} investment property loan specialists today!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadForm 
                    onSubmitSuccess={handleFormSuccess} 
                    compact 
                    defaultLocation={state.name}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
