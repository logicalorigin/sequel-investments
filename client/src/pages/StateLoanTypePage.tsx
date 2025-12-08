import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";
import { getStateBySlug } from "@shared/schema";
import { Home, TrendingUp, Building2, Hammer, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LoanType = "dscr" | "fix-flip" | "hard-money" | "new-construction";

interface LoanTypeConfig {
  title: string;
  fullTitle: string;
  icon: typeof Home;
  description: string;
  programKey: "dscr" | "fixFlip" | "hardMoney" | "newConstruction";
  rates: string;
  ltv: string;
  terms: string[];
  benefits: string[];
  content: (stateName: string) => string;
}

const loanTypeConfigs: Record<LoanType, LoanTypeConfig> = {
  dscr: {
    title: "DSCR Loans",
    fullTitle: "DSCR Rental Loans",
    icon: Home,
    description: "Qualify based on property cash flow, not personal income",
    programKey: "dscr",
    rates: "5.75%",
    ltv: "80%",
    terms: [
      "30-year fixed or 5/6 ARM options",
      "No minimum DSCR requirement",
      "No W2 or tax returns required",
      "Short-term rental (STR) friendly",
      "No seasoning for BRRRR refinance",
      "Cash-out refinance available",
    ],
    benefits: [
      "Qualify the property, not the borrower",
      "Build your portfolio without income limits",
      "Perfect for self-employed investors",
      "Fast closings with minimal paperwork",
    ],
    content: (stateName: string) => 
      `Our ${stateName} DSCR Loans are designed for savvy real estate investors who want to grow their rental portfolio. 
      Unlike traditional mortgages, we qualify the property's income potential, not your W2. This means you can scale your 
      investments without hitting debt-to-income limits. Whether you're acquiring your first rental or your fiftieth, 
      our DSCR program gives you the flexibility and speed you need.`,
  },
  "fix-flip": {
    title: "Fix & Flip Loans",
    fullTitle: "Fix & Flip Hard Money Loans",
    icon: TrendingUp,
    description: "Fast bridge financing for your flip projects",
    programKey: "fixFlip",
    rates: "8.90%",
    ltv: "90% LTC / 70% ARV",
    terms: [
      "6-12 month terms (interest-only)",
      "48-hour closings available",
      "No appraisal required",
      "48-hour draw process",
      "No prepayment penalty",
      "Up to $2M loan amounts",
    ],
    benefits: [
      "Move fast on hot deals",
      "No income verification required",
      "Experienced team understands flippers",
      "Construction funding included",
    ],
    content: (stateName: string) => 
      `Our ${stateName} Fix & Flip Loans are built for serious renovators. With closings as fast as 48 hours and 
      draws processed just as quickly, you'll never lose a deal waiting on financing. We understand the fix and flip 
      business inside and out, which means fewer headaches and faster fundings. Whether you're doing a light cosmetic 
      rehab or a full gut renovation, we've got the capital you need.`,
  },
  "hard-money": {
    title: "Hard Money Loans",
    fullTitle: "Hard Money Loans",
    icon: Hammer,
    description: "Flexible short-term financing for real estate investors",
    programKey: "hardMoney",
    rates: "8.90%",
    ltv: "75% LTV",
    terms: [
      "Asset-based lending",
      "Quick approval process",
      "Flexible loan structures",
      "Bridge to permanent financing",
      "Short-term capital solutions",
      "Experienced investor programs",
    ],
    benefits: [
      "Credit flexibility",
      "Speed and certainty",
      "Asset-focused underwriting",
      "Relationship-based lending",
    ],
    content: (stateName: string) => 
      `Our ${stateName} Hard Money Loans provide the fast, flexible financing that experienced investors need. 
      When traditional lenders say no or move too slowly, we step in with asset-based solutions that focus on the 
      deal, not your tax returns. Our hard money programs serve as the perfect bridge to permanent financing or 
      as a quick capital source for time-sensitive opportunities.`,
  },
  "new-construction": {
    title: "New Construction",
    fullTitle: "New Construction Loans",
    icon: Building2,
    description: "Ground-up construction financing for developers",
    programKey: "newConstruction",
    rates: "9.90%",
    ltv: "82.5% LTC",
    terms: [
      "9-24 month terms (9 months base)",
      "48-hour draw turnaround",
      "Spec homes and infill development",
      "Multi-home developments",
      "In-house servicing",
      "Builder-friendly process",
    ],
    benefits: [
      "Fast draw processing",
      "Experienced construction team",
      "Competitive builder rates",
      "Seamless exit to DSCR",
    ],
    content: (stateName: string) => 
      `Our ${stateName} New Construction Loans fuel developers and builders who are creating new inventory. 
      From single spec homes to multi-unit developments, we provide the ground-up financing you need with 
      industry-leading draw turnaround times. When your project is complete, transition seamlessly to our 
      DSCR program for long-term rental financing.`,
  },
};

export default function StateLoanTypePage() {
  const params = useParams<{ stateSlug: string; loanType: string }>();
  const state = getStateBySlug(params.stateSlug || "");
  const loanType = params.loanType as LoanType;
  const config = loanTypeConfigs[loanType];
  const { toast } = useToast();

  useEffect(() => {
    if (state && config) {
      document.title = `${state.name} ${config.fullTitle} | Rates from ${config.rates} | Sequel Investments`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", `${config.title} in ${state.name} with rates from ${config.rates} and up to ${config.ltv}. ${config.description}. Fast approvals and competitive terms from Sequel Investments.`);
      }
    }
  }, [state, config]);

  const handleFormSuccess = () => {
    toast({
      title: "Thank you for your interest!",
      description: "A loan specialist will contact you within 24 hours.",
    });
  };

  if (!state || !config) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
          <Link href="/where-we-lend">
            <Button>View All States</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!state.isEligible || !state.eligiblePrograms[config.programKey]) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">{config.title} in {state.name}</h1>
          <p className="text-muted-foreground mb-8">
            This loan program is not currently available in {state.name}. Please check our other loan products.
          </p>
          <div className="flex justify-center gap-4">
            <Link href={`/states/${state.slug}`}>
              <Button variant="outline">View {state.name} Loans</Button>
            </Link>
            <Link href="/where-we-lend">
              <Button>View All States</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-4 flex-wrap">
            <Link href="/where-we-lend" className="hover:text-primary transition-colors">
              Where We Lend
            </Link>
            <ArrowRight className="h-4 w-4" />
            <Link href={`/states/${state.slug}`} className="hover:text-primary transition-colors">
              {state.name}
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-foreground">{config.title}</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-loan-title">
              {state.name} {config.fullTitle}
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            {config.description}. Sequel Investments offers competitive {config.title.toLowerCase()} for 
            real estate investors throughout {state.name}.
          </p>

          <div className="flex flex-wrap gap-6 mb-8">
            <div className="bg-card rounded-lg px-6 py-4 border">
              <p className="text-3xl font-bold text-primary">{config.rates}</p>
              <p className="text-sm text-muted-foreground">Rates Starting At</p>
            </div>
            <div className="bg-card rounded-lg px-6 py-4 border">
              <p className="text-3xl font-bold text-primary">{config.ltv}</p>
              <p className="text-sm text-muted-foreground">Maximum LTV/LTC</p>
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
            {state.name} {config.title} Program Terms
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-4">Loan Features</h3>
              <ul className="space-y-3">
                {config.terms.map((term, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Benefits</h3>
              <ul className="space-y-3">
                {config.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                About Our {state.name} {config.title}
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground mb-6">
                  {config.content(state.name)}
                </p>
                <p className="text-muted-foreground mb-6">
                  Ready to get started? Our {state.name} loan specialists are standing by to help you find 
                  the perfect financing solution for your investment property. Fill out the form to get 
                  your personalized rate quote today.
                </p>
              </div>

              <div className="mt-8 p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-4">Other Loan Programs in {state.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(loanTypeConfigs)
                    .filter(([key]) => key !== loanType)
                    .filter(([, conf]) => state.eligiblePrograms[conf.programKey])
                    .map(([key, conf]) => (
                      <Link key={key} href={`/states/${state.slug}/${key}`}>
                        <Button variant="outline" size="sm">
                          {conf.title}
                        </Button>
                      </Link>
                    ))}
                </div>
              </div>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Get Your {state.name} {config.title} Quote</CardTitle>
                  <CardDescription>
                    Talk to one of our {state.name} loan specialists today!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadForm 
                    onSubmitSuccess={handleFormSuccess} 
                    compact 
                    defaultLocation={state.name}
                    defaultLoanType={loanType === "dscr" ? "DSCR" : loanType === "fix-flip" ? "Fix & Flip" : loanType === "hard-money" ? "Hard Money" : "New Construction"}
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
