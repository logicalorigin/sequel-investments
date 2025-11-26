import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { Calculator, ArrowRight, TrendingUp, ArrowUpRight, Minus, ArrowDown } from "lucide-react";

export function TeaserDSCRCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [downPaymentPercent, setDownPaymentPercent] = useState([25]);
  const [creditScore, setCreditScore] = useState([740]);
  const [monthlyRent, setMonthlyRent] = useState("3200");
  const [annualTaxes, setAnnualTaxes] = useState("4800");
  const [annualInsurance, setAnnualInsurance] = useState("1800");

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
    const taxes = parseFloat(annualTaxes) || 0;
    const insurance = parseFloat(annualInsurance) || 0;

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
    
    const monthlyRate = estimatedRate / 100 / 12;
    const loanTermMonths = 30 * 12;
    const monthlyPI = loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / 
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1)
      : 0;
    
    const monthlyTaxes = taxes / 12;
    const monthlyInsurance = insurance / 12;
    const monthlyPITIA = monthlyPI + monthlyTaxes + monthlyInsurance;
    const dscr = monthlyPITIA > 0 ? rent / monthlyPITIA : 0;
    const monthlyCashFlow = rent - monthlyPITIA;
    const cashToClose = downPayment + (price * 0.03);

    return {
      estimatedRate,
      loanAmount,
      ltv,
      dscr,
      monthlyPI,
      monthlyPITIA,
      monthlyCashFlow,
      cashToClose,
    };
  }, [purchasePrice, downPaymentPercent, creditScore, monthlyRent, annualTaxes, annualInsurance]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          DSCR Calculator
        </CardTitle>
        <CardDescription>
          Calculate your DSCR loan rate and cash flow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <Label htmlFor="teaserMonthlyRent">Expected Monthly Rent</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="teaserMonthlyRent"
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="pl-7"
                data-testid="input-teaser-monthly-rent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teaserAnnualTaxes">Annual Taxes</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="teaserAnnualTaxes"
                  type="number"
                  value={annualTaxes}
                  onChange={(e) => setAnnualTaxes(e.target.value)}
                  className="pl-7"
                  data-testid="input-teaser-annual-taxes"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="teaserAnnualInsurance">Annual Insurance</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="teaserAnnualInsurance"
                  type="number"
                  value={annualInsurance}
                  onChange={(e) => setAnnualInsurance(e.target.value)}
                  className="pl-7"
                  data-testid="input-teaser-annual-insurance"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className={`bg-gradient-to-br rounded-lg p-4 border ${
          results.dscr >= 1.0 
            ? "from-green-500/20 to-green-500/10 border-green-500/30"
            : results.dscr >= 0.75
            ? "from-yellow-500/20 to-yellow-500/10 border-yellow-500/30"
            : "from-red-500/20 to-red-500/10 border-red-500/30"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Your Results
            </h3>
            {results.dscr >= 1.0 ? (
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            ) : results.dscr >= 0.75 ? (
              <Minus className="h-5 w-5 text-yellow-600" />
            ) : (
              <ArrowDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Interest Rate</p>
              <p className="text-2xl font-bold text-green-600" data-testid="text-teaser-dscr-rate">
                {results.estimatedRate.toFixed(3)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">DSCR Ratio</p>
              <p className={`text-2xl font-bold ${
                results.dscr >= 1.0 ? "text-green-600" : results.dscr >= 0.75 ? "text-yellow-600" : "text-red-600"
              }`} data-testid="text-teaser-dscr-ratio">
                {results.dscr.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Monthly Cash Flow</p>
              <p className={`text-lg font-semibold ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(results.monthlyCashFlow)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. Cash to Close</p>
              <p className="text-lg font-semibold">
                {formatCurrency(results.cashToClose)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Monthly PITIA</p>
              <p className="text-lg font-semibold">
                {formatCurrency(results.monthlyPITIA)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Loan Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(results.loanAmount)}
              </p>
            </div>
          </div>
        </div>

        <Link href="/get-quote">
          <Button className="w-full" data-testid="button-teaser-dscr-apply">
            Get Your Rate
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
