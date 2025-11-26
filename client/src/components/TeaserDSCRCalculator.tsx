import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { Calculator, Lock, ArrowRight, Sparkles } from "lucide-react";

type PropertyType = "sfr" | "2-4unit";

export function TeaserDSCRCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [downPaymentPercent, setDownPaymentPercent] = useState([25]);
  const [creditScore, setCreditScore] = useState([740]);
  const [monthlyRent, setMonthlyRent] = useState("3200");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateTeaser = () => {
    const price = parseFloat(purchasePrice) || 0;
    const downPayment = price * (downPaymentPercent[0] / 100);
    const loanAmount = price - downPayment;
    const ltv = price > 0 ? (loanAmount / price) * 100 : 0;
    const rent = parseFloat(monthlyRent) || 0;

    const BASE_RATE = 6.25;
    let creditAdjustment = 0;
    const score = creditScore[0];
    if (score >= 760) creditAdjustment = 0;
    else if (score >= 740) creditAdjustment = 0.25;
    else if (score >= 720) creditAdjustment = 0.375;
    else if (score >= 700) creditAdjustment = 0.5;
    else if (score >= 680) creditAdjustment = 0.75;
    else creditAdjustment = 1.0;

    let ltvAdjustment = 0;
    if (ltv <= 50) ltvAdjustment = -0.5;
    else if (ltv <= 55) ltvAdjustment = -0.25;
    else if (ltv <= 60) ltvAdjustment = 0;
    else if (ltv <= 65) ltvAdjustment = 0.125;
    else if (ltv <= 70) ltvAdjustment = 0.25;
    else if (ltv <= 75) ltvAdjustment = 0.375;
    else ltvAdjustment = 0.5;

    const estimatedRate = Math.max(5.75, Math.min(9.0, BASE_RATE + creditAdjustment + ltvAdjustment));

    return {
      estimatedRate,
      loanAmount,
      ltv,
    };
  };

  const results = calculateTeaser();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          DSCR Calculator
        </CardTitle>
        <CardDescription>
          Get a quick estimate of your DSCR loan rate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Your Estimated Rate
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary" data-testid="text-teaser-dscr-rate">
              {results.estimatedRate.toFixed(2)}%
            </span>
            <span className="text-muted-foreground text-sm">30-Year Fixed</span>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Credit Score</Label>
              <span className="text-sm font-medium">{creditScore[0]}</span>
            </div>
            <Slider
              value={creditScore}
              onValueChange={setCreditScore}
              min={660}
              max={800}
              step={5}
              className="py-2"
              data-testid="slider-teaser-credit-score"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>660</span>
              <span>800</span>
            </div>
          </div>

          <div>
            <Label htmlFor="teaserPurchasePrice">Purchase Price ($)</Label>
            <Input
              id="teaserPurchasePrice"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="400000"
              data-testid="input-teaser-purchase-price"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Down Payment (LTV: {(100 - downPaymentPercent[0]).toFixed(0)}%)</Label>
              <span className="text-sm font-medium">{downPaymentPercent[0]}%</span>
            </div>
            <Slider
              value={downPaymentPercent}
              onValueChange={setDownPaymentPercent}
              min={20}
              max={50}
              step={5}
              className="py-2"
              data-testid="slider-teaser-down-payment"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(parseFloat(purchasePrice || "0") * (downPaymentPercent[0] / 100))}
            </p>
          </div>

          <div>
            <Label htmlFor="teaserMonthlyRent">Expected Monthly Rent ($)</Label>
            <Input
              id="teaserMonthlyRent"
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              placeholder="3200"
              data-testid="input-teaser-monthly-rent"
            />
          </div>
        </div>

        <div className="relative">
          <div className="bg-card border rounded-lg p-6 space-y-4 blur-sm select-none pointer-events-none">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">DSCR Ratio</p>
                <p className="text-3xl font-bold">1.25</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Cash Flow</p>
                <p className="text-3xl font-bold text-green-600">$847</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Cash to Close</p>
                <p className="text-lg font-semibold">$112,000</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Payment</p>
                <p className="text-lg font-semibold">$1,753</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cash-on-Cash</p>
                <p className="text-lg font-semibold">9.1%</p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
            <div className="bg-card border shadow-lg rounded-lg p-6 text-center max-w-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unlock Full Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a free account to see DSCR ratio, monthly cash flow, rate breakdown, and more.
              </p>
              <Link href="/api/login">
                <Button className="w-full" data-testid="button-teaser-dscr-unlock">
                  Sign In to Unlock
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                Already have an account?{" "}
                <Link href="/api/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 border border-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            Our Investment Analysis tool provides complete DSCR calculations, rate breakdowns, 
            and financing scenarios for your rental property investments.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
