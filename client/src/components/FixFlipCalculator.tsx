import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, AlertCircle, ArrowRight, Calculator, TrendingUp } from "lucide-react";

export function FixFlipCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [rehabCosts, setRehabCosts] = useState("50000");
  const [arv, setArv] = useState("550000");
  const [holdingPeriod, setHoldingPeriod] = useState("6");

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
    const rehab = parseFloat(rehabCosts) || 0;
    const afterRepairValue = parseFloat(arv) || 0;
    const months = parseInt(holdingPeriod) || 6;
    
    const totalProjectCost = price + rehab;
    const ltc = afterRepairValue > 0 ? (totalProjectCost / afterRepairValue) * 100 : 0;
    const loanToValue = afterRepairValue > 0 ? (price / afterRepairValue) * 100 : 0;
    
    const loanAmountPurchase = Math.min(price * 0.9, afterRepairValue * 0.7);
    const loanAmountRehab = Math.min(rehab, afterRepairValue * 0.7 - loanAmountPurchase);
    const totalLoanAmount = loanAmountPurchase + Math.max(0, loanAmountRehab);
    
    const rate = 9.9 / 100 / 12;
    const interestPayments = totalLoanAmount * rate * months;
    
    const downPaymentRequired = price - loanAmountPurchase;
    const cashOutOfPocket = Math.max(0, rehab - loanAmountRehab);
    const closingCosts = price * 0.025;
    const sellingCosts = afterRepairValue * 0.06;
    const cashToClose = downPaymentRequired + closingCosts + cashOutOfPocket;
    
    const totalCosts = price + rehab + interestPayments + closingCosts + sellingCosts;
    const profit = afterRepairValue - totalCosts;
    const roi = cashToClose > 0 ? (profit / cashToClose) * 100 : 0;
    const annualizedROI = months > 0 ? (roi / months) * 12 : 0;
    
    let qualificationStatus: "excellent" | "good" | "marginal" | "needs-review" = "needs-review";
    if (ltc <= 70) qualificationStatus = "excellent";
    else if (ltc <= 80) qualificationStatus = "good";
    else if (ltc <= 90) qualificationStatus = "marginal";
    
    return {
      totalProjectCost,
      ltc: ltc.toFixed(1),
      loanToValue: loanToValue.toFixed(1),
      loanAmountPurchase,
      loanAmountRehab: Math.max(0, loanAmountRehab),
      totalLoanAmount,
      interestPayments,
      downPaymentRequired,
      cashOutOfPocket,
      closingCosts,
      sellingCosts,
      cashToClose,
      profit,
      roi: roi.toFixed(1),
      annualizedROI: annualizedROI.toFixed(1),
      qualificationStatus,
    };
  }, [purchasePrice, rehabCosts, arv, holdingPeriod]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Fix & Flip Calculator
        </CardTitle>
        <CardDescription>
          Analyze your flip deal profitability and financing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="flipPurchasePrice">Purchase Price ($)</Label>
              <Input
                id="flipPurchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="400000"
                data-testid="input-flip-purchase"
              />
            </div>

            <div>
              <Label htmlFor="rehabCosts">Rehab Budget ($)</Label>
              <Input
                id="rehabCosts"
                type="number"
                value={rehabCosts}
                onChange={(e) => setRehabCosts(e.target.value)}
                placeholder="50000"
                data-testid="input-flip-rehab"
              />
            </div>

            <div>
              <Label htmlFor="holdingPeriod">Hold Time (months)</Label>
              <Input
                id="holdingPeriod"
                type="number"
                value={holdingPeriod}
                onChange={(e) => setHoldingPeriod(e.target.value)}
                placeholder="6"
                data-testid="input-flip-holding"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="arv">After Repair Value (ARV) ($)</Label>
              <Input
                id="arv"
                type="number"
                value={arv}
                onChange={(e) => setArv(e.target.value)}
                placeholder="550000"
                data-testid="input-flip-arv"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Estimated value after renovations
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Estimated Profit</p>
              <p className={`text-3xl font-bold ${results.profit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-flip-profit">
                {formatCurrency(results.profit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return on Investment</p>
              <p className={`text-3xl font-bold ${parseFloat(results.roi) >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-flip-roi">
                {results.roi}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Cash to Close</p>
              <p className="text-lg font-semibold" data-testid="text-flip-cash-to-close">
                {formatCurrency(results.cashToClose)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Loan-to-Cost</p>
              <p className="text-lg font-semibold" data-testid="text-flip-ltc">
                {results.ltc}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Annualized ROI</p>
              <p className="text-lg font-semibold" data-testid="text-flip-annual-roi">
                {results.annualizedROI}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Project Cost:</span>
              <span className="font-medium">{formatCurrency(results.totalProjectCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Loan Amount:</span>
              <span className="font-medium">{formatCurrency(results.totalLoanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchase Financing:</span>
              <span className="font-medium">{formatCurrency(results.loanAmountPurchase)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rehab Financing:</span>
              <span className="font-medium">{formatCurrency(results.loanAmountRehab)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest Payments:</span>
              <span className="font-medium">{formatCurrency(results.interestPayments)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selling Costs (6%):</span>
              <span className="font-medium">{formatCurrency(results.sellingCosts)}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            {results.qualificationStatus === "excellent" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Excellent deal metrics! Strong financing potential.</span>
              </div>
            )}
            {results.qualificationStatus === "good" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Good deal! LTC within standard guidelines.</span>
              </div>
            )}
            {results.qualificationStatus === "marginal" && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Higher LTC - may require additional cash down.</span>
              </div>
            )}
            {results.qualificationStatus === "needs-review" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Let's review your deal together.</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Loan Terms (Est.)</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="font-medium">9.90%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Term:</span>
              <span className="font-medium">12 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max LTC:</span>
              <span className="font-medium">90%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max ARV:</span>
              <span className="font-medium">70%</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/get-quote">
            <Button size="lg" data-testid="button-flip-calc-apply">
              Get Your Rate
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
