import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AirDNAEmbed } from "@/components/AirDNAEmbed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  FileCheck,
  Home
} from "lucide-react";
import { GeometricPattern } from "@/components/GeometricPattern";

export default function AirDNACalculatorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <section className="relative py-12 sm:py-16 bg-primary overflow-hidden">
        <GeometricPattern 
          variant="circles" 
          className="text-primary-foreground" 
          opacity={0.12}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">
              <Calculator className="h-3 w-3 mr-1" />
              Powered by AirDNA
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4" data-testid="text-airdna-calculator-title">
              Short-Term Rental Income Calculator
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-6">
              Estimate your vacation rental or Airbnb income potential using real market data from AirDNA. 
              Get accurate projections to qualify for our STR-friendly DSCR loans.
            </p>
            <div className="flex flex-wrap gap-4 text-primary-foreground text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Real Market Data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Property-Specific Estimates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Use for DSCR Qualification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 bg-muted/30" data-testid="section-airdna-embed">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <AirDNAEmbed height="700px" />
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4" data-testid="text-str-dscr-title">
              How STR Income Works with DSCR Loans
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our DSCR loan program uses your short-term rental income to qualify, 
              making it easy to finance Airbnb and vacation rental properties.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Income-Based Qualification</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  We use AirDNA projections or your actual rental history to calculate qualifying income—no W2s or tax returns required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">No Minimum DSCR</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Unlike most lenders, we have no minimum DSCR requirement. We can close deals even when the ratio falls below 1.0x.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">STR-Friendly Terms</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Finance Airbnb, VRBO, and vacation rentals with rates from 5.75%, up to 80% LTV, and 30-year fixed terms.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 sm:p-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-bold mb-3">Ready to Finance Your STR Property?</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    Get pre-qualified in minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    Receive a term sheet within 24 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    Close in as fast as 14 days
                  </li>
                </ul>
              </div>
              <div className="text-center md:text-right">
                <Link href="/get-quote">
                  <Button size="lg" className="text-lg px-8" data-testid="button-airdna-get-quote">
                    Get Your Rate
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
