import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { CheckCircle2, AlertCircle, ArrowRight, Calculator, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type PropertyType = "sfr" | "2-4unit";

export function DSCROnlyCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [downPaymentPercent, setDownPaymentPercent] = useState([25]);
  const [creditScore, setCreditScore] = useState([740]);
  const [propertyType, setPropertyType] = useState<PropertyType>("sfr");
  const [monthlyRent, setMonthlyRent] = useState("3200");
  const [monthlyExpenses, setMonthlyExpenses] = useState("600");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateInterestRate = (ltv: number, dscr: number) => {
    const BASE_RATE = 5.75;
    
    let creditAdjustment = 0;
    const score = creditScore[0];
    if (score >= 760) creditAdjustment = 0;
    else if (score >= 740) creditAdjustment = 0.25;
    else if (score >= 720) creditAdjustment = 0.5;
    else if (score >= 700) creditAdjustment = 0.75;
    else if (score >= 680) creditAdjustment = 1.0;
    else creditAdjustment = 1.25;
    
    let ltvAdjustment = 0;
    if (ltv <= 60) ltvAdjustment = -0.25;
    else if (ltv <= 65) ltvAdjustment = 0;
    else if (ltv <= 70) ltvAdjustment = 0.25;
    else if (ltv <= 75) ltvAdjustment = 0.5;
    else ltvAdjustment = 0.75;
    
    let dscrAdjustment = 0;
    if (dscr >= 1.5) dscrAdjustment = -0.125;
    else if (dscr >= 1.25) dscrAdjustment = 0;
    else if (dscr >= 1.0) dscrAdjustment = 0.25;
    else if (dscr >= 0.75) dscrAdjustment = 0.5;
    else dscrAdjustment = 0.75;
    
    let propertyAdjustment = 0;
    if (propertyType === "2-4unit") propertyAdjustment = 0.25;
    
    const finalRate = BASE_RATE + creditAdjustment + ltvAdjustment + dscrAdjustment + propertyAdjustment;
    return Math.max(5.75, Math.min(9.0, finalRate));
  };

  const calculateDSCR = () => {
    const price = parseFloat(purchasePrice) || 0;
    const downPayment = price * (downPaymentPercent[0] / 100);
    const loanAmount = price - downPayment;
    const ltv = price > 0 ? (loanAmount / price) * 100 : 0;
    const rent = parseFloat(monthlyRent) || 0;
    const expenses = parseFloat(monthlyExpenses) || 0;
    
    const preliminaryDscr = rent > 0 && expenses >= 0 ? rent / (expenses + 1000) : 1.0;
    
    const calculatedRate = calculateInterestRate(ltv, preliminaryDscr);
    const rate = calculatedRate / 100 / 12;
    const term = 30 * 12;
    
    const monthlyPayment = loanAmount > 0 
      ? (loanAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
      : 0;
    
    const totalMonthlyDebt = monthlyPayment + expenses;
    const dscr = totalMonthlyDebt > 0 ? rent / totalMonthlyDebt : 0;
    const cashFlow = rent - totalMonthlyDebt;
    const annualCashFlow = cashFlow * 12;
    const closingCosts = price * 0.03;
    const cashToClose = downPayment + closingCosts;
    const cashOnCashReturn = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;
    
    let qualificationStatus: "excellent" | "good" | "marginal" | "needs-review" = "needs-review";
    if (dscr >= 1.25) qualificationStatus = "excellent";
    else if (dscr >= 1.0) qualificationStatus = "good";
    else if (dscr >= 0.75) qualificationStatus = "marginal";
    
    return {
      dscr: dscr.toFixed(2),
      dscrValue: dscr,
      monthlyPayment: monthlyPayment,
      loanAmount: loanAmount,
      downPayment: downPayment,
      cashToClose: cashToClose,
      closingCosts: closingCosts,
      monthlyRentVal: rent,
      totalMonthlyDebt: totalMonthlyDebt,
      cashFlow: cashFlow,
      annualCashFlow: annualCashFlow,
      cashOnCashReturn: cashOnCashReturn,
      qualificationStatus,
      ltv: ltv,
      interestRate: calculatedRate,
    };
  };

  const results = calculateDSCR();

  const rateBreakdown = useMemo(() => {
    const BASE_RATE = 5.75;
    const score = creditScore[0];
    const ltv = results.ltv;
    const dscr = results.dscrValue;

    let creditAdj = 0;
    let creditLabel = "";
    if (score >= 760) { creditAdj = 0; creditLabel = "760+ (Excellent)"; }
    else if (score >= 740) { creditAdj = 0.25; creditLabel = "740-759 (Very Good)"; }
    else if (score >= 720) { creditAdj = 0.5; creditLabel = "720-739 (Good)"; }
    else if (score >= 700) { creditAdj = 0.75; creditLabel = "700-719 (Fair)"; }
    else if (score >= 680) { creditAdj = 1.0; creditLabel = "680-699"; }
    else { creditAdj = 1.25; creditLabel = "660-679"; }

    let ltvAdj = 0;
    let ltvLabel = "";
    if (ltv <= 60) { ltvAdj = -0.25; ltvLabel = "≤60% (Best)"; }
    else if (ltv <= 65) { ltvAdj = 0; ltvLabel = "61-65%"; }
    else if (ltv <= 70) { ltvAdj = 0.25; ltvLabel = "66-70%"; }
    else if (ltv <= 75) { ltvAdj = 0.5; ltvLabel = "71-75%"; }
    else { ltvAdj = 0.75; ltvLabel = "76-80%"; }

    let dscrAdj = 0;
    let dscrLabel = "";
    if (dscr >= 1.5) { dscrAdj = -0.125; dscrLabel = "1.50+ (Excellent)"; }
    else if (dscr >= 1.25) { dscrAdj = 0; dscrLabel = "1.25-1.49 (Good)"; }
    else if (dscr >= 1.0) { dscrAdj = 0.25; dscrLabel = "1.00-1.24"; }
    else if (dscr >= 0.75) { dscrAdj = 0.5; dscrLabel = "0.75-0.99"; }
    else { dscrAdj = 0.75; dscrLabel = "<0.75"; }

    let propAdj = propertyType === "2-4unit" ? 0.25 : 0;
    let propLabel = propertyType === "sfr" ? "Single Family" : "2-4 Unit";

    return { BASE_RATE, creditAdj, creditLabel, ltvAdj, ltvLabel, dscrAdj, dscrLabel, propAdj, propLabel };
  }, [creditScore, results.ltv, results.dscrValue, propertyType]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          DSCR Calculator
        </CardTitle>
        <CardDescription>
          Calculate your estimated interest rate and DSCR qualification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Your Estimated Rate
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary" data-testid="text-dscr-calc-rate">
              {results.interestRate.toFixed(3)}%
            </span>
            <span className="text-muted-foreground text-sm">30-Year Fixed</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Rate based on credit score, LTV, DSCR, and property type
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <Label className="flex items-center gap-1">
                  Credit Score
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">Most important factor in rate calculation. Minimum 660 required.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm font-medium">{creditScore[0]}</span>
              </div>
              <Slider
                value={creditScore}
                onValueChange={setCreditScore}
                min={660}
                max={800}
                step={5}
                className="py-2"
                data-testid="slider-dscr-credit-score"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>660 (Min)</span>
                <span>800</span>
              </div>
            </div>

            <div>
              <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="400000"
                data-testid="input-dscr-purchase-price"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="flex items-center gap-1">
                  Down Payment (LTV: {(100 - downPaymentPercent[0]).toFixed(0)}%)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">Maximum LTV is 80%. Lower LTV = better rate.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <span className="text-sm font-medium">{downPaymentPercent[0]}%</span>
              </div>
              <Slider
                value={downPaymentPercent}
                onValueChange={setDownPaymentPercent}
                min={20}
                max={50}
                step={5}
                className="py-2"
                data-testid="slider-dscr-down-payment"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(parseFloat(purchasePrice || "0") * (downPaymentPercent[0] / 100))}
              </p>
            </div>

            <div>
              <Label className="flex items-center gap-1 mb-2">
                Property Type
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">SFR typically gets best rates. 2-4 unit adds +0.25%.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
                <SelectTrigger data-testid="select-dscr-property-type">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sfr">Single Family Residence (SFR)</SelectItem>
                  <SelectItem value="2-4unit">2-4 Unit Multifamily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="monthlyRent">Monthly Rental Income ($)</Label>
              <Input
                id="monthlyRent"
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="3200"
                data-testid="input-dscr-monthly-rent"
              />
            </div>

            <div>
              <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                placeholder="600"
                data-testid="input-dscr-monthly-expenses"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Taxes, insurance, HOA, maintenance
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Rate Breakdown
              </h4>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Rate:</span>
                <span className="font-medium">{rateBreakdown.BASE_RATE.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credit ({rateBreakdown.creditLabel}):</span>
                <span className={`font-medium ${rateBreakdown.creditAdj > 0 ? "text-red-600" : rateBreakdown.creditAdj < 0 ? "text-green-600" : ""}`}>
                  {rateBreakdown.creditAdj > 0 ? "+" : ""}{rateBreakdown.creditAdj.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LTV ({rateBreakdown.ltvLabel}):</span>
                <span className={`font-medium ${rateBreakdown.ltvAdj > 0 ? "text-red-600" : rateBreakdown.ltvAdj < 0 ? "text-green-600" : ""}`}>
                  {rateBreakdown.ltvAdj > 0 ? "+" : ""}{rateBreakdown.ltvAdj.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DSCR ({rateBreakdown.dscrLabel}):</span>
                <span className={`font-medium ${rateBreakdown.dscrAdj > 0 ? "text-red-600" : rateBreakdown.dscrAdj < 0 ? "text-green-600" : ""}`}>
                  {rateBreakdown.dscrAdj > 0 ? "+" : ""}{rateBreakdown.dscrAdj.toFixed(3)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property ({rateBreakdown.propLabel}):</span>
                <span className={`font-medium ${rateBreakdown.propAdj > 0 ? "text-red-600" : ""}`}>
                  {rateBreakdown.propAdj > 0 ? "+" : ""}{rateBreakdown.propAdj.toFixed(2)}%
                </span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Your Rate:</span>
                <span className="text-primary">{results.interestRate.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">DSCR Ratio</p>
              <p className="text-3xl font-bold" data-testid="text-dscr-calc-dscr">
                {results.dscr}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Cash Flow</p>
              <p className={`text-3xl font-bold ${results.cashFlow >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-dscr-calc-cashflow">
                {formatCurrency(results.cashFlow)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Cash to Close</p>
              <p className="text-lg font-semibold" data-testid="text-dscr-cash-to-close">
                {formatCurrency(results.cashToClose)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Payment</p>
              <p className="text-lg font-semibold" data-testid="text-dscr-payment">
                {formatCurrency(results.monthlyPayment)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cash-on-Cash</p>
              <p className="text-lg font-semibold" data-testid="text-dscr-coc">
                {results.cashOnCashReturn.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loan Amount:</span>
              <span className="font-medium">{formatCurrency(results.loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">LTV:</span>
              <span className="font-medium">{results.ltv.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Down Payment:</span>
              <span className="font-medium">{formatCurrency(results.downPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Closing Costs:</span>
              <span className="font-medium">{formatCurrency(results.closingCosts)}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            {results.qualificationStatus === "excellent" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Excellent! You likely qualify with strong cash flow.</span>
              </div>
            )}
            {results.qualificationStatus === "good" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Good! DSCR of 1.0+ typically qualifies.</span>
              </div>
            )}
            {results.qualificationStatus === "marginal" && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Marginal - We may still have options for you.</span>
              </div>
            )}
            {results.qualificationStatus === "needs-review" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Contact us to discuss alternative programs.</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/get-quote">
            <Button size="lg" data-testid="button-dscr-calc-apply">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
