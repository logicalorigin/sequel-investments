import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, Lock, ArrowRight, Sparkles } from "lucide-react";

export function TeaserFixFlipCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [rehabCosts, setRehabCosts] = useState("50000");
  const [arv, setArv] = useState("550000");

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
    const rehab = parseFloat(rehabCosts) || 0;
    const afterRepairValue = parseFloat(arv) || 0;

    const totalProjectCost = price + rehab;
    const ltc = afterRepairValue > 0 ? (totalProjectCost / afterRepairValue) * 100 : 0;

    const loanAmountPurchase = Math.min(price * 0.9, afterRepairValue * 0.7);
    const loanAmountRehab = Math.min(rehab, afterRepairValue * 0.7 - loanAmountPurchase);
    const totalLoanAmount = loanAmountPurchase + Math.max(0, loanAmountRehab);

    const rate = 9.9 / 100 / 12;
    const months = 6;
    const interestPayments = totalLoanAmount * rate * months;

    const downPaymentRequired = price - loanAmountPurchase;
    const cashOutOfPocket = Math.max(0, rehab - loanAmountRehab);
    const closingCosts = price * 0.025;
    const sellingCosts = afterRepairValue * 0.06;
    const cashToClose = downPaymentRequired + closingCosts + cashOutOfPocket;

    const totalCosts = price + rehab + interestPayments + closingCosts + sellingCosts;
    const profit = afterRepairValue - totalCosts;

    return {
      totalProjectCost,
      ltc: ltc.toFixed(1),
      profit,
      totalLoanAmount,
    };
  };

  const results = calculateTeaser();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Fix & Flip Calculator
        </CardTitle>
        <CardDescription>
          Quickly analyze your flip deal potential
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Estimated Profit
          </h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${results.profit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-teaser-flip-profit">
              {formatCurrency(results.profit)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            LTC: {results.ltc}%
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="teaserFlipPurchase">Purchase Price ($)</Label>
            <Input
              id="teaserFlipPurchase"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="400000"
              data-testid="input-teaser-flip-purchase"
            />
          </div>

          <div>
            <Label htmlFor="teaserFlipRehab">Rehab Budget ($)</Label>
            <Input
              id="teaserFlipRehab"
              type="number"
              value={rehabCosts}
              onChange={(e) => setRehabCosts(e.target.value)}
              placeholder="50000"
              data-testid="input-teaser-flip-rehab"
            />
          </div>

          <div>
            <Label htmlFor="teaserFlipARV">After Repair Value ($)</Label>
            <Input
              id="teaserFlipARV"
              type="number"
              value={arv}
              onChange={(e) => setArv(e.target.value)}
              placeholder="550000"
              data-testid="input-teaser-flip-arv"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Estimated value after renovations
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="bg-card border rounded-lg p-6 space-y-4 blur-sm select-none pointer-events-none">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Return on Investment</p>
                <p className="text-3xl font-bold text-green-600">42.5%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annualized ROI</p>
                <p className="text-3xl font-bold">85.0%</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Cash to Close</p>
                <p className="text-lg font-semibold">$67,000</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Loan</p>
                <p className="text-lg font-semibold">$385,000</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Interest Cost</p>
                <p className="text-lg font-semibold">$19,058</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
              <div className="flex justify-between">
                <span>Purchase Financing:</span>
                <span>$360,000</span>
              </div>
              <div className="flex justify-between">
                <span>Rehab Financing:</span>
                <span>$25,000</span>
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
                Create a free account to see ROI calculations, financing breakdown, and complete deal metrics.
              </p>
              <Link href="/api/login">
                <Button className="w-full" data-testid="button-teaser-flip-unlock">
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
            Our Investment Analysis tool provides detailed ROI calculations, 
            financing scenarios, and complete deal analysis for your fix & flip projects.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
