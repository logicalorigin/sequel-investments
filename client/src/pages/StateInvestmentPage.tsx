import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";
import { getStateBySlug, type StateData } from "@shared/schema";
import { Home, TrendingUp, Building2, Hammer, Check, MapPin, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatLoanVolume(volume: number): string {
  if (volume >= 1) {
    return `$${volume.toFixed(1)}M`;
  }
  return `$${(volume * 1000).toFixed(0)}K`;
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-primary/10 to-background">
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

      <section className="py-16 bg-card">
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
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
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
