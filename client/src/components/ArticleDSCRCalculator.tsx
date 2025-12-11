import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { Calculator, Lock, ArrowRight, TrendingUp, UserPlus } from "lucide-react";

export function ArticleDSCRCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [downPaymentPercent, setDownPaymentPercent] = useState([25]);
  const [monthlyRent, setMonthlyRent] = useState("3200");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const results = useMemo(() => {
    const price = parseFloat(purchasePrice) || 0;
    const downPayment = price * (downPaymentPercent[0] / 100);
    const loanAmount = price - downPayment;
    const ltv = price > 0 ? (loanAmount / price) * 100 : 0;
    const rent = parseFloat(monthlyRent) || 0;
    const estimatedTaxesInsurance = price * 0.015 / 12;

    const BASE_RATE = 6.5;
    let ltvAdjustment = 0;
    if (ltv <= 60) ltvAdjustment = -0.25;
    else if (ltv <= 70) ltvAdjustment = 0;
    else if (ltv <= 75) ltvAdjustment = 0.25;
    else ltvAdjustment = 0.5;

    const estimatedRate = Math.max(6.0, Math.min(8.5, BASE_RATE + ltvAdjustment));
    
    const monthlyRate = estimatedRate / 100 / 12;
    const loanTermMonths = 30 * 12;
    const monthlyPI = loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / 
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1)
      : 0;
    
    const monthlyPITIA = monthlyPI + estimatedTaxesInsurance;
    const dscr = monthlyPITIA > 0 ? rent / monthlyPITIA : 0;

    return {
      estimatedRate,
      loanAmount,
      dscr,
      monthlyPITIA,
    };
  }, [purchasePrice, downPaymentPercent, monthlyRent]);

  return (
    <Card className="w-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Quick DSCR Estimate</h3>
            <p className="text-sm text-muted-foreground">See if your deal qualifies</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="articlePurchasePrice" className="text-sm">Purchase Price</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="articlePurchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="pl-7"
                data-testid="input-article-dscr-price"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-sm">Down Payment</Label>
              <span className="text-sm font-medium">{downPaymentPercent[0]}%</span>
            </div>
            <Slider
              value={downPaymentPercent}
              onValueChange={setDownPaymentPercent}
              min={20}
              max={50}
              step={5}
              className="py-2"
              data-testid="slider-article-dscr-down"
            />
          </div>

          <div>
            <Label htmlFor="articleMonthlyRent" className="text-sm">Monthly Rent</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="articleMonthlyRent"
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="pl-7"
                data-testid="input-article-dscr-rent"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Your Results
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Est. Rate</p>
              <p className="text-xl font-bold text-green-600" data-testid="text-article-dscr-rate">
                {results.estimatedRate.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">DSCR Ratio</p>
              <p className={`text-xl font-bold ${
                results.dscr >= 1.0 ? "text-green-600" : "text-amber-500"
              }`} data-testid="text-article-dscr-ratio">
                {results.dscr.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-dashed">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Lock className="h-4 w-4" />
              <span className="text-xs font-medium">Unlock Full Analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-4 opacity-50 blur-[2px] select-none pointer-events-none">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Cash Flow</p>
                <p className="text-lg font-semibold">$XXX</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cash to Close</p>
                <p className="text-lg font-semibold">$XXX,XXX</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Link href="/auth">
            <Button className="w-full gap-2" data-testid="button-article-dscr-signup">
              <UserPlus className="h-4 w-4" />
              Create Free Account for Full Calculator
            </Button>
          </Link>
          <p className="text-xs text-center text-muted-foreground">
            Save scenarios, track deals, and access advanced metrics
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
