import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { HardHat, Lock, ArrowRight, Sparkles } from "lucide-react";

export function TeaserConstructionCalculator() {
  const [landCost, setLandCost] = useState("150000");
  const [constructionCost, setConstructionCost] = useState("350000");
  const [completedValue, setCompletedValue] = useState("650000");
  const [landIsOwned, setLandIsOwned] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateTeaser = () => {
    const land = parseFloat(landCost) || 0;
    const construction = parseFloat(constructionCost) || 0;
    const completed = parseFloat(completedValue) || 0;
    const months = 9;

    const totalProjectCost = land + construction;
    const ltc = completed > 0 ? (totalProjectCost / completed) * 100 : 0;

    const maxLTC = 0.90;
    const maxLoanByARV = completed * maxLTC;
    const maxLoanByLTC = totalProjectCost * maxLTC;
    const maxLoanAmount = Math.min(maxLoanByARV, maxLoanByLTC);

    let loanAmountLand = 0;
    let loanAmountConstruction = 0;
    let downPaymentRequired = 0;
    let landEquityApplied = 0;
    let constructionCashRequired = 0;

    if (landIsOwned) {
      landEquityApplied = land;
      loanAmountConstruction = Math.min(construction, maxLoanAmount);
      constructionCashRequired = Math.max(0, construction - loanAmountConstruction);
      downPaymentRequired = 0;
    } else {
      loanAmountLand = Math.min(land * 0.75, completed * 0.65);
      const remainingLoanCapacity = maxLoanAmount - loanAmountLand;
      loanAmountConstruction = Math.min(construction, Math.max(0, remainingLoanCapacity));
      downPaymentRequired = land - loanAmountLand;
      constructionCashRequired = Math.max(0, construction - loanAmountConstruction);
    }

    const totalLoanAmount = loanAmountLand + Math.max(0, loanAmountConstruction);

    const rate = 9.9 / 100 / 12;
    const avgDrawnAmount = totalLoanAmount * 0.5;
    const interestPayments = avgDrawnAmount * rate * months;

    const closingCosts = totalProjectCost * 0.025;
    const sellingCosts = completed * 0.06;

    const totalProjectExpenses = land + construction + interestPayments + closingCosts + sellingCosts;
    const profit = completed - totalProjectExpenses;

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
          <HardHat className="h-6 w-6 text-primary" />
          Construction Calculator
        </CardTitle>
        <CardDescription>
          Estimate your ground-up construction returns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Estimated Profit
          </h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${results.profit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-teaser-construction-profit">
              {formatCurrency(results.profit)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            LTC: {results.ltc}%
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="teaserLandCost">
              {landIsOwned ? "Land Value (Equity) ($)" : "Land / Lot Cost ($)"}
            </Label>
            <Input
              id="teaserLandCost"
              type="number"
              value={landCost}
              onChange={(e) => setLandCost(e.target.value)}
              placeholder="150000"
              data-testid="input-teaser-construction-land"
            />
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                id="teaserLandIsOwned"
                checked={landIsOwned}
                onCheckedChange={(checked) => setLandIsOwned(checked === true)}
                data-testid="checkbox-teaser-land-owned"
              />
              <Label htmlFor="teaserLandIsOwned" className="text-sm font-normal cursor-pointer">
                Land is owned (apply as equity)
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="teaserConstructionCost">Construction Budget ($)</Label>
            <Input
              id="teaserConstructionCost"
              type="number"
              value={constructionCost}
              onChange={(e) => setConstructionCost(e.target.value)}
              placeholder="350000"
              data-testid="input-teaser-construction-budget"
            />
          </div>

          <div>
            <Label htmlFor="teaserCompletedValue">Completed Value ($)</Label>
            <Input
              id="teaserCompletedValue"
              type="number"
              value={completedValue}
              onChange={(e) => setCompletedValue(e.target.value)}
              placeholder="650000"
              data-testid="input-teaser-construction-completed"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Expected market value when complete
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="bg-card border rounded-lg p-6 space-y-4 blur-sm select-none pointer-events-none">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Return on Investment</p>
                <p className="text-3xl font-bold text-green-600">58.2%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annualized ROI</p>
                <p className="text-3xl font-bold">77.6%</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Total Cash Required</p>
                <p className="text-lg font-semibold">$62,500</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Loan</p>
                <p className="text-lg font-semibold">$450,000</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Interest Cost</p>
                <p className="text-lg font-semibold">$16,706</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
              <div className="flex justify-between">
                <span>Land Financing:</span>
                <span>$112,500</span>
              </div>
              <div className="flex justify-between">
                <span>Construction Financing:</span>
                <span>$337,500</span>
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
                Create a free account to see ROI calculations, draw schedules, and complete project analysis.
              </p>
              <Link href="/api/login">
                <Button className="w-full" data-testid="button-teaser-construction-unlock">
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
            Our Investment Analysis tool provides detailed construction financing scenarios, 
            draw schedules, and complete project analysis for new builds.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
