import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { Hammer, Lock, ArrowRight, TrendingUp, UserPlus } from "lucide-react";

export function ArticleFixFlipCalculator() {
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
    const sellingCosts = arvVal * 0.06;
    const holdingCosts = 600 * holdMonths;
    const interestCost = (loanAmount * (rate / 100)) * (holdMonths / 12);
    
    const totalProjectCost = purchase + rehab + closingCosts + holdingCosts + interestCost + sellingCosts;
    const cashInvested = downPayment + closingCosts + (rehab - rehabFunding);
    const totalProfit = arvVal - totalProjectCost;
    const roi = cashInvested > 0 ? (totalProfit / cashInvested) * 100 : 0;

    return {
      totalProfit,
      roi,
      cashInvested,
    };
  }, [arv, purchasePrice, rehabBudget, holdTimeMonths]);

  return (
    <Card className="w-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <Hammer className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Quick Flip Analysis</h3>
            <p className="text-sm text-muted-foreground">Estimate your deal profit</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="articleArv" className="text-sm">After Repair Value (ARV)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="articleArv"
                type="number"
                value={arv}
                onChange={(e) => setArv(e.target.value)}
                className="pl-7"
                data-testid="input-article-flip-arv"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="articlePurchase" className="text-sm">Purchase Price</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="articlePurchase"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="pl-7"
                data-testid="input-article-flip-purchase"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="articleRehab" className="text-sm">Rehab Budget</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="articleRehab"
                type="number"
                value={rehabBudget}
                onChange={(e) => setRehabBudget(e.target.value)}
                className="pl-7"
                data-testid="input-article-flip-rehab"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-sm">Hold Time</Label>
              <span className="text-sm font-medium">{holdTimeMonths[0]} months</span>
            </div>
            <Slider
              value={holdTimeMonths}
              onValueChange={setHoldTimeMonths}
              min={3}
              max={12}
              step={1}
              className="py-2"
              data-testid="slider-article-flip-hold"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Deal Analysis
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Est. Profit</p>
              <p className={`text-xl font-bold ${results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-article-flip-profit">
                {formatCurrency(results.totalProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ROI</p>
              <p className={`text-xl font-bold ${
                results.roi >= 15 ? "text-green-600" : results.roi >= 0 ? "text-amber-500" : "text-red-600"
              }`} data-testid="text-article-flip-roi">
                {results.roi.toFixed(1)}%
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
                <p className="text-xs text-muted-foreground">LTV / LTC</p>
                <p className="text-lg font-semibold">XX% / XX%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Annualized ROI</p>
                <p className="text-lg font-semibold">XX.X%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Interest Cost</p>
                <p className="text-lg font-semibold">$X,XXX</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Loan Amount</p>
                <p className="text-lg font-semibold">$XXX,XXX</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Link href="/auth">
            <Button className="w-full gap-2" data-testid="button-article-flip-signup">
              <UserPlus className="h-4 w-4" />
              Create Free Account for Full Calculator
            </Button>
          </Link>
          <p className="text-xs text-center text-muted-foreground">
            Save scenarios, compare deals, and access advanced metrics
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
