import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { DSCRCalculator } from "@/components/DSCRCalculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, Home, Building, DollarSign, CheckCircle2 } from "lucide-react";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-calculator-title">
              DSCR Calculator
            </h1>
            <p className="text-xl text-muted-foreground">
              Calculate your estimated rate based on credit score, LTV, DSCR ratio, and property type
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
              <Card data-testid="card-calculator-dscr-info">
                <CardHeader>
                  <Building className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>DSCR Explained</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    The Debt Service Coverage Ratio measures whether a property's rental income can cover its debt obligations.
                  </p>
                  <div className="bg-accent/20 rounded-md p-4">
                    <p className="font-mono text-sm text-center">
                      DSCR = Rent / (Payment + Expenses)
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>1.25+</strong> Excellent qualification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>1.0+</strong> Standard qualification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span><strong>0.75+</strong> May qualify with reserves</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card data-testid="card-calculator-flip-info">
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Fix & Flip Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Key metrics for evaluating fix and flip investments.
                  </p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold">LTC (Loan-to-Cost)</h4>
                      <p className="text-muted-foreground">Total project cost vs. ARV. We finance up to 90% LTC.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">ARV (After Repair Value)</h4>
                      <p className="text-muted-foreground">Estimated value after renovations are complete.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">ROI (Return on Investment)</h4>
                      <p className="text-muted-foreground">Profit divided by your cash invested in the deal.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-calculator-assumptions">
                <CardHeader>
                  <DollarSign className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Calculator Assumptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground">DSCR Loans</h4>
                    <p>30-year fixed term, rates from 5.75%</p>
                    <p>Closing costs estimated at 3%</p>
                  </div>
                  <div className="pt-2 border-t">
                    <h4 className="font-semibold text-foreground">Fix & Flip Loans</h4>
                    <p>Rate: 9.9% APR, interest-only</p>
                    <p>Up to 90% LTC / 70% ARV</p>
                    <p>Selling costs estimated at 6%</p>
                  </div>
                  <p className="pt-2 text-xs">
                    For exact rates based on your situation, contact our loan specialists for a personalized quote.
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-calculator-tips">
                <CardHeader>
                  <Calculator className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Tips for Success</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">For Rentals</h4>
                    <p className="text-sm text-muted-foreground">
                      Get a professional market rent analysis to maximize your DSCR ratio.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">For Flips</h4>
                    <p className="text-sm text-muted-foreground">
                      Be conservative on ARV estimates and pad your rehab budget by 10-15%.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">For Both</h4>
                    <p className="text-sm text-muted-foreground">
                      A larger down payment improves your ratios and may unlock better rates.
                    </p>
                  </div>
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
