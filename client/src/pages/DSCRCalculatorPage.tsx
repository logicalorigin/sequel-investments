import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GeometricPattern } from "@/components/GeometricPattern";
import { 
  Calculator, 
  Lock, 
  ArrowRight, 
  TrendingUp,
  DollarSign,
  Home,
  Percent
} from "lucide-react";

export default function DSCRCalculatorPage() {
  const [propertyValue, setPropertyValue] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [annualTaxes, setAnnualTaxes] = useState("");
  const [annualInsurance, setAnnualInsurance] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 bg-card border-b overflow-hidden">
        <GeometricPattern 
          variant="dots" 
          className="text-primary" 
          opacity={0.03}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Badge className="mb-4" variant="secondary">Free Calculator</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" data-testid="text-dscr-calc-title">
            DSCR Rental Property Calculator
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Calculate your Debt Service Coverage Ratio and see if your rental property qualifies for financing
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Property Details
                </CardTitle>
                <CardDescription>
                  Enter your property information to calculate DSCR
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyValue">Property Value</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="propertyValue"
                      type="number"
                      placeholder="400,000"
                      className="pl-9"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      data-testid="input-property-value"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Monthly Rent</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="monthlyRent"
                      type="number"
                      placeholder="2,800"
                      className="pl-9"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      data-testid="input-monthly-rent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="loanAmount"
                      type="number"
                      placeholder="320,000"
                      className="pl-9"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      data-testid="input-loan-amount"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.125"
                      placeholder="7.25"
                      className="pl-9"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      data-testid="input-interest-rate"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualTaxes">Annual Taxes</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="annualTaxes"
                        type="number"
                        placeholder="4,800"
                        className="pl-9"
                        value={annualTaxes}
                        onChange={(e) => setAnnualTaxes(e.target.value)}
                        data-testid="input-annual-taxes"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualInsurance">Annual Insurance</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="annualInsurance"
                        type="number"
                        placeholder="1,800"
                        className="pl-9"
                        value={annualInsurance}
                        onChange={(e) => setAnnualInsurance(e.target.value)}
                        data-testid="input-annual-insurance"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locked Results */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your DSCR Analysis
                </CardTitle>
                <CardDescription>
                  See your complete investment analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                {/* Blurred preview content */}
                <div className="space-y-4 filter blur-sm select-none pointer-events-none">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">DSCR Ratio</div>
                    <div className="text-3xl font-bold text-primary">1.25x</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Monthly P&I</div>
                      <div className="text-lg font-semibold">$2,184</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Monthly PITIA</div>
                      <div className="text-lg font-semibold">$2,734</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Cash Flow</div>
                      <div className="text-lg font-semibold text-green-600">+$566</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Cap Rate</div>
                      <div className="text-lg font-semibold">6.8%</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Loan Qualification</div>
                    <div className="text-lg font-semibold text-green-600">Likely Approved</div>
                  </div>
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Unlock Full Analysis
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-xs">
                      Create a free account to see your complete DSCR analysis with detailed projections
                    </p>
                    <Link href="/portal">
                      <Button size="lg" data-testid="button-unlock-results">
                        Create Free Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Home className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">No Income Docs Required</h3>
                <p className="text-sm text-muted-foreground">
                  DSCR loans qualify based on property income, not your personal tax returns or W2s
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">No Minimum DSCR</h3>
                <p className="text-sm text-muted-foreground">
                  We finance properties with DSCR below 1.0x. Most lenders require 1.25x or higher
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <DollarSign className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Rates from 5.75%</h3>
                <p className="text-sm text-muted-foreground">
                  Competitive rates on 30-year fixed or 5/6 ARM terms with up to 80% LTV
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <GeometricPattern 
          variant="bubbles" 
          className="text-primary-foreground" 
          opacity={0.15}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Analyze Your Deal?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-xl mx-auto">
            Get instant access to our full DSCR analyzer with detailed projections, scenario modeling, and financing options
          </p>
          <Link href="/portal">
            <Button size="lg" variant="secondary" data-testid="button-cta-portal">
              Access Full Analyzer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
