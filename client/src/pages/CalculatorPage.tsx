import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { DSCRCalculator } from "@/components/DSCRCalculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, Home } from "lucide-react";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-calculator-title">
              Loan Calculator
            </h1>
            <p className="text-xl text-muted-foreground">
              Calculate your DSCR ratio and estimated monthly payments to see if you qualify
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DSCRCalculator />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card data-testid="card-calculator-info">
                <CardHeader>
                  <Calculator className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>How DSCR is Calculated</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    The Debt Service Coverage Ratio (DSCR) is calculated by dividing your property's monthly rental income by its total monthly debt obligations.
                  </p>
                  <div className="bg-accent/20 rounded-md p-4">
                    <p className="font-mono text-sm">
                      DSCR = Monthly Rent / (Mortgage Payment + Expenses)
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    A DSCR of 1.0 means your rental income exactly covers your debt obligations. Higher ratios indicate stronger cash flow and better qualification.
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-calculator-tips">
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Tips for Success</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Maximize Rental Income</h4>
                    <p className="text-sm text-muted-foreground">
                      Get a professional market rent analysis to ensure you're using the highest supportable rent figure.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Minimize Expenses</h4>
                    <p className="text-sm text-muted-foreground">
                      Shop for competitive insurance rates and consider properties with lower taxes and HOA fees.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Larger Down Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      A bigger down payment reduces your monthly mortgage payment and improves your DSCR ratio.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-calculator-assumption">
                <CardHeader>
                  <Home className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Calculator Assumptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Interest rate: 7.5% APR</p>
                  <p>• Loan term: 30 years fixed</p>
                  <p>• LTV: 80% (20% down payment)</p>
                  <p>• Principal & interest only</p>
                  <p className="pt-2 text-xs">
                    For exact rates and terms based on your specific situation, contact our loan specialists for a personalized quote.
                  </p>
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
