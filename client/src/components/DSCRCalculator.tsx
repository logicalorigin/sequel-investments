import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { CheckCircle2, AlertCircle, ArrowRight, Calculator, Building, TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type LoanType = "dscr" | "fixflip";
type PropertyType = "sfr" | "2-4unit";

export function DSCRCalculator() {
  const [loanType, setLoanType] = useState<LoanType>("dscr");
  
  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [downPaymentPercent, setDownPaymentPercent] = useState([25]);
  const [creditScore, setCreditScore] = useState([740]);
  const [propertyType, setPropertyType] = useState<PropertyType>("sfr");
  const [monthlyRent, setMonthlyRent] = useState("3200");
  const [monthlyExpenses, setMonthlyExpenses] = useState("600");
  
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

  const calculateInterestRate = (ltv: number, dscr: number) => {
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
    
    let dscrAdjustment = 0;
    if (dscr >= 1.5) dscrAdjustment = -0.125;
    else if (dscr >= 1.25) dscrAdjustment = 0;
    else if (dscr >= 1.0) dscrAdjustment = 0.125;
    else if (dscr >= 0.75) dscrAdjustment = 0.25;
    else dscrAdjustment = 0.375;
    
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

  const calculateFixFlip = () => {
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
  };

  const dscrResults = calculateDSCR();
  const flipResults = calculateFixFlip();

  const rateBreakdown = useMemo(() => {
    const BASE_RATE = 6.25;
    const score = creditScore[0];
    const ltv = dscrResults.ltv;
    const dscr = dscrResults.dscrValue;

    let creditAdj = 0;
    let creditLabel = "";
    if (score >= 760) { creditAdj = 0; creditLabel = "760+ (Excellent)"; }
    else if (score >= 740) { creditAdj = 0.25; creditLabel = "740-759 (Very Good)"; }
    else if (score >= 720) { creditAdj = 0.375; creditLabel = "720-739 (Good)"; }
    else if (score >= 700) { creditAdj = 0.5; creditLabel = "700-719 (Fair)"; }
    else if (score >= 680) { creditAdj = 0.75; creditLabel = "680-699"; }
    else { creditAdj = 1.0; creditLabel = "660-679"; }

    let ltvAdj = 0;
    let ltvLabel = "";
    if (ltv <= 50) { ltvAdj = -0.5; ltvLabel = "≤50% (Best)"; }
    else if (ltv <= 55) { ltvAdj = -0.25; ltvLabel = "51-55%"; }
    else if (ltv <= 60) { ltvAdj = 0; ltvLabel = "56-60%"; }
    else if (ltv <= 65) { ltvAdj = 0.125; ltvLabel = "61-65%"; }
    else if (ltv <= 70) { ltvAdj = 0.25; ltvLabel = "66-70%"; }
    else if (ltv <= 75) { ltvAdj = 0.375; ltvLabel = "71-75%"; }
    else { ltvAdj = 0.5; ltvLabel = "76-80%"; }

    let dscrAdj = 0;
    let dscrLabel = "";
    if (dscr >= 1.5) { dscrAdj = -0.125; dscrLabel = "1.50+ (Excellent)"; }
    else if (dscr >= 1.25) { dscrAdj = 0; dscrLabel = "1.25-1.49 (Good)"; }
    else if (dscr >= 1.0) { dscrAdj = 0.125; dscrLabel = "1.00-1.24"; }
    else if (dscr >= 0.75) { dscrAdj = 0.25; dscrLabel = "0.75-0.99"; }
    else { dscrAdj = 0.375; dscrLabel = "<0.75"; }

    let propAdj = propertyType === "2-4unit" ? 0.25 : 0;
    let propLabel = propertyType === "sfr" ? "Single Family" : "2-4 Unit";

    return { BASE_RATE, creditAdj, creditLabel, ltvAdj, ltvLabel, dscrAdj, dscrLabel, propAdj, propLabel };
  }, [creditScore, dscrResults.ltv, dscrResults.dscrValue, propertyType]);

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
      <CardContent>
        <Tabs value={loanType} onValueChange={(v) => setLoanType(v as LoanType)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="dscr" className="flex items-center gap-2" data-testid="tab-calc-dscr">
              <Building className="h-4 w-4" />
              DSCR / Rental
            </TabsTrigger>
            <TabsTrigger value="fixflip" className="flex items-center gap-2" data-testid="tab-calc-fixflip">
              <TrendingUp className="h-4 w-4" />
              Fix & Flip
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dscr" className="space-y-6">
            <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Your Estimated Rate
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary" data-testid="text-calc-rate">
                  {dscrResults.interestRate.toFixed(3)}%
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
                    data-testid="slider-calc-credit-score"
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
                    data-testid="input-calc-purchase-price"
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
                    data-testid="slider-calc-down-payment"
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
                    <SelectTrigger data-testid="select-calc-property-type">
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
                    data-testid="input-calc-monthly-rent"
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
                    data-testid="input-calc-monthly-expenses"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Taxes, insurance, HOA
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
                    <span className="text-primary">{dscrResults.interestRate.toFixed(3)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">DSCR Ratio</p>
                  <p className="text-3xl font-bold" data-testid="text-calc-dscr">
                    {dscrResults.dscr}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Cash Flow</p>
                  <p className={`text-3xl font-bold ${dscrResults.cashFlow >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-calc-cashflow">
                    {formatCurrency(dscrResults.cashFlow)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Cash to Close</p>
                  <p className="text-lg font-semibold" data-testid="text-calc-cash-to-close">
                    {formatCurrency(dscrResults.cashToClose)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Payment</p>
                  <p className="text-lg font-semibold" data-testid="text-calc-payment">
                    {formatCurrency(dscrResults.monthlyPayment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cash-on-Cash</p>
                  <p className="text-lg font-semibold" data-testid="text-calc-coc">
                    {dscrResults.cashOnCashReturn.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <span className="font-medium">{formatCurrency(dscrResults.loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LTV:</span>
                  <span className="font-medium">{dscrResults.ltv.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Down Payment:</span>
                  <span className="font-medium">{formatCurrency(dscrResults.downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Closing Costs:</span>
                  <span className="font-medium">{formatCurrency(dscrResults.closingCosts)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                {dscrResults.qualificationStatus === "excellent" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Excellent! You likely qualify with strong cash flow.</span>
                  </div>
                )}
                {dscrResults.qualificationStatus === "good" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Good! DSCR of 1.0+ typically qualifies.</span>
                  </div>
                )}
                {dscrResults.qualificationStatus === "marginal" && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Marginal - We may still have options for you.</span>
                  </div>
                )}
                {dscrResults.qualificationStatus === "needs-review" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Contact us to discuss alternative programs.</span>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 border border-muted rounded-lg p-4 mt-4">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Note:</strong> This is an estimate only. Actual rates depend on full underwriting review. 
                  <Link href="/get-quote" className="text-primary hover:underline ml-1">
                    Talk to a loan specialist
                  </Link> for a personalized quote.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fixflip" className="space-y-6">
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
                    data-testid="input-calc-flip-purchase"
                  />
                </div>

                <div>
                  <Label htmlFor="rehabCosts">Rehab / Renovation Costs ($)</Label>
                  <Input
                    id="rehabCosts"
                    type="number"
                    value={rehabCosts}
                    onChange={(e) => setRehabCosts(e.target.value)}
                    placeholder="50000"
                    data-testid="input-calc-rehab"
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
                    data-testid="input-calc-arv"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Estimated value after renovations
                  </p>
                </div>

                <div>
                  <Label htmlFor="holdingPeriod">Holding Period (months)</Label>
                  <Input
                    id="holdingPeriod"
                    type="number"
                    value={holdingPeriod}
                    onChange={(e) => setHoldingPeriod(e.target.value)}
                    placeholder="6"
                    data-testid="input-calc-holding"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Profit</p>
                  <p className={`text-3xl font-bold ${flipResults.profit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-calc-profit">
                    {formatCurrency(flipResults.profit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return on Investment</p>
                  <p className={`text-3xl font-bold ${parseFloat(flipResults.roi) >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-calc-roi">
                    {flipResults.roi}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Cash to Close</p>
                  <p className="text-lg font-semibold" data-testid="text-calc-flip-cash">
                    {formatCurrency(flipResults.cashToClose)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">LTC Ratio</p>
                  <p className="text-lg font-semibold" data-testid="text-calc-ltc">
                    {flipResults.ltc}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Annualized ROI</p>
                  <p className="text-lg font-semibold" data-testid="text-calc-annual-roi">
                    {flipResults.annualizedROI}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Project Cost:</span>
                  <span className="font-medium">{formatCurrency(flipResults.totalProjectCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <span className="font-medium">{formatCurrency(flipResults.totalLoanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Costs:</span>
                  <span className="font-medium">{formatCurrency(flipResults.interestPayments)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selling Costs (6%):</span>
                  <span className="font-medium">{formatCurrency(flipResults.sellingCosts)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                {flipResults.qualificationStatus === "excellent" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Excellent! LTC under 70% qualifies easily.</span>
                  </div>
                )}
                {flipResults.qualificationStatus === "good" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Good! This project likely qualifies.</span>
                  </div>
                )}
                {flipResults.qualificationStatus === "marginal" && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Higher LTC - Additional terms may apply.</span>
                  </div>
                )}
                {flipResults.qualificationStatus === "needs-review" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">LTC over 90% - Contact us to discuss options.</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Link href="/get-quote">
            <Button className="w-full" size="lg" data-testid="button-calc-getquote">
              Get Your Custom Rate
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
