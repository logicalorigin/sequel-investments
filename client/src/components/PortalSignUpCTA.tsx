import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calculator, 
  FileText, 
  TrendingUp, 
  Shield, 
  UserPlus, 
  ArrowRight,
  CheckCircle2,
  Briefcase
} from "lucide-react";

interface PortalSignUpCTAProps {
  variant?: "inline" | "card" | "banner";
  title?: string;
  description?: string;
  loanType?: "dscr" | "fix-flip" | "construction" | "general";
}

export function PortalSignUpCTA({ 
  variant = "card",
  title,
  description,
  loanType = "general"
}: PortalSignUpCTAProps) {
  const benefits = {
    dscr: [
      "Save and compare DSCR scenarios",
      "Track multiple rental properties",
      "Get personalized rate quotes",
      "Access portfolio analytics"
    ],
    "fix-flip": [
      "Analyze unlimited flip deals",
      "Track rehab budgets and timelines",
      "Compare financing options",
      "Access draw request management"
    ],
    construction: [
      "Model ground-up construction deals",
      "Track build schedules and draws",
      "Compare land acquisition options",
      "Access contractor management tools"
    ],
    general: [
      "Save and compare loan scenarios",
      "Track your applications in real-time",
      "Access exclusive rate estimates",
      "Manage all your deals in one place"
    ]
  };

  const selectedBenefits = benefits[loanType];

  if (variant === "inline") {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{title || "Ready to analyze your deal?"}</p>
            <p className="text-sm text-muted-foreground">{description || "Create a free account for full access"}</p>
          </div>
        </div>
        <Link href="/auth">
          <Button className="gap-2 whitespace-nowrap" data-testid="button-inline-cta-signup">
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">{title || "Take Your Investing to the Next Level"}</h3>
            <p className="text-white/70 max-w-xl">
              {description || "Join thousands of investors using our platform to analyze deals, track applications, and close faster."}
            </p>
          </div>
          <Link href="/auth">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 whitespace-nowrap" data-testid="button-banner-cta-signup">
              <UserPlus className="h-5 w-5" />
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{title || "Unlock Your Investor Portal"}</h3>
          </div>
        </div>
        <p className="text-muted-foreground">
          {description || "Get full access to calculators, deal tracking, and exclusive resources."}
        </p>
      </div>
      
      <CardContent className="p-6">
        <ul className="space-y-3 mb-6">
          {selectedBenefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-4 gap-2 mb-6 p-3 rounded-lg bg-muted/50">
          <div className="flex flex-col items-center text-center">
            <Calculator className="h-5 w-5 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Calculators</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <FileText className="h-5 w-5 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Applications</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="h-5 w-5 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Analytics</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield className="h-5 w-5 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Secure</span>
          </div>
        </div>

        <Link href="/auth">
          <Button className="w-full gap-2" size="lg" data-testid="button-card-cta-signup">
            <UserPlus className="h-5 w-5" />
            Create Your Free Account
          </Button>
        </Link>
        
        <p className="text-xs text-center text-muted-foreground mt-3">
          No credit card required. Start analyzing deals in minutes.
        </p>
      </CardContent>
    </Card>
  );
}
