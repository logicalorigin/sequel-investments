import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { HardHat, ArrowRight, TrendingUp, ArrowUpRight, Minus, ArrowDown } from "lucide-react";

export function TeaserConstructionCalculator() {
  const [landCost, setLandCost] = useState("100000");
  const [constructionCost, setConstructionCost] = useState("350000");
  const [completedValue, setCompletedValue] = useState("550000");
  const [landIsOwned, setLandIsOwned] = useState(false);
  const [buildMonths, setBuildMonths] = useState([9]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const results = useMemo(() => {
    const land = parseFloat(landCost) || 0;
    const construction = parseFloat(constructionCost) || 0;
    const completed = parseFloat(completedValue) || 0;
    const months = buildMonths[0];

    const totalProjectCost = land + construction;
    const ltc = completed > 0 ? (totalProjectCost / completed) * 100 : 0;

    const constructionFunding = construction * 0.9;
    const constructionEquity = construction - constructionFunding;
    
    let loanAmount = 0;
    let downPayment = 0;
    let landEquity = 0;
    
    if (landIsOwned) {
      landEquity = land;
      loanAmount = constructionFunding;
      downPayment = constructionEquity;
    } else {
      downPayment = land * 0.1;
      loanAmount = (land - downPayment) + constructionFunding;
    }

    const rate = 11.5;
    const closingCosts = totalProjectCost * 0.025;
    const holdingCosts = 800 * months;
    const avgDrawnAmount = loanAmount * 0.5;
    const interestCost = (avgDrawnAmount * (rate / 100)) * (months / 12);
    
    const totalCosts = land + construction + closingCosts + holdingCosts + interestCost;
    const cashInvested = landIsOwned 
      ? constructionEquity + closingCosts
      : downPayment + constructionEquity + closingCosts;
    const totalCapitalDeployed = cashInvested + landEquity;
    const totalProfit = completed - totalCosts;
    const roi = totalCapitalDeployed > 0 ? (totalProfit / totalCapitalDeployed) * 100 : 0;
    const annualizedRoi = roi * (12 / months);
    const ltv = completed > 0 ? (loanAmount / completed) * 100 : 0;

    return {
      loanAmount,
      totalProfit,
      roi,
      annualizedRoi,
      ltv,
      ltc,
      cashInvested,
      totalCapitalDeployed,
      totalProjectCost,
      interestCost,
      landEquity,
    };
  }, [landCost, constructionCost, completedValue, landIsOwned, buildMonths]);

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
        <div className="space-y-5">
          <div>
            <Label htmlFor="teaserCompletedValue">Completed Value (ARV)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="teaserCompletedValue"
                type="number"
                value={completedValue}
                onChange={(e) => setCompletedValue(e.target.value)}
                className="pl-7"
                data-testid="input-teaser-construction-completed"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="teaserLandCost">
                {landIsOwned ? "Land Value (Equity)" : "Land / Lot Cost"}
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="teaserLandIsOwned"
                  checked={landIsOwned}
                  onCheckedChange={(checked) => setLandIsOwned(checked === true)}
                  data-testid="checkbox-teaser-land-owned"
                />
                <label htmlFor="teaserLandIsOwned" className="text-xs text-muted-foreground cursor-pointer">
                  Land is Owned
                </label>
              </div>
            </div>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="teaserLandCost"
                type="number"
                value={landCost}
                onChange={(e) => setLandCost(e.target.value)}
                className="pl-7"
                data-testid="input-teaser-construction-land"
              />
            </div>
            {landIsOwned && (
              <p className="text-xs text-green-600 mt-1">
                Land value applied as equity
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="teaserConstructionCost">Construction Budget</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="teaserConstructionCost"
                type="number"
                value={constructionCost}
                onChange={(e) => setConstructionCost(e.target.value)}
                className="pl-7"
                data-testid="input-teaser-construction-budget"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Build Duration</Label>
              <span className="text-sm font-medium">{buildMonths[0]} months</span>
            </div>
            <Slider
              value={buildMonths}
              onValueChange={setBuildMonths}
              min={6}
              max={18}
              step={1}
              className="py-2"
              data-testid="slider-teaser-build-months"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>6 months</span>
              <span>18 months</span>
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
              Project Analysis
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
              <p className={`text-2xl font-bold ${results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-teaser-construction-profit">
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
              <p className="text-xs text-muted-foreground">Capital Required</p>
              <p className="text-lg font-semibold">
                {formatCurrency(results.totalCapitalDeployed)}
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
              <p className="text-xs text-muted-foreground">Est. Interest Cost</p>
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

          {landIsOwned && results.landEquity > 0 && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Land Equity Applied</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(results.landEquity)}
              </p>
            </div>
          )}
        </div>

        <Link href="/get-quote">
          <Button className="w-full" data-testid="button-teaser-construction-apply">
            Get Your Rate
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
