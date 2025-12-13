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
  Building2,
  Clock
} from "lucide-react";

export default function ConstructionCalculatorPage() {
  const [landCost, setLandCost] = useState("");
  const [constructionBudget, setConstructionBudget] = useState("");
  const [expectedSalePrice, setExpectedSalePrice] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [buildTimeline, setBuildTimeline] = useState("");

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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" data-testid="text-construction-calc-title">
            New Construction Calculator
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze your ground-up construction project to calculate potential profit and financing needs
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
                  Project Details
                </CardTitle>
                <CardDescription>
                  Enter your construction project details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="landCost">Land Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="landCost"
                      type="number"
                      placeholder="150,000"
                      className="pl-9"
                      value={landCost}
                      onChange={(e) => setLandCost(e.target.value)}
                      data-testid="input-land-cost"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constructionBudget">Construction Budget</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="constructionBudget"
                      type="number"
                      placeholder="350,000"
                      className="pl-9"
                      value={constructionBudget}
                      onChange={(e) => setConstructionBudget(e.target.value)}
                      data-testid="input-construction-budget"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedSalePrice">Expected Sale Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expectedSalePrice"
                      type="number"
                      placeholder="650,000"
                      className="pl-9"
                      value={expectedSalePrice}
                      onChange={(e) => setExpectedSalePrice(e.target.value)}
                      data-testid="input-expected-sale-price"
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
                      placeholder="400,000"
                      className="pl-9"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      data-testid="input-loan-amount"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildTimeline">Build Timeline (months)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="buildTimeline"
                      type="number"
                      placeholder="12"
                      className="pl-9"
                      value={buildTimeline}
                      onChange={(e) => setBuildTimeline(e.target.value)}
                      data-testid="input-build-timeline"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locked Results */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Project Analysis
                </CardTitle>
                <CardDescription>
                  See your complete construction analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                {/* Blurred preview content */}
                <div className="space-y-4 filter blur-sm select-none pointer-events-none">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Estimated Profit</div>
                    <div className="text-3xl font-bold text-green-600">$98,500</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Total Project Cost</div>
                      <div className="text-lg font-semibold">$500,000</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Cash Required</div>
                      <div className="text-lg font-semibold">$100,000</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">ROI</div>
                      <div className="text-lg font-semibold text-green-600">98.5%</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Interest Reserve</div>
                      <div className="text-lg font-semibold">$36,000</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Project Viability</div>
                    <div className="text-lg font-semibold text-green-600">Strong Project</div>
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
                      Create a free account to see your complete construction analysis with draw schedules and projections
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
                <DollarSign className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Up to 85% LTC</h3>
                <p className="text-sm text-muted-foreground">
                  Finance up to 85% of total project costs including land and construction
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Building2 className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Flexible Draw Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Get funds as you need them with our flexible construction draw process
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">12-24 Month Terms</h3>
                <p className="text-sm text-muted-foreground">
                  Flexible loan terms to match your build timeline with extension options
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
            Ready to Build Your Project?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-xl mx-auto">
            Get instant access to our full construction analyzer with detailed budgets, draw schedules, and financing options
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
