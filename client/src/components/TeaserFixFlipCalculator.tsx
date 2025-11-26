import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { TrendingUp, ArrowRight, ArrowUpRight, Minus, ArrowDown, Hammer } from "lucide-react";

export function TeaserFixFlipCalculator() {
  const [arv, setArv] = useState("400000");
  const [purchasePrice, setPurchasePrice] = useState("280000");
  const [rehabBudget, setRehabBudget] = useState("60000");
  const [holdTimeMonths, setHoldTimeMonths] = useState([6]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const results = useMemo(() => {
    const arvVal = parseFloat(arv) || 0;
    const purchase = parseFloat(purchasePrice) || 0;
    const rehab = parseFloat(rehabBudget) || 0;
    const holdMonths = holdTimeMonths[0];
    
    const totalCost = purchase + rehab;
    const downPayment = purchase * 0.1;
    const rehabFunding = rehab * 0.9;
    const loanAmount = purchase - downPayment + rehabFunding;
    
    const rate = 10.5;
    const closingCosts = purchase * 0.03;
    const holdingCosts = 600 * holdMonths;
    const interestCost = (loanAmount * (rate / 100)) * (holdMonths / 12);
    
    const totalProjectCost = purchase + rehab + closingCosts + holdingCosts + interestCost;
    const cashInvested = downPayment + closingCosts + (rehab - rehabFunding);
    const totalProfit = arvVal - totalProjectCost;
    const roi = cashInvested > 0 ? (totalProfit / cashInvested) * 100 : 0;
    const annualizedRoi = roi * (12 / holdMonths);
    const ltv = arvVal > 0 ? (loanAmount / arvVal) * 100 : 0;
    const ltc = totalCost > 0 ? (loanAmount / totalCost) * 100 : 0;

    return {
      loanAmount,
      totalProfit,
      roi,
      annualizedRoi,
      ltv,
      ltc,
      cashInvested,
      totalProjectCost,
      interestCost,
    };
  }, [arv, purchasePrice, rehabBudget, holdTimeMonths]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hammer className="h-6 w-6 text-primary" />
          Fix & Flip Calculator
        </CardTitle>
        <CardDescription>
          Estimate your fix and flip deal profitability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-5">
          <div>
            <Label htmlFor="teaserArv">After Repair Value (ARV)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="teaserArv"
                type="number"
                value={arv}
                onChange={(e) => setArv(e.target.value)}
                className="pl-7"
                data-testid="input-teaser-arv"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="teaserPurchasePrice">Purchase Price</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="teaserPurchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="pl-7"
                data-testid="input-teaser-purchase-price"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="teaserRehabBudget">Rehab Budget</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="teaserRehabBudget"
                type="number"
                value={rehabBudget}
                onChange={(e) => setRehabBudget(e.target.value)}
                className="pl-7"
                data-testid="input-teaser-rehab-budget"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Hold Time</Label>
              <span className="text-sm font-medium">{holdTimeMonths[0]} months</span>
            </div>
            <Slider
              value={holdTimeMonths}
              onValueChange={setHoldTimeMonths}
              min={3}
              max={12}
              step={1}
              className="py-2"
              data-testid="slider-teaser-hold-time"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>3 months</span>
              <span>12 months</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className={`bg-gradient-to-br rounded-lg p-4 border ${
          results.roi >= 10 
            ? "from-green-500/20 to-green-500/10 border-green-500/30"
            : results.roi >= 5
            ? "from-yellow-500/20 to-yellow-500/10 border-yellow-500/30"
            : "from-red-500/20 to-red-500/10 border-red-500/30"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Deal Analysis
            </h3>
            {results.roi >= 10 ? (
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            ) : results.roi >= 5 ? (
              <Minus className="h-5 w-5 text-yellow-600" />
            ) : (
              <ArrowDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Est. Profit</p>
              <p className={`text-2xl font-bold ${results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-teaser-profit">
                {formatCurrency(results.totalProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ROI</p>
              <p className={`text-2xl font-bold ${
                results.roi >= 10 ? "text-green-600" : results.roi >= 5 ? "text-yellow-600" : "text-red-600"
              }`} data-testid="text-teaser-roi">
                {results.roi.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">LTV</p>
              <p className="text-lg font-semibold">
                {results.ltv.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">LTC</p>
              <p className="text-lg font-semibold">
                {results.ltc.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Cash Required</p>
              <p className="text-lg font-semibold">
                {formatCurrency(results.cashInvested)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Loan Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(results.loanAmount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Interest Cost</p>
              <p className="text-lg font-semibold">
                {formatCurrency(results.interestCost)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Annualized ROI</p>
              <p className="text-lg font-semibold text-primary">
                {results.annualizedRoi.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <Link href="/get-quote">
          <Button className="w-full" data-testid="button-teaser-fixflip-apply">
            Get Your Rate
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
